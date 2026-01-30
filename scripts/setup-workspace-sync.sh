#!/bin/bash
set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Workspace Sync 설정 스크립트 (Subtree + Private 지원)  ║${NC}"
echo -e "${BLUE}║     Dev-Expertise-TS → ts-cxdm/workspace                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo

read -p "원본 레포 이름 (Dev-Expertise-TS/___): " SOURCE_REPO_NAME
if [[ -z "$SOURCE_REPO_NAME" ]]; then
  echo -e "${RED}Error: 레포 이름을 입력해주세요.${NC}"
  exit 1
fi

SOURCE_REPO="Dev-Expertise-TS/${SOURCE_REPO_NAME}"

echo -e "\n${YELLOW}원본 레포 확인 중...${NC}"
if ! gh repo view "$SOURCE_REPO" &>/dev/null; then
  echo -e "${RED}Error: ${SOURCE_REPO} 레포를 찾을 수 없습니다.${NC}"
  exit 1
fi
REPO_VISIBILITY=$(gh repo view "$SOURCE_REPO" --json visibility -q '.visibility')
echo -e "${GREEN}✓ ${SOURCE_REPO} 확인됨 (${REPO_VISIBILITY})${NC}"

read -p "workspace 내 대상 경로 (예: frontend/select3-front, backend/api): " TARGET_PATH
if [[ -z "$TARGET_PATH" ]]; then
  echo -e "${RED}Error: 대상 경로를 입력해주세요.${NC}"
  exit 1
fi

PROJECT_SLUG=$(echo "$SOURCE_REPO_NAME" | tr '[:upper:]' '[:lower:]' | tr '_' '-')

echo
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "  원본 레포:      ${GREEN}${SOURCE_REPO}${NC} (${REPO_VISIBILITY})"
echo -e "  대상 경로:      ${GREEN}ts-cxdm/workspace/${TARGET_PATH}${NC}"
echo -e "  Event Type:     ${GREEN}sync-${PROJECT_SLUG}${NC}"
echo -e "  Sync 방식:      ${GREEN}Git Subtree (히스토리 보존, Private 지원)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo

read -p "계속 진행하시겠습니까? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "취소되었습니다."
  exit 0
fi

echo -e "\n${YELLOW}[1/6] WORKSPACE_SYNC_TOKEN 시크릿 확인 중 (원본 레포)...${NC}"
if gh secret list --repo "$SOURCE_REPO" 2>/dev/null | grep -q "WORKSPACE_SYNC_TOKEN"; then
  echo -e "${GREEN}✓ WORKSPACE_SYNC_TOKEN 이미 존재함${NC}"
else
  echo -e "${YELLOW}WORKSPACE_SYNC_TOKEN이 없습니다.${NC}"
  echo "Classic PAT (repo 스코프)가 필요합니다."
  echo "https://github.com/settings/tokens/new?scopes=repo 에서 생성하세요."
  echo
  read -sp "PAT 토큰을 입력하세요 (입력 숨김): " PAT_TOKEN
  echo
  if [[ -z "$PAT_TOKEN" ]]; then
    echo -e "${RED}Error: 토큰이 필요합니다.${NC}"
    exit 1
  fi
  echo "$PAT_TOKEN" | gh secret set WORKSPACE_SYNC_TOKEN --repo "$SOURCE_REPO"
  echo -e "${GREEN}✓ WORKSPACE_SYNC_TOKEN 설정 완료${NC}"
fi

echo -e "\n${YELLOW}[2/6] UPSTREAM_ACCESS_TOKEN 시크릿 확인 중 (workspace 레포)...${NC}"
if gh secret list --repo ts-cxdm/workspace 2>/dev/null | grep -q "UPSTREAM_ACCESS_TOKEN"; then
  echo -e "${GREEN}✓ UPSTREAM_ACCESS_TOKEN 이미 존재함${NC}"
else
  echo -e "${YELLOW}UPSTREAM_ACCESS_TOKEN이 없습니다.${NC}"
  echo "Private 레포 접근을 위해 Classic PAT가 필요합니다."
  echo
  read -sp "PAT 토큰을 입력하세요 (입력 숨김): " PAT_TOKEN
  echo
  if [[ -z "$PAT_TOKEN" ]]; then
    echo -e "${RED}Error: 토큰이 필요합니다.${NC}"
    exit 1
  fi
  echo "$PAT_TOKEN" | gh secret set UPSTREAM_ACCESS_TOKEN --repo ts-cxdm/workspace
  echo -e "${GREEN}✓ UPSTREAM_ACCESS_TOKEN 설정 완료${NC}"
fi

echo -e "\n${YELLOW}[3/6] 원본 레포에 트리거 워크플로우 생성 중...${NC}"

TRIGGER_WORKFLOW=$(cat <<EOF
name: Trigger Sync to Workspace

on:
  push:
    branches:
      - main

jobs:
  trigger-sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger workspace sync
        uses: peter-evans/repository-dispatch@v3
        with:
          token: \${{ secrets.WORKSPACE_SYNC_TOKEN }}
          repository: ts-cxdm/workspace
          event-type: sync-${PROJECT_SLUG}
          client-payload: |
            {
              "source_repo": "\${{ github.repository }}",
              "source_branch": "\${{ github.ref_name }}",
              "source_sha": "\${{ github.sha }}",
              "source_commit_message": \${{ toJSON(github.event.head_commit.message) }},
              "source_author": "\${{ github.event.head_commit.author.name }}"
            }
EOF
)

TEMP_DIR=$(mktemp -d)
gh repo clone "$SOURCE_REPO" "$TEMP_DIR/repo" -- --depth 1 2>/dev/null
cd "$TEMP_DIR/repo"
git config user.name "$(git config --global user.name || echo 'Setup Script')"
git config user.email "$(git config --global user.email || echo 'setup@local')"
mkdir -p .github/workflows
echo "$TRIGGER_WORKFLOW" > .github/workflows/trigger-sync-to-workspace.yml
git add .github/workflows/trigger-sync-to-workspace.yml
if git diff --staged --quiet; then
  echo -e "${GREEN}✓ 트리거 워크플로우 이미 존재함${NC}"
else
  git commit -m "ci: add workflow to sync to workspace repo"
  git push origin main
  echo -e "${GREEN}✓ 트리거 워크플로우 생성 완료${NC}"
fi
cd - > /dev/null

echo -e "\n${YELLOW}[4/6] workspace 레포에 수신 워크플로우 생성 중...${NC}"

RECEIVER_WORKFLOW=$(cat <<EOF
name: Sync ${SOURCE_REPO_NAME} from upstream (Subtree)

on:
  repository_dispatch:
    types: [sync-${PROJECT_SLUG}]

env:
  TARGET_PATH: ${TARGET_PATH}
  PROJECT_SLUG: ${PROJECT_SLUG}
  SOURCE_REPO: ${SOURCE_REPO}

jobs:
  sync-and-create-pr:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - name: Checkout workspace
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: \${{ secrets.GITHUB_TOKEN }}
          persist-credentials: false

      - name: Configure Git with PAT
        env:
          PAT: \${{ secrets.UPSTREAM_ACCESS_TOKEN }}
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git config --global credential.helper store
          echo "https://x-access-token:\${PAT}@github.com" > ~/.git-credentials
          chmod 600 ~/.git-credentials
          git remote set-url origin "https://x-access-token:\${{ secrets.GITHUB_TOKEN }}@github.com/ts-cxdm/workspace.git"

      - name: Create sync branch
        id: branch
        run: |
          BRANCH_NAME="sync/\${{ env.PROJECT_SLUG }}"
          echo "branch_name=\$BRANCH_NAME" >> \$GITHUB_OUTPUT
          git checkout -B "\$BRANCH_NAME"

      - name: Sync via subtree
        id: sync
        continue-on-error: true
        run: |
          if [ -d "\${{ env.TARGET_PATH }}" ]; then
            git subtree pull --prefix=\${{ env.TARGET_PATH }} \\
              https://github.com/\${{ env.SOURCE_REPO }}.git main \\
              --squash -m "sync(\${{ env.PROJECT_SLUG }}): upstream \${{ github.event.client_payload.source_sha }}"
          else
            git subtree add --prefix=\${{ env.TARGET_PATH }} \\
              https://github.com/\${{ env.SOURCE_REPO }}.git main \\
              --squash
          fi

      - name: Handle failure
        if: steps.sync.outcome == 'failure'
        run: |
          echo "## ⚠️ Sync Failed" >> \$GITHUB_STEP_SUMMARY
          echo "Check UPSTREAM_ACCESS_TOKEN has repo access" >> \$GITHUB_STEP_SUMMARY
          exit 1

      - name: Check for changes
        if: steps.sync.outcome == 'success'
        id: changes
        run: |
          if git diff --quiet HEAD~1 HEAD 2>/dev/null; then
            echo "has_changes=false" >> \$GITHUB_OUTPUT
          else
            echo "has_changes=true" >> \$GITHUB_OUTPUT
          fi

      - name: Push branch
        if: steps.sync.outcome == 'success' && steps.changes.outputs.has_changes == 'true'
        run: git push --force origin "\${{ steps.branch.outputs.branch_name }}"

      - name: Create Pull Request (if not exists)
        if: steps.sync.outcome == 'success' && steps.changes.outputs.has_changes == 'true'
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          # Check if PR already exists for this branch
          EXISTING_PR=\$(gh pr list --head "\${{ steps.branch.outputs.branch_name }}" --json number -q '.[0].number' || echo "")
          
          if [ -n "\$EXISTING_PR" ]; then
            echo "## ✅ PR #\$EXISTING_PR updated (branch force-pushed)" >> \$GITHUB_STEP_SUMMARY
            echo "Latest commit: \${{ github.event.client_payload.source_sha }}" >> \$GITHUB_STEP_SUMMARY
          else
            gh pr create \\
              --title "sync(\${{ env.PROJECT_SLUG }}): upstream changes" \\
              --body "## Automated Sync from Upstream (Subtree)

          **Source:** \${{ env.SOURCE_REPO }}
          **Latest Commit:** \\\`\${{ github.event.client_payload.source_sha }}\\\`
          **Author:** \${{ github.event.client_payload.source_author }}

          > This PR auto-updates on each upstream push. Review when ready.

          ---
          *Auto-generated PR*" \\
              --base main \\
              --head "\${{ steps.branch.outputs.branch_name }}" \\
              --label "sync,automated"
            echo "## ✅ New PR created" >> \$GITHUB_STEP_SUMMARY
          fi

      - name: Cleanup
        if: always()
        run: rm -f ~/.git-credentials

      - name: No changes
        if: steps.sync.outcome == 'success' && steps.changes.outputs.has_changes == 'false'
        run: echo "## ✅ Already in sync" >> \$GITHUB_STEP_SUMMARY
EOF
)

WORKSPACE_TEMP=$(mktemp -d)
gh repo clone ts-cxdm/workspace "$WORKSPACE_TEMP/repo" -- --depth 1 2>/dev/null
cd "$WORKSPACE_TEMP/repo"
git config user.name "$(git config --global user.name || echo 'Setup Script')"
git config user.email "$(git config --global user.email || echo 'setup@local')"
mkdir -p .github/workflows
echo "$RECEIVER_WORKFLOW" > ".github/workflows/sync-${PROJECT_SLUG}.yml"
git add ".github/workflows/sync-${PROJECT_SLUG}.yml"
if git diff --staged --quiet; then
  echo -e "${GREEN}✓ 수신 워크플로우 이미 존재함${NC}"
else
  git commit -m "ci: add subtree sync workflow for ${SOURCE_REPO_NAME}"
  git push origin main
  echo -e "${GREEN}✓ 수신 워크플로우 생성 완료${NC}"
fi
cd - > /dev/null

echo -e "\n${YELLOW}[5/6] workspace에 Subtree 초기 설정 확인 중...${NC}"

WORKSPACE_TEMP2=$(mktemp -d)
gh repo clone ts-cxdm/workspace "$WORKSPACE_TEMP2/repo" 2>/dev/null
cd "$WORKSPACE_TEMP2/repo"
git config user.name "$(git config --global user.name || echo 'Setup Script')"
git config user.email "$(git config --global user.email || echo 'setup@local')"
git config http.postBuffer 524288000

if [ -d "$TARGET_PATH" ]; then
  echo -e "${YELLOW}⚠️  ${TARGET_PATH} 폴더가 이미 존재합니다.${NC}"
  echo -e "${YELLOW}   기존 폴더를 subtree로 전환하려면 migrate-to-subtree.sh를 실행하세요.${NC}"
else
  echo -e "${YELLOW}Subtree 초기 추가 중...${NC}"
  PAT_FOR_SUBTREE=$(gh auth token)
  git config --global credential.helper store
  echo "https://x-access-token:${PAT_FOR_SUBTREE}@github.com" > ~/.git-credentials
  chmod 600 ~/.git-credentials
  
  git subtree add --prefix="$TARGET_PATH" "https://github.com/${SOURCE_REPO}.git" main --squash
  git push origin main
  
  rm -f ~/.git-credentials
  echo -e "${GREEN}✓ Subtree 초기 설정 완료${NC}"
fi
cd - > /dev/null

rm -rf "$TEMP_DIR" "$WORKSPACE_TEMP" "$WORKSPACE_TEMP2"

echo -e "\n${YELLOW}[6/6] 설정 완료!${NC}"
echo
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ 설정이 완료되었습니다!${NC}"
echo
echo -e "  이제 ${GREEN}${SOURCE_REPO}${NC}의 main 브랜치에 push하면"
echo -e "  ${GREEN}ts-cxdm/workspace${NC}에 PR이 자동 생성됩니다."
echo
echo -e "  ${BLUE}특징:${NC}"
echo -e "  • Git Subtree 사용 (히스토리 보존)"
echo -e "  • Private/Public 레포 모두 지원"
echo -e "  • 단일 브랜치 방식: PR 중복 없이 자동 업데이트"
echo -e "  • 충돌 발생 시 워크플로우 실패 + 가이드 제공"
echo -e "  • PR 기반 리뷰 후 머지"
echo
echo -e "  테스트: 원본 레포에 테스트 커밋 후 Actions 탭 확인"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

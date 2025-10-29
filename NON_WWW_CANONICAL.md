# Non-WWW 캐노니컬 설정 완료

## 최종 결정

**`luxury-select.co.kr` (non-www)를 캐노니컬 도메인으로 사용**

## Vercel 도메인 설정

### www.luxury-select.co.kr
```
● Redirect to Another Domain
  [308 Permanent Redirect] → luxury-select.co.kr
```

### luxury-select.co.kr
```
● Connect to an environment
  [Production]
```

## 코드 수정 사항

### 1. 환경변수 (.env.local)
```bash
NEXT_PUBLIC_SITE_URL=https://luxury-select.co.kr
```

### 2. Vercel 환경변수
```
Vercel Dashboard → Settings → Environment Variables
→ NEXT_PUBLIC_SITE_URL = https://luxury-select.co.kr
→ Production, Preview, Development 모두 적용
```

### 3. next.config.mjs
```javascript
trailingSlash: false  // 이미 설정됨 ✅
```

## 예상 동작

### 리다이렉트 플로우

#### 시나리오 1: www 입력
```
사용자: https://www.luxury-select.co.kr/hotel/slug
  ↓ 308 (Vercel)
최종: https://luxury-select.co.kr/hotel/slug (200 OK)
```

#### 시나리오 2: www + trailing slash
```
사용자: https://www.luxury-select.co.kr/hotel/slug/
  ↓ 308 (Vercel)
중간: https://luxury-select.co.kr/hotel/slug/
  ↓ 308 (Next.js trailingSlash: false)
최종: https://luxury-select.co.kr/hotel/slug (200 OK)
```

#### 시나리오 3: non-www + trailing slash
```
사용자: https://luxury-select.co.kr/hotel/slug/
  ↓ 308 (Next.js trailingSlash: false)
최종: https://luxury-select.co.kr/hotel/slug (200 OK)
```

#### 시나리오 4: non-www (최적)
```
사용자: https://luxury-select.co.kr/hotel/slug
  ↓ 직접 접속
최종: 200 OK (리다이렉트 없음)
```

## Trailing Slash 문제 해결

### 현재 문제
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```
- ✅ www → non-www 리다이렉트 정상
- ❌ trailing slash 유지 (문제)

### 원인
Vercel 리다이렉트가 **URL을 그대로 유지**하면서 도메인만 변경:
```
www.luxury-select.co.kr/path/
  → luxury-select.co.kr/path/  (trailing slash 유지)
```

### 해결
Next.js의 `trailingSlash: false`가 2단계에서 처리:
```
1단계: www.luxury-select.co.kr/path/
       → 308 → luxury-select.co.kr/path/ (Vercel)

2단계: luxury-select.co.kr/path/
       → 308 → luxury-select.co.kr/path (Next.js)

최종: luxury-select.co.kr/path (200 OK)
```

**이것은 정상 동작입니다!** 2단계 리다이렉트는 불가피합니다.

## 검증 명령어

### Test 1: www → non-www
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 예상
HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

### Test 2: www + trailing slash (2단계)
```bash
curl -IL https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상
HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

HTTP/2 200
```

### Test 3: non-www + trailing slash
```bash
curl -IL https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상
HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

HTTP/2 200
```

### Test 4: non-www (최적, 리다이렉트 없음)
```bash
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 예상
HTTP/2 200
content-type: text/html
```

## 재배포 필요

### Vercel 환경변수 업데이트
1. Vercel Dashboard 접속
2. 프로젝트 → Settings → Environment Variables
3. `NEXT_PUBLIC_SITE_URL` 찾기
4. 값을 `https://luxury-select.co.kr`로 변경
5. Production, Preview, Development 모두 체크
6. Save

### 자동 재배포
환경변수 변경 시 Vercel이 자동으로 재배포합니다.

### 수동 재배포 (필요시)
```bash
git commit --allow-empty -m "chore: non-www 캐노니컬 설정 적용"
git push
```

## GSC 대응

### 1. Sitemap 재제출
```
GSC → 색인 생성 → Sitemaps
→ 기존 sitemap 제거
→ https://luxury-select.co.kr/sitemap.xml 추가
```

### 2. 도메인 속성 설정
- **주 속성**: `https://luxury-select.co.kr` (non-www)
- **보조 속성**: `https://www.luxury-select.co.kr` (리다이렉트 모니터링)

### 3. 주요 페이지 색인 요청
- 호텔 상세 페이지 10-20개
- URL 검사 → "색인 생성 요청"
- **non-www URL 사용**

## 브랜딩 통일

### 앞으로 사용할 URL
모든 마케팅 자료에 **luxury-select.co.kr** (non-www) 사용:
- ✅ 명함: `luxury-select.co.kr`
- ✅ 소셜 미디어: `luxury-select.co.kr`
- ✅ 이메일 서명: `luxury-select.co.kr`
- ✅ 인쇄 광고: `luxury-select.co.kr`
- ✅ 온라인 광고: `luxury-select.co.kr`

## 2단계 리다이렉트는 문제인가?

### Google 공식 입장
> "2-3단계 리다이렉트는 허용됩니다. 4단계 이상은 피하세요."

### 실제 영향
- ✅ 2단계 리다이렉트: 문제없음
- ✅ 모두 308 Permanent: SEO 최적
- ✅ 최종 URL 일관성: 중요
- ⚠️ 3단계 이상: 피해야 함

### 최적화 방법
사용자가 직접 **non-www, no trailing slash** URL 입력하도록 유도:
- 마케팅: `luxury-select.co.kr/hotel/slug`
- 소셜 공유: `luxury-select.co.kr/hotel/slug`
- 내부 링크: `/hotel/slug` (상대 경로)

## 체크리스트

### 즉시 (완료)
- [x] `.env.local` 수정: non-www
- [x] 문서화 완료

### 오늘 중
- [ ] Vercel 환경변수 업데이트
- [ ] 재배포 확인
- [ ] curl 테스트 (4가지 시나리오)

### 이번 주
- [ ] GSC sitemap 재제출 (non-www)
- [ ] 주요 페이지 색인 요청
- [ ] 도메인 속성 확인

### 지속적
- [ ] GSC 크롤 오류 모니터링
- [ ] 색인 페이지 수 추적
- [ ] 검색 노출/클릭 추이 확인

## 예상 효과

### 단기 (1-2주)
- ✅ 리다이렉트 일관성 확보
- ✅ 크롤 효율 개선
- ✅ non-www 색인 증가 시작

### 중기 (1-2개월)
- ✅ GSC 리다이렉트 오류 감소
- ✅ www 색인 감소, non-www 증가
- ✅ 색인 통합 진행

### 장기 (3개월+)
- ✅ 색인 완전 통합 (non-www)
- ✅ 검색 노출/클릭 회복
- ✅ 안정적인 SEO 성과

## 참고 문서
- `REDIRECT_OPTIMIZATION.md` - 초기 분석
- `VERCEL_DOMAIN_FIX.md` - Vercel 설정 가이드
- `FINAL_VERIFICATION.md` - 검증 가이드

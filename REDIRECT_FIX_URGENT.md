# 🚨 긴급: 리다이렉트 문제 해결 방안

## 검증 결과 요약

### 발견된 문제
```bash
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 결과 1: HTTP/2 307 → https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 결과 2: HTTP/2 307 → https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

### 문제점
1. **www 리다이렉트**: `luxury-select.co.kr` → `www.luxury-select.co.kr`
2. **307 Temporary Redirect**: 308 Permanent가 아님
3. **Trailing Slash 불일치**: 같은 URL에 대해 다른 결과
4. **리다이렉트 체인**: non-www → www → trailing slash 정규화 (2단계)

## 원인

### 1. Vercel 도메인 설정
Vercel 프로젝트 설정에서 **www를 primary domain으로 설정**했을 가능성

### 2. 환경변수 불일치
- `.env.local`: `NEXT_PUBLIC_SITE_URL=https://luxury-select.co.kr` (non-www)
- Vercel 설정: `www.luxury-select.co.kr`가 primary

## 해결 방안

### 옵션 A: www를 캐노니컬로 사용 (권장)

#### 1. Vercel 프로젝트 설정 확인
```
Vercel Dashboard → 프로젝트 → Settings → Domains
```

**현재 상태 (추정)**:
- ✅ `www.luxury-select.co.kr` (Primary)
- `luxury-select.co.kr` (Redirect to Primary)

**조치**: 이 설정 유지

#### 2. 환경변수 수정
`.env.local` 및 Vercel 환경변수:
```bash
NEXT_PUBLIC_SITE_URL=https://www.luxury-select.co.kr
```

#### 3. Vercel 리다이렉트 설정 추가
`vercel.json`:
```json
{
  "regions": ["icn1"],
  "redirects": [
    {
      "source": "/:path((?!www).*)",
      "destination": "https://www.luxury-select.co.kr/:path",
      "permanent": true,
      "statusCode": 308
    }
  ]
}
```

**주의**: 위 리다이렉트는 Vercel이 자동으로 처리하므로 불필요할 수 있음

#### 4. 모든 URL 업데이트
- Sitemap: `https://www.luxury-select.co.kr`
- Canonical: `https://www.luxury-select.co.kr`
- OG URL: `https://www.luxury-select.co.kr`
- 내부 링크: 상대 경로 유지 (변경 불필요)

### 옵션 B: non-www를 캐노니컬로 사용

#### 1. Vercel 도메인 설정 변경
```
Vercel Dashboard → 프로젝트 → Settings → Domains
```

**변경**:
- ✅ `luxury-select.co.kr` (Primary로 변경)
- `www.luxury-select.co.kr` (Redirect to Primary)

#### 2. 환경변수 확인
`.env.local` 및 Vercel 환경변수:
```bash
NEXT_PUBLIC_SITE_URL=https://luxury-select.co.kr
```

#### 3. 재배포
도메인 설정 변경 후 재배포 필요

## 권장 사항: 옵션 A (www 사용)

### 이유
1. **현재 Vercel 설정이 www를 primary로 사용 중**
2. 변경 최소화 (환경변수만 수정)
3. www는 SEO에 중립적 (non-www와 동일)
4. 기존 www 색인 유지 가능

### 단점
- 모든 URL이 www로 변경됨
- 기존 non-www 색인은 시간이 지나면서 www로 전환

## 즉시 조치 사항

### 1단계: Vercel 도메인 설정 확인
```
https://vercel.com/[팀명]/[프로젝트명]/settings/domains
```

확인 사항:
- Primary domain이 무엇인지
- Redirect 설정 상태

### 2단계: 캐노니컬 도메인 결정
- **www 사용**: 현재 Vercel 설정 유지
- **non-www 사용**: Vercel에서 primary 변경

### 3단계: 환경변수 통일
선택한 도메인으로 `NEXT_PUBLIC_SITE_URL` 업데이트

### 4단계: Vercel 환경변수 업데이트
```
Vercel Dashboard → 프로젝트 → Settings → Environment Variables
→ NEXT_PUBLIC_SITE_URL 수정
```

### 5단계: 재배포
```bash
git commit -m "fix(seo): www 도메인으로 캐노니컬 통일"
git push
```

## Trailing Slash 불일치 해결

### 원인
Vercel의 www 리다이렉트와 Next.js의 trailing slash 정규화가 충돌

### 해결
1. **Vercel 도메인 리다이렉트를 308로 변경** (Vercel 설정)
2. **Next.js의 trailingSlash: false 유지**
3. **리다이렉트 순서 보장**:
   - 1단계: non-www → www (308, Vercel)
   - 2단계: trailing slash 정규화 (308, Next.js)

### Vercel 설정 확인
Vercel Dashboard에서:
```
Settings → Domains → [도메인] → Edit
→ Redirect Status Code: 308 Permanent
```

## 검증 명령어 (수정 후)

### www를 캐노니컬로 선택한 경우
```bash
# 1. non-www → www (308)
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: 308 → https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 2. www + trailing slash → www (308)
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
# 예상: 308 → https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 3. www + no trailing slash (최종 URL)
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: 200 OK
```

### non-www를 캐노니컬로 선택한 경우
```bash
# 1. www → non-www (308)
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: 308 → https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 2. non-www + trailing slash → non-www (308)
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
# 예상: 308 → https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 3. non-www + no trailing slash (최종 URL)
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: 200 OK
```

## GSC 대응

### 수정 후
1. **Sitemap 재제출** (새 캐노니컬 도메인으로)
2. **도메인 속성 확인**:
   - www 사용 시: `https://www.luxury-select.co.kr` 속성 사용
   - non-www 사용 시: `https://luxury-select.co.kr` 속성 사용
3. **URL 접두어 속성 추가** (반대 도메인):
   - 리다이렉트 모니터링용

### 색인 회복 예상 시간
- 리다이렉트 정리: 즉시
- 크롤 정상화: 1-2주
- 색인 회복: 2-4주
- 검색 노출 회복: 1-3개월

## 체크리스트

### 즉시 (오늘)
- [ ] Vercel 도메인 설정 확인
- [ ] Primary domain 결정 (www vs non-www)
- [ ] Vercel 리다이렉트 status code 308 확인

### 내일
- [ ] `.env.local` 업데이트
- [ ] Vercel 환경변수 업데이트
- [ ] 재배포
- [ ] curl 테스트로 검증

### 이번 주
- [ ] GSC sitemap 재제출
- [ ] 주요 페이지 색인 요청
- [ ] 리다이렉트 체인 모니터링

### 지속적
- [ ] GSC 크롤 오류 모니터링
- [ ] 색인 페이지 수 추적
- [ ] 검색 노출/클릭 추이 확인

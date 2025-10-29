# Vercel Trailing Slash 리다이렉트 수정

## 문제 상황

### 검증 결과
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

**문제**: Vercel 도메인 리다이렉트가 trailing slash를 유지

## 원인 분석

### Vercel 도메인 리다이렉트 동작
```
www.luxury-select.co.kr/path/
  ↓ 308 (Vercel Domain Redirect)
luxury-select.co.kr/path/
  ↑ trailing slash 유지 (문제!)
```

**Vercel 도메인 설정**은:
- ✅ 도메인 변경 (www → non-www)
- ❌ 경로는 그대로 유지 (trailing slash 포함)

### Next.js trailingSlash: false의 한계
- Next.js 설정은 **자체 도메인**에서만 작동
- Vercel 도메인 리다이렉트는 **Next.js 이전 단계**에서 처리
- 따라서 2단계 리다이렉트 발생

## 해결 방법

### vercel.json에 명시적 리다이렉트 추가

```json
{
  "regions": ["icn1"],
  "redirects": [
    {
      "source": "/:path((?!.*\\.).*)/",
      "destination": "/:path",
      "permanent": true
    }
  ]
}
```

### 설정 설명

#### source: `/:path((?!.*\\.).*)/`
- `/:path`: 경로 캡처
- `(?!.*\\.)`: 파일 확장자 없는 경로만 매칭 (negative lookahead)
- `.*/`: trailing slash로 끝나는 경로
- **예시**:
  - ✅ `/hotel/slug/` → 매칭
  - ✅ `/brand/slug/` → 매칭
  - ❌ `/image.jpg` → 제외
  - ❌ `/api/data.json` → 제외

#### destination: `/:path`
- trailing slash 없는 경로로 리다이렉트
- `:path`는 source에서 캡처한 값

#### permanent: true
- 308 Permanent Redirect 사용
- SEO 최적

## 예상 동작 (수정 후)

### 시나리오 1: www + trailing slash
```
입력: https://www.luxury-select.co.kr/hotel/slug/

1단계: 308 → https://luxury-select.co.kr/hotel/slug/ (Vercel Domain)
2단계: 308 → https://luxury-select.co.kr/hotel/slug (Vercel Redirect Rule)
최종: 200 OK
```

### 시나리오 2: non-www + trailing slash
```
입력: https://luxury-select.co.kr/hotel/slug/

1단계: 308 → https://luxury-select.co.kr/hotel/slug (Vercel Redirect Rule)
최종: 200 OK
```

### 시나리오 3: www
```
입력: https://www.luxury-select.co.kr/hotel/slug

1단계: 308 → https://luxury-select.co.kr/hotel/slug (Vercel Domain)
최종: 200 OK
```

### 시나리오 4: non-www (최적)
```
입력: https://luxury-select.co.kr/hotel/slug

직접: 200 OK (리다이렉트 없음)
```

## 재배포 및 검증

### 1단계: 커밋 및 푸시
```bash
git add vercel.json
git commit -m "fix(vercel): trailing slash 리다이렉트 규칙 추가"
git push
```

### 2단계: Vercel 배포 대기
- Vercel Dashboard에서 배포 상태 확인
- 예상 시간: 2-5분

### 3단계: 검증 (배포 후)

#### Test 1: www + trailing slash
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상 결과
HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 두 번째 요청 (자동 follow)
HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 최종
HTTP/2 200
```

#### Test 2: non-www + trailing slash
```bash
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상 결과
HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 최종
HTTP/2 200
```

#### Test 3: 최종 URL 확인
```bash
curl -sL https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/ \
  -o /dev/null -w "최종 URL: %{url_effective}\n"

# 예상 결과
최종 URL: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

## 대안 방법 (참고)

### 옵션 A: Vercel 도메인 설정에서 처리 (불가능)
- Vercel UI에서는 trailing slash 제거 옵션 없음
- 도메인 리다이렉트는 경로를 그대로 유지

### 옵션 B: Next.js Middleware (복잡)
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  if (url.pathname.endsWith('/') && url.pathname !== '/') {
    url.pathname = url.pathname.slice(0, -1)
    return NextResponse.redirect(url, 308)
  }
  
  return NextResponse.next()
}
```
- 장점: 세밀한 제어
- 단점: Edge Function 실행 비용, 복잡성

### 옵션 C: vercel.json (권장) ✅
- 장점: 간단, 명확, Edge Network에서 처리
- 단점: 없음
- **선택한 방법**

## 주의사항

### 파일 경로 제외
```json
"source": "/:path((?!.*\\.).*)/",
```

이 정규식은 **파일 확장자가 없는 경로만** 매칭:
- ✅ `/hotel/slug/` → 리다이렉트
- ❌ `/image.jpg` → 제외 (파일)
- ❌ `/api/data.json` → 제외 (API 응답)
- ❌ `/sitemap.xml` → 제외 (XML)

### API 라우트 보호
API 라우트는 자동으로 제외되지 않으므로 주의:
- `/api/hotels/` → 리다이렉트 발생 가능
- 필요시 추가 규칙으로 제외

```json
{
  "source": "/:path((?!api/)(?!.*\\.).*)/",
  "destination": "/:path",
  "permanent": true
}
```

## 예상 효과

### 즉시
- ✅ 1단계 리다이렉트로 trailing slash 제거
- ✅ www + trailing slash도 2단계로 처리
- ✅ 모든 리다이렉트 308 Permanent

### 단기 (1-2주)
- ✅ 크롤 효율 증가
- ✅ 리다이렉트 체인 단축
- ✅ 사용자 경험 개선 (빠른 로딩)

### 중장기 (1-3개월)
- ✅ GSC 리다이렉트 오류 감소
- ✅ 색인 통합 가속
- ✅ 검색 노출 회복

## 체크리스트

### 즉시
- [x] vercel.json 수정
- [ ] Git commit
- [ ] Git push
- [ ] Vercel 배포 확인

### 배포 후 (5분)
- [ ] curl 테스트 (4가지 시나리오)
- [ ] 최종 URL 확인 (trailing slash 없음)
- [ ] 리다이렉트 단계 확인 (최대 2단계)

### 이번 주
- [ ] 다양한 페이지 타입 테스트
- [ ] API 라우트 정상 작동 확인
- [ ] GSC sitemap 재제출

## 참고

### Vercel Redirects 문서
https://vercel.com/docs/edge-network/redirects

### 정규식 테스트
- `/:path((?!.*\\.).*)/`
- 테스트 도구: https://regex101.com/

### Next.js trailingSlash
https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash

# 리다이렉트 최적화 및 색인 회복 가이드

## 문제 상황
구글 서치 콘솔에서 "리다이렉트" 이유로 색인이 되지 않는 페이지가 증가

## 원인 분석

### 1. Trailing Slash 정책 미명시
- **문제**: next.config.js에 trailingSlash 설정이 없어 Vercel이 자동으로 정규화
- **영향**: 크롤러가 같은 페이지를 다른 URL로 인식 (예: `/hotel/slug` vs `/hotel/slug/`)
- **결과**: 불필요한 리다이렉트 발생, 색인 효율 저하

### 2. URL 일관성 부족
- sitemap, canonical, og:url, 내부 링크가 모두 같은 형식을 사용해야 함
- 혼용 시 크롤 예산 낭비 및 색인 충돌

## 적용된 수정사항

### 1. next.config.mjs 수정
```javascript
const nextConfig = {
  // URL 정규화 정책: trailing slash 없음 (Google 색인 일관성)
  trailingSlash: false,
  // ...
}
```

**효과**:
- 명시적으로 trailing slash 없는 URL 정책 선언
- Next.js가 자동으로 trailing slash 있는 요청을 trailing slash 없는 URL로 리다이렉트 (301)
- Vercel 배포 시에도 동일한 정책 적용

### 2. URL 형식 일관성 검증
모든 URL이 trailing slash 없이 통일됨을 확인:

| 구분 | 형식 | 파일 | 상태 |
|------|------|------|------|
| Sitemap | `/hotel/${slug}` | `src/app/sitemap.ts` | ✅ 일관됨 |
| Sitemap (호텔) | `/hotel/${slug}` | `src/app/sitemap-hotel/route.ts` | ✅ 일관됨 |
| Canonical | `/hotel/${slug}` | `src/app/hotel/[slug]/page.tsx` | ✅ 일관됨 |
| OG URL | `/hotel/${slug}` | `src/app/hotel/[slug]/page.tsx` | ✅ 일관됨 |
| 내부 링크 | `/hotel/${slug}` | 모든 컴포넌트 | ✅ 일관됨 |

### 3. 리다이렉트 남용 방지 확인
- ✅ App Router에서 `redirect()` 함수 미사용 (서버 컴포넌트)
- ✅ 클라이언트 네비게이션은 `router.push()` 사용 (308 리다이렉트 없음)
- ✅ middleware 미사용 (로케일 감지 등 불필요한 리다이렉트 없음)
- ✅ vercel.json에 추가 리다이렉트 규칙 없음

## SEO 최적화 체크리스트

### ✅ 완료된 항목
- [x] `trailingSlash: false` 명시적 설정
- [x] Sitemap URL 형식 일관성 (trailing slash 없음)
- [x] Canonical URL 형식 일관성
- [x] OG URL 형식 일관성
- [x] 내부 링크 형식 일관성
- [x] `redirect()` 함수 미사용 확인
- [x] middleware 리다이렉트 없음 확인
- [x] vercel.json 리다이렉트 설정 없음 확인

### 📋 배포 후 확인 필요
- [ ] GSC에서 크롤 오류 모니터링
- [ ] 리다이렉트 체인 확인 (Screaming Frog 또는 유사 도구)
- [ ] HEAD와 GET 응답 코드 일치 확인 (200)
- [ ] Mobile/Desktop Googlebot 접근 확인

## 예상 효과

### 단기 (1-2주)
- 불필요한 리다이렉트 제거로 크롤 효율 증가
- 크롤 예산 절약으로 더 많은 페이지 크롤 가능

### 중기 (1-2개월)
- GSC "리다이렉트" 오류 감소
- 색인 페이지 수 증가
- 검색 노출 및 클릭 회복

### 장기 (3개월+)
- 안정적인 색인 유지
- 검색 순위 개선 가능성

## 추가 권장 사항

### 1. Vercel 배포 설정 확인
배포 후 다음 URL 패턴 테스트:
```bash
# trailing slash 있는 요청이 없는 URL로 리다이렉트되는지 확인
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
# → 301 → https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# trailing slash 없는 URL이 200 응답하는지 확인
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# → 200 OK
```

### 2. GSC 재크롤 요청
수정 후 주요 페이지들에 대해 "URL 검사" → "색인 생성 요청"

### 3. 모니터링
- GSC "페이지" 보고서에서 "리다이렉트" 오류 추적
- 주간 색인 페이지 수 변화 확인
- 검색 노출/클릭 추이 모니터링

## 관련 파일
- `next.config.mjs` - trailing slash 정책
- `src/app/sitemap.ts` - 메인 sitemap
- `src/app/sitemap-hotel/route.ts` - 호텔 sitemap
- `src/app/hotel/[slug]/page.tsx` - 호텔 상세 메타데이터
- 모든 `*-card*.tsx` - 내부 링크 컴포넌트

## 참고 문서
- Next.js 15 trailingSlash: https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash
- Google 리다이렉트 가이드: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- Vercel Next.js 설정: https://vercel.com/docs/frameworks/nextjs

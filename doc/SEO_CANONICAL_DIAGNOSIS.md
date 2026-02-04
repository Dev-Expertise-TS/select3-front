# SEO Canonical URL 진단 보고서

**진단 일시**: 2024년  
**대상**: 모든 페이지의 canonical URL 설정

## 📋 요약

- ✅ **정상 설정**: 15개 페이지
- ❌ **문제 발견**: 4개 페이지
- ⚠️ **개선 권장**: 2개 페이지

---

## ❌ Canonical URL이 누락된 페이지

### 1. 홈페이지 (`/`)
**파일**: `src/app/page.tsx`

**문제점**:
- 페이지 자체에 canonical URL이 명시되어 있지 않음
- `layout.tsx`에서 루트 canonical이 설정되어 있지만, 페이지별 명시적 설정 권장

**권장 수정**:
```typescript
export const metadata: Metadata = {
  // ... 기존 메타데이터
  alternates: {
    canonical: 'https://luxury-select.co.kr'
  }
}
```

---

### 2. 검색 결과 페이지 (`/search-results`)
**파일**: `src/app/search-results/page.tsx`

**문제점**:
- canonical URL이 완전히 누락됨
- 쿼리 파라미터가 있어도 동일한 canonical로 통일해야 함

**권장 수정**:
```typescript
export const metadata: Metadata = {
  // ... 기존 메타데이터
  alternates: {
    canonical: 'https://luxury-select.co.kr/search-results'
  }
}
```

**참고**: 검색 결과 페이지는 쿼리 파라미터(`?q=...`)가 있어도 동일한 canonical URL을 사용해야 중복 콘텐츠 문제를 방지할 수 있습니다.

---

### 3. 통합 검색 페이지 (`/search`)
**파일**: `src/app/search/page.tsx`

**문제점**:
- canonical URL이 누락됨

**권장 수정**:
```typescript
export const metadata: Metadata = {
  // ... 기존 메타데이터
  alternates: {
    canonical: 'https://luxury-select.co.kr/search'
  }
}
```

---

### 4. 브랜드 목록 페이지 (`/brand`)
**파일**: `src/app/brand/page.tsx`

**문제점**:
- canonical URL이 누락됨

**권장 수정**:
```typescript
export const metadata: Metadata = {
  // ... 기존 메타데이터
  alternates: {
    canonical: 'https://luxury-select.co.kr/brand'
  }
}
```

---

## ⚠️ 개선 권장 사항

### 1. Layout.tsx의 루트 Canonical
**파일**: `src/app/layout.tsx`

**현재 상태**:
- 루트 canonical이 하드코딩되어 있음: `'https://luxury-select.co.kr'`
- 이는 기본값으로 작동하지만, 각 페이지에서 명시적으로 설정하는 것이 더 명확함

**권장 사항**:
- 각 페이지에서 명시적으로 canonical을 설정
- Layout의 canonical은 기본값으로만 유지하거나 제거 고려

---

### 2. 쿼리 파라미터가 있는 페이지들

**영향받는 페이지**:
- `/hotel?brand_id=...` - 이미 canonical 설정됨 ✅
- `/search-results?q=...` - canonical 누락 ❌ (위에서 언급)

**권장 사항**:
- 모든 쿼리 파라미터가 있는 페이지는 쿼리 파라미터를 제외한 base URL을 canonical로 설정
- 예: `/search-results?q=도쿄` → canonical: `/search-results`

---

## ✅ 정상적으로 설정된 페이지

다음 페이지들은 canonical URL이 올바르게 설정되어 있습니다:

1. ✅ `/about` - `src/app/about/page.tsx`
2. ✅ `/contact` - `src/app/contact/page.tsx`
3. ✅ `/terms` - `src/app/terms/page.tsx`
4. ✅ `/promotion` - `src/app/promotion/page.tsx`
5. ✅ `/testimonials` - `src/app/testimonials/page.tsx`
6. ✅ `/with-kids` - `src/app/with-kids/page.tsx`
7. ✅ `/hotel` - `src/app/hotel/page.tsx`
8. ✅ `/blog` - `src/app/blog/page.tsx`
9. ✅ `/hotel/brand` - `src/app/hotel/brand/page.tsx`
10. ✅ `/hotel/[slug]` - `src/app/hotel/[slug]/page.tsx` (동적)
11. ✅ `/hotel/brand/[brandSlug]` - `src/app/hotel/brand/[brandSlug]/page.tsx` (동적)
12. ✅ `/hotel/chain/[chainSlug]` - `src/app/hotel/chain/[chainSlug]/page.tsx` (동적)
13. ✅ `/blog/[slug]` - `src/app/blog/[slug]/page.tsx` (동적)
14. ✅ `/brand/detail/[brandSlug]` - `src/app/brand/detail/[brandSlug]/page.tsx` (동적)
15. ✅ `/hotel-recommendations/[slug]` - `src/app/hotel-recommendations/[slug]/page.tsx` (동적)

---

## 🔍 Canonical URL 형식 일관성 검증

### ✅ 올바른 형식
- 모든 canonical URL이 `https://luxury-select.co.kr`로 시작
- trailing slash 없음 (일관성 유지)
- 쿼리 파라미터 제외

### ✅ 환경 변수 사용
- 대부분의 페이지가 `process.env.NEXT_PUBLIC_SITE_URL` 사용
- Fallback: `'https://luxury-select.co.kr'`

---

## 📝 수정 우선순위

### 🔴 높음 (즉시 수정 필요)
1. `/search-results` - 검색 결과 페이지는 트래픽이 많을 수 있음
2. `/` (홈페이지) - 가장 중요한 페이지

### 🟡 중간 (빠른 시일 내 수정)
3. `/search` - 검색 기능 페이지
4. `/brand` - 브랜드 목록 페이지

---

## 🛠️ 수정 체크리스트

- [ ] `src/app/page.tsx`에 canonical 추가
- [ ] `src/app/search-results/page.tsx`에 canonical 추가
- [ ] `src/app/search/page.tsx`에 canonical 추가
- [ ] `src/app/brand/page.tsx`에 canonical 추가
- [ ] 수정 후 빌드 테스트 (`pnpm build`)
- [ ] 배포 후 실제 페이지에서 canonical 태그 확인

---

## 📚 참고 자료

- [Google: Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- 프로젝트 내 SEO 문서: `docs/SEO_OPTIMIZATION_SUMMARY.md`

---

## ✅ 검증 방법

수정 후 다음 명령어로 확인:

```bash
# 홈페이지
curl -s https://luxury-select.co.kr | grep -i canonical

# 검색 결과 페이지
curl -s https://luxury-select.co.kr/search-results | grep -i canonical

# 검색 페이지
curl -s https://luxury-select.co.kr/search | grep -i canonical

# 브랜드 페이지
curl -s https://luxury-select.co.kr/brand | grep -i canonical
```

예상 출력:
```html
<link rel="canonical" href="https://luxury-select.co.kr/..." />
```


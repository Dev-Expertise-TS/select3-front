# 테스트 및 디버그 페이지 안내

## 개발 전용 페이지

다음 페이지들은 **개발 환경에서만** 사용됩니다:

### 테스트 페이지 (`/test-*`)
- `/test-apostrophe` - 어퍼스트로피 URL 처리 테스트
- `/test-blog-cta` - 블로그 CTA 컴포넌트 테스트
- `/test-hero-image` - 히어로 이미지 테스트
- `/test-hotel-card-cta` - 호텔 카드 CTA 테스트
- `/test-hotel-cards` - 호텔 카드 컴포넌트 테스트
- `/test-hotel-not-found` - 호텔 404 처리 테스트
- `/test-hotel-storage-images` - 호텔 이미지 스토리지 테스트
- `/test-image-exists` - 이미지 존재 여부 테스트
- `/test-images` - 이미지 로딩 테스트
- `/test-mandarin-images` - 만다린 오리엔탈 이미지 테스트
- `/test-select-hotels` - 셀렉트 호텔 테스트
- `/test-storage-api` - 스토리지 API 테스트
- `/test-supabase-images` - Supabase 이미지 테스트
- `/test-url-debug` - URL 디버깅 테스트
- `/test-url-generation` - URL 생성 테스트

### 디버그 페이지 (`/debug*`)
- `/debug` - 전체 디버그 대시보드
- `/debug-apostrophe-url` - 어퍼스트로피 URL 디버깅
- `/debug-gallery-images` - 갤러리 이미지 디버깅
- `/debug-grand-hyatt-images` - 그랜드 하얏트 이미지 디버깅
- `/debug-hotel-images/[slug]` - 특정 호텔 이미지 디버깅

## 프로덕션 배포

`.vercelignore` 파일에 의해 **프로덕션 빌드에서 자동 제외**됩니다.

## 로컬 개발

개발 서버(`pnpm dev`)에서는 모든 페이지에 접근 가능합니다.


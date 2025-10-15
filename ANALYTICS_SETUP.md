# Google Analytics 4 (GA4) 설정 가이드

## 환경변수 설정

`.env.local` 파일에 다음을 추가:

```bash
NEXT_PUBLIC_GA_ID=G-6Y4X23JB12
```

## 설정된 컴포넌트

### 1. GoogleAnalytics 컴포넌트
- **위치**: `src/components/analytics/google-analytics.tsx`
- **기능**: GA4 스크립트 로드 및 초기 설정

### 2. AnalyticsProvider 컴포넌트
- **위치**: `src/components/analytics/analytics-provider.tsx`
- **기능**: 환경변수 확인 후 GoogleAnalytics 컴포넌트 렌더링

### 3. useAnalytics 훅
- **위치**: `src/hooks/use-analytics.ts`
- **기능**: 페이지 뷰 추적 및 이벤트 추적 함수 제공

## 자동 추적되는 이벤트

### 페이지 뷰 추적
- 모든 페이지 이동 시 자동으로 추적
- Next.js App Router와 완전 호환

### 호텔 상세 페이지
- 호텔 조회 시 자동으로 `view_item` 이벤트 발생
- 호텔명과 호텔 ID 포함

### 카카오톡 상담 버튼
- 클릭 시 `conversion` 이벤트 발생
- 이벤트 라벨: `kakao_consultation_no_rooms`

## 수동 이벤트 추적 사용법

```tsx
import { useAnalytics } from '@/hooks/use-analytics'

function MyComponent() {
  const { trackEvent, trackSearch, trackClick, trackConversion } = useAnalytics()

  const handleSearch = (searchTerm: string) => {
    trackSearch(searchTerm, resultsCount)
  }

  const handleButtonClick = () => {
    trackClick('button', 'header')
  }

  const handleConversion = () => {
    trackConversion('contact_form')
  }

  return (
    // 컴포넌트 JSX
  )
}
```

## 사용 가능한 추적 함수

### trackEvent(action, category, label?, value?)
- 일반적인 이벤트 추적
- 예: `trackEvent('click', 'button', 'header_nav')`

### trackHotelView(hotelName, hotelId)
- 호텔 상세 페이지 뷰 추적
- 예: `trackHotelView('소피텔 파리', '13212')`

### trackSearch(searchTerm, resultsCount)
- 검색 이벤트 추적
- 예: `trackSearch('파리 호텔', 25)`

### trackClick(element, location)
- 클릭 이벤트 추적
- 예: `trackClick('button', 'header')`

### trackConversion(conversionType)
- 전환 이벤트 추적
- 예: `trackConversion('kakao_consultation')`

## GA4 대시보드에서 확인 가능한 데이터

### 실시간 보고서
- 현재 활성 사용자
- 실시간 페이지 뷰
- 실시간 이벤트

### 이벤트 보고서
- `view_item`: 호텔 상세 페이지 조회
- `search`: 검색 이벤트
- `click`: 클릭 이벤트
- `conversion`: 전환 이벤트

### 전환 보고서
- `kakao_consultation_no_rooms`: 객실 없을 때 카카오톡 상담 클릭

## 개발 환경에서 테스트

1. 브라우저 개발자 도구 > Console
2. GA4 이벤트 확인:
   ```javascript
   // gtag 함수가 로드되었는지 확인
   console.log(typeof window.gtag)
   
   // 수동으로 이벤트 발생
   gtag('event', 'test_event', {
     event_category: 'test',
     event_label: 'manual_test'
   })
   ```

## 배포 시 주의사항

1. 환경변수가 올바르게 설정되었는지 확인
2. GA4 속성에서 올바른 도메인이 설정되었는지 확인
3. 실시간 보고서에서 이벤트가 정상적으로 수집되는지 확인

## 추가 설정 가능한 이벤트

필요에 따라 다음 이벤트들을 추가할 수 있습니다:

- 호텔 이미지 클릭
- 검색 필터 사용
- 페이지 스크롤 깊이
- 세션 시간
- 사용자 행동 패턴

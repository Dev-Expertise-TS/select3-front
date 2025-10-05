# 이미지 컴포넌트 사용 가이드

## 개요

이미지 로딩, 에러 처리, 최적화를 통합한 스마트 이미지 시스템입니다.

## 컴포넌트

### 1. SmartImage

통합된 이미지 컴포넌트로 모든 이미지 관련 기능을 포함합니다.

```tsx
import { SmartImage } from '@/components/ui/smart-image'

<SmartImage
  src="https://example.com/image.jpg"
  alt="이미지 설명"
  width={800}
  height={600}
  quality={85}
  format="avif"
  autoPreload={true}
  onLoad={(src) => console.log('로드 완료:', src)}
  onError={(src, error) => console.error('로드 실패:', src, error)}
/>
```

#### Props

- `src`: 이미지 URL
- `alt`: 대체 텍스트
- `width/height`: 이미지 크기
- `quality`: 이미지 품질 (1-100, 기본값: 85)
- `format`: 이미지 포맷 ('webp' | 'avif' | 'auto', 기본값: 'auto')
- `priority`: 우선 로딩 여부 (기본값: false)
- `fill`: 부모 컨테이너에 맞춤 (기본값: false)
- `objectFit`: 이미지 맞춤 방식 (기본값: 'cover')
- `autoPreload`: 자동 preload 여부 (기본값: true)
- `showLoadingState`: 로딩 상태 표시 여부 (기본값: true)
- `fallbackComponent`: 에러 시 표시할 컴포넌트
- `onLoad`: 로드 완료 콜백
- `onError`: 로드 실패 콜백

### 2. HotelHeroImage

호텔 메인 이미지용 최적화된 컴포넌트입니다.

```tsx
import { HotelHeroImage } from '@/components/ui/smart-image'

<HotelHeroImage
  src="https://example.com/hotel-hero.jpg"
  alt="호텔 메인 이미지"
  className="w-full h-64"
/>
```

### 3. HotelThumbnail

호텔 썸네일 이미지용 컴포넌트입니다.

```tsx
import { HotelThumbnail } from '@/components/ui/smart-image'

<HotelThumbnail
  src="https://example.com/hotel-thumb.jpg"
  alt="호텔 썸네일"
  isActive={true}
  onClick={() => console.log('클릭됨')}
/>
```

## 훅

### useImageLoading

이미지 로딩 상태를 관리하는 훅입니다.

```tsx
import { useImageLoading } from '@/hooks/use-image-loading'

function MyComponent() {
  const {
    loadingStates,
    preloadedImages,
    preloadImage,
    isImageLoading,
    isImageLoaded,
    isImageError,
    clearCache
  } = useImageLoading({
    preloadOnMount: true,
    checkExistence: true,
    onLoad: (src) => console.log('로드됨:', src),
    onError: (src, error) => console.error('에러:', src, error)
  })

  return (
    <div>
      {isImageLoading('image.jpg') && <div>로딩 중...</div>}
      {isImageLoaded('image.jpg') && <div>로드 완료</div>}
      {isImageError('image.jpg') && <div>로드 실패</div>}
    </div>
  )
}
```

## 유틸리티 함수

### image-utils.ts

```tsx
import { 
  isValidImageUrl, 
  getSafeImageUrl, 
  filterValidImageUrls,
  processHotelImages,
  updateImageLoadingState,
  getImageLoadingState,
  resetImageLoadingStates
} from '@/lib/image-utils'

// URL 유효성 검사
const isValid = isValidImageUrl('https://example.com/image.jpg')

// 안전한 URL 가져오기
const safeUrl = getSafeImageUrl(possiblyInvalidUrl, '/fallback.jpg')

// 유효한 URL들만 필터링
const validUrls = filterValidImageUrls(urlArray)

// 호텔 이미지 데이터 처리
const images = processHotelImages(hotelData)

// 로딩 상태 관리
const newStates = updateImageLoadingState(states, 'image.jpg', 'loaded')
const state = getImageLoadingState(states, 'image.jpg')
const emptyStates = resetImageLoadingStates()
```

### image-cache.ts

```tsx
import { checkImageExists, checkMultipleImages } from '@/lib/image-cache'

// 단일 이미지 존재 여부 확인
const exists = await checkImageExists('https://example.com/image.jpg')

// 여러 이미지 존재 여부 확인
const results = await checkMultipleImages([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg'
])
```

## 에러 처리

### ImageErrorBoundary

이미지 로딩 에러를 처리하는 Error Boundary입니다.

```tsx
import { ImageErrorBoundary } from '@/components/ui/image-error-boundary'

<ImageErrorBoundary 
  src="image.jpg" 
  alt="이미지"
  fallbackComponent={<div>이미지를 불러올 수 없습니다</div>}
>
  <img src="image.jpg" alt="이미지" />
</ImageErrorBoundary>
```

### ImageLoadingState

로딩 상태를 표시하는 컴포넌트입니다.

```tsx
import { ImageLoadingState } from '@/components/ui/image-error-boundary'

<ImageLoadingState 
  isLoading={true} 
  hasError={false}
  className="w-full h-64"
>
  <img src="image.jpg" alt="이미지" />
</ImageLoadingState>
```

## 성능 최적화

1. **자동 Preload**: `autoPreload={true}`로 설정하면 이미지가 자동으로 preload됩니다.
2. **캐싱**: 이미지 존재 여부 확인 결과가 캐시됩니다.
3. **지연 로딩**: `priority={false}`로 설정하면 지연 로딩됩니다.
4. **포맷 최적화**: AVIF/WebP 포맷으로 자동 변환됩니다.
5. **크기 최적화**: `sizes` prop으로 반응형 이미지를 제공합니다.

## 마이그레이션 가이드

### OptimizedImage에서 SmartImage로

```tsx
// 이전
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src="image.jpg"
  alt="이미지"
  width={800}
  height={600}
/>

// 이후
import { SmartImage } from '@/components/ui/smart-image'

<SmartImage
  src="image.jpg"
  alt="이미지"
  width={800}
  height={600}
  autoPreload={true}
/>
```

### 기존 이미지 로딩 로직에서 useImageLoading으로

```tsx
// 이전
const [loadingStates, setLoadingStates] = useState(new Map())

// 이후
const { loadingStates, preloadImage, isImageLoading } = useImageLoading()
```

/**
 * 이미지 관련 유틸리티 함수들
 */

// 유효한 이미지 URL인지 검증하는 함수
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  // 빈 문자열 체크
  if (url.trim() === '') {
    return false
  }

  // 기본 placeholder나 잘못된 경로 체크
  const invalidPatterns = [
    /^\/[^\/]*\.(png|jpg|jpeg|gif|webp|avif)$/i, // 루트 경로의 이미지 파일 (예: /hotel-name.png)
    /^\/next\.svg$/i,
    /^\/vercel\.svg$/i,
    /^\/file\.svg$/i,
    /^\/globe\.svg$/i,
    /^\/window\.svg$/i,
    /^null$/i,
    /^undefined$/i,
    /^$/,
  ]

  // 허용된 외부 도메인들
  const allowedDomains = [
    'images.unsplash.com',
    'via.placeholder.com',
    'picsum.photos',
    'source.unsplash.com',
    'framerusercontent.com',
    'bnnuekzyfuvgeefmhmnp.supabase.co' // Supabase 스토리지
  ]

  // 잘못된 패턴 체크
  for (const pattern of invalidPatterns) {
    if (pattern.test(url)) {
      return false
    }
  }

  // 유효한 URL 형식인지 체크
  try {
    // 상대 경로인 경우
    if (url.startsWith('/')) {
      // public 폴더 내의 유효한 경로인지 체크
      const validPublicPaths = [
        '/brand-image/',
        '/destination-image/',
        '/select_logo.avif',
        '/favicon.ico',
        '/favicon.png',
        '/robots.txt',
        '/placeholder.svg'
      ]
      
      const isValidPublicPath = validPublicPaths.some(path => url.startsWith(path))
      if (!isValidPublicPath) {
        return false
      }
    }
    
    // 절대 URL인 경우
    if (url.startsWith('http')) {
      const urlObj = new URL(url)
      const hostname = urlObj.hostname
      
      // 허용된 도메인인지 확인
      const isAllowedDomain = allowedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )
      
      if (!isAllowedDomain) {
        console.warn(`⚠️ 허용되지 않은 외부 도메인: ${hostname}`)
        return false
      }
      
      // Supabase 스토리지 URL의 경우 추가 검증
      if (hostname.includes('supabase.co')) {
        // Supabase 스토리지 경로가 올바른지 확인
        if (!urlObj.pathname.includes('/storage/v1/object/public/')) {
          console.warn(`⚠️ 잘못된 Supabase 스토리지 경로: ${urlObj.pathname}`)
          return false
        }
      }
    }
    
    return true
  } catch {
    return false
  }
}

// 이미지 URL을 안전하게 처리하는 함수
export function getSafeImageUrl(url: string | null | undefined, fallback: string = '/placeholder.svg'): string {
  if (isValidImageUrl(url)) {
    // Supabase Storage URL인 경우 URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
    if (url && url.includes('supabase.co/storage/v1/object/public/')) {
      const decodedUrl = decodeURIComponent(url);
      
      // 디버깅 로그 제거됨
      
      return decodedUrl;
    }
    
    return url!
  }
  
  console.warn(`⚠️ 유효하지 않은 이미지 URL: ${url}, fallback 사용: ${fallback}`)
  return fallback
}

// 이미지 URL 배열을 필터링하는 함수
export function filterValidImageUrls(urls: (string | null | undefined)[]): string[] {
  return urls
    .filter((url): url is string => isValidImageUrl(url))
    .map(url => url!)
}

// 호텔 이미지 데이터를 안전하게 처리하는 함수
export function processHotelImages(hotel: any, mediaData?: any[]): Array<{
  id: string
  media_path: string
  alt: string
  isMain: boolean
}> {
  if (!hotel) return []
  
  // select_hotel_media 테이블 데이터를 갤러리 형식으로 변환
  if (mediaData && mediaData.length > 0) {
    return mediaData.map((media, index) => ({
      id: `media_${media.id || index}`,
      media_path: media.media_path,
      alt: `${hotel.property_name_ko} - 이미지 ${index + 1}`,
      isMain: index === 0
    }))
  }
  
  return []
}

// 이미지 로딩 상태를 관리하는 타입
export type ImageLoadingState = 'loading' | 'loaded' | 'error'

// 이미지 로딩 상태를 업데이트하는 함수
export function updateImageLoadingState(
  states: Map<string, ImageLoadingState>,
  key: string,
  state: ImageLoadingState
): Map<string, ImageLoadingState> {
  const newStates = new Map(states)
  newStates.set(key, state)
  return newStates
}

// 이미지 로딩 상태를 Map에서 조회하는 함수
export function getImageLoadingState(
  states: Map<string, ImageLoadingState>,
  key: string
): ImageLoadingState | undefined {
  return states.get(key)
}

// 이미지 로딩 상태를 초기화하는 함수
export function resetImageLoadingStates(): Map<string, ImageLoadingState> {
  return new Map()
}

// 이미지 오류 핸들러
export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/placeholder.svg'
): void {
  const target = e.currentTarget as HTMLImageElement
  
  // 이미 플레이스홀더로 대체된 경우 무한 루프 방지
  if (target.src.includes('placeholder.svg') || target.src.includes('placeholder.png')) {
    return
  }
  
  // 개발 환경에서만 에러 로그 출력
  if (process.env.NODE_ENV === 'development') {
    console.warn('이미지 로드 실패, 플레이스홀더로 대체:', target.src)
  }
  
  target.src = fallbackSrc
}

// 이미지 로드 성공 핸들러
export function handleImageLoad(
  src: string,
  onLoad?: (src: string) => void
): void {
  console.log('이미지 로드 성공:', src)
  onLoad?.(src)
}

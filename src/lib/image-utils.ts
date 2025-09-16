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
    /^\/placeholder\.svg$/i,
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
        '/robots.txt'
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
export function processHotelImages(hotel: any): Array<{
  id: string
  media_path: string
  alt: string
  isMain: boolean
}> {
  if (!hotel) return []

  const images = []
  
  // image_1을 가장 큰 그리드에 사용하기 위해 첫 번째로 추가
  if (isValidImageUrl(hotel.image_1)) {
    images.push({
      id: 'image_1',
      media_path: hotel.image_1,
      alt: `${hotel.property_name_ko} - 메인 이미지`,
      isMain: true
    })
  }
  
  // 나머지 이미지들 추가
  const imageFields = ['image_2', 'image_3', 'image_4', 'image_5']
  imageFields.forEach((field, index) => {
    if (isValidImageUrl(hotel[field])) {
      images.push({
        id: field,
        media_path: hotel[field],
        alt: `${hotel.property_name_ko} - 갤러리 이미지 ${index + 2}`,
        isMain: false
      })
    }
  })
  
  return images
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

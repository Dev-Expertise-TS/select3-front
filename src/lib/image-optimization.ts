/**
 * 이미지 최적화 유틸리티
 * Supabase Storage의 이미지 변환 API를 활용하여 이미지 로딩 성능 개선
 */

interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'origin'
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * 브라우저 AVIF 지원 여부 확인 (클라이언트 사이드)
 * Next.js Image 컴포넌트가 자동으로 처리하므로 참고용
 */
export function checkAVIFSupport(): boolean {
  if (typeof window === 'undefined') return false
  const canvas = document.createElement('canvas')
  if (canvas.getContext && canvas.getContext('2d')) {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  }
  return false
}

/**
 * Supabase Storage 이미지 URL에 변환 파라미터를 추가합니다.
 * @param url - 원본 이미지 URL
 * @param options - 변환 옵션
 * @returns 최적화된 이미지 URL
 */
export function optimizeSupabaseImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Supabase Storage URL이 아니면 원본 반환
  if (!url || !url.includes('supabase')) {
    return url
  }

  // 기본값 설정
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options

  // URL에 이미 쿼리 파라미터가 있는지 확인
  const hasQuery = url.includes('?')
  const separator = hasQuery ? '&' : '?'

  // 변환 파라미터 구성
  const params: string[] = []
  
  if (width) params.push(`width=${width}`)
  if (height) params.push(`height=${height}`)
  if (quality) params.push(`quality=${quality}`)
  if (format !== 'origin') params.push(`format=${format}`)
  if (resize) params.push(`resize=${resize}`)

  // 파라미터가 없으면 원본 반환
  if (params.length === 0) {
    return url
  }

  return `${url}${separator}${params.join('&')}`
}

/**
 * 히어로 캐로셀용 이미지 최적화 (모바일)
 * - 화면 전체 너비
 * - Aspect ratio: 4:2 or 4:3
 * - AVIF 포맷 사용 (LCP 최적화)
 */
export function optimizeHeroImageMobile(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 1200, // 모바일 최대 너비 (레티나 대응)
    quality: 85,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 히어로 캐로셀용 이미지 최적화 (데스크탑 그리드)
 * - 4개 그리드 중 1개 (약 25vw)
 * - Aspect ratio: 4:3
 * - AVIF 포맷 사용 (LCP 최적화)
 */
export function optimizeHeroImageDesktop(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 600, // 데스크탑 그리드 1개 크기 (레티나 대응)
    quality: 85,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 호텔 카드용 이미지 최적화
 * - 호텔 카드 그리드용
 * - AVIF 포맷 사용 (WebP보다 20-30% 더 작은 파일 크기)
 */
export function optimizeHotelCardImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 600,
    quality: 80,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 썸네일용 이미지 최적화
 * - AVIF 포맷 사용 (WebP보다 20-30% 더 작은 파일 크기)
 */
export function optimizeThumbnail(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 300,
    quality: 75,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 갤러리 그리드용 이미지 최적화
 * - 4개 컬럼 그리드
 * - Aspect ratio: 4:3
 * - AVIF 포맷 사용 (WebP보다 20-30% 더 작은 파일 크기)
 */
export function optimizeGalleryGrid(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 500,
    quality: 80,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 갤러리 상세 보기용 이미지 최적화 (큰 이미지)
 * - 전체 화면 보기
 * - 고품질
 * - AVIF 포맷 사용 (WebP보다 20-30% 더 작은 파일 크기)
 */
export function optimizeGalleryDetail(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 2000,
    quality: 90,
    format: 'avif', // AVIF로 변경
    resize: 'contain'
  })
}

/**
 * 갤러리 썸네일용 이미지 최적화 (작은 썸네일)
 * - 64px 크기
 * - AVIF 포맷 사용 (WebP보다 20-30% 더 작은 파일 크기)
 */
export function optimizeGalleryThumbnail(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 128, // 레티나 대응
    quality: 75,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 호텔 메인 이미지 최적화 (HotelInfo 컴포넌트)
 * - 큰 메인 이미지
 * - AVIF 포맷 사용 (고품질 이미지에 최적)
 */
export function optimizeHotelMainImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 1600,
    quality: 90,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}

/**
 * 호텔 작은 이미지 최적화 (HotelInfo 사이드 이미지)
 * - 작은 보조 이미지
 * - AVIF 포맷 사용 (WebP보다 20-30% 더 작은 파일 크기)
 */
export function optimizeHotelSmallImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 400,
    quality: 85,
    format: 'avif', // AVIF로 변경
    resize: 'cover'
  })
}


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
 * Supabase Storage 이미지 URL을 정리합니다.
 * Next.js Image 컴포넌트가 최적화를 전담하므로 Supabase 파라미터는 제거합니다.
 * @param url - 원본 이미지 URL
 * @param options - 변환 옵션 (더 이상 사용되지 않음)
 * @returns 정리된 이미지 URL
 */
export function optimizeSupabaseImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Supabase Storage URL이 아니면 원본 반환
  if (!url || !url.includes('supabase')) {
    return url
  }

  // URL에서 기존 쿼리 파라미터 제거 (Next.js Image가 최적화를 전담)
  // Supabase Storage 변환 파라미터와 Next.js 파라미터가 충돌하는 것을 방지
  const urlWithoutParams = url.split('?')[0]
  
  return urlWithoutParams
}

/**
 * 히어로 캐로셀용 이미지 최적화 (모바일)
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 * - Next.js Image의 quality={70} 설정 사용
 */
export function optimizeHeroImageMobile(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 히어로 캐로셀용 이미지 최적화 (데스크탑 그리드)
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 * - Next.js Image의 quality={70} 설정 사용
 */
export function optimizeHeroImageDesktop(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 호텔 카드용 이미지 최적화
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeHotelCardImage(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 썸네일용 이미지 최적화
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeThumbnail(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 갤러리 그리드용 이미지 최적화
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeGalleryGrid(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 갤러리 상세 보기용 이미지 최적화 (큰 이미지)
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeGalleryDetail(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 갤러리 썸네일용 이미지 최적화 (작은 썸네일)
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeGalleryThumbnail(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 호텔 메인 이미지 최적화 (HotelInfo 컴포넌트)
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeHotelMainImage(url: string): string {
  return optimizeSupabaseImage(url, {})
}

/**
 * 호텔 작은 이미지 최적화 (HotelInfo 사이드 이미지)
 * - Supabase 파라미터를 제거하여 Next.js Image가 최적화 전담
 */
export function optimizeHotelSmallImage(url: string): string {
  return optimizeSupabaseImage(url, {})
}


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
 * Supabase Storage 이미지 URL에 Transform API 파라미터를 추가합니다.
 * 
 * Supabase Transform API 장점:
 * - CDN 캐시 활용 (Cloudflare)
 * - 원본 서버에서 변환 (빠름)
 * - Vercel Image Optimization보다 비용 효율적
 * - 더 많은 옵션 (blur, sharpen, rotate 등)
 * 
 * @param url - 원본 이미지 URL
 * @param options - 변환 옵션
 * @returns Supabase Transform API URL
 */
export function optimizeSupabaseImage(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Supabase Storage URL이 아니면 원본 반환
  if (!url || !url.includes('supabase.co/storage')) {
    return url
  }

  // 이미 transform 파라미터가 있으면 제거 (중복 방지)
  const cleanUrl = url.split('?')[0]

  // 기본값 설정
  const {
    width,
    height,
    quality = 80,
    format = 'origin',  // 원본 포맷 유지 (AVIF → AVIF)
    resize = 'cover'
  } = options

  // Transform 파라미터 구성
  const params: string[] = []
  
  if (width) params.push(`width=${width}`)
  if (height) params.push(`height=${height}`)
  if (quality) params.push(`quality=${quality}`)
  if (format !== 'origin') params.push(`format=${format}`)
  if (resize) params.push(`resize=${resize}`)

  // 파라미터가 없으면 원본 반환
  if (params.length === 0) {
    return cleanUrl
  }

  // Supabase Transform API URL 생성
  return `${cleanUrl}?${params.join('&')}`
}

/**
 * 히어로 캐로셀용 이미지 최적화 (모바일)
 * - Supabase Transform API 사용
 * - WebP 강제 변환 (크기 70% 감소)
 * - LCP 최적화 (작은 크기, 낮은 quality로 빠른 로딩)
 */
export function optimizeHeroImageMobile(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 1000,  // 1200 → 1000 (모바일에 충분, 20% 파일 크기 감소)
    quality: 65,  // 70 → 65 (더 빠른 변환)
    format: 'webp',  // WebP 강제 변환
    resize: 'cover'
  })
}

/**
 * 히어로 캐로셀용 이미지 최적화 (데스크탑 그리드)
 * - Supabase Transform API 사용
 * - WebP 강제 변환
 */
export function optimizeHeroImageDesktop(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 600,
    quality: 75,  // 80 → 75
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 호텔 카드용 이미지 최적화
 * - Supabase Transform API 사용
 * - WebP 변환으로 크기 감소
 */
export function optimizeHotelCardImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 600,
    quality: 70,  // 75 → 70
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 썸네일용 이미지 최적화
 * - Supabase Transform API 사용
 */
export function optimizeThumbnail(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 300,
    quality: 65,  // 70 → 65
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 갤러리 그리드용 이미지 최적화
 * - Supabase Transform API 사용
 */
export function optimizeGalleryGrid(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 500,
    quality: 70,  // 75 → 70
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 갤러리 상세 보기용 이미지 최적화 (큰 이미지)
 * - Supabase Transform API 사용
 */
export function optimizeGalleryDetail(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 2000,
    quality: 80,  // 85 → 80
    format: 'webp',  // origin → webp
    resize: 'contain'
  })
}

/**
 * 갤러리 썸네일용 이미지 최적화 (작은 썸네일)
 * - Supabase Transform API 사용
 */
export function optimizeGalleryThumbnail(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 128,
    quality: 65,  // 70 → 65
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 호텔 메인 이미지 최적화 (HotelInfo 컴포넌트)
 * - Supabase Transform API 사용
 * - WebP 변환
 */
export function optimizeHotelMainImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 1600,
    quality: 80,  // 85 → 80
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 호텔 작은 이미지 최적화 (HotelInfo 사이드 이미지)
 * - Supabase Transform API 사용
 */
export function optimizeHotelSmallImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 400,
    quality: 75,  // 80 → 75
    format: 'webp',  // origin → webp
    resize: 'cover'
  })
}

/**
 * 목적지 도시 이미지 최적화
 * - Supabase Transform API 사용
 * - WebP 포맷으로 강제 변환 (크기 70-80% 감소)
 * - 작은 크기 (400px)로 빠른 로딩
 */
export function optimizeCityImage(url: string): string {
  return optimizeSupabaseImage(url, {
    width: 400,  // 640 → 400 (모바일 그리드에 충분)
    quality: 65,  // 70 → 65 (더 작은 파일)
    format: 'webp',  // origin → webp (강제 변환)
    resize: 'cover'
  })
}


"use client"

import Image from "next/image"
import { useRegionFirstImage } from "@/hooks/use-region-images"

interface CityImageProps {
  cityCode: string
  cityKo: string
  alt?: string
  className?: string
  sizes?: string
  priority?: boolean
  fallbackImage?: string
  preloadedImageUrl?: string  // 서버에서 미리 가져온 이미지 URL (성능 최적화)
}

/**
 * 도시 이미지 컴포넌트 (성능 최적화)
 * 
 * 우선순위:
 * 1. preloadedImageUrl (서버에서 미리 가져온 이미지) - 가장 빠름! ⚡
 * 2. API (select_city_media 테이블)
 * 3. 로컬 파일 (/destination-image/{city_ko}.jpg)
 * 4. Placeholder (/placeholder.svg)
 */
export function CityImage({
  cityCode,
  cityKo,
  alt,
  className = "object-cover",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
  fallbackImage = '/placeholder.svg',
  preloadedImageUrl
}: CityImageProps) {
  // preloadedImageUrl이 있으면 API 호출 생략 (성능 최적화!)
  const { imageUrl, isLoading, error } = useRegionFirstImage(cityCode, !preloadedImageUrl)
  
  // ✅ 우선순위 결정 함수
  const getFinalImageUrl = (): string => {
    // 1순위: 서버에서 미리 가져온 이미지 (가장 빠름!)
    if (preloadedImageUrl) return preloadedImageUrl
    
    // 2순위: API에서 가져온 이미지
    if (imageUrl) return imageUrl
    
    // 3순위: 로컬 파일 (확실히 있는 경우만 시도하여 404 방지)
    const citiesWithLocalImages = [
      '도쿄', '런던', '발리', '싱가포르', '오사카', '로마', '다낭', '홍콩',
      '푸켓', '교토', '후쿠오카', '하와이', '방콕'
    ]
    
    if (citiesWithLocalImages.includes(cityKo)) {
      const specialCases: Record<string, string> = { '싱가포르': '싱가폴' }
      const imageExtensions: Record<string, string> = {
        '오사카': 'avif',
        '발리': 'webp',
        '홍콩': 'webp',
      }
      const cityName = specialCases[cityKo] || cityKo
      const extension = imageExtensions[cityKo] || 'jpg'
      return `/destination-image/${cityName}.${extension}`
    }
    
    // 4순위: Placeholder (404 요청 없음)
    return fallbackImage
  }
  
  const finalImageUrl = getFinalImageUrl()
  
  // 디버깅 로그 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && (preloadedImageUrl || imageUrl)) {
    console.log(`🖼️ [CityImage] ${cityKo} (${cityCode}):`, {
      source: preloadedImageUrl ? '⚡ Preloaded (서버)' : imageUrl ? '📡 API' : '🖼️ Local/Placeholder',
      final: finalImageUrl
    })
  }
  
  return (
    <>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <Image
          src={finalImageUrl}
          alt={alt || `${cityKo} 이미지`}
          fill
          className={className}
          sizes={sizes}
          quality={80}
          priority={priority}
          unoptimized={true}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = fallbackImage
          }}
        />
      )}
    </>
  )
}


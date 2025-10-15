"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import supabaseLoader, { tinyBlurDataURL } from "@/supabase-image-loader"

interface HotelAdBannerProps {
  hotel: {
    sabre_id: number
    slug: string
    property_name_ko: string
    property_name_en: string
    city: string
    city_ko?: string
    benefit?: string
    benefit_1?: string
    benefit_2?: string
    benefit_3?: string
    benefit_4?: string
    benefit_5?: string
    benefit_6?: string
    media_path?: string
    image_1?: string
    brand_name_en?: string | null
    chain_name_en?: string | null
  }
  copywriter?: string
  className?: string
}

export function HotelAdBanner({ hotel, copywriter, className }: HotelAdBannerProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/hotel/${hotel.slug}`)
  }

  // 호텔 혜택 중 하나를 카피라이터로 사용 (우선순위: benefit > benefit_1 > benefit_2)
  const displayCopywriter = copywriter || hotel.benefit || hotel.benefit_1 || hotel.benefit_2 || "특별한 혜택을 만나보세요"
  
  // media_path 정규화: 중복된 public/ 제거 및 경로 정리
  const normalizeMediaPath = (path?: string): string => {
    if (!path) return ''
    
    // 절대 URL이면 그대로 반환
    if (path.startsWith('http')) return path
    
    // hotel-media/public/... 형태를 select-media/hotels/... 로 변환
    // supabaseLoader가 자동으로 public/을 추가하므로 중복 방지
    if (path.includes('hotel-media/public/')) {
      return path.replace('hotel-media/public/', 'select-media/hotels/')
    }
    
    // select-media/hotels/public/... 형태의 중복 제거
    if (path.includes('select-media/hotels/public/')) {
      return path.replace('select-media/hotels/public/', 'select-media/hotels/')
    }
    
    return path
  }
  
  const imagePath = normalizeMediaPath(hotel.media_path || hotel.image_1)

  return (
    <div 
      className={cn(
        "relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer group bg-gray-100",
        className
      )}
      onClick={handleClick}
    >
      {/* 배경 이미지 - 필터 없이 밝고 선명하게 */}
      {imagePath && (
        <Image
          loader={supabaseLoader}
          src={imagePath}
          alt={hotel.property_name_ko}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1440px"
          quality={90}
          placeholder="blur"
          blurDataURL={tinyBlurDataURL(imagePath)}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
          }}
        />
      )}
      
      {/* 콘텐츠 - 배경 없이 텍스트만 */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-2xl">
          {/* 추천 문구 라벨 */}
          <div className="mb-2 sm:mb-3 md:mb-4">
            <span className="inline-block bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-gray-900 text-xs sm:text-sm font-semibold shadow-lg">
              에디터가 선정한 이주의 추천 호텔
            </span>
          </div>
          
          {/* 호텔명 - 모바일에서 작게 */}
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-3 md:mb-4 line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {hotel.property_name_ko}
          </h2>
          
          {/* 영어 호텔명 - 모바일에서 숨김 */}
          <p className="hidden sm:block text-lg md:text-xl text-white mb-4 md:mb-6 line-clamp-1 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            {hotel.property_name_en}
          </p>
          
          {/* 위치 - 모바일에서 작게 */}
          <p className="text-xs sm:text-sm md:text-base text-white mb-2 sm:mb-4 md:mb-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
            📍 {hotel.city_ko || hotel.city}
          </p>
          
          {/* 카피라이터 영역 제거 */}
        </div>
      </div>
      
      {/* 호버 효과를 위한 화살표 - 모바일에서 작게 */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}

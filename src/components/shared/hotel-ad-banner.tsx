"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

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

  return (
    <div 
      className={cn(
        "relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer group",
        "bg-gradient-to-r from-gray-900/60 to-gray-900/40",
        className
      )}
      onClick={handleClick}
    >
      {/* 배경 이미지 */}
      {hotel.media_path && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url(${hotel.media_path})`
          }}
        />
      )}
      
      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      
      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="max-w-2xl">
          {/* 추천 문구 라벨 */}
          <div className="mb-2 sm:mb-3 md:mb-4">
            <span className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 border border-white/30 text-white text-xs sm:text-sm font-semibold">
              에디터가 선정한 이주의 추천 호텔
            </span>
          </div>
          
          {/* 호텔명 - 모바일에서 작게 */}
          <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 sm:mb-3 md:mb-4 line-clamp-2">
            {hotel.property_name_ko}
          </h2>
          
          {/* 영어 호텔명 - 모바일에서 숨김 */}
          <p className="hidden sm:block text-lg md:text-xl text-gray-200 mb-4 md:mb-6 line-clamp-1">
            {hotel.property_name_en}
          </p>
          
          {/* 위치 - 모바일에서 작게 */}
          <p className="text-xs sm:text-sm md:text-base text-gray-300 mb-2 sm:mb-4 md:mb-6">
            📍 {hotel.city_ko || hotel.city}
          </p>
          
          {/* 카피라이터 영역 제거 */}
        </div>
      </div>
      
      {/* 호버 효과를 위한 화살표 - 모바일에서 작게 */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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

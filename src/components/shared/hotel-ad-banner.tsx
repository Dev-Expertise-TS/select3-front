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
        "relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden cursor-pointer group",
        "bg-gradient-to-r from-gray-900/60 to-gray-900/40",
        className
      )}
      onClick={handleClick}
    >
      {/* 배경 이미지 */}
      {(hotel.image_1 || hotel.media_path) && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url(${hotel.image_1 || hotel.media_path})`
          }}
        />
      )}
      
      {/* 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      
      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-8 lg:px-12">
        <div className="max-w-2xl">
          {/* 브랜드 뱃지 */}
          {(hotel.brand_name_en || hotel.chain_name_en) && (
            <div className="mb-3 md:mb-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
                {hotel.brand_name_en && (
                  <span className="text-white text-sm font-medium">
                    {hotel.brand_name_en}
                  </span>
                )}
                {hotel.brand_name_en && hotel.chain_name_en && (
                  <span className="text-white/70 text-xs">•</span>
                )}
                {hotel.chain_name_en && (
                  <span className="text-white/80 text-xs">
                    {hotel.chain_name_en}
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* 호텔명 */}
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
            {hotel.property_name_ko}
          </h2>
          
          {/* 영어 호텔명 */}
          <p className="text-lg md:text-xl text-gray-200 mb-4 md:mb-6">
            {hotel.property_name_en}
          </p>
          
          {/* 위치 */}
          <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6">
            📍 {hotel.city_ko || hotel.city}
          </p>
          
          {/* 카피라이터 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-white/20">
            <p className="text-white text-base md:text-lg font-medium leading-relaxed">
              {displayCopywriter}
            </p>
          </div>
        </div>
      </div>
      
      {/* 호버 효과를 위한 화살표 */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
          <svg
            className="w-5 h-5 text-white"
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

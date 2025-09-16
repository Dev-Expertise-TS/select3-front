'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { usePromotionHotels } from "@/features/promotion-section"
import { useHotelPromotionDetails } from "@/hooks/use-hotel-promotion-details"

// 프로모션 상세 정보 컴포넌트
function PromotionDetails({ sabreId }: { sabreId?: number }) {
  const { data: promotions = [] } = useHotelPromotionDetails(sabreId || 0)
  
  if (!sabreId || promotions.length === 0) {
    return null
  }
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    } catch (error) {
      return dateString
    }
  }
  
  return (
    <span className="truncate">
      {promotions.map((promotion, index) => (
        <span key={index} className="inline-block">
          <span className="hidden sm:inline">{promotion.promotion}</span>
          <span className="sm:hidden">{promotion.promotion.length > 15 ? promotion.promotion.substring(0, 15) + '...' : promotion.promotion}</span>
          {promotion.booking_date && (
            <span className="hidden sm:inline">
              {` (예약일: ~${formatDate(promotion.booking_date)})`}
            </span>
          )}
          {promotion.check_in_date && (
            <span className="hidden sm:inline">
              {` (투숙일: ~${formatDate(promotion.check_in_date)})`}
            </span>
          )}
          {index < promotions.length - 1 ? (
            <span className="hidden sm:inline">, </span>
          ) : null}
        </span>
      ))}
    </span>
  )
}

export function PromotionBanner() {
  const [showPromoBanner, setShowPromoBanner] = useState(true)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)

  // 프로모션 호텔 데이터 조회
  const { data: promotionHotels = [] } = usePromotionHotels()

  useEffect(() => {
    if (showPromoBanner && promotionHotels.length > 0) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % promotionHotels.length)
        setAnimationKey(prev => prev + 1) // 애니메이션 키 업데이트
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [showPromoBanner, promotionHotels.length])

  // 수동 네비게이션 시에도 애니메이션 재실행
  const handleSlideChange = (newIndex: number) => {
    setCurrentPromoIndex(newIndex)
    setAnimationKey(prev => prev + 1)
  }

  const currentPromo = promotionHotels[currentPromoIndex]

  if (!showPromoBanner || promotionHotels.length === 0 || !currentPromo) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="container mx-auto max-w-[1440px] px-3 sm:px-4">
        <div className="flex items-center justify-center py-2 sm:py-3 relative">
          <div key={animationKey} className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative w-12 h-8 sm:w-20 sm:h-13 rounded-lg overflow-hidden shadow-md animate-slide-in-left">
              <Image
                src={currentPromo?.image || "/placeholder.svg"}
                alt={currentPromo?.property_name_ko || "프로모션 호텔"}
                fill
                className="object-cover"
              />
            </div>
            <div className="h-8 sm:h-13 flex flex-col justify-center animate-slide-in-right">
              <div className="flex flex-col sm:flex-row sm:items-center mb-0.5">
                <h3 className="text-sm sm:text-lg font-bold text-white animate-typewriter">
                  {currentPromo?.property_name_ko || "프로모션 호텔"}
                </h3>
                {currentPromo?.property_name_en && (
                  <span className="text-xs sm:text-lg font-bold text-white sm:ml-2 animate-typewriter-delay-1">
                    {currentPromo.property_name_en}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-base text-blue-100 animate-typewriter-delay-2">
                <PromotionDetails sabreId={currentPromo?.sabre_id} />
              </div>
            </div>
          </div>

          <div className="absolute right-2 sm:right-4 flex items-center space-x-1 sm:space-x-2">
            <button
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-white hover:bg-white/20 transition-colors"
              onClick={() =>
                handleSlideChange((currentPromoIndex - 1 + promotionHotels.length) % promotionHotels.length)
              }
            >
              <ChevronLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
            <button
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-white hover:bg-white/20 transition-colors"
              onClick={() => handleSlideChange((currentPromoIndex + 1) % promotionHotels.length)}
            >
              <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
            <button
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 ml-1 sm:ml-2 text-white hover:bg-white/20 transition-colors"
              onClick={() => setShowPromoBanner(false)}
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

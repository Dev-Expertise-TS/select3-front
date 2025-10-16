
'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTopBannerHotels } from "@/hooks/use-promotion-hotels"
import { useHotelPromotionDetails } from "@/hooks/use-hotel-promotion-details"

// 상수
const BANNER_HEIGHT = 60
const SLIDE_INTERVAL = 5000

// 프로모션 상세 정보 컴포넌트
function PromotionDetails({ sabreId }: { sabreId?: number }) {
  const { data: promotions = [] } = useHotelPromotionDetails(sabreId || 0)
  
  if (!sabreId || promotions.length === 0) {
    return null
  }
  
  const first = promotions[0]
  const raw: string = String(first?.promotion_description ?? first?.description ?? first?.promotion ?? "")

  return (
    <span className="truncate">
      <span className="hidden sm:inline">
        {raw.length > 50 ? raw.substring(0, 50) + '...' : raw}
      </span>
      <span className="sm:hidden">
        {raw.length > 22 ? raw.substring(0, 22) + '...' : raw}
      </span>
    </span>
  )
}

export function PromotionBanner() {
  const router = useRouter()
  const [showPromoBanner, setShowPromoBanner] = useState(true)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)
  const [animationKey, setAnimationKey] = useState(0)

  // 띠베너 노출 대상 호텔 데이터 조회 (KST 날짜 필터 적용)
  const { data: promotionHotels = [] } = useTopBannerHotels()

  useEffect(() => {
    // 호텔이 2개 이상일 때만 자동 슬라이드 실행
    if (showPromoBanner && promotionHotels.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % promotionHotels.length)
        setAnimationKey(prev => prev + 1)
      }, SLIDE_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [showPromoBanner, promotionHotels.length])

  // 수동 네비게이션 시에도 애니메이션 재실행
  const handleSlideChange = (newIndex: number) => {
    setCurrentPromoIndex(newIndex)
    setAnimationKey(prev => prev + 1)
  }

  const currentPromo = promotionHotels[currentPromoIndex]

  // 프로모션 베너 클릭 핸들러
  const handleBannerClick = () => {
    if (currentPromo?.slug) {
      router.push(`/hotel/${currentPromo.slug}`)
    }
  }

  if (!showPromoBanner || promotionHotels.length === 0 || !currentPromo) {
    return null
  }

  return (
    <div 
      className="promotion-banner-fixed bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white cursor-pointer hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 shadow-lg"
      style={{ 
        position: 'fixed',
        top: '3rem', // 48px (h-12)
        left: 0,
        right: 0,
        zIndex: 40,
        width: '100%'
      }}
      onClick={handleBannerClick}
    >
      <div className="container mx-auto max-w-[1440px] pl-[10px] pr-1 sm:px-4">
        <div className="flex items-center justify-start sm:justify-center py-2 sm:py-2 relative">
          <div key={animationKey} className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative w-12 h-8 sm:w-20 sm:h-13 rounded-lg overflow-hidden shadow-md animate-slide-in-left">
              <Image
                src={currentPromo?.image || "/placeholder.svg"}
                alt={currentPromo?.property_name_ko || "프로모션 호텔"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 48px, 80px"
                priority={currentPromoIndex === 0}
              />
            </div>
            <div className="h-8 sm:h-13 flex flex-col justify-center animate-slide-in-right">
              <div className="flex flex-col sm:flex-row sm:items-center mb-0.5">
                <h3 className="text-sm sm:text-lg font-bold text-white animate-typewriter">
                  {currentPromo?.property_name_ko || "프로모션 호텔"}
                </h3>
                {currentPromo?.property_name_en && (
                  <span className="hidden sm:inline text-lg font-bold text-white sm:ml-2 animate-typewriter-delay-1">
                    {currentPromo.property_name_en}
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-base text-blue-100 animate-typewriter-delay-2">
                <PromotionDetails sabreId={currentPromo?.sabre_id} />
              </div>
            </div>
          </div>

          <div className="absolute right-1 sm:right-4 flex items-center space-x-1 sm:space-x-2">
            {/* 호텔이 2개 이상일 때만 좌우 화살표 표시 */}
            {promotionHotels.length > 1 && (
              <>
                <button
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-white hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSlideChange((currentPromoIndex - 1 + promotionHotels.length) % promotionHotels.length)
                  }}
                  aria-label="이전 프로모션 보기"
                >
                  <ChevronLeft className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
                <button
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-white hover:bg-white/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSlideChange((currentPromoIndex + 1) % promotionHotels.length)
                  }}
                  aria-label="다음 프로모션 보기"
                >
                  <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              </>
            )}
            <button
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 ml-1 sm:ml-2 text-white hover:bg-white/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowPromoBanner(false)
              }}
              aria-label="프로모션 배너 닫기"
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

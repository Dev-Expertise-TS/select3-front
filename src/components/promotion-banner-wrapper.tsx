"use client"

import { PromotionBanner } from "@/components/promotion-banner"
import { useTopBannerHotels } from "@/hooks/use-promotion-hotels"

interface PromotionBannerWrapperProps {
  children: React.ReactNode
}

export function PromotionBannerWrapper({ children }: PromotionBannerWrapperProps) {
  // 프로모션 베너 데이터 조회
  const { data: promotionHotels = [] } = useTopBannerHotels()
  const hasPromotionBanner = promotionHotels.length > 0

  return (
    <>
      {/* 프로모션 베너 - 데이터가 있을 때만 표시 */}
      {hasPromotionBanner && <PromotionBanner />}
      
      {/* 프로모션 베너 아래 여백 - 프로모션 베너가 있을 때만 적용 */}
      <div className={hasPromotionBanner ? "pt-[50px] sm:pt-[60px]" : ""}>
        {children}
      </div>
    </>
  )
}

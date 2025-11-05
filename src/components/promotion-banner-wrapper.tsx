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
      
      {/* 상단 여백: Header + PromotionBanner(있을 경우) 높이 확보 */}
      {/* Header: 48px/64px (모바일/데스크톱) */}
      {/* PromotionBanner: ~52px/~68px (모바일/데스크톱) */}
      <div className={hasPromotionBanner ? "pt-[50px] sm:pt-[82px]" : "pt-12 md:pt-16"}>
        {children}
      </div>
    </>
  )
}

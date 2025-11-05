"use client"

import { PromotionBanner } from "@/components/promotion-banner"
import { useTopBannerHotels } from "@/hooks/use-promotion-hotels"

interface PromotionBannerWrapperProps {
  children: React.ReactNode
  noGap?: boolean // 프로모션 배너 아래 간격 제거 옵션
}

export function PromotionBannerWrapper({ children, noGap = false }: PromotionBannerWrapperProps) {
  // 프로모션 베너 데이터 조회
  const { data: promotionHotels = [] } = useTopBannerHotels()
  const hasPromotionBanner = promotionHotels.length > 0

  return (
    <>
      {/* 프로모션 베너 - 데이터가 있을 때만 표시 */}
      {hasPromotionBanner && <PromotionBanner />}
      
      {/* 프로모션 베너 아래 여백 */}
      {/* noGap=true: 베너 높이만큼만 확보 (모바일 52px, 데스크톱 68px) */}
      {/* noGap=false: 베너 높이 + 추가 간격 20px */}
      <div className={hasPromotionBanner ? (noGap ? "pt-[52px] sm:pt-[68px]" : "pt-[72px] sm:pt-[88px]") : ""}>
        {children}
      </div>
    </>
  )
}

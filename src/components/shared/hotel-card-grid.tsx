'use client'

import { HotelCard, HotelCardData, HotelCardProps } from "./hotel-card"
import { HotelCardGrid3 } from "./hotel-card-grid-3"
import { HotelCardGrid4 } from "./hotel-card-grid-4"
import { HotelCardGridSection3 } from "./hotel-card-grid-3"
import { HotelCardGridSection4 } from "./hotel-card-grid-4"
import { cn } from "@/lib/utils"

// 호텔 카드 그리드 Props 타입 정의
export interface HotelCardGridProps {
  hotels: HotelCardData[]
  variant?: 'default' | 'featured' | 'compact' | 'promotion'
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  showBenefits?: boolean
  showRating?: boolean
  showPrice?: boolean
  showBadge?: boolean
  showPromotionBadge?: boolean
  className?: string
  cardClassName?: string
  imageClassName?: string
  contentClassName?: string
  emptyMessage?: string
  loading?: boolean
  skeletonCount?: number
  hotelCount?: 3 | 4 // 호텔 개수 설정 (기본값: 4)
}

// 호텔 카드 그리드 컴포넌트
export function HotelCardGrid({
  hotels,
  variant = 'default',
  columns = 4,
  gap = 'md',
  showBenefits = true,
  showRating = false,
  showPrice = false,
  showBadge = false,
  showPromotionBadge = false,
  className,
  cardClassName,
  imageClassName,
  contentClassName,
  emptyMessage = "표시할 호텔이 없습니다.",
  loading = false,
  skeletonCount = 4,
  hotelCount = 4
}: HotelCardGridProps) {
  // 호텔 개수에 따라 적절한 컴포넌트 렌더링
  if (hotelCount === 3) {
    return (
      <HotelCardGrid3
        hotels={hotels}
        variant={variant}
        gap={gap}
        showBenefits={showBenefits}
        showRating={showRating}
        showPrice={showPrice}
        showBadge={showBadge}
        showPromotionBadge={showPromotionBadge}
        className={className}
        cardClassName={cardClassName}
        imageClassName={imageClassName}
        contentClassName={contentClassName}
        emptyMessage={emptyMessage}
        loading={loading}
        skeletonCount={skeletonCount}
      />
    )
  }
  
  return (
    <HotelCardGrid4
      hotels={hotels}
      variant={variant}
      gap={gap}
      showBenefits={showBenefits}
      showRating={showRating}
      showPrice={showPrice}
      showBadge={showBadge}
      showPromotionBadge={showPromotionBadge}
      className={className}
      cardClassName={cardClassName}
      imageClassName={imageClassName}
      contentClassName={contentClassName}
      emptyMessage={emptyMessage}
      loading={loading}
      skeletonCount={skeletonCount}
    />
  )
}

// 호텔 카드 그리드 섹션 컴포넌트 (제목과 함께)
export interface HotelCardGridSectionProps extends HotelCardGridProps {
  title?: string
  subtitle?: string
  titleClassName?: string
  subtitleClassName?: string
  headerClassName?: string
  showViewAll?: boolean
  viewAllText?: string
  viewAllHref?: string
  onViewAllClick?: () => void
  error?: Error | null
}

export function HotelCardGridSection({
  title,
  subtitle,
  titleClassName,
  subtitleClassName,
  headerClassName,
  showViewAll = false,
  viewAllText = "전체 보기",
  viewAllHref,
  onViewAllClick,
  error,
  hotelCount = 4,
  ...gridProps
}: HotelCardGridSectionProps) {
  // 호텔 개수에 따라 적절한 섹션 컴포넌트 렌더링
  if (hotelCount === 3) {
    return (
      <HotelCardGridSection3
        title={title}
        subtitle={subtitle}
        titleClassName={titleClassName}
        subtitleClassName={subtitleClassName}
        headerClassName={headerClassName}
        showViewAll={showViewAll}
        viewAllText={viewAllText}
        viewAllHref={viewAllHref}
        onViewAllClick={onViewAllClick}
        error={error}
        {...gridProps}
      />
    )
  }
  
  return (
    <HotelCardGridSection4
      title={title}
      subtitle={subtitle}
      titleClassName={titleClassName}
      subtitleClassName={subtitleClassName}
      headerClassName={headerClassName}
      showViewAll={showViewAll}
      viewAllText={viewAllText}
      viewAllHref={viewAllHref}
      onViewAllClick={onViewAllClick}
      error={error}
      {...gridProps}
    />
  )
}

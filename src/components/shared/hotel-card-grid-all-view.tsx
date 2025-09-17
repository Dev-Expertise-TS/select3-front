'use client'

import { HotelCardAllView, HotelCardAllViewData, HotelCardAllViewProps } from "./hotel-card-all-view"
import { cn } from "@/lib/utils"
import { HOTEL_CARD_CONFIG, HOTEL_GRID_CONFIG, type CardVariant, type GridGap } from "@/config/layout"

// 전체보기용 호텔 카드 그리드 Props 타입 정의
export interface HotelCardGridAllViewProps {
  hotels: HotelCardAllViewData[]
  variant?: CardVariant
  gap?: GridGap
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
  isThreeGrid?: boolean
}

// 전체보기용 호텔 카드 그리드 컴포넌트
export function HotelCardGridAllView({
  hotels,
  variant = 'default',
  gap = HOTEL_GRID_CONFIG.DEFAULT_GAP,
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
  skeletonCount = HOTEL_GRID_CONFIG.DEFAULT_SKELETON_COUNT,
  isThreeGrid = false
}: HotelCardGridAllViewProps) {
  // 전체보기용 4개 컬럼 그리드 클래스
  const gridColumnsClasses = HOTEL_CARD_CONFIG.GRID_COLUMNS.FOUR

  // 그리드 간격 클래스
  const gridGapClasses = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-10"
  }

  // 전체보기용 스켈레톤 로딩 컴포넌트
  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-96"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )

  // 로딩 중일 때
  if (loading) {
    return (
      <div className={cn(
        "grid",
        gridColumnsClasses,
        gridGapClasses[gap],
        className
      )}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  // 호텔이 없을 때
  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">🏨</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          호텔 목록이 없습니다
        </h3>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "grid",
      gridColumnsClasses,
      gridGapClasses[gap],
      className
    )}>
      {hotels.map((hotel) => (
        <HotelCardAllView
          key={hotel.sabre_id}
          hotel={hotel}
          variant={variant}
          showBenefits={showBenefits}
          showRating={showRating}
          showPrice={showPrice}
          showBadge={showBadge}
          showPromotionBadge={showPromotionBadge}
          className={cardClassName}
          imageClassName={imageClassName}
          contentClassName={contentClassName}
          isThreeGrid={isThreeGrid}
        />
      ))}
    </div>
  )
}

// 전체보기용 호텔 카드 그리드 섹션 컴포넌트 (제목과 함께)
export interface HotelCardGridAllViewSectionProps extends HotelCardGridAllViewProps {
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

export function HotelCardGridAllViewSection({
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
  ...gridProps
}: HotelCardGridAllViewSectionProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto max-w-[1440px] px-4">
        {/* 섹션 헤더 */}
        {(title || subtitle || showViewAll) && (
          <div className={cn(
            "flex items-center justify-between mb-8",
            headerClassName
          )}>
            <div className="space-y-2">
              {title && (
                <h2 className={cn(
                  "text-2xl md:text-3xl font-bold text-gray-900",
                  titleClassName
                )}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className={cn(
                  "text-gray-600 text-lg",
                  subtitleClassName
                )}>
                  {subtitle}
                </p>
              )}
            </div>
            
            {showViewAll && (
              <div className="flex-shrink-0">
                {viewAllHref ? (
                  <a
                    href={viewAllHref}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {viewAllText}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ) : onViewAllClick ? (
                  <button
                    onClick={onViewAllClick}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {viewAllText}
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-16">
            <div className="text-red-600 text-lg mb-2">
              호텔 목록을 불러오는 중 오류가 발생했습니다.
            </div>
            <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
          </div>
        )}

        {/* 호텔 카드 그리드 */}
        {!error && (
          <HotelCardGridAllView {...gridProps} />
        )}
      </div>
    </section>
  )
}

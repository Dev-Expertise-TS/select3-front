'use client'

import { HotelCard, HotelCardData, HotelCardProps } from "./hotel-card"
import { cn } from "@/lib/utils"

// 호텔 카드 그리드 Props 타입 정의
export interface HotelCardGrid3Props {
  hotels: HotelCardData[]
  variant?: 'default' | 'featured' | 'compact' | 'promotion'
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
}

// 호텔 카드 그리드 3개 컴포넌트
export function HotelCardGrid3({
  hotels,
  variant = 'default',
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
  skeletonCount = 3
}: HotelCardGrid3Props) {
  // 3개 컬럼 그리드 클래스
  const gridColumnsClasses = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

  // 그리드 간격 클래스
  const gridGapClasses = {
    sm: "gap-3",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-10"
  }

  // 스켈레톤 로딩 컴포넌트
  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-80"></div>
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
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">{emptyMessage}</div>
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
        <HotelCard
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
        />
      ))}
    </div>
  )
}

// 호텔 카드 그리드 섹션 컴포넌트 (제목과 함께) - 3개 전용
export interface HotelCardGridSection3Props extends HotelCardGrid3Props {
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

export function HotelCardGridSection3({
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
}: HotelCardGridSection3Props) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto max-w-[1440px] px-4">
        {/* 헤더 */}
        {(title || subtitle) && (
          <div className={cn(
            "text-center mb-12",
            headerClassName
          )}>
            {title && (
              <h2 className={cn(
                "text-3xl md:text-4xl font-bold text-gray-900 mb-4",
                titleClassName
              )}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn(
                "text-lg text-gray-600",
                subtitleClassName
              )}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* 에러 처리 */}
        {error && (
          <div className="text-center text-red-600 mb-8">
            정보를 불러오는 중 오류가 발생했습니다.
          </div>
        )}

        {/* 호텔 카드 그리드 */}
        <HotelCardGrid3 {...gridProps} />

        {/* 전체 보기 버튼 */}
        {showViewAll && (
          <div className="text-center mt-12">
            {viewAllHref ? (
              <a
                href={viewAllHref}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {viewAllText}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ) : (
              <button
                onClick={onViewAllClick}
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {viewAllText}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

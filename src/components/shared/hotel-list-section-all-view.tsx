"use client"

import { HotelCardGridAllView } from './hotel-card-grid-all-view'
import { HotelErrorBoundary } from './hotel-error-boundary'

interface HotelListSectionAllViewProps {
  // 제목과 부제목 (선택적)
  title?: string
  subtitle?: string
  
  // 데이터와 상태
  hotels: any[]
  isLoading: boolean
  error: any
  
  // 페이지네이션
  hasMoreData?: boolean
  onLoadMore?: () => void
  totalCount?: number
  displayCount?: number
  
  // 호텔 카드 그리드 설정
  columns?: number
  variant?: 'default' | 'compact' | 'detailed'
  gap?: 'sm' | 'md' | 'lg'
  showBenefits?: boolean
  showRating?: boolean
  showPrice?: boolean
  showBadge?: boolean
  showPromotionBadge?: boolean
  
  // 검색 관련
  searchQuery?: string
  
  className?: string
  isThreeGrid?: boolean
}

export function HotelListSectionAllView({
  title,
  subtitle,
  hotels,
  isLoading,
  error,
  hasMoreData = false,
  onLoadMore,
  totalCount,
  displayCount,
  columns = 4,
  variant = 'default',
  gap = 'lg',
  showBenefits = true,
  showRating = false,
  showPrice = false,
  showBadge = false,
  showPromotionBadge = false,
  searchQuery,
  className,
  isThreeGrid = false
}: HotelListSectionAllViewProps) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            {searchQuery ? "검색 중..." : "호텔 목록을 불러오는 중..."}
          </p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <div className="text-red-600 text-lg mb-2">
            {searchQuery ? "검색 중 오류가 발생했습니다." : "호텔 목록을 불러오는 중 오류가 발생했습니다."}
          </div>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      )
    }

    if (!hotels || hotels.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🏨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다.` : "호텔 목록이 없습니다."}
          </h3>
          <p className="text-gray-600">
            {searchQuery ? "다른 검색어로 시도해보세요." : "현재 등록된 호텔이 없습니다."}
          </p>
        </div>
      )
    }

    return (
      <>
        <HotelCardGridAllView
          hotels={hotels}
          variant={variant}
          gap={gap}
          showBenefits={showBenefits}
          showRating={showRating}
          showPrice={showPrice}
          showBadge={showBadge}
          showPromotionBadge={showPromotionBadge}
          emptyMessage="호텔 목록이 없습니다."
          isThreeGrid={isThreeGrid}
        />
        {hasMoreData && onLoadMore && (
          <div className="text-center mt-12">
            <button
              onClick={onLoadMore}
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              호텔 더보기
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {totalCount && displayCount && (
              <p className="text-sm text-gray-500 mt-2">
                {totalCount}개 중 {displayCount}개 호텔
              </p>
            )}
          </div>
        )}
      </>
    )
  }

  return (
    <div className={`lg:col-span-4 ${className || ''}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <HotelErrorBoundary>
        {renderContent()}
      </HotelErrorBoundary>
    </div>
  )
}

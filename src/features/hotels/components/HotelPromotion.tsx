"use client"

interface HotelPromotion {
  promotion_id: number;
  promotion: string;
  promotion_description: string;
  booking_date: string;
  check_in_date: string;
}

interface HotelPromotionProps {
  promotions: HotelPromotion[]
  isLoading: boolean
}

export function HotelPromotion({ promotions, isLoading }: HotelPromotionProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-100 py-3 sm:py-4 mt-1.5">
        <div className="container mx-auto max-w-[1440px] px-3 sm:px-4">
          <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="font-medium text-base sm:text-lg">프로모션</span>
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-sm">프로모션 정보를 불러오는 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!promotions || promotions.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-100 py-3 sm:py-4 mt-1.5">
      <div className="container mx-auto max-w-[1440px] px-3 sm:px-4">
        <div className="bg-blue-600 text-white p-4 sm:p-6 rounded-lg">
          {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* 프로모션 제목 */}
            <div className="flex-shrink-0">
              <span className="font-medium text-base sm:text-lg">프로모션</span>
            </div>
            
            {/* 프로모션 배너들 */}
            <div className="flex flex-col sm:flex-row sm:gap-2 sm:flex-wrap sm:items-center gap-2">
              {promotions.map((promotion, index) => (
                <div key={promotion.promotion_id} className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                  {/* 주요 프로모션 배너 */}
                  <span className="bg-red-500 px-3 py-2 sm:py-1 rounded text-xs sm:text-xs font-medium text-center sm:text-left">
                    {promotion.promotion}
                  </span>
                  
                  {/* 프로모션 설명 */}
                  {promotion.promotion_description && (
                    <span className="bg-pink-400 px-3 py-2 sm:py-1 rounded text-xs font-medium text-center sm:text-left">
                      {promotion.promotion_description}
                    </span>
                  )}
                  
                  {/* 날짜 정보들 */}
                  <div className="flex flex-row items-center justify-center sm:justify-start gap-2 text-xs text-blue-100">
                    {promotion.booking_date && (
                      <span className="whitespace-nowrap">
                        예약: ~{new Date(promotion.booking_date).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                    {promotion.check_in_date && (
                      <span className="whitespace-nowrap">
                        투숙: ~{new Date(promotion.check_in_date).toLocaleDateString('ko-KR')}
                      </span>
                    )}
                  </div>
                  
                  {/* 구분자 - 데스크톱에서만 표시 */}
                  {index < promotions.length - 1 && (
                    <span className="hidden sm:inline text-blue-200 mx-1">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
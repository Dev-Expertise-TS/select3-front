"use client"

interface HotelPromotion {
  promotion_id: number;
  promotion: string;
  promotion_description?: string;
  booking_start_date?: string | null;
  booking_end_date?: string | null;
  check_in_start_date?: string | null;
  check_in_end_date?: string | null;
  note?: string | null;
}

interface HotelPromotionProps {
  promotions: HotelPromotion[]
  isLoading: boolean
}

export function HotelPromotion({ promotions, isLoading }: HotelPromotionProps) {
  const formatKstDate = (value?: string | null) => {
    if (!value) return ''
    try {
      const d = new Date(value)
      return new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(d)
    } catch {
      return value
    }
  }
  if (isLoading) {
    return (
      <div className="bg-gray-200 py-2 sm:py-3 mt-1.5">
        <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
          <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-none sm:rounded-lg shadow-sm">
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
    <div className="bg-gray-200 py-2 sm:py-3 mt-1.5">
      <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
        <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-none sm:rounded-lg shadow-sm">
          {/* 모바일: 세로 레이아웃, 데스크톱: 가로 레이아웃 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            {/* 프로모션 제목 */}
            <div className="flex-shrink-0 text-center sm:text-left">
              <span className="font-medium text-base sm:text-lg">프로모션</span>
            </div>
            
            {/* 프로모션 목록: 1행 1개 */}
            <div className="flex flex-col gap-2">
              {promotions.map((promotion) => (
                <div key={promotion.promotion_id} className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                  {/* 주요 프로모션 배너 */}
                  <span className="bg-amber-700 px-3 py-2 sm:py-1 rounded text-xs sm:text-xs font-medium text-center sm:text-left text-white shadow-sm">
                    {promotion.promotion}
                  </span>
                  
                  {/* 프로모션 설명 */}
                  {promotion.promotion_description && (
                    <span className="bg-rose-500 px-3 py-2 sm:py-1 rounded text-xs font-medium text-center sm:text-left text-white shadow-sm">
                      {promotion.promotion_description}
                    </span>
                  )}
                  
                  {/* 날짜 정보들 (KST, 범위 표기) - 모바일: 세로 정렬, 데스크톱: 가로 정렬 */}
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs text-white/95">
                    {(promotion.booking_start_date || promotion.booking_end_date) && (
                      <span className="text-center sm:text-left whitespace-nowrap">
                        예약일: {formatKstDate(promotion.booking_start_date)} ~ {formatKstDate(promotion.booking_end_date)}
                      </span>
                    )}
                    {(promotion.check_in_start_date || promotion.check_in_end_date) && (
                      <span className="text-center sm:text-left whitespace-nowrap">
                        투숙일: {formatKstDate(promotion.check_in_start_date)} ~ {formatKstDate(promotion.check_in_end_date)}
                      </span>
                    )}
                  </div>

                  {/* 비고(note) - 모바일: 가운데 정렬 */}
                  {promotion.note && (
                    <div className="text-[11px] sm:text-xs text-white/90 text-center sm:text-left">
                      {promotion.note}
                    </div>
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
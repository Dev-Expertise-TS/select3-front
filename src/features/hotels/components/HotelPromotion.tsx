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
      <div className="bg-gray-100 py-4 mt-1.5">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="font-medium text-lg">프로모션</span>
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
    <div className="bg-gray-100 py-4 mt-1.5">
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="bg-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="font-medium text-lg">프로모션</span>
            <div className="flex gap-2 flex-wrap items-center">
              {promotions.map((promotion, index) => (
                <div key={promotion.promotion_id} className="flex items-center gap-2 min-w-0 flex-shrink-0">
                  <span className="bg-pink-500 px-3 py-1 rounded text-xs font-medium whitespace-nowrap">
                    {promotion.promotion}
                  </span>
                  {promotion.promotion_description && (
                    <span className="bg-orange-500 px-3 py-1 rounded text-xs font-medium whitespace-nowrap">
                      {promotion.promotion_description}
                    </span>
                  )}
                  {promotion.booking_date && (
                    <span className="text-xs text-blue-100 whitespace-nowrap">
                      예약: ~{new Date(promotion.booking_date).toLocaleDateString('ko-KR')}
                    </span>
                  )}
                  {promotion.check_in_date && (
                    <span className="text-xs text-blue-100 whitespace-nowrap">
                      투숙: ~{new Date(promotion.check_in_date).toLocaleDateString('ko-KR')}
                    </span>
                  )}
                  {index < promotions.length - 1 && (
                    <span className="text-blue-200 mx-1">|</span>
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
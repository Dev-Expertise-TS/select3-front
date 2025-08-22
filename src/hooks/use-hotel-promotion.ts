import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface HotelPromotion {
  promotion_id: number
  promotion: string
  booking_date: string | null
  check_in_date: string | null
}

export function useHotelPromotion(sabreId: number | null) {
  return useQuery({
    queryKey: ['hotel-promotion', sabreId],
    queryFn: async (): Promise<HotelPromotion[]> => {
      if (!sabreId) return []

      try {
        const supabase = createClient()
        
        // 1. select_hotel_promotions_map에서 해당 호텔의 promotion_id 조회
        const { data: promotionMaps, error: mapError } = await supabase
          .from('select_hotel_promotions_map')
          .select('promotion_id')
          .eq('sabre_id', sabreId)

        if (mapError) {
          console.error('❌ 프로모션 매핑 조회 실패:', mapError)
          return []
        }

        if (!promotionMaps || promotionMaps.length === 0) {
          return []
        }

        // 2. promotion_id들을 추출
        const promotionIds = promotionMaps.map(map => map.promotion_id)

        // 3. select_hotel_promotions에서 프로모션 정보 조회
        const { data: promotions, error: promotionError } = await supabase
          .from('select_hotel_promotions')
          .select('promotion_id, promotion, booking_date, check_in_date')
          .in('promotion_id', promotionIds)

        if (promotionError) {
          console.error('❌ 프로모션 정보 조회 실패:', promotionError)
          return []
        }

        return promotions || []
      } catch (error) {
        console.error('❌ 프로모션 조회 중 오류:', error)
        return []
      }
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  })
}

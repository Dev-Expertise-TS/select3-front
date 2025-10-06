'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface HotelPromotionDetail {
  promotion: string
  booking_date: string
  check_in_date: string
}

export function useHotelPromotionDetails(sabreId: number) {
  return useQuery({
    queryKey: ['hotel-promotion-details', sabreId],
    queryFn: async (): Promise<HotelPromotionDetail[]> => {
      try {
        // 1. select_hotel_promotions_map에서 해당 sabre_id의 promotion_id 조회
        const { data: promotionMap, error: mapError } = await supabase
          .from('select_hotel_promotions_map')
          .select('promotion_id')
          .eq('sabre_id', sabreId)
        
        if (mapError) throw mapError
        if (!promotionMap || promotionMap.length === 0) return []
        
        const promotionIds = promotionMap.map(item => item.promotion_id)
        
        // 2. select_hotel_promotions에서 프로모션 상세 정보 조회 (전 컬럼 조회 + 정렬)
        const { data: promotions, error: promotionError } = await supabase
          .from('select_hotel_promotions')
          .select('*')
          .in('promotion_id', promotionIds)
          .order('promotion_id', { ascending: true })
        
        if (promotionError) throw promotionError
        if (!promotions) return []
        
        return promotions
      } catch (error) {
        const err: any = error
        console.error('프로모션 상세 정보 조회 실패:', {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
        })
        return []
      }
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

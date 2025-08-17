import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface HotelBenefit {
  benefit: string
  benefit_description: string
  start_date: string | null
  end_date: string | null
}

export function useHotelPromotion(sabreId: number | null) {
  return useQuery({
    queryKey: ['hotel-promotion', sabreId],
    queryFn: async (): Promise<HotelBenefit[]> => {
      if (!sabreId) return []
      
      try {
        // 1. select_hotel_benefits_map에서 해당 호텔의 promotion_id 조회
        const { data: benefitsMap, error: mapError } = await supabase
          .from('select_hotel_benefits_map')
          .select('promotion_id')
          .eq('sabre_id', sabreId)
        
        if (mapError) {
          console.error('❌ benefits_map 조회 실패:', mapError)
          return []
        }
        
        if (!benefitsMap || benefitsMap.length === 0) {
          return []
        }
        
        // 2. select_hotel_benefits에서 benefit_id에 해당하는 혜택 정보 조회
        const benefitIds = benefitsMap.map(item => item.benefit_id)
        
        const { data: benefits, error: benefitsError } = await supabase
          .from('select_hotel_benefits')
          .select('benefit, benefit_description, start_date, end_date')
          .in('benefit_id', benefitIds)
        
        if (benefitsError) {
          console.error('❌ benefits 조회 실패:', benefitsError)
          return []
        }
        
        return benefits || []
      } catch (error) {
        console.error('❌ 프로모션 혜택 조회 중 오류:', error)
        return []
      }
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

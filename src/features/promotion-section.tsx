'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { HotelCardGridSection } from '@/components/shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { PROMOTION_CONFIG, type HotelCount } from '@/config/layout'

const supabase = createClient()

// 프로모션 호텔 데이터 조회 훅
export function usePromotionHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  return useQuery({
    queryKey: ['promotion-hotels', hotelCount],
    queryFn: async () => {
      // 1. select_feature_slots에서 surface가 "프로모션"인 sabre_id 조회
      const { data: featureSlots, error: featureError } = await supabase
        .from('select_feature_slots')
        .select('sabre_id')
        .eq('surface', '프로모션')
      
      if (featureError) throw featureError
      if (!featureSlots || featureSlots.length === 0) return []
      
      const sabreIds = featureSlots.map(slot => slot.sabre_id)
      
      // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회 (image_1 포함)
      const { data: hotels, error: hotelsError } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1')
        .in('sabre_id', sabreIds)
        .limit(hotelCount)
      
      if (hotelsError) throw hotelsError
      if (!hotels) return []
      
      // 3. 데이터 변환 (image_1 직접 사용)
      return transformHotelsToCardData(hotels, undefined, true)
    },
    staleTime: PROMOTION_CONFIG.CACHE_TIME,
  })
}

interface PromotionSectionProps {
  hotelCount?: HotelCount // 호텔 개수 설정
}

export function PromotionSection({ hotelCount = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT }: PromotionSectionProps) {
  const { data: promotionHotels, isLoading, error } = usePromotionHotels(hotelCount)

  return (
    <HotelCardGridSection
      hotels={promotionHotels || []}
      title="Hotel & Resorts"
      subtitle="프로모션 진행 중인 호텔 & 리조트"
      variant="promotion"
      gap="md"
      showBenefits={true}
      showRating={false}
      showPrice={false}
      showBadge={false}
      showPromotionBadge={true}
      loading={isLoading}
      skeletonCount={hotelCount}
      emptyMessage="현재 진행 중인 프로모션이 없습니다."
      error={error}
      hotelCount={hotelCount}
    />
  )
}

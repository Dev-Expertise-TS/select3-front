'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { HotelCardGridSection } from './shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'

const supabase = createClient()

// 프로모션 호텔 데이터 조회 훅
function usePromotionHotels() {
  return useQuery({
    queryKey: ['promotion-hotels'],
    queryFn: async () => {
      // 1. select_feature_slots에서 surface가 "프로모션"인 sabre_id 조회
      const { data: featureSlots, error: featureError } = await supabase
        .from('select_feature_slots')
        .select('sabre_id')
        .eq('surface', '프로모션')
      
      if (featureError) throw featureError
      if (!featureSlots || featureSlots.length === 0) return []
      
      const sabreIds = featureSlots.map(slot => slot.sabre_id)
      
      // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회
      const { data: hotels, error: hotelsError } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_kor, city, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6')
        .in('sabre_id', sabreIds)
        .limit(4)
      
      if (hotelsError) throw hotelsError
      if (!hotels) return []
      
      // 3. select_hotel_media에서 해당 sabre_id의 이미지 조회 (is_primary 대신 sort_order 기준)
      const { data: mediaData, error: mediaError } = await supabase
        .from('select_hotel_media')
        .select('sabre_id, media_path, sort_order')
        .in('sabre_id', sabreIds)
        .order('sort_order', { ascending: true })
      
      if (mediaError) throw mediaError
      
      // 4. 데이터 변환
      return transformHotelsToCardData(hotels, mediaData, true)
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export function PromotionSection() {
  const { data: promotionHotels, isLoading, error } = usePromotionHotels()

  return (
    <HotelCardGridSection
      hotels={promotionHotels || []}
      title="Promotion"
      subtitle="프로모션 진행 중인 호텔 & 리조트"
      variant="promotion"
      columns={4}
      gap="md"
      showBenefits={true}
      showRating={false}
      showPrice={false}
      showBadge={false}
      showPromotionBadge={true}
      loading={isLoading}
      skeletonCount={4}
      emptyMessage="현재 진행 중인 프로모션이 없습니다."
      error={error}
    />
  )
}

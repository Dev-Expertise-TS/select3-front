'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { HotelCardGridSection } from '@/components/shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'

const supabase = createClient()

// select_hotel_promotions_map 테이블의 호텔만 조회하는 훅
function usePromotionPageHotels() {
  return useQuery({
    queryKey: ['promotion-page-hotels'],
    queryFn: async () => {
      // 1. select_hotel_promotions_map에서 sabre_id 조회
      const { data: promotionMap, error: mapError } = await supabase
        .from('select_hotel_promotions_map')
        .select('sabre_id')
      
      if (mapError) throw mapError
      if (!promotionMap || promotionMap.length === 0) return []
      
      // 중복 제거
      const uniqueSabreIds = [...new Set(promotionMap.map(item => item.sabre_id))]
      
      // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회
      const { data: hotels, error: hotelsError } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1')
        .eq('publish', true)
        .in('sabre_id', uniqueSabreIds)
      
      if (hotelsError) throw hotelsError
      if (!hotels) return []
      
      // 3. 데이터 변환 (image_1 직접 사용)
      return transformHotelsToCardData(hotels, undefined, true)
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export default function PromotionPage() {
  const { data: promotionHotels, isLoading, error } = usePromotionPageHotels()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PromotionBanner />
      
      <main>
        <HotelCardGridSection
          hotels={promotionHotels || []}
          title="프로모션"
          subtitle="지금 진행 중인 프로모션 혜택을 확인해보세요"
          variant="promotion"
          gap="md"
          showBenefits={true}
          showRating={false}
          showPrice={false}
          showBadge={false}
          showPromotionBadge={true}
          loading={isLoading}
          skeletonCount={9}
          emptyMessage="현재 진행 중인 프로모션이 없습니다."
          error={error}
          hotelCount={3}
        />
      </main>

      <Footer />
    </div>
  )
}

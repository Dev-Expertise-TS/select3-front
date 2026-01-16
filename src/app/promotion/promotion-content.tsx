'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { HotelCardGridSection } from '@/components/shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { getCompanyFromURL, applyVccFilter } from '@/lib/company-filter'

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
      
      const company = getCompanyFromURL()
      
      // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회
      let hotelQuery = supabase
        .from('select_hotels')
        .select('*')
        .in('sabre_id', uniqueSabreIds)
      
      // company=sk일 때 vcc=TRUE 필터 적용
      hotelQuery = applyVccFilter(hotelQuery, company)
      
      const { data: hotels, error: hotelsError } = await hotelQuery
      
      if (hotelsError) throw hotelsError
      if (!hotels) return []
      
      // 클라이언트에서 publish 필터링 (false 제외)
      const filteredHotels = hotels.filter((h: any) => h.publish !== false)
      
      // 3. select_hotel_media에서 호텔 이미지 조회 (각 호텔의 첫 번째 이미지)
      const hotelSabreIds = filteredHotels.map(h => String(h.sabre_id))
      const { data: rawMediaData, error: mediaError } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', hotelSabreIds)
        .order('image_seq', { ascending: true })
      
      if (mediaError) {
        console.error('프로모션 페이지 미디어 조회 오류:', mediaError instanceof Error ? mediaError.message : String(mediaError))
      }
      
      // 각 호텔별로 첫 번째 이미지만 선택 (image_seq가 가장 작은 것)
      const mediaData = getFirstImagePerHotel(rawMediaData || [])
      
      // 4. 브랜드 정보 조회 (brand_id, brand_id_2, brand_id_3)
      const allBrandIds = [
        ...new Set(
          filteredHotels
            .flatMap((h: any) => [h.brand_id, h.brand_id_2, h.brand_id_3])
            .filter((id) => id !== null && id !== undefined && id !== '')
        )
      ]
      
      let brandData: any[] = []
      if (allBrandIds.length > 0) {
        const { data: brands, error: brandError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .in('brand_id', allBrandIds)
        
        if (brandError) {
          console.error('프로모션 페이지 브랜드 조회 오류:', {
            message: brandError.message,
            details: brandError.details,
            hint: brandError.hint,
            code: brandError.code
          })
        } else {
          brandData = brands || []
          console.log('✅ 프로모션 페이지 브랜드 데이터 조회:', {
            brand_ids_count: allBrandIds.length,
            brands_found: brandData.length,
            sample_brands: brandData.slice(0, 3)
          })
        }
      } else {
        console.warn('⚠️ 프로모션 페이지: 브랜드 ID가 없음')
      }
      
      // 5. 데이터 변환 (select_hotel_media 사용, 브랜드 정보 포함)
      return transformHotelsToCardData(filteredHotels, mediaData, true, brandData)
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export function PromotionPageContent() {
  const { data: promotionHotels, isLoading, error } = usePromotionPageHotels()

  return (
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
  )
}

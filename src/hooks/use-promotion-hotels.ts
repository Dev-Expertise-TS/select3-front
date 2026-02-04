'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { PROMOTION_CONFIG } from '@/config/layout'
import { getCompanyFromURL, applyVccFilter, isCompanyWithVccFilter } from '@/lib/company-filter'

/**
 * 띠베너용 호텔 데이터 조회 훅 (Client Component용)
 * PromotionBanner 컴포넌트에서 사용
 */
export function useTopBannerHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['top-banner-hotels', hotelCount],
    queryFn: async () => {
      // KST 오늘 (YYYY-MM-DD)
      const now = new Date()
      const kstMs = now.getTime() + 9 * 60 * 60 * 1000
      const todayKst = new Date(kstMs).toISOString().slice(0, 10)

      const { data: slots } = await supabase
        .from('select_feature_slots')
        .select('sabre_id, slot_key, start_date, end_date')
        .eq('surface', '띠베너')
        .order('slot_key', { ascending: true })

      const activeSlots = (slots || [])
        .filter((slot: any) => {
          const start = (slot.start_date ?? '').toString().slice(0, 10)
          const end = (slot.end_date ?? '').toString().slice(0, 10)
          if (!start && !end) return true
          if (start && todayKst < start) return false
          if (end && todayKst > end) return false
          return true
        })

      // slot_key 순서를 보존하기 위한 맵
      const orderMap = new Map<number, number>()
      activeSlots.forEach((slot: any, idx: number) => orderMap.set(slot.sabre_id, idx))

      let poolSabreIds = activeSlots.map((slot: any) => slot.sabre_id)

      const company = getCompanyFromURL()

      // SK인 경우 풀을 /promotion 페이지와 동일하게 설정
      if (isCompanyWithVccFilter(company)) {
        const { data: promotionMap } = await supabase
          .from('select_hotel_promotions_map')
          .select('sabre_id')
        
        if (promotionMap && promotionMap.length > 0) {
          poolSabreIds = [...new Set(promotionMap.map(item => item.sabre_id))]
        } else {
          return []
        }
      }

      if (poolSabreIds.length === 0) return []

      let hotelQuery = supabase
        .from('select_hotels')
        .select('*')
      
      // company=sk일 때 vcc=true 필터 적용
      hotelQuery = applyVccFilter(hotelQuery, company)
      
      // SK인 경우 더 많은 후보를 가져와서 랜덤화
      if (isCompanyWithVccFilter(company)) {
        hotelQuery = hotelQuery.limit(50)
      } else {
        hotelQuery = hotelQuery.limit(hotelCount * 2)
      }
      
      const { data: hotels } = await hotelQuery
        .in('sabre_id', poolSabreIds)

      if (!hotels) return []

      // publish 필터링 (null이거나 true인 것만)
      let processedHotels = hotels.filter((h: any) => h.publish !== false)

      if (isCompanyWithVccFilter(company)) {
        // SK인 경우 랜덤하게 섞고 요청된 개수만큼 선택
        processedHotels = processedHotels
          .sort(() => Math.random() - 0.5)
          .slice(0, hotelCount)
      } else {
        // 일반 사용자는 slot_key 순서대로 정렬 후 선택
        processedHotels = processedHotels
          .sort((a: any, b: any) => (orderMap.get(a.sabre_id) ?? 0) - (orderMap.get(b.sabre_id) ?? 0))
          .slice(0, hotelCount)
      }

      const hotelSabreIds = processedHotels.map(h => String(h.sabre_id))
      const { data: rawMediaData } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', hotelSabreIds)
        .order('image_seq', { ascending: true })
      
      const mediaData = getFirstImagePerHotel(rawMediaData || [])

      // 브랜드 정보 조회
      const allBrandIds = [
        ...new Set(
          processedHotels
            .flatMap((h: any) => [h.brand_id, h.brand_id_2, h.brand_id_3])
            .filter((id) => id !== null && id !== undefined && id !== '')
        )
      ]
      
      let brandData: any[] = []
      if (allBrandIds.length > 0) {
        const { data: brands } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .in('brand_id', allBrandIds)
        brandData = brands || []
      }

      return transformHotelsToCardData(processedHotels, mediaData, true, brandData)
    },
    staleTime: PROMOTION_CONFIG.CACHE_TIME,
  })
}


'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { HotelCardGridSection } from '@/components/shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { PROMOTION_CONFIG, type HotelCount } from '@/config/layout'

const supabase = createClient()

// 프로모션 호텔 데이터 조회 훅
export function usePromotionHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  return useQuery({
    queryKey: ['promotion-hotels', hotelCount],
    queryFn: async () => {
      // KST 오늘 (YYYY-MM-DD)
      const now = new Date()
      const kstMs = now.getTime() + 9 * 60 * 60 * 1000
      const todayKst = new Date(kstMs).toISOString().slice(0, 10)

      // 1. select_feature_slots에서 surface가 "프로모션"인 sabre_id 조회 (start/end 포함)
      const { data: featureSlots, error: featureError } = await supabase
        .from('select_feature_slots')
        .select('sabre_id, start_date, end_date')
        .eq('surface', '프로모션')
      
      if (featureError) throw featureError
      if (!featureSlots || featureSlots.length === 0) return []

      // 시작/종료 날짜 필터 (없으면 계속 노출)
      const activeSabreIds = (featureSlots as any[])
        .filter((slot) => {
          const start = (slot.start_date ?? '').toString().slice(0, 10)
          const end = (slot.end_date ?? '').toString().slice(0, 10)
          if (!start && !end) return true
          if (start && todayKst < start) return false
          if (end && todayKst > end) return false
          return true
        })
        .map((slot) => slot.sabre_id)

      if (activeSabreIds.length === 0) return []
      
      // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회 (image_1 포함)
      const { data: hotels, error: hotelsError } = await supabase
        .from('select_hotels')
        .select('*')
        .in('sabre_id', activeSabreIds)
        .limit(hotelCount * 2) // 필터링 고려하여 더 많이 가져오기
      
      if (hotelsError) throw hotelsError
      if (!hotels) return []
      
      // 클라이언트에서 publish 필터링 (false 제외)
      const filteredHotels = hotels.filter((h: any) => h.publish !== false).slice(0, hotelCount)
      
      // 3. select_hotel_media에서 호텔 이미지 조회 (각 호텔의 첫 번째 이미지)
      const hotelSabreIds = filteredHotels.map(h => String(h.sabre_id))
      const { data: rawMediaData, error: mediaError } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', hotelSabreIds)
        .order('image_seq', { ascending: true })
      
      if (mediaError) {
        console.error('프로모션 페이지 미디어 조회 오류:', mediaError)
      }
      
      // 각 호텔별로 첫 번째 이미지만 선택 (image_seq가 가장 작은 것)
      const mediaData = getFirstImagePerHotel(rawMediaData || [])
      
      // 4. 데이터 변환 (select_hotel_media 사용)
      return transformHotelsToCardData(filteredHotels, mediaData, true)
    },
    staleTime: PROMOTION_CONFIG.CACHE_TIME,
  })
}

// 띠베너용 호텔 데이터 조회 훅 (select_feature_slots.surface = '띠베너' + KST 날짜 필터)
export function useTopBannerHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  return useQuery({
    queryKey: ['top-banner-hotels', hotelCount],
    queryFn: async () => {
      // KST 오늘 (YYYY-MM-DD)
      const now = new Date()
      const kstMs = now.getTime() + 9 * 60 * 60 * 1000
      const todayKst = new Date(kstMs).toISOString().slice(0, 10)

      // 1. select_feature_slots에서 surface가 '띠베너'인 항목 조회 (start/end 포함)
      const { data: slots, error: slotsError } = await supabase
        .from('select_feature_slots')
        .select('sabre_id, start_date, end_date')
        .eq('surface', '띠베너')

      if (slotsError) throw slotsError
      if (!slots || slots.length === 0) return []

      const activeSabreIds = (slots as any[])
        .filter((slot) => {
          const start = (slot.start_date ?? '').toString().slice(0, 10)
          const end = (slot.end_date ?? '').toString().slice(0, 10)
          if (!start && !end) return true
          if (start && todayKst < start) return false
          if (end && todayKst > end) return false
          return true
        })
        .map((slot) => slot.sabre_id)

      if (activeSabreIds.length === 0) return []

      // 2. select_hotels에서 해당 sabre_id의 호텔들 조회 (image_1 필요)
      const { data: hotels, error: hotelsError } = await supabase
        .from('select_hotels')
        .select('*')
        .in('sabre_id', activeSabreIds)
        .limit(hotelCount * 2) // 필터링 고려하여 더 많이 가져오기

      if (hotelsError) throw hotelsError
      if (!hotels) return []

      // 클라이언트에서 publish 필터링 (false 제외)
      const filteredHotels = hotels.filter((h: any) => h.publish !== false).slice(0, hotelCount)

      // 3. select_hotel_media에서 호텔 이미지 조회 (각 호텔의 첫 번째 이미지)
      const hotelSabreIds = filteredHotels.map(h => String(h.sabre_id))
      const { data: rawMediaData, error: mediaError } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', hotelSabreIds)
        .order('image_seq', { ascending: true })
      
      if (mediaError) {
        console.error('프로모션 미디어 조회 오류:', mediaError)
      }
      
      // 각 호텔별로 첫 번째 이미지만 선택 (image_seq가 가장 작은 것)
      const mediaData = getFirstImagePerHotel(rawMediaData || [])

      // 4. 카드 데이터 형식으로 변환 (select_hotel_media 사용)
      return transformHotelsToCardData(filteredHotels, mediaData, true)
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
      showViewAll={true}
      viewAllText="프로모션 더 보기"
      viewAllHref="/promotion"
    />
  )
}

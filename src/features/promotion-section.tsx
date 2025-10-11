import { createClient } from '@/lib/supabase/server'
import { HotelCardGridSection } from '@/components/shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { PROMOTION_CONFIG, type HotelCount } from '@/config/layout'

// 프로모션 호텔 데이터 조회 (Server-side)
async function getPromotionHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  const supabase = await createClient()
  
  console.log('🔍 [PromotionSection] 프로모션 호텔 조회 시작, hotelCount:', hotelCount)
  
  // KST 오늘 (YYYY-MM-DD)
  const now = new Date()
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000
  const todayKst = new Date(kstMs).toISOString().slice(0, 10)
  
  console.log('📅 [PromotionSection] KST Today:', todayKst)

  // 1. select_feature_slots에서 surface가 "프로모션"인 sabre_id 조회
  const { data: featureSlots, error: featureError } = await supabase
    .from('select_feature_slots')
    .select('sabre_id, start_date, end_date')
    .eq('surface', '프로모션')
  
  console.log('📊 [PromotionSection] Feature Slots:', {
    count: featureSlots?.length || 0,
    data: featureSlots,
    error: featureError
  })
  
  if (featureError || !featureSlots || featureSlots.length === 0) {
    console.log('❌ [PromotionSection] Feature slots 없음')
    return []
  }

  // 시작/종료 날짜 필터
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

  console.log('✅ [PromotionSection] Active Sabre IDs:', activeSabreIds)

  if (activeSabreIds.length === 0) {
    console.log('❌ [PromotionSection] 활성 Sabre IDs 없음')
    return []
  }
  
  // 2. select_hotels에서 호텔 정보 조회
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('*')
    .in('sabre_id', activeSabreIds)
    .limit(hotelCount * 2)  // 필터링 고려하여 더 많이 가져오기
  
  console.log('📊 [PromotionSection] Hotels:', {
    count: hotels?.length || 0,
    error: hotelsError
  })
  
  if (hotelsError || !hotels) {
    console.log('❌ [PromotionSection] 호텔 조회 실패')
    return []
  }
  
  // publish 필터링 (null이거나 true인 것만)
  const filteredHotels = hotels.filter((h: any) => h.publish !== false).slice(0, hotelCount)
  
  console.log('✅ [PromotionSection] Filtered Hotels:', filteredHotels.length)
  
  // 3. select_hotel_media에서 호텔 이미지 조회
  const hotelSabreIds = filteredHotels.map(h => String(h.sabre_id))
  const { data: rawMediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', hotelSabreIds)
    .order('image_seq', { ascending: true })
  
  console.log('📊 [PromotionSection] Media:', {
    count: rawMediaData?.length || 0
  })
  
  // 각 호텔별로 첫 번째 이미지만 선택
  const mediaData = getFirstImagePerHotel(rawMediaData || [])
  
  // 4. 데이터 변환
  const result = transformHotelsToCardData(filteredHotels, mediaData, true)
  
  console.log('🎯 [PromotionSection] Final Result:', result.length, 'hotels')
  
  return result
}

// 띠베너용 호텔 데이터 조회 (Server-side)
async function getTopBannerHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  const supabase = await createClient()
  
  // KST 오늘 (YYYY-MM-DD)
  const now = new Date()
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000
  const todayKst = new Date(kstMs).toISOString().slice(0, 10)

  // 1. select_feature_slots에서 surface가 '띠베너'인 항목 조회
  const { data: slots, error: slotsError } = await supabase
    .from('select_feature_slots')
    .select('sabre_id, start_date, end_date')
    .eq('surface', '띠베너')

  if (slotsError || !slots || slots.length === 0) return []

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

  // 2. select_hotels에서 호텔 정보 조회
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('*')
    .in('sabre_id', activeSabreIds)
    .limit(hotelCount * 2)  // 필터링 고려하여 더 많이 가져오기

  if (hotelsError || !hotels) return []

  // publish 필터링 (null이거나 true인 것만)
  const filteredHotels = hotels.filter((h: any) => h.publish !== false).slice(0, hotelCount)

  // 3. select_hotel_media에서 호텔 이미지 조회
  const hotelSabreIds = filteredHotels.map(h => String(h.sabre_id))
  const { data: rawMediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', hotelSabreIds)
    .order('image_seq', { ascending: true })
  
  // 각 호텔별로 첫 번째 이미지만 선택
  const mediaData = getFirstImagePerHotel(rawMediaData || [])

  // 4. 카드 데이터 형식으로 변환
  return transformHotelsToCardData(filteredHotels, mediaData, true)
}

interface PromotionSectionProps {
  hotelCount?: HotelCount
}

// RSC로 전환
export async function PromotionSection({ hotelCount = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT }: PromotionSectionProps) {
  const promotionHotels = await getPromotionHotels(hotelCount)

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
      loading={false}
      skeletonCount={hotelCount}
      emptyMessage="현재 진행 중인 프로모션이 없습니다."
      hotelCount={hotelCount}
      showViewAll={true}
      viewAllText="프로모션 더 보기"
      viewAllHref="/promotion"
    />
  )
}

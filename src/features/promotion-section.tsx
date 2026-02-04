import { createClient } from '@/lib/supabase/server'
import { HotelCardGridSection } from '@/components/shared/hotel-card-grid'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { PROMOTION_CONFIG, type HotelCount } from '@/config/layout'
import { applyVccFilter, isCompanyWithVccFilter } from '@/lib/company-filter'

// 프로모션 호텔 데이터 조회 (Server-side)
async function getPromotionHotels(
  hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT,
  company?: string | null
) {
  const supabase = await createClient()
  
  // 1. select_hotel_promotions_map에서 sabre_id 조회 (/promotion 페이지와 동일한 풀)
  const { data: promotionMap, error: mapError } = await supabase
    .from('select_hotel_promotions_map')
    .select('sabre_id')

  if (mapError || !promotionMap || promotionMap.length === 0) {
    return []
  }

  // 중복 제거 및 sabre_id 목록 생성
  const poolSabreIds = [...new Set(promotionMap.map(item => item.sabre_id))]
  
  // 2. select_hotels에서 호텔 정보 조회
  let hotelQuery = supabase
    .from('select_hotels')
    .select('*')
    .in('sabre_id', poolSabreIds)
  
  // company=sk일 때 vcc=true 필터 적용
  hotelQuery = applyVccFilter(hotelQuery, company || null)
  
  // 랜덤하게 선택하기 위해 넉넉하게 가져옴
  hotelQuery = hotelQuery.limit(100)
  
  const { data: hotels, error: hotelsError } = await hotelQuery
  
  if (hotelsError || !hotels) {
    return []
  }
  
  // publish 필터링 (null이거나 true인 것만)
  let processedHotels = hotels.filter((h: any) => h.publish !== false)

  // 모든 사용자에게 랜덤하게 섞고 요청된 개수만큼 선택
  processedHotels = processedHotels
    .sort(() => Math.random() - 0.5)
    .slice(0, hotelCount)
  
  // 3. select_hotel_media에서 호텔 이미지 조회
  const hotelSabreIds = processedHotels.map(h => String(h.sabre_id))
  const { data: rawMediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', hotelSabreIds)
    .order('image_seq', { ascending: true })
  
  // 각 호텔별로 첫 번째 이미지만 선택
  const mediaData = getFirstImagePerHotel(rawMediaData || [])
  
  // 4. 브랜드 정보 조회 (프로모션 페이지와 동일한 스타일을 위해)
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
  
  // 5. 데이터 변환 (브랜드 정보 포함하여 프로모션 페이지와 동일하게)
  const result = transformHotelsToCardData(processedHotels, mediaData, true, brandData)
  
  return result
}

// 띠베너용 호텔 데이터 조회 (Server-side)
async function getTopBannerHotels(
  hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT,
  company?: string | null
) {
  const supabase = await createClient()
  
  // KST 오늘 (YYYY-MM-DD)
  const now = new Date()
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000
  const todayKst = new Date(kstMs).toISOString().slice(0, 10)

  // 1. select_feature_slots에서 surface가 '띠베너'인 항목 조회 (slot_key 오름차순)
  const { data: slots } = await supabase
    .from('select_feature_slots')
    .select('sabre_id, slot_key, start_date, end_date')
    .eq('surface', '띠베너')
    .order('slot_key', { ascending: true })

  // 시작/종료 날짜 필터 적용
  const activeTopSlots = (slots || [])
    .filter((slot: any) => {
      const start = (slot.start_date ?? '').toString().slice(0, 10)
      const end = (slot.end_date ?? '').toString().slice(0, 10)
      if (!start && !end) return true
      if (start && todayKst < start) return false
      if (end && todayKst > end) return false
      return true
    })

  const topOrderMap = new Map<number, number>()
  activeTopSlots.forEach((slot: any, idx: number) => topOrderMap.set(slot.sabre_id, idx))

  let poolSabreIds = activeTopSlots.map((slot: any) => slot.sabre_id)

  // vcc 필터 적용 company인 경우 풀을 /promotion 페이지와 동일하게 설정
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

  // 2. select_hotels에서 호텔 정보 조회
  let hotelQuery = supabase
    .from('select_hotels')
    .select('*')
    .in('sabre_id', poolSabreIds)
  
  // company=sk일 때 vcc=true 필터 적용
  hotelQuery = applyVccFilter(hotelQuery, company || null)
  
  // vcc 필터 적용 company인 경우 더 많은 후보를 가져와서 랜덤화 (최대 50개)
  if (isCompanyWithVccFilter(company)) {
    hotelQuery = hotelQuery.limit(50)
  } else {
    hotelQuery = hotelQuery.limit(hotelCount * 2)
  }
  
  const { data: hotels, error: hotelsError } = await hotelQuery

  if (hotelsError || !hotels) return []

  // publish 필터링 (null이거나 true인 것만)
  let processedHotels = hotels.filter((h: any) => h.publish !== false)

  if (isCompanyWithVccFilter(company)) {
    // vcc 필터 적용 company인 경우 랜덤하게 섞고 요청된 개수만큼 선택
    processedHotels = processedHotels
      .sort(() => Math.random() - 0.5)
      .slice(0, hotelCount)
  } else {
    // 일반 사용자는 slot_key 순서대로 정렬 후 선택
    processedHotels = processedHotels
      .sort((a: any, b: any) => (topOrderMap.get(a.sabre_id) ?? 0) - (topOrderMap.get(b.sabre_id) ?? 0))
      .slice(0, hotelCount)
  }

  // 3. select_hotel_media에서 호텔 이미지 조회
  const hotelSabreIds = processedHotels.map(h => String(h.sabre_id))
  const { data: rawMediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', hotelSabreIds)
    .order('image_seq', { ascending: true })
  
  // 각 호텔별로 첫 번째 이미지만 선택
  const mediaData = getFirstImagePerHotel(rawMediaData || [])

  // 4. 브랜드 정보 조회
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

  // 5. 카드 데이터 형식으로 변환
  return transformHotelsToCardData(processedHotels, mediaData, true, brandData)
}

interface PromotionSectionProps {
  hotelCount?: HotelCount
  company?: string | null
}

// RSC로 전환
export async function PromotionSection({ 
  hotelCount = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT,
  company
}: PromotionSectionProps) {
  const promotionHotels = await getPromotionHotels(hotelCount, company)

  return (
    <HotelCardGridSection
      hotels={promotionHotels || []}
      title="Hotel & Resort Promotions"
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
      viewAllHref={company ? `/promotion?company=${company}` : "/promotion"}
      onViewAllClick={undefined}
    />
  )
}

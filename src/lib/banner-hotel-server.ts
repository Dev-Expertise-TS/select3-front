import { createClient } from '@/lib/supabase/server'

/**
 * 배너용 호텔 데이터 조회 (서버 사이드)
 * select_feature_slots 테이블에서 '상단베너' surface의 활성 호텔 조회
 */
export async function getBannerHotel() {
  try {
    const supabase = await createClient()
    
    // 한국 시간(KST)의 오늘 날짜
    const now = new Date()
    const kstMs = now.getTime() + 9 * 60 * 60 * 1000
    const todayKst = new Date(kstMs).toISOString().slice(0, 10)

    // select_feature_slots에서 활성 슬롯 조회
    const { data: featureSlots, error: featureError } = await supabase
      .from('select_feature_slots')
      .select('sabre_id, start_date, end_date')
      .eq('surface', '상단베너')

    if (featureError) {
      console.error('❌ [Server] 배너 슬롯 조회 오류:', featureError)
      return null
    }
    
    if (!featureSlots || featureSlots.length === 0) {
      console.log('📭 [Server] 활성 배너 슬롯 없음')
      return null
    }

    // KST 오늘 날짜 기준으로 필터링
    const activeSlots = featureSlots.filter((slot: any) => {
      const start = (slot.start_date ?? '').toString().slice(0, 10)
      const end = (slot.end_date ?? '').toString().slice(0, 10)
      if (!start && !end) return true
      if (start && todayKst < start) return false
      if (end && todayKst > end) return false
      return true
    })

    if (activeSlots.length === 0) {
      console.log('📭 [Server] 오늘 날짜에 활성 배너 슬롯 없음')
      return null
    }

    const sabreIds = activeSlots.map((slot: any) => slot.sabre_id)
    
    // select_hotels에서 호텔 정보 조회
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('*')
      .in('sabre_id', sabreIds)
      .not('image_1', 'is', null)
    
    if (hotelsError) {
      console.error('❌ [Server] 배너 호텔 조회 오류:', hotelsError)
      return null
    }
    
    if (!hotels || hotels.length === 0) {
      console.log('📭 [Server] 배너 호텔 없음')
      return null
    }
    
    const filteredHotels = hotels.filter((h: any) => h.publish !== false)
    if (filteredHotels.length === 0) {
      console.log('📭 [Server] publish된 배너 호텔 없음')
      return null
    }
    
    // 브랜드 및 체인 정보 조회
    const brandIds = filteredHotels.map((hotel: any) => hotel.brand_id).filter(Boolean)
    let brandsData: Array<{brand_id: string, brand_name_en: string, chain_id: string}> = []
    if (brandIds.length > 0) {
      const { data, error: brandsError } = await supabase
        .from('hotel_brands')
        .select('brand_id, brand_name_en, chain_id')
        .in('brand_id', brandIds)
      
      if (brandsError) {
        console.error('❌ [Server] 브랜드 조회 오류:', brandsError)
      } else {
        brandsData = data || []
      }
    }
    
    const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
    let chainsData: Array<{chain_id: string, chain_name_en: string}> = []
    if (chainIds.length > 0) {
      const { data, error: chainsError } = await supabase
        .from('hotel_chains')
        .select('chain_id, chain_name_en')
        .in('chain_id', chainIds)
      
      if (chainsError) {
        console.error('❌ [Server] 체인 조회 오류:', chainsError)
      } else {
        chainsData = data || []
      }
    }
    
    // 랜덤 호텔 선택 및 브랜드 정보 매핑
    const randomHotel = filteredHotels[Math.floor(Math.random() * filteredHotels.length)]
    const hotelBrand = brandsData?.find((brand: any) => brand.brand_id === randomHotel.brand_id)
    const hotelChain = chainsData?.find((chain: any) => chain.chain_id === hotelBrand?.chain_id)
    
    console.log('✅ [Server] 배너 호텔 조회 성공:', randomHotel.property_name_ko)
    
    return {
      ...randomHotel,
      media_path: randomHotel.image_1,
      brand_name_en: hotelBrand?.brand_name_en || null,
      chain_name_en: hotelChain?.chain_name_en || null
    }
  } catch (error) {
    console.error('💥 [Server] 배너 호텔 조회 중 예외:', error)
    return null
  }
}


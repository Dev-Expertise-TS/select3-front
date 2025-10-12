import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'

export interface HeroImageData {
  sabre_id: number
  property_name_ko: string
  property_name_en: string
  slug: string
  media_path: string
  city: string
  chain_name_en: string
  brand_name_en: string
}

/**
 * 히어로 이미지 데이터 조회 (서버 사이드)
 * - 성능 최적화: 클라이언트 API 호출 제거
 * - 즉시 이미지 표시 (빠른 LCP)
 */
export async function getHeroImages(): Promise<HeroImageData[]> {
  const supabase = await createClient()

  try {
    // 1. select_feature_slots에서 surface가 "히어로"인 sabre_id 조회
    const { data: featureSlots, error: featureError } = await supabase
      .from('select_feature_slots')
      .select('sabre_id, slot_key, start_date, end_date')
      .eq('surface', '히어로')
      .order('slot_key', { ascending: true })
    
    if (featureError || !featureSlots || featureSlots.length === 0) {
      return []
    }
    
    // KST 기준 오늘 날짜
    const now = new Date()
    const kstMs = now.getTime() + 9 * 60 * 60 * 1000
    const todayKst = new Date(kstMs).toISOString().slice(0, 10)

    // start_date/end_date 기간 필터링
    const activeSlots = (featureSlots as any[]).filter((slot) => {
      const start = (slot.start_date ?? '').toString().slice(0, 10)
      const end = (slot.end_date ?? '').toString().slice(0, 10)
      if (!start && !end) return true
      if (start && todayKst < start) return false
      if (end && todayKst > end) return false
      return true
    })

    if (activeSlots.length === 0) {
      return []
    }

    const sabreIds = activeSlots.map(slot => slot.sabre_id)
    
    // 2. select_hotels에서 호텔 정보 조회
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('*')
      .in('sabre_id', sabreIds)
    
    if (hotelsError || !hotels) {
      return []
    }
    
    // publish 필터링
    const filteredHotels = hotels.filter((h: any) => h.publish !== false)
    
    // 3. select_hotel_media에서 이미지 조회
    const { data: rawMediaData } = await supabase
      .from('select_hotel_media')
      .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
      .in('sabre_id', sabreIds.map(id => String(id)))
      .order('image_seq', { ascending: true })
    
    // 각 호텔별 첫 번째 이미지만 선택
    const mediaData = getFirstImagePerHotel(rawMediaData || [])
    
    // 4. 브랜드/체인 정보 조회
    const brandIds = filteredHotels.map(hotel => hotel.brand_id).filter(id => id !== null && id !== undefined)
    let brandsData: Array<{brand_id: string, brand_name_en: string, chain_id: string}> = []
    
    if (brandIds.length > 0) {
      const { data } = await supabase
        .from('hotel_brands')
        .select('brand_id, brand_name_en, chain_id')
        .in('brand_id', brandIds)
      
      brandsData = data || []
    }
    
    const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
    const { data: chainsData } = await supabase
      .from('hotel_chains')
      .select('chain_id, chain_name_en')
      .in('chain_id', chainIds)
    
    // slot_key 순서 맵
    const orderMap = new Map<number, number>()
    activeSlots.forEach((slot: any, idx: number) => orderMap.set(slot.sabre_id, idx))

    // 5. 데이터 조합
    const heroImages: HeroImageData[] = filteredHotels.map(hotel => {
      const brand = brandsData?.find(b => b.brand_id === hotel.brand_id)
      const chain = chainsData?.find(c => c.chain_id === brand?.chain_id)
      
      const getBrandDisplayName = () => {
        if (brand?.brand_name_en) return brand.brand_name_en
        if (chain?.chain_name_en) return chain.chain_name_en
        const hotelName = hotel.property_name_ko || hotel.property_name_en || ''
        if (hotelName.includes('포시즌스') || hotelName.includes('Four Seasons')) return 'FOUR SEASONS'
        if (hotelName.includes('만다린') || hotelName.includes('Mandarin')) return 'MANDARIN ORIENTAL'
        if (hotelName.includes('인터컨티넨탈') || hotelName.includes('InterContinental')) return 'INTERCONTINENTAL'
        return 'LUXURY'
      }
      
      const hotelMedia = mediaData?.find(m => String(m.sabre_id) === String(hotel.sabre_id))
      let mediaPath = hotelMedia?.public_url || hotelMedia?.storage_path || '/placeholder.svg'
      
      // 미디어가 없으면 도시별 fallback
      if (mediaPath === '/placeholder.svg') {
        const cityFallbacks: Record<string, string> = {
          'Tokyo': '/destination-image/tokyo.jpg',
          'London': '/destination-image/london.jpg',
          'Bali': '/destination-image/bali.webp',
          'Singapore': '/destination-image/singapore.jpg',
          'Hong Kong': '/destination-image/hongkong.webp',
          'Osaka': '/destination-image/osaka.avif',
          'Roma': '/destination-image/roma.jpg',
          'Danang': '/destination-image/danang.jpg'
        }
        mediaPath = cityFallbacks[hotel.city] || '/destination-image/tokyo.jpg'
      }
      
      return {
        sabre_id: hotel.sabre_id,
        property_name_ko: hotel.property_name_ko || `호텔 ${hotel.sabre_id}`,
        property_name_en: hotel.property_name_en || 'Luxury Destination',
        slug: hotel.slug || '',
        media_path: mediaPath,
        city: hotel.city || 'Unknown',
        chain_name_en: chain?.chain_name_en || 'LUXURY',
        brand_name_en: getBrandDisplayName(),
      }
    })

    // 6. slot_key 순서대로 정렬
    heroImages.sort((a, b) => (orderMap.get(a.sabre_id) ?? 0) - (orderMap.get(b.sabre_id) ?? 0))

    return heroImages
  } catch (error) {
    console.error('❌ 히어로 이미지 조회 실패:', error instanceof Error ? error.message : String(error))
    return []
  }
}


import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { transformHotelsToCardData } from '@/lib/hotel-utils'

/**
 * 지역별 호텔 데이터 조회
 */
export async function getDestinationData(citySlug: string) {
  const supabase = await createClient()
  
  console.log('🔍 [Destination] 지역 데이터 조회 시작:', citySlug)
  
  // 1. select_regions에서 도시 정보 조회
  const { data: region, error: regionError } = await supabase
    .from('select_regions')
    .select('*')
    .eq('city_slug', citySlug)
    .eq('status', 'active')
    .maybeSingle()
  
  if (regionError || !region) {
    console.warn('❌ [Destination] 지역 조회 실패:', { citySlug, error: regionError })
    return null
  }
  
  console.log('✅ [Destination] 지역 조회 완료:', region.city_ko)
  
  const cityCode = region.city_code
  
  // 2-4. 병렬로 데이터 조회
  const [hotelsResult, cityMediaResult] = await Promise.all([
    // 2. 해당 도시의 호텔 조회
    supabase
      .from('select_hotels')
      .select('*')
      .eq('city_code', cityCode)
      .or('publish.is.null,publish.eq.true')
      .order('property_name_en'),
    
    // 3. 도시 이미지 조회
    supabase
      .from('select_city_media')
      .select('city_code, public_url, storage_path, image_seq')
      .eq('city_code', cityCode)
      .order('image_seq', { ascending: true })
      .limit(1)
  ])
  
  const hotels = hotelsResult.data || []
  console.log('🏨 [Destination] 호텔 조회 완료:', hotels.length, '개')
  
  if (hotels.length === 0) {
    return {
      region,
      hotels: [],
      cityImage: null
    }
  }
  
  // 4. 호텔 이미지 조회
  const sabreIds = hotels.map((h: any) => String(h.sabre_id))
  const { data: mediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', sabreIds)
    .order('image_seq', { ascending: true })
  
  const firstImages = getFirstImagePerHotel(mediaData || [])
  console.log('📸 [Destination] 호텔 이미지 조회 완료:', firstImages.length, '개')
  
  // 5. 데이터 변환
  const transformedHotels = transformHotelsToCardData(hotels, firstImages, true)
  
  // 6. 도시 이미지
  const cityImage = cityMediaResult.data?.[0]
  const cityImageUrl = cityImage?.public_url || cityImage?.storage_path || null
  
  console.log('✅ [Destination] 데이터 조회 완료:', {
    region: region.city_ko,
    hotels: transformedHotels.length,
    cityImage: !!cityImageUrl
  })
  
  return {
    region,
    hotels: transformedHotels,
    cityImage: cityImageUrl
  }
}


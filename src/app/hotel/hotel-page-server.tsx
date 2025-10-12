import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { transformHotelsToAllViewCardData } from '@/lib/hotel-utils'

/**
 * 서버에서 호텔 목록 페이지 데이터 조회
 * UI는 유지하고 데이터 페칭만 서버로 이동
 */
export async function getHotelPageData() {
  const supabase = await createClient()
  
  console.log('🔍 [HotelPage] 서버 데이터 조회 시작')

  // 1. 전체 호텔 조회
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('*')
    .or('publish.is.null,publish.eq.true')  // publish가 null이거나 true인 것만
    .order('property_name_en')
  
  if (hotelsError) {
    console.error('❌ [HotelPage] 호텔 조회 실패:', hotelsError)
    return { allHotels: [], filterOptions: { countries: [], cities: [], brands: [], chains: [] } }
  }
  
  console.log('✅ [HotelPage] 호텔 조회 완료:', hotels?.length || 0, '개')
  
  if (!hotels || hotels.length === 0) {
    return { allHotels: [], filterOptions: { countries: [], cities: [], brands: [], chains: [] } }
  }

  // 2. 호텔 이미지 조회
  const sabreIds = hotels.map((hotel: any) => String(hotel.sabre_id))
  const { data: mediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', sabreIds)
    .order('image_seq', { ascending: true })
  
  const firstImages = getFirstImagePerHotel(mediaData || [])
  console.log('✅ [HotelPage] 이미지 조회 완료:', firstImages?.length || 0, '개')

  // 3. 브랜드 정보 조회
  const brandIds = hotels.filter((hotel: any) => hotel.brand_id).map((hotel: any) => hotel.brand_id)
  let brandData = []
  if (brandIds.length > 0) {
    const { data: brandResult, error: brandError } = await supabase
      .from('hotel_brands')
      .select('brand_id, brand_name_en')
      .in('brand_id', brandIds)
    
    if (brandError) {
      console.error('❌ [HotelPage] 브랜드 조회 실패:', brandError)
    } else {
      brandData = brandResult || []
      console.log('✅ [HotelPage] 브랜드 조회 완료:', brandData.length, '개')
    }
  }

  // 4. 데이터 변환 (useAllHotels와 동일한 형식)
  const allHotels = transformHotelsToAllViewCardData(hotels, firstImages, brandData)
  console.log('✅ [HotelPage] 데이터 변환 완료:', allHotels?.length || 0, '개')

  // 5. 필터 옵션 가공 (이미 조회한 hotels 데이터 사용)
  const countries = new Map<string, { id: string; label: string; count: number }>()
  const cities = new Map<string, { id: string; label: string; count: number }>()
  const brands = new Map<string, { id: string; label: string; count: number }>()
  const chains = new Map<number, { id: string; label: string; count: number }>()
  
  hotels.forEach((hotel: any) => {
    // 국가
    if (hotel.country_ko) {
      const existing = countries.get(hotel.country_ko) || { 
        id: hotel.country_ko, 
        label: hotel.country_ko, 
        count: 0 
      }
      existing.count++
      countries.set(hotel.country_ko, existing)
    }
    
    // 도시
    if (hotel.city_ko) {
      const existing = cities.get(hotel.city_ko) || { 
        id: hotel.city_ko, 
        label: hotel.city_ko, 
        count: 0 
      }
      existing.count++
      cities.set(hotel.city_ko, existing)
    }
    
    // 브랜드
    if (hotel.brand_name_en) {
      const existing = brands.get(hotel.brand_name_en) || { 
        id: hotel.brand_name_en, 
        label: hotel.brand_name_en, 
        count: 0 
      }
      existing.count++
      brands.set(hotel.brand_name_en, existing)
    }
    
    // 체인
    if (hotel.chain_id) {
      const existing = chains.get(hotel.chain_id) || { 
        id: String(hotel.chain_id), 
        label: `Chain ${hotel.chain_id}`, 
        count: 0 
      }
      existing.count++
      chains.set(hotel.chain_id, existing)
    }
  })
  
  const filterOptions = {
    countries: Array.from(countries.values()).sort((a, b) => b.count - a.count),
    cities: Array.from(cities.values()).sort((a, b) => b.count - a.count),
    brands: Array.from(brands.values()).sort((a, b) => a.label.localeCompare(b.label)),
    chains: Array.from(chains.values()).sort((a, b) => a.label.localeCompare(b.label))
  }
  
  console.log('✅ [HotelPage] 필터 옵션 생성 완료:', {
    countries: filterOptions.countries.length,
    cities: filterOptions.cities.length,
    brands: filterOptions.brands.length,
    chains: filterOptions.chains.length
  })

  return {
    allHotels,
    filterOptions
  }
}


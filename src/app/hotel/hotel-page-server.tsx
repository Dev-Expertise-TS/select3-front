import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { transformHotelsToAllViewCardData } from '@/lib/hotel-utils'
import { getBannerHotel } from '@/lib/banner-hotel-server'

/**
 * 서버에서 호텔 목록 페이지 데이터 조회
 * UI는 유지하고 데이터 페칭만 서버로 이동
 */
export async function getHotelPageData() {
  const supabase = await createClient()
  
  console.log('🔍 [HotelPage] 서버 데이터 조회 시작')

  // 0. 배너 호텔 조회 (병렬 처리를 위해 먼저 시작)
  const bannerHotelPromise = getBannerHotel()

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

  // 3-1. 체인 정보 조회 (필터 옵션용)
  const chainIds = [...new Set(hotels.filter((hotel: any) => hotel.chain_id).map((hotel: any) => hotel.chain_id))]
  let chainData: Array<{ chain_id: number; chain_name_en: string; chain_name_ko?: string }> = []
  
  console.log('🔍 [HotelPage] 호텔의 chain_id 현황:', {
    총호텔수: hotels.length,
    chain_id있는호텔: hotels.filter((h: any) => h.chain_id).length,
    고유chain_id개수: chainIds.length,
    chain_id샘플: hotels.filter((h: any) => h.chain_id).slice(0, 5).map((h: any) => ({ 
      sabre_id: h.sabre_id, 
      name: h.property_name_ko,
      chain_id: h.chain_id 
    }))
  })
  
  if (chainIds.length > 0) {
    const { data: chainResult, error: chainError } = await supabase
      .from('hotel_chains')
      .select('chain_id, chain_name_en, chain_name_ko')
      .in('chain_id', chainIds)
    
    if (chainError) {
      console.error('❌ [HotelPage] 체인 조회 실패:', chainError)
    } else {
      chainData = chainResult || []
      console.log('✅ [HotelPage] 체인 조회 완료:', {
        조회된체인수: chainData.length,
        체인샘플: chainData.slice(0, 3)
      })
    }
  } else {
    console.warn('⚠️ [HotelPage] chain_id가 있는 호텔이 없습니다. select_hotels 테이블의 chain_id 컬럼을 확인하세요.')
  }

  // 4. 데이터 변환 (useAllHotels와 동일한 형식)
  const allHotels = transformHotelsToAllViewCardData(hotels, firstImages, brandData)
  console.log('✅ [HotelPage] 데이터 변환 완료:', allHotels?.length || 0, '개')

  // 5. 필터 옵션 가공 (이미 조회한 hotels 데이터 사용)
  const countries = new Map<string, { id: string; label: string; count: number }>()
  const cities = new Map<string, { id: string; label: string; count: number; country_code: string }>()
  const brands = new Map<string, { id: string; label: string; count: number }>()
  const chains = new Map<number, { id: string; label: string; count: number }>()
  
  hotels.forEach((hotel: any) => {
    // 국가 (country_code를 id로 사용)
    if (hotel.country_code && hotel.country_ko) {
      const existing = countries.get(hotel.country_code) || { 
        id: hotel.country_code,  // country_code를 id로 (예: JP, TH)
        label: hotel.country_ko,  // 한글 이름을 label로 (예: 일본, 태국)
        count: 0 
      }
      existing.count++
      countries.set(hotel.country_code, existing)
    }
    
    // 도시 (city_code를 id로 사용, country_code 포함)
    if (hotel.city_code && hotel.city_ko && hotel.country_code) {
      const existing = cities.get(hotel.city_code) || { 
        id: hotel.city_code,       // city_code를 id로 (예: TYO, BKK)
        label: hotel.city_ko,       // 한글 이름을 label로 (예: 도쿄, 방콕)
        country_code: hotel.country_code,  // 국가 코드 추가 (예: JP, TH)
        count: 0 
      }
      existing.count++
      cities.set(hotel.city_code, existing)
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
    
    // 체인 (chainData에서 체인명 조회)
    if (hotel.chain_id) {
      const chainInfo = chainData.find(c => c.chain_id === hotel.chain_id)
      const chainLabel = chainInfo?.chain_name_ko || chainInfo?.chain_name_en || `Chain ${hotel.chain_id}`
      
      const existing = chains.get(hotel.chain_id) || { 
        id: String(hotel.chain_id), 
        label: chainLabel, 
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
    chains: filterOptions.chains.length,
    체인데이터조회: chainData.length,
    체인샘플: chainData.slice(0, 3),
    필터체인샘플: filterOptions.chains.slice(0, 3)
  })

  // 배너 호텔 대기
  const bannerHotel = await bannerHotelPromise
  console.log('✅ [HotelPage] 배너 호텔 조회 완료:', bannerHotel ? bannerHotel.property_name_ko : '없음')

  return {
    allHotels,
    filterOptions,
    bannerHotel
  }
}


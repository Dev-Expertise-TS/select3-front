import { getCityBySlug, getHotelsByCityCode } from '@/lib/city-data-server'
import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { getHotelBrandIds, transformHotelsToAllViewCardData } from '@/lib/hotel-utils'
import { getCompanyFromServer, applyVccFilter } from '@/lib/company-filter'

/**
 * 도시별 호텔 페이지 데이터 조회
 */
export async function getCityHotelsData(
  citySlug: string, 
  searchParams?: { [key: string]: string | string[] | undefined }
) {
  // 1. 도시 정보 조회
  const city = await getCityBySlug(citySlug)
  
  if (!city) {
    return null
  }
  
  const supabase = await createClient()
  
  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const company = searchParams ? await getCompanyFromServer(searchParams) : null
  
  // 2. 해당 도시의 호텔 목록 조회 (필터링된 결과)
  const hotels = await getHotelsByCityCode(city.city_code, company)
  
  if (!hotels || hotels.length === 0) {
    return {
      city,
      hotels: [],
      filterOptions: { countries: [], cities: [], brands: [], chains: [] }
    }
  }
  
  // 2-1. 전체 호텔 목록 조회 (필터 옵션용)
  let filterQuery = supabase
    .from('select_hotels')
    .select('city_code, city_ko, country_code, country_ko, brand_id, brand_id_2, brand_id_3, chain_id')
    .or('publish.is.null,publish.eq.true')
  
  // company=sk일 때 vcc=true 필터 적용
  filterQuery = applyVccFilter(filterQuery, company)
  
  const { data: allHotelsForFilter } = await filterQuery
  
  // 2-2. 체인 정보 조회 (필터 옵션용)
  const chainIdsForFilter = [...new Set(allHotelsForFilter?.filter(h => h.chain_id).map(h => h.chain_id) || [])]
  let chainDataForFilter: Array<{ chain_id: number; chain_name_en: string; chain_name_ko?: string }> = []
  
  if (chainIdsForFilter.length > 0) {
    const { data: chainResult } = await supabase
      .from('hotel_chains')
      .select('chain_id, chain_name_en, chain_name_ko')
      .in('chain_id', chainIdsForFilter)
    chainDataForFilter = chainResult || []
  }
  
  // 3. 호텔 이미지 조회
  const sabreIds = hotels.map((hotel: any) => String(hotel.sabre_id))
  const { data: mediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', sabreIds)
    .order('image_seq', { ascending: true })
  
  const firstImages = getFirstImagePerHotel(mediaData || [])
  
  // 4. 브랜드 정보 조회
  const brandIds = Array.from(new Set(hotels.flatMap((hotel: any) => getHotelBrandIds(hotel))))
  let brandData = []
  
  if (brandIds.length > 0) {
    const { data } = await supabase
      .from('hotel_brands')
      .select('brand_id, brand_name_en, brand_name_ko, chain_id')
      .in('brand_id', brandIds)
    brandData = data || []
  }
  
  // 5. 호텔 카드 데이터 변환
  const allHotels = transformHotelsToAllViewCardData(hotels, firstImages, brandData)
  
  // 6. 필터 옵션 생성 (전체 호텔 기준)
  const countries = new Map<string, { id: string; label: string; count: number }>()
  const cities = new Map<string, { id: string; label: string; country_code?: string; count: number }>()
  const brands = new Map<string, { id: string; label: string; count: number }>()
  const chains = new Map<number, { id: string; label: string; count: number }>()
  
  // 전체 호텔에서 필터 옵션 생성
  if (allHotelsForFilter && allHotelsForFilter.length > 0) {
    const filterBrandIds = Array.from(
      new Set(allHotelsForFilter.flatMap((hotel: any) => getHotelBrandIds(hotel)))
    )
    let filterBrandData: Array<{ brand_id: number; brand_name_en?: string; brand_name_ko?: string }> = []
    if (filterBrandIds.length > 0) {
      const { data } = await supabase
        .from('hotel_brands')
        .select('brand_id, brand_name_en, brand_name_ko')
        .in('brand_id', filterBrandIds)
      filterBrandData = data || []
    }

    allHotelsForFilter.forEach((hotel: any) => {
      // 국가
      if (hotel.country_code && hotel.country_ko) {
        const existing = countries.get(hotel.country_code) || { 
          id: hotel.country_code,
          label: hotel.country_ko,
          count: 0 
        }
        existing.count++
        countries.set(hotel.country_code, existing)
      }
      
      // 도시
      if (hotel.city_code && hotel.city_ko && hotel.country_code) {
        const existing = cities.get(hotel.city_code) || { 
          id: hotel.city_code,
          label: hotel.city_ko,
          country_code: hotel.country_code,
          count: 0 
        }
        existing.count++
        cities.set(hotel.city_code, existing)
      }
      
      // 브랜드 (brand_id, brand_id_2, brand_id_3)
      const hotelBrandIds = getHotelBrandIds(hotel)
      hotelBrandIds.forEach((brandId) => {
        const brandInfo = filterBrandData.find((b) => String(b.brand_id) === String(brandId))
        const brandLabel = brandInfo?.brand_name_en || brandInfo?.brand_name_ko
        if (!brandLabel) return
        const key = String(brandId)
        const existing = brands.get(key) || {
          id: key,
          label: brandLabel,
          count: 0
        }
        existing.count++
        brands.set(key, existing)
      })
      
      // 체인 (chainDataForFilter에서 체인명 조회)
      if (hotel.chain_id) {
        const chainInfo = chainDataForFilter.find(c => c.chain_id === hotel.chain_id)
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
  }
  
  // 필터 옵션 (전체 목록 제공)
  const filterOptions = {
    countries: Array.from(countries.values()).sort((a, b) => b.count - a.count),
    cities: Array.from(cities.values()).sort((a, b) => b.count - a.count),
    brands: Array.from(brands.values()).sort((a, b) => a.label.localeCompare(b.label)),
    chains: Array.from(chains.values()).sort((a, b) => a.label.localeCompare(b.label))
  }
  
  console.log('✅ [CityHotelsPage] 데이터 조회 완료:', {
    city: city.city_ko,
    cityCode: city.city_code,
    hotelsCount: allHotels.length,
    brandsCount: filterOptions.brands.length
  })
  
  return {
    city,
    hotels: allHotels,
    filterOptions
  }
}


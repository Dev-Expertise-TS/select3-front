import { getBrandBySlug, getHotelsByBrandId } from '@/lib/brand-data-server'
import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { transformHotelsToAllViewCardData } from '@/lib/hotel-utils'

/**
 * 브랜드별 호텔 페이지 데이터 조회
 */
export async function getBrandHotelsData(brandSlug: string) {
  // 1. 브랜드 정보 조회
  const brand = await getBrandBySlug(brandSlug)
  
  if (!brand) {
    return null
  }
  
  const supabase = await createClient()
  
  // 2. 해당 브랜드의 호텔 목록 조회 (brand_id 기준)
  const hotels = await getHotelsByBrandId(String(brand.brand_id))
  
  if (!hotels || hotels.length === 0) {
    return {
      brand,
      hotels: [],
      filterOptions: { countries: [], cities: [], brands: [], chains: [] }
    }
  }
  
  // 2-1. 전체 호텔 목록 조회 (필터 옵션용)
  const { data: allHotelsForFilter } = await supabase
    .from('select_hotels')
    .select('city_code, city_ko, country_code, country_ko, brand_name_en, chain_id')
    .or('publish.is.null,publish.eq.true')
  
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
  
  // 모자이크용 모든 이미지 추출 (빈 URL 필터링)
  const allHotelImages = mediaData
    ?.filter(media => media.public_url && media.public_url.trim() !== '')
    .map(media => ({
      sabre_id: media.sabre_id,
      url: media.public_url,
      slug: media.slug
    })) || []
  
  // 4. 브랜드 정보 조회
  const brandIds = hotels.filter((hotel: any) => hotel.brand_id).map((hotel: any) => hotel.brand_id)
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
  
  // 7. 브랜드 관련 아티클 조회
  const { data: articles } = await supabase
    .from('select_hotel_blogs')
    .select('id, slug, main_image, main_title, sub_title, created_at, updated_at')
    .contains('related_brand_ids', [brand.brand_id])
    .eq('publish', true)
    .order('created_at', { ascending: false })
    .limit(6)
  
  return {
    brand,
    hotels: allHotels,
    allHotelImages, // 모자이크용 모든 이미지
    filterOptions,
    articles: articles || []
  }
}


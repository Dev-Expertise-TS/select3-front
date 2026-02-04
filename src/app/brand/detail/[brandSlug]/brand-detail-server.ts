import { createClient } from '@/lib/supabase/server'
import { isCompanyWithVccFilter } from '@/lib/company-filter'
import { getBrandBySlug, getHotelsByBrandName } from '@/lib/brand-data-server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { getHotelBrandIds, transformHotelsToAllViewCardData } from '@/lib/hotel-utils'

/**
 * 브랜드 상세 페이지 데이터 조회
 */
export async function getBrandDetailData(brandSlug: string, company?: string | null) {
  // 1. 브랜드 정보 조회
  const brand = await getBrandBySlug(brandSlug)
  
  if (!brand) {
    return null
  }
  
  const supabase = await createClient()
  
  // 2. 해당 브랜드의 호텔 목록 조회
  const hotels = await getHotelsByBrandName(brand.brand_name_en, company)
  
  // 3. 호텔 이미지 조회
  let hotelMediaData: any[] = []
  if (hotels.length > 0) {
    const sabreIds = hotels.map((hotel: any) => String(hotel.sabre_id))
    const { data: mediaData } = await supabase
      .from('select_hotel_media')
      .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
      .in('sabre_id', sabreIds)
      .order('image_seq', { ascending: true })
    
    hotelMediaData = getFirstImagePerHotel(mediaData || [])
  }
  
  // 4. 브랜드 정보 (체인 포함) 재조회
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
  const transformedHotels = transformHotelsToAllViewCardData(hotels, hotelMediaData, brandData)
  
  // 6. 브랜드 관련 아티클 조회 (brand_id 기준)
  // vcc 필터링을 위해 sN_sabre_id 필드들도 함께 조회
  const { data: articles } = await supabase
    .from('select_hotel_blogs')
    .select(`
      id, 
      slug, 
      main_image, 
      main_title, 
      sub_title, 
      created_at, 
      updated_at,
      s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
      s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
      s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id
    `)
    .contains('related_brand_ids', [brand.brand_id])
    .eq('publish', true)
    .order('created_at', { ascending: false })
    .limit(6)
  
  let filteredArticles = articles || []

  // company=sk일 때 vcc=true 필터 적용
  if (isCompanyWithVccFilter(company) && filteredArticles.length > 0) {
    const sabreIds = new Set<number>()
    filteredArticles.forEach((article: any) => {
      for (let i = 1; i <= 12; i++) {
        const id = article[`s${i}_sabre_id`]
        if (id) sabreIds.add(id)
      }
    })

    if (sabreIds.size > 0) {
      const { data: vccData, error: vccError } = await supabase
        .from('select_hotels')
        .select('sabre_id, vcc')
        .in('sabre_id', Array.from(sabreIds))

      if (!vccError && vccData) {
        const vccMap = new Map(vccData.map((h: any) => [h.sabre_id, h.vcc]))
        
        filteredArticles = filteredArticles.filter((article: any) => {
          for (let i = 1; i <= 12; i++) {
            const id = article[`s${i}_sabre_id`]
            if (id && vccMap.get(id) !== true) {
              return false
            }
          }
          return true
        })
      }
    }
  }

  // sabre_id 필드 제거
  const resultArticles = filteredArticles.map((article: any) => {
    const { 
      s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
      s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
      s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id,
      ...rest 
    } = article
    return rest
  })
  
  console.log('✅ [BrandDetailPage] 데이터 조회 완료:', {
    brand: brand.brand_name_en,
    brandId: brand.brand_id,
    hotelsCount: transformedHotels.length,
    articlesCount: resultArticles.length,
    company: company
  })
  
  return {
    brand,
    hotels: transformedHotels,
    articles: resultArticles
  }
}


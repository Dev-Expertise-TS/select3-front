import { createClient } from '@/lib/supabase/server'
import { getBrandBySlug, getHotelsByBrandName } from '@/lib/brand-data-server'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { transformHotelsToAllViewCardData } from '@/lib/hotel-utils'

/**
 * 브랜드 상세 페이지 데이터 조회
 */
export async function getBrandDetailData(brandSlug: string) {
  // 1. 브랜드 정보 조회
  const brand = await getBrandBySlug(brandSlug)
  
  if (!brand) {
    return null
  }
  
  const supabase = await createClient()
  
  // 2. 해당 브랜드의 호텔 목록 조회
  const hotels = await getHotelsByBrandName(brand.brand_name_en)
  
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
  const transformedHotels = transformHotelsToAllViewCardData(hotels, hotelMediaData, brandData)
  
  // 6. 브랜드 관련 아티클 조회 (brand_id 기준)
  const { data: articles } = await supabase
    .from('select_hotel_blogs')
    .select('id, slug, main_image, main_title, sub_title, created_at, updated_at')
    .contains('related_brand_ids', [brand.brand_id])
    .eq('publish', true)
    .order('created_at', { ascending: false })
    .limit(6)
  
  console.log('✅ [BrandDetailPage] 데이터 조회 완료:', {
    brand: brand.brand_name_en,
    brandId: brand.brand_id,
    hotelsCount: transformedHotels.length,
    articlesCount: articles?.length || 0
  })
  
  return {
    brand,
    hotels: transformedHotels,
    articles: articles || []
  }
}


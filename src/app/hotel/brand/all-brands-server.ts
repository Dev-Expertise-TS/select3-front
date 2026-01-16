import { createClient } from '@/lib/supabase/server'
import { applyVccFilter } from '@/lib/company-filter'

export interface BrandWithCount {
  brand_id: number
  brand_name_en: string | null
  brand_name_ko: string | null
  brand_slug: string | null
  hotel_count: number
  hotel_images: Array<{ url: string; alt: string }>
}

/**
 * 모든 브랜드와 각 브랜드의 호텔 수를 조회
 * publish가 null이거나 true인 호텔만 카운트
 * company 파라미터가 있으면 vcc=TRUE 필터 적용
 */
export async function getAllBrandsWithHotelCount(company?: string | null): Promise<BrandWithCount[]> {
  const supabase = await createClient()
  
  // 1. 모든 브랜드 조회
  const { data: brands, error: brandsError } = await supabase
    .from('hotel_brands')
    .select('brand_id, brand_name_en, brand_name_ko, brand_slug')
    .not('brand_slug', 'is', null)
    .not('brand_slug', 'eq', '')
    .order('brand_name_en')
  
  if (brandsError) {
    console.error('❌ 브랜드 목록 조회 오류:', brandsError)
    return []
  }
  
  if (!brands || brands.length === 0) {
    return []
  }
  
  // 2. 각 브랜드별 호텔 수 및 이미지 조회
  const brandsWithCount = await Promise.all(
    brands.map(async (brand) => {
      // 호텔 수 조회
      let countQuery = supabase
        .from('select_hotels')
        .select('*', { count: 'exact', head: true })
        .or(`brand_id.eq.${brand.brand_id},brand_id_2.eq.${brand.brand_id},brand_id_3.eq.${brand.brand_id}`)
        .or('publish.is.null,publish.eq.true')
      
      // company=sk일 때 vcc=TRUE 필터 적용
      countQuery = applyVccFilter(countQuery, company || null)
      
      const { count, error: countError } = await countQuery
      
      if (countError) {
        console.error(`❌ 브랜드 ${brand.brand_id} 호텔 수 조회 오류:`, countError)
        return {
          ...brand,
          hotel_count: 0,
          hotel_images: []
        }
      }
      
      // 호텔 이미지 조회 (최대 30개)
      let hotelsQuery = supabase
        .from('select_hotels')
        .select('image, property_name_ko, property_name_en')
        .or(`brand_id.eq.${brand.brand_id},brand_id_2.eq.${brand.brand_id},brand_id_3.eq.${brand.brand_id}`)
        .or('publish.is.null,publish.eq.true')
        .not('image', 'is', null)
        .limit(30)
      
      // company=sk일 때 vcc=TRUE 필터 적용
      hotelsQuery = applyVccFilter(hotelsQuery, company || null)
      
      const { data: hotels, error: hotelsError } = await hotelsQuery
      
      const hotel_images = hotels
        ?.filter(h => h.image && h.image.trim() !== '') // 빈 URL 필터링
        .map(h => ({
          url: h.image!,
          alt: h.property_name_ko || h.property_name_en || brand.brand_name_en || 'Hotel'
        })) || []
      
      return {
        ...brand,
        hotel_count: count || 0,
        hotel_images
      }
    })
  )
  
  // 3. 호텔이 1개 이상 있는 브랜드만 필터링하고 호텔 수로 정렬
  return brandsWithCount
    .filter(brand => brand.hotel_count > 0)
    .sort((a, b) => b.hotel_count - a.hotel_count)
}



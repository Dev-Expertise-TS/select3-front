import { createClient } from '@/lib/supabase/server'
import { applyVccFilter } from '@/lib/company-filter'

/**
 * 브랜드 slug로 브랜드 정보 조회
 * brand_slug 컬럼 사용
 */
export async function getBrandBySlug(brandSlug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('hotel_brands')
    .select('brand_id, brand_name_en, brand_name_ko, brand_slug, chain_id')
    .eq('brand_slug', brandSlug)
    .maybeSingle()
  
  if (error) {
    console.error('❌ 브랜드 정보 조회 오류:', error instanceof Error ? error.message : String(error))
    return null
  }
  
  return data
}

/**
 * brand_id로 해당 브랜드의 호텔 목록 조회
 * company 파라미터가 있으면 vcc=TRUE 필터 적용
 */
export async function getHotelsByBrandId(brandId: string | number, company?: string | null) {
  const supabase = await createClient()
  
  // publish = null 또는 publish = true인 호텔만 조회
  let hotelQuery = supabase
    .from('select_hotels')
    .select('*')
    .or(`brand_id.eq.${brandId},brand_id_2.eq.${brandId},brand_id_3.eq.${brandId}`)
    .or('publish.is.null,publish.eq.true')
    .order('property_name_en')
  
  // company=sk일 때 vcc=TRUE 필터 적용
  hotelQuery = applyVccFilter(hotelQuery, company || null)
  
  const { data: hotels, error: hotelsError } = await hotelQuery
  
  if (hotelsError) {
    console.error('❌ 브랜드별 호텔 조회 오류:', hotelsError instanceof Error ? hotelsError.message : String(hotelsError))
    return []
  }
  
  return hotels || []
}

/**
 * brand_name_en으로 해당 브랜드의 호텔 목록 조회
 */
export async function getHotelsByBrandName(brandName: string) {
  const supabase = await createClient()
  
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('*')
    .eq('brand_name_en', brandName)
    .or('publish.is.null,publish.eq.true')
    .order('property_name_en')
  
  if (hotelsError) {
    console.error('❌ 브랜드별 호텔 조회 오류:', hotelsError instanceof Error ? hotelsError.message : String(hotelsError))
    return []
  }
  
  return hotels || []
}

/**
 * 전체 활성 브랜드 목록 조회 (SSG용)
 * generateStaticParams에서 사용하므로 cookies 없는 클라이언트 생성
 */
export async function getAllActiveBrands() {
  const { createServerClient } = await import('@supabase/ssr')
  
  // cookies 없이 Supabase 클라이언트 생성 (읽기 전용, SSG용)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {}
      }
    }
  )
  
  const { data, error } = await supabase
    .from('hotel_brands')
    .select('brand_id, brand_name_en, brand_name_ko, brand_slug')
    .not('brand_slug', 'is', null)
    .not('brand_slug', 'eq', '')
  
  if (error) {
    console.error('❌ 전체 브랜드 목록 조회 오류:', error instanceof Error ? error.message : String(error))
    return []
  }
  
  return data || []
}


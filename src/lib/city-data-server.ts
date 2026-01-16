import { createClient } from '@/lib/supabase/server'
import { applyVccFilter } from '@/lib/company-filter'

/**
 * 도시 slug로 도시 정보 조회
 */
export async function getCityBySlug(citySlug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('select_regions')
    .select('city_code, city_ko, city_en, city_slug, country_code, country_ko, country_en, continent_ko, continent_en')
    .eq('city_slug', citySlug)
    .eq('region_type', 'city')
    .eq('status', 'active')
    .maybeSingle()
  
  if (error) {
    console.error('❌ 도시 정보 조회 오류:', error instanceof Error ? error.message : String(error))
    return null
  }
  
  return data
}

/**
 * 도시 코드로 해당 도시의 호텔 목록 조회
 */
export async function getHotelsByCityCode(cityCode: string, company?: string | null) {
  const supabase = await createClient()
  
  let hotelQuery = supabase
    .from('select_hotels')
    .select('*')
    .eq('city_code', cityCode)
    .or('publish.is.null,publish.eq.true')
    .order('property_name_en')
  
  // company=sk일 때 vcc=true 필터 적용
  hotelQuery = applyVccFilter(hotelQuery, company || null)
  
  const { data: hotels, error: hotelsError } = await hotelQuery
  
  if (hotelsError) {
    console.error('❌ 도시별 호텔 조회 오류:', hotelsError instanceof Error ? hotelsError.message : String(hotelsError))
    return []
  }
  
  return hotels || []
}

/**
 * 전체 활성 도시 목록 조회 (SSG용)
 * generateStaticParams에서 사용하므로 cookies 없는 클라이언트 생성
 */
export async function getAllActiveCities() {
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
    .from('select_regions')
    .select('city_code, city_ko, city_en, city_slug')
    .eq('region_type', 'city')
    .eq('status', 'active')
    .not('city_slug', 'is', null)
  
  if (error) {
    console.error('❌ 전체 도시 목록 조회 오류:', error instanceof Error ? error.message : String(error))
    return []
  }
  
  return data || []
}


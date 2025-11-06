import { createClient } from '@/lib/supabase/server'

/**
 * 체인 slug로 체인 정보 조회
 * chain_slug 컬럼 사용
 */
export async function getChainBySlug(chainSlug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_ko, chain_slug')
    .eq('chain_slug', chainSlug)
    .maybeSingle()
  
  if (error) {
    console.error('❌ 체인 정보 조회 오류:', error)
    return null
  }
  
  return data
}

/**
 * chain_id로 해당 체인의 호텔 목록 조회
 */
export async function getHotelsByChainId(chainId: number) {
  const supabase = await createClient()
  
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('*')
    .eq('chain_id', chainId)
    .or('publish.is.null,publish.eq.true')
    .order('property_name_en')
  
  if (hotelsError) {
    console.error('❌ 체인별 호텔 조회 오류:', hotelsError)
    return []
  }
  
  return hotels || []
}

/**
 * 전체 활성 체인 목록 조회 (SSG용)
 * generateStaticParams에서 사용하므로 cookies 없는 클라이언트 생성
 */
export async function getAllActiveChains() {
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
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_ko, chain_slug')
    .not('chain_slug', 'is', null)
    .not('chain_slug', 'eq', '')
  
  if (error) {
    console.error('❌ 전체 체인 목록 조회 오류:', error)
    return []
  }
  
  return data || []
}


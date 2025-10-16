import { MetadataRoute } from 'next'

export default async function sitemapChains(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 브랜드 체인 페이지들만 가져오기
    const { data: chains, error: chainsError } = await supabase
      .from('hotel_chains')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(500)

    if (chainsError) {
      console.error('체인 sitemap 생성 중 오류:', chainsError)
      return []
    }

    if (!chains || chains.length === 0) {
      return []
    }

    return chains.map((chain) => ({
      url: `${baseUrl}/brand/${chain.slug}`,
      lastModified: chain.updated_at ? new Date(chain.updated_at) : 
                   chain.created_at ? new Date(chain.created_at) : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('체인 sitemap 생성 중 오류:', error)
    return []
  }
}

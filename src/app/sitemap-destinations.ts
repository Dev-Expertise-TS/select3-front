import { MetadataRoute } from 'next'

export default async function sitemapDestinations(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 도시별 페이지들만 가져오기
    const { data: cities, error: citiesError } = await supabase
      .from('destinations')
      .select('city_slug, updated_at, created_at')
      .not('city_slug', 'is', null)
      .not('city_slug', 'eq', '')
      .limit(500)

    if (citiesError) {
      console.error('도시 sitemap 생성 중 오류:', citiesError)
      return []
    }

    if (!cities || cities.length === 0) {
      return []
    }

    return cities.map((city) => ({
      url: `${baseUrl}/destination/${city.city_slug}`,
      lastModified: city.updated_at ? new Date(city.updated_at) : 
                   city.created_at ? new Date(city.created_at) : currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('도시 sitemap 생성 중 오류:', error)
    return []
  }
}

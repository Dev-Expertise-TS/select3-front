import { MetadataRoute } from 'next'

export default async function sitemapHotel(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 호텔 페이지들만 가져오기
    const { data: hotels } = await supabase
      .from('select_hotels')
      .select('slug, updated_at')
      .eq('publish', true)
      .limit(1000)

    if (!hotels) return []

    return hotels.map((hotel) => ({
      url: `${baseUrl}/hotel/${hotel.slug}`,
      lastModified: hotel.updated_at ? new Date(hotel.updated_at) : currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('호텔 sitemap 생성 중 오류:', error)
    return []
  }
}

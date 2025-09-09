import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const supabase = await createClient()
    
    // 호텔 목록 조회
    const { data: hotels } = await supabase
      .from('select_hotels')
      .select('slug, updated_at')
      .not('slug', 'is', null)
      .order('updated_at', { ascending: false })

    // 호텔 상세 페이지들
    const hotelPages: MetadataRoute.Sitemap = (hotels || []).map((hotel) => ({
      url: `https://select-hotels.com/hotel/${hotel.slug}`,
      lastModified: new Date(hotel.updated_at),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // 정적 페이지들
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: 'https://select-hotels.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: 'https://select-hotels.com/brands',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: 'https://select-hotels.com/all-hotel-resort',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]

    return [...staticPages, ...hotelPages]
  } catch (error) {
    console.error('sitemap 생성 에러:', error)
    // 에러 발생 시 기본 정적 페이지만 반환
    return [
      {
        url: 'https://select-hotels.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ]
  }
}

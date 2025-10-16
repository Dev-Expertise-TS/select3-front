import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()

  // 정적 페이지들 - 주요 페이지들
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brand`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brand/brand`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hotel`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hotel/region`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/promotion`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search-results`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/testimonials`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/with-kids`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  // 동적 페이지들을 가져오기 위한 함수들
  let dynamicPages: MetadataRoute.Sitemap = []

  try {
    // 1. 호텔 페이지들 추가
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 호텔 목록 가져오기
    const { data: hotels } = await supabase
      .from('select_hotels')
      .select('slug, updated_at')
      .eq('publish', true)
      .limit(1000) // 최대 1000개 호텔

    if (hotels) {
      const hotelPages = hotels.map((hotel) => ({
        url: `${baseUrl}/hotel/${hotel.slug}`,
        lastModified: hotel.updated_at ? new Date(hotel.updated_at) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
      dynamicPages = [...dynamicPages, ...hotelPages]
    }

    // 2. 브랜드 체인 페이지들 추가
    const { data: chains } = await supabase
      .from('hotel_chains')
      .select('slug, updated_at')
      .limit(100)

    if (chains) {
      const chainPages = chains.map((chain) => ({
        url: `${baseUrl}/brand/${chain.slug}`,
        lastModified: chain.updated_at ? new Date(chain.updated_at) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      dynamicPages = [...dynamicPages, ...chainPages]
    }

    // 3. 블로그 포스트들 추가
    const { data: blogs } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('published', true)
      .limit(500)

    if (blogs) {
      const blogPages = blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
      dynamicPages = [...dynamicPages, ...blogPages]
    }

    // 4. 도시별 페이지들 추가
    const { data: cities } = await supabase
      .from('destinations')
      .select('city_slug, updated_at')
      .limit(100)

    if (cities) {
      const cityPages = cities.map((city) => ({
        url: `${baseUrl}/destination/${city.city_slug}`,
        lastModified: city.updated_at ? new Date(city.updated_at) : currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
      dynamicPages = [...dynamicPages, ...cityPages]
    }

  } catch (error) {
    console.error('Sitemap 생성 중 오류:', error)
    // 오류 발생 시 정적 페이지만 반환
  }

  return [...staticPages, ...dynamicPages]
}

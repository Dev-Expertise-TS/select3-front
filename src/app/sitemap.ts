import { MetadataRoute } from 'next'

// Supabase createClient()가 cookies를 사용하므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1시간마다 재검증

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
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
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 1. 호텔 페이지들 추가 - 모든 호텔 포함
    console.log('호텔 페이지 조회 시작...')
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(5000) // 더 많은 호텔 포함

    if (hotelsError) {
      console.error('호텔 데이터 조회 오류:', hotelsError)
    } else if (hotels && hotels.length > 0) {
      console.log(`호텔 페이지 ${hotels.length}개 추가`)
      const hotelPages = hotels.map((hotel) => ({
        url: `${baseUrl}/hotel/${hotel.slug}`,
        lastModified: hotel.updated_at ? new Date(hotel.updated_at) : 
                     hotel.created_at ? new Date(hotel.created_at) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
      dynamicPages = [...dynamicPages, ...hotelPages]
    }

    // 2. 브랜드 체인 페이지들 추가
    console.log('브랜드 체인 페이지 조회 시작...')
    const { data: chains, error: chainsError } = await supabase
      .from('hotel_chains')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(500)

    if (chainsError) {
      console.error('체인 데이터 조회 오류:', chainsError)
    } else if (chains && chains.length > 0) {
      console.log(`체인 페이지 ${chains.length}개 추가`)
      const chainPages = chains.map((chain) => ({
        url: `${baseUrl}/brand/${chain.slug}`,
        lastModified: chain.updated_at ? new Date(chain.updated_at) : 
                     chain.created_at ? new Date(chain.created_at) : currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      dynamicPages = [...dynamicPages, ...chainPages]
    }

    // 3. 블로그 포스트들 추가
    console.log('블로그 포스트 조회 시작...')
    const { data: blogs, error: blogsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(1000)

    if (blogsError) {
      console.error('블로그 데이터 조회 오류:', blogsError)
    } else if (blogs && blogs.length > 0) {
      console.log(`블로그 페이지 ${blogs.length}개 추가`)
      const blogPages = blogs.map((blog) => ({
        url: `${baseUrl}/blog/${blog.slug}`,
        lastModified: blog.updated_at ? new Date(blog.updated_at) : 
                     blog.created_at ? new Date(blog.created_at) : currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      }))
      dynamicPages = [...dynamicPages, ...blogPages]
    }

    // 4. 도시별 페이지들 추가
    console.log('도시 페이지 조회 시작...')
    const { data: cities, error: citiesError } = await supabase
      .from('destinations')
      .select('city_slug, updated_at, created_at')
      .not('city_slug', 'is', null)
      .not('city_slug', 'eq', '')
      .limit(500)

    if (citiesError) {
      console.error('도시 데이터 조회 오류:', citiesError)
    } else if (cities && cities.length > 0) {
      console.log(`도시 페이지 ${cities.length}개 추가`)
      const cityPages = cities.map((city) => ({
        url: `${baseUrl}/destination/${city.city_slug}`,
        lastModified: city.updated_at ? new Date(city.updated_at) : 
                     city.created_at ? new Date(city.created_at) : currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
      dynamicPages = [...dynamicPages, ...cityPages]
    }

    // 5. 추가 테이블들 확인 및 포함
    console.log('추가 페이지 조회 시작...')
    
    // 브랜드 테이블이 별도로 있는 경우
    try {
      const { data: brands, error: brandsError } = await supabase
        .from('hotel_brands')
        .select('brand_id, updated_at, created_at')
        .not('brand_id', 'is', null)
        .limit(1000)

      if (!brandsError && brands && brands.length > 0) {
        console.log(`브랜드 페이지 ${brands.length}개 추가`)
        const brandPages = brands.map((brand) => ({
          url: `${baseUrl}/brand/brand?brand=${brand.brand_id}`,
          lastModified: brand.updated_at ? new Date(brand.updated_at) : 
                       brand.created_at ? new Date(brand.created_at) : currentDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
        dynamicPages = [...dynamicPages, ...brandPages]
      }
    } catch (brandError) {
      console.log('브랜드 테이블 조회 실패:', brandError)
    }

    console.log(`총 동적 페이지 ${dynamicPages.length}개 생성 완료`)

  } catch (error) {
    console.error('Sitemap 생성 중 오류:', error)
    // 오류 발생 시 정적 페이지만 반환
  }

  return [...staticPages, ...dynamicPages]
}

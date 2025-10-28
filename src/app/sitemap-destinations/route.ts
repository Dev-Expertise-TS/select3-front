import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 지역별 페이지 목록 가져오기 (도시별)
    const { data: cities, error: citiesError } = await supabase
      .from('select_regions')
      .select('city_slug, updated_at, created_at')
      .eq('region_type', 'city')
      .not('city_slug', 'is', null)
      .not('city_slug', 'eq', '')
      .limit(500)

    if (citiesError) {
      console.error('도시 sitemap 생성 중 오류:', citiesError)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    if (!cities || cities.length === 0) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    const cityUrls = cities.map((city) => {
      const lastModified = city.updated_at ? new Date(city.updated_at) : 
                          city.created_at ? new Date(city.created_at) : currentDate
      return `
  <url>
    <loc>${baseUrl}/destination/${city.city_slug}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${cityUrls}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('도시 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

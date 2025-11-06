import { NextResponse } from 'next/server'

// 호텔 목록 페이지들 (도시별/브랜드별/체인별)
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const urls: string[] = []

    // 1. 도시별 호텔 목록 페이지 (/hotel/[citySlug])
    const { data: cities, error: citiesError } = await supabase
      .from('select_regions')
      .select('city_slug')
      .eq('region_type', 'city')
      .eq('status', 'active')
      .not('city_slug', 'is', null)
      .not('city_slug', 'eq', '')
      .limit(500)

    if (!citiesError && cities && cities.length > 0) {
      cities.forEach((city) => {
        urls.push(`
  <url>
    <loc>${baseUrl}/hotel/${city.city_slug}</loc>
    <lastmod>${currentDate.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
      })
    }

    // 2. 브랜드별 호텔 목록 페이지 (/hotel/brand/[brandSlug])
    const { data: brands, error: brandsError } = await supabase
      .from('hotel_brands')
      .select('brand_slug, updated_at')
      .not('brand_slug', 'is', null)
      .not('brand_slug', 'eq', '')
      .limit(500)

    if (!brandsError && brands && brands.length > 0) {
      brands.forEach((brand) => {
        const lastModified = brand.updated_at ? new Date(brand.updated_at) : currentDate
        urls.push(`
  <url>
    <loc>${baseUrl}/hotel/brand/${brand.brand_slug}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
      })
    }

    // 3. 체인별 호텔 목록 페이지 (/hotel/chain/[chainSlug])
    const { data: chains, error: chainsError } = await supabase
      .from('hotel_chains')
      .select('chain_slug, updated_at')
      .not('chain_slug', 'is', null)
      .not('chain_slug', 'eq', '')
      .limit(500)

    if (!chainsError && chains && chains.length > 0) {
      chains.forEach((chain) => {
        const lastModified = chain.updated_at ? new Date(chain.updated_at) : currentDate
        urls.push(`
  <url>
    <loc>${baseUrl}/hotel/chain/${chain.chain_slug}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
      })
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('호텔 목록 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}


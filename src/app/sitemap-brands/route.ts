import { NextResponse } from 'next/server'
import { normalizeSitemapUrl, isValidSitemapUrl } from '@/lib/sitemap-validator'

// 브랜드 관련 모든 페이지 (체인, 브랜드, 브랜드 상세)
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const urls: string[] = []

    // 1. 호텔 체인 페이지 (/brand/[chainSlug])
    const { data: chains, error: chainsError } = await supabase
      .from('hotel_chains')
      .select('slug, updated_at, created_at')
      .eq('status', 'active')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(500)

    if (!chainsError && chains && chains.length > 0) {
      chains.forEach((chain) => {
        const url = `${baseUrl}/brand/${chain.slug}`
        const normalizedUrl = normalizeSitemapUrl(url)
        
        // 리디렉션되는 URL 제외
        if (!isValidSitemapUrl(normalizedUrl)) {
          return
        }
        
        const lastModified = chain.updated_at 
          ? new Date(chain.updated_at) 
          : chain.created_at 
            ? new Date(chain.created_at) 
            : currentDate
        urls.push(`
  <url>
    <loc>${normalizedUrl}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
      })
    }

    // 2. 브랜드 상세 페이지 (/brand/detail/[brandSlug])
    const { data: brandDetails, error: brandDetailsError } = await supabase
      .from('hotel_brands')
      .select('brand_slug, updated_at, created_at')
      .not('brand_slug', 'is', null)
      .not('brand_slug', 'eq', '')
      .limit(500)

    if (!brandDetailsError && brandDetails && brandDetails.length > 0) {
      brandDetails.forEach((brand) => {
        const url = `${baseUrl}/brand/detail/${brand.brand_slug}`
        const normalizedUrl = normalizeSitemapUrl(url)
        
        // 리디렉션되는 URL 제외
        if (!isValidSitemapUrl(normalizedUrl)) {
          return
        }
        
        const lastModified = brand.updated_at 
          ? new Date(brand.updated_at) 
          : brand.created_at 
            ? new Date(brand.created_at) 
            : currentDate
        urls.push(`
  <url>
    <loc>${normalizedUrl}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error('브랜드 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}


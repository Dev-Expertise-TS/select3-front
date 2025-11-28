import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeSitemapUrl, isValidSitemapUrl } from '@/lib/sitemap-validator'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const supabase = await createClient()
    
    // recommendation pages 목록 가져오기
    const { data: recommendationPages, error: recommendationPagesError } = await supabase
      .from('select_recommendation_pages')
      .select('slug, updated_at, sitemap_priority, sitemap_changefreq')
      .eq('publish', true)
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(500)

    if (recommendationPagesError) {
      console.error('추천 페이지 sitemap 생성 중 오류:', recommendationPagesError)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    if (!recommendationPages || recommendationPages.length === 0) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    // 리디렉션되는 URL 제거 및 최종 목적지 URL만 포함
    const validRecommendationPageUrls = recommendationPages
      .map((page) => {
        const url = `${baseUrl}/hotel-recommendations/${page.slug}`
        const normalizedUrl = normalizeSitemapUrl(url)
        return isValidSitemapUrl(normalizedUrl) ? { page, url: normalizedUrl } : null
      })
      .filter((item): item is { page: typeof recommendationPages[0]; url: string } => item !== null)

    const recommendationPageUrls = validRecommendationPageUrls.map(({ page, url }) => {
      const lastModified = page.updated_at ? new Date(page.updated_at) : currentDate
      const priority = page.sitemap_priority || 0.6
      const changefreq = page.sitemap_changefreq || 'weekly'
      
      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${recommendationPageUrls}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('추천 페이지 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}


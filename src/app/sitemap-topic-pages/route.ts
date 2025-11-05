import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const supabase = await createClient()
    
    // topic pages 목록 가져오기
    const { data: topicPages, error: topicPagesError } = await supabase
      .from('select_topic_pages')
      .select('slug, updated_at, sitemap_priority, sitemap_changefreq')
      .eq('publish', true)
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(500)

    if (topicPagesError) {
      console.error('토픽 페이지 sitemap 생성 중 오류:', topicPagesError)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    if (!topicPages || topicPages.length === 0) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    const topicPageUrls = topicPages.map((page) => {
      const lastModified = page.updated_at ? new Date(page.updated_at) : currentDate
      const priority = page.sitemap_priority || 0.6
      const changefreq = page.sitemap_changefreq || 'weekly'
      
      return `
  <url>
    <loc>${baseUrl}/hotel-recommendations/${page.slug}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${topicPageUrls}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('토픽 페이지 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}


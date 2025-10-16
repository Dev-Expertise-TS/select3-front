import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 브랜드 체인 목록 가져오기
    const { data: chains, error: chainsError } = await supabase
      .from('hotel_chains')
      .select('slug, created_at')
      .eq('status', 'active')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(500)

    if (chainsError) {
      console.error('체인 sitemap 생성 중 오류:', chainsError)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    if (!chains || chains.length === 0) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    const chainUrls = chains.map((chain) => {
      const lastModified = chain.created_at ? new Date(chain.created_at) : currentDate
      return `
  <url>
    <loc>${baseUrl}/brand/${chain.slug}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${chainUrls}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('체인 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

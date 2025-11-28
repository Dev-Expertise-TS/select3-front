import { NextResponse } from 'next/server'
import { normalizeSitemapUrl, isValidSitemapUrl } from '@/lib/sitemap-validator'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 호텔 목록 가져오기
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(5000)

    if (hotelsError) {
      console.error('호텔 sitemap 생성 중 오류:', hotelsError)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    if (!hotels || hotels.length === 0) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    // 리디렉션되는 URL 제거 및 최종 목적지 URL만 포함
    const validHotelUrls = hotels
      .map((hotel) => {
        const url = `${baseUrl}/hotel/${hotel.slug}`
        const normalizedUrl = normalizeSitemapUrl(url)
        return isValidSitemapUrl(normalizedUrl) ? { hotel, url: normalizedUrl } : null
      })
      .filter((item): item is { hotel: typeof hotels[0]; url: string } => item !== null)

    const hotelUrls = validHotelUrls.map(({ hotel, url }) => {
      const lastModified = hotel.updated_at ? new Date(hotel.updated_at) : 
                          hotel.created_at ? new Date(hotel.created_at) : currentDate
      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${hotelUrls}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('호텔 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

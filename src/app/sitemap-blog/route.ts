import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 블로그 포스트 목록 가져오기
    const { data: blogs, error: blogsError } = await supabase
      .from('select_hotel_blogs')
      .select('slug, updated_at, created_at')
      .eq('publish', true)
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(1000)

    if (blogsError) {
      console.error('블로그 sitemap 생성 중 오류:', blogsError)
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    if (!blogs || blogs.length === 0) {
      return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    const blogUrls = blogs.map((blog) => {
      const lastModified = blog.updated_at ? new Date(blog.updated_at) : 
                          blog.created_at ? new Date(blog.created_at) : currentDate
      return `
  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${lastModified.toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`
    }).join('')

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${blogUrls}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('블로그 sitemap 생성 중 오류:', error)
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  }
}

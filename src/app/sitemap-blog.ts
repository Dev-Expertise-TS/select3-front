import { MetadataRoute } from 'next'

export default async function sitemapBlog(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://luxury-select.co.kr'
  const currentDate = new Date()
  
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    // 블로그 포스트들만 가져오기
    const { data: blogs, error: blogsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .not('slug', 'is', null)
      .not('slug', 'eq', '')
      .limit(1000)

    if (blogsError) {
      console.error('블로그 sitemap 생성 중 오류:', blogsError)
      return []
    }

    if (!blogs || blogs.length === 0) {
      return []
    }

    return blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : 
                   blog.created_at ? new Date(blog.created_at) : currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }))
  } catch (error) {
    console.error('블로그 sitemap 생성 중 오류:', error)
    return []
  }
}

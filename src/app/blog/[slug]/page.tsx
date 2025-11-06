import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBannerWrapper } from "@/components/promotion-banner-wrapper"
import { Footer } from "@/components/footer"
import { BlogDetailSection } from '@/features/blog/blog-detail-section'

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>
}


export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  try {
    // 서버 사이드에서 직접 Supabase 호출
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    
    const { slug } = await params
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
    
    const { data: blog, error } = await supabase
      .from("select_hotel_blogs")
      .select("main_title, sub_title, main_image")
      .eq("slug", slug)
      .single()

    if (error || !blog) {
      return {
        title: '아티클 상세 | 투어비스 셀렉트',
        description: '투어비스 셀렉트 호텔 매거진의 상세 아티클을 확인하세요.',
      }
    }

    return {
      title: `${blog.main_title} | 투어비스 셀렉트`,
      description: blog.sub_title || '투어비스 셀렉트 호텔 매거진의 상세 아티클을 확인하세요.',
      openGraph: {
        title: blog.main_title,
        description: blog.sub_title || '투어비스 셀렉트 호텔 매거진의 상세 아티클을 확인하세요.',
        url: `${baseUrl}/blog/${slug}`,
        siteName: '투어비스 셀렉트',
        locale: 'ko_KR',
        type: 'article',
        images: blog.main_image ? [{
          url: blog.main_image,
          width: 1200,
          height: 630,
          alt: blog.main_title
        }] : [{
          url: `${baseUrl}/select_logo.avif`,
          width: 1200,
          height: 630,
          alt: '투어비스 셀렉트'
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.main_title,
        description: blog.sub_title || '투어비스 셀렉트 호텔 매거진의 상세 아티클을 확인하세요.',
        images: blog.main_image ? [blog.main_image] : [`${baseUrl}/select_logo.avif`],
      },
      alternates: {
        canonical: `${baseUrl}/blog/${slug}`
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      }
    }
  } catch (error) {
    console.error('Metadata generation error:', error)
    
    // 기본 메타데이터 (오류 시)
    return {
      title: '아티클 상세 | 투어비스 셀렉트',
      description: '투어비스 셀렉트 호텔 매거진의 상세 아티클을 확인하세요.',
    }
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // 블로그 데이터 가져오기
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  
  const { data: blog } = await supabase
    .from("select_hotel_blogs")
    .select("main_title, sub_title, main_image, created_at, updated_at")
    .eq("slug", slug)
    .single()
  
  // Article Structured Data (블로그 데이터가 있을 때만)
  const articleData = blog ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.main_title,
    description: blog.sub_title || '',
    image: blog.main_image || `${baseUrl}/select_logo.avif`,
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    author: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/select_logo.avif`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${slug}`
    }
  } : null
  
  return (
    <div className="min-h-screen bg-background">
      {/* Article Structured Data */}
      {articleData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleData) }}
        />
      )}
      
      <Header />
      <PromotionBannerWrapper>
        <main>
          <BlogDetailSection slug={slug} />
        </main>
      </PromotionBannerWrapper>
      <Footer />
    </div>
  )
}

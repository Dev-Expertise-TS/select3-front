import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
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
        images: blog.main_image ? [blog.main_image] : undefined,
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.main_title,
        description: blog.sub_title || '투어비스 셀렉트 호텔 매거진의 상세 아티클을 확인하세요.',
        images: blog.main_image ? [blog.main_image] : undefined,
      },
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
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      {/* 프로모션 베너 아래 여백 */}
      <div style={{ paddingTop: '72px' }}></div>
      <main>
        <BlogDetailSection slug={slug} />
      </main>
      <Footer />
    </div>
  )
}

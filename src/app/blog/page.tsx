import { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from "@/components/header"
import { PromotionBannerWrapper } from "@/components/promotion-banner-wrapper"
import { Footer } from "@/components/footer"
import { BlogListSection } from '@/features/blog/blog-list-section'
import { getBlogPageData } from './blog-page-server'

// 블로그 페이지 캐시: 10분마다 재검증
export const revalidate = 600

export const metadata: Metadata = {
  title: '아티클 | Select',
  description: '셀렉트에서 제공하는 다양한 호텔과 여행 관련 아티클을 만나보세요.',
}

export default async function BlogPage() {
  // 서버에서 초기 데이터 조회
  const { blogs } = await getBlogPageData()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBannerWrapper>
        <main>
          <Suspense fallback={
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-16"></div>
                  </div>
                </div>
              </div>
            </section>
          }>
            <BlogListSection initialBlogs={blogs} />
          </Suspense>
        </main>
      </PromotionBannerWrapper>
      <Footer />
    </div>
  )
}

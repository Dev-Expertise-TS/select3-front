import { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { BlogListSection } from '@/features/blog/blog-list-section'

export const metadata: Metadata = {
  title: '아티클 | Select',
  description: '셀렉트에서 제공하는 다양한 호텔과 여행 관련 아티클을 만나보세요.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
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
          <BlogListSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

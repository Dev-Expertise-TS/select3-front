import { Metadata } from 'next'
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
        <BlogListSection />
      </main>
      <Footer />
    </div>
  )
}

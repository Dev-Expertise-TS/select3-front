import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: 'Brand | Select',
  description: '브랜드 페이지',
}

export default function BrandsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      <main>
        {/* Brand & Program 영역 삭제됨 */}
      </main>
      <Footer />
    </div>
  )
}

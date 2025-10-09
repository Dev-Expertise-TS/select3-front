import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { BrandProgramPage } from "@/features/brands/brand-program-page"

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
        <BrandProgramPage />
      </main>
      <Footer />
    </div>
  )
}

import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { BrandProgramPage } from '@/features/brands/brand-program-page'

export const metadata: Metadata = {
  title: 'Brand & Program | Select',
  description: '셀렉트에서 추천하는 최고의 브랜드와 프로그램을 만나보세요.',
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

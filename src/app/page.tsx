import { Suspense } from "react"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Hero } from "@/features/hero"
import { SearchSection } from "@/features/search"
import { HotelGrid } from "@/features/hotels"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { BenefitsSection } from "@/features/benefits-section"
import { PromotionSection } from "@/features/promotion-section"
import { TrendingDestinationsSection } from "@/features/destinations"
import { BrandProgramSection } from "@/features/brands"
import TestimonialsSection from "@/components/shared/testimonials-section"

// 페이지 레벨 캐시 설정: 30분마다 재검증
export const revalidate = 1800

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      <main>
        <Hero />
        <Suspense fallback={<div className="bg-white sm:bg-gray-50 pt-3 pb-1 sm:py-6 h-20" />}>
          <SearchSection />
        </Suspense>
        <BenefitsSection />
        <TestimonialsSection />
        <Suspense fallback={<div className="py-16 bg-white h-96" />}>
          <PromotionSection hotelCount={3} />
        </Suspense>
        <BrandProgramSection />
        <Suspense fallback={<div className="py-16 bg-gray-50 h-96" />}>
          <TrendingDestinationsSection />
        </Suspense>
        <Suspense fallback={<div className="py-16 bg-white h-96" />}>
          <HotelGrid />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

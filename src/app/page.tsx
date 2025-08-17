import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { SearchSection } from "@/components/search-section"
import { HotelGrid } from "@/components/hotel-grid"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { BenefitsSection } from "@/components/benefits-section"
import { BrandProgramSection } from "@/components/brand-program-section"
import { PromotionSection } from "@/components/promotion-section"
import { TrendingDestinationsSection } from "@/components/trending-destinations-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <SearchSection />
        <BenefitsSection />
        <BrandProgramSection />
        <PromotionSection />
        <TrendingDestinationsSection />
        <HotelGrid />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

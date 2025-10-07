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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      <main>
        <Hero />
        <SearchSection />
        <BenefitsSection />
        <PromotionSection hotelCount={3} />
        <BrandProgramSection />
        <TrendingDestinationsSection />
        <HotelGrid />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

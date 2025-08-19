import { Header } from "@/components/header"
import { Hero } from "@/features/hero"
import { SearchSection } from "@/features/search"
import { HotelGrid } from "@/features/hotels"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { BenefitsSection } from "@/features/benefits-section"
import { BrandProgramSection } from "@/features/brands"
import { PromotionSection } from "@/features/promotion-section"
import { TrendingDestinationsSection } from "@/features/destinations"

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

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
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      <main>
        <Hero />
        <SearchSection />
        <BenefitsSection />
        <BrandsLinkSection />
        <PromotionSection />
        <TrendingDestinationsSection />
        <HotelGrid />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

function BrandsLinkSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-[1440px] text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brand & Program</h2>
        <p className="text-lg text-gray-600 mb-8">셀렉트에서 추천하는 최고의 브랜드와 프로그램</p>
        <Link 
          href="/brands" 
          className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
        >
          브랜드 둘러보기
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}

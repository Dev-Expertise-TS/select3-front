import { Suspense } from "react"
import type { Metadata } from "next"
import { PromotionBannerWrapper } from "@/components/promotion-banner-wrapper"
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  alternates: {
    canonical: baseUrl
  }
}

export default function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // Organization Structured Data
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '투어비스 셀렉트',
    alternateName: 'Tourvis Select',
    url: baseUrl,
    logo: `${baseUrl}/select_logo.avif`,
    description: '프리미엄 호텔 & 리조트를 특별한 혜택과 함께 만나보세요. 투어비스 셀렉트에서 최고의 여행 경험을 시작하세요.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['ko', 'en']
    },
    sameAs: [
      'https://pf.kakao.com/_cxmxgNG'
    ]
  }

  // WebSite Structured Data
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '투어비스 셀렉트',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search-results?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <div className="bg-background">
      {/* Organization Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      {/* WebSite Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      
      <main>
        <PromotionBannerWrapper>
          <Hero />
          <Suspense fallback={<div className="bg-white sm:bg-gray-50 pt-3 pb-1 sm:py-6 h-20" />}>
            <SearchSection />
          </Suspense>
          <BenefitsSection />
          <TestimonialsSection />
          <PromotionSection hotelCount={3} />
          <BrandProgramSection />
          <TrendingDestinationsSection />
          <HotelGrid />
        </PromotionBannerWrapper>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

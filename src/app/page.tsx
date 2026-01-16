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
  title: '투어비스 셀렉트 | 프리미엄 호텔 & 리조트 특별 혜택',
  description: '럭셔리 호텔 & 리조트를 특별한 혜택과 함께 만나보세요. 2인 조식 무료, $100 식음료 크레딧, 객실 업그레이드 등 7가지 혜택을 제공합니다.',
  alternates: {
    canonical: baseUrl
  },
  openGraph: {
    title: '투어비스 셀렉트 | 프리미엄 호텔 & 리조트 특별 혜택',
    description: '럭셔리 호텔 & 리조트를 특별한 혜택과 함께 만나보세요. 2인 조식 무료, $100 식음료 크레딧, 객실 업그레이드 등 7가지 혜택을 제공합니다.',
    url: baseUrl,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_og_image.jpg`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 - 프리미엄 호텔 & 리조트'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '투어비스 셀렉트 | 프리미엄 호텔 & 리조트 특별 혜택',
    description: '럭셔리 호텔 & 리조트를 특별한 혜택과 함께 만나보세요. 2인 조식 무료, $100 식음료 크레딧, 객실 업그레이드 등 7가지 혜택을 제공합니다.',
    images: [`${baseUrl}/select_og_image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const { getCompanyFromServer } = await import('@/lib/company-filter')
  const company = searchParams ? await getCompanyFromServer(searchParams) : null
  
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
          <Hero company={company} />
          <Suspense fallback={<div className="bg-white sm:bg-gray-50 pt-3 pb-1 sm:py-6 h-20" />}>
            <SearchSection />
          </Suspense>
          <BenefitsSection />
          <TestimonialsSection />
          <PromotionSection hotelCount={3} company={company} />
          <BrandProgramSection company={company} />
          <TrendingDestinationsSection />
          <HotelGrid />
        </PromotionBannerWrapper>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

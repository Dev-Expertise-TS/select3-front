import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBannerWrapper } from "@/components/promotion-banner-wrapper"
import { Footer } from "@/components/footer"
import { PromotionPageContent } from './promotion-content'

// 프로모션 페이지 캐시: 10분마다 재검증 (자주 변경됨)
export const revalidate = 600

export const metadata: Metadata = {
  title: '프로모션 호텔 | 투어비스 셀렉트',
  description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요. 최고의 럭셔리 호텔과 리조트를 특별한 가격으로 예약하실 수 있습니다. 한정된 기간의 특가 혜택을 놓치지 마세요.',
  keywords: [
    '호텔 프로모션',
    '호텔 특가',
    '럭셔리 호텔 할인',
    '프리미엄 호텔 이벤트',
    '호텔 패키지',
    '투어비스 셀렉트 프로모션',
    '호텔 특별 혜택'
  ],
  openGraph: {
    title: '프로모션 호텔 | 투어비스 셀렉트',
    description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요. 최고의 럭셔리 호텔과 리조트를 특별한 가격으로 예약하실 수 있습니다.',
    url: 'https://luxury-select.co.kr/promotion',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://luxury-select.co.kr/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 프로모션',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '프로모션 호텔 | 투어비스 셀렉트',
    description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요. 최고의 럭셔리 호텔과 리조트를 특별한 가격으로 예약하실 수 있습니다.',
    images: ['https://luxury-select.co.kr/select_logo.avif'],
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/promotion'
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
  }
}

export default function PromotionPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // OfferCatalog Structured Data
  const promotionPageData = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name: '프로모션 호텔',
    description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요.',
    url: `${baseUrl}/promotion`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '프로모션',
          item: `${baseUrl}/promotion`
        }
      ]
    },
    provider: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      url: baseUrl,
      logo: `${baseUrl}/select_logo.avif`
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(promotionPageData) }}
      />
      
      <Header />
      <PromotionBannerWrapper>
        <PromotionPageContent />
      </PromotionBannerWrapper>
      <Footer />
    </div>
  )
}

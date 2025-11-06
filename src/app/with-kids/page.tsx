import type { Metadata } from "next"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import WithKidsClient from "./with-kids-client"

export const metadata: Metadata = {
  title: "아이와 함께 떠나는 여행 | 투어비스 셀렉트",
  description: "키즈풀, 키즈 클럽, 베이비시팅 서비스까지 가족 여행에 어울리는 호텔 추천. 아이와 함께하는 특별한 가족 휴가를 위한 최고의 럭셔리 호텔을 만나보세요.",
  keywords: [
    '가족 여행',
    '아이와 함께 여행',
    '키즈 프렌들리 호텔',
    '키즈풀',
    '키즈 클럽',
    '가족 호텔',
    '베이비시팅 서비스',
    '어린이 환영 호텔'
  ],
  openGraph: {
    title: "아이와 함께 떠나는 여행 | 투어비스 셀렉트",
    description: "키즈풀, 키즈 클럽, 베이비시팅 서비스까지 가족 여행에 어울리는 호텔 추천",
    url: 'https://luxury-select.co.kr/with-kids',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://luxury-select.co.kr/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '아이와 함께 떠나는 여행'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: "아이와 함께 떠나는 여행 | 투어비스 셀렉트",
    description: "키즈풀, 키즈 클럽, 베이비시팅 서비스까지 가족 여행에 어울리는 호텔 추천",
    images: ['https://luxury-select.co.kr/select_logo.avif']
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/with-kids'
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

export default function WithKidsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // CollectionPage Structured Data
  const withKidsPageData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '아이와 함께 떠나는 여행',
    description: '키즈풀, 키즈 클럽, 베이비시팅 서비스까지 가족 여행에 어울리는 호텔 추천',
    url: `${baseUrl}/with-kids`,
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
          name: '아이와 함께 떠나는 여행',
          item: `${baseUrl}/with-kids`
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(withKidsPageData) }}
      />
      
      <Header />
      <PromotionBanner />

      <main>
        {/* Hero */}
        <section className="bg-white border-b">
          <div className="container mx-auto max-w-[1440px] px-4 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              아이와 함께 떠나는 여행
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              키즈풀, 키즈 클럽, 베이비시팅 서비스까지
              <br className="hidden sm:block" />
              가족 여행에 어울리는 호텔을 추천드려요
            </p>
          </div>
        </section>

        {/* 추천 호텔 리스트 */}
        <section className="py-6 sm:py-10">
          <div className="container mx-auto max-w-[1440px] px-4">
            <WithKidsClient />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}



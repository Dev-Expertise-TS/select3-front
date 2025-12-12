import { Suspense } from "react"
import { Metadata } from 'next'
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '호텔 검색 결과 | 투어비스 셀렉트',
  description: '투어비스 셀렉트에서 원하는 호텔을 검색해보세요. 전 세계 최고의 럭셔리 호텔과 리조트를 찾아 특별한 혜택(2인 조식, $100 크레딧, 객실 업그레이드)과 함께 예약하실 수 있습니다.',
  keywords: [
    '호텔 검색 결과',
    '럭셔리 호텔 검색',
    '프리미엄 호텔 검색',
    '호텔 예약',
    '투어비스 셀렉트 검색',
    '특급 호텔 검색',
    '5성급 호텔 검색'
  ],
  openGraph: {
    title: '호텔 검색 결과 | 투어비스 셀렉트',
    description: '투어비스 셀렉트에서 원하는 호텔을 검색해보세요. 전 세계 최고의 럭셔리 호텔과 리조트를 찾아 특별한 혜택과 함께 예약하실 수 있습니다.',
    url: `${baseUrl}/search-results`,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 호텔 검색',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '호텔 검색 결과 | 투어비스 셀렉트',
    description: '투어비스 셀렉트에서 원하는 호텔을 검색해보세요. 전 세계 최고의 럭셔리 호텔과 리조트를 찾아 특별한 혜택과 함께 예약하실 수 있습니다.',
    images: [`${baseUrl}/select_logo.avif`],
  },
  alternates: {
    canonical: `${baseUrl}/search-results`
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

export default function SearchResultsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // CollectionPage Structured Data for Search Results
  const searchResultsPageData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '호텔 검색 결과',
    description: '투어비스 셀렉트에서 원하는 호텔을 검색해보세요.',
    url: `${baseUrl}/search-results`,
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
          name: '검색 결과',
          item: `${baseUrl}/search-results`
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
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchResultsPageData) }}
      />
      <HotelSearchResults 
        title="호텔 검색 결과"
        subtitle="검색어에 맞는 호텔을 찾아보세요"
        showAllHotels={false}
      />
    </Suspense>
  )
}

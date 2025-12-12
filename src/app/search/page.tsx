import { Suspense } from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { UnifiedSearchResults } from '@/features/search/unified-search-results'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '호텔 & 아티클 검색 | 투어비스 셀렉트',
  description: '전 세계 럭셔리 호텔과 여행 아티클을 한 번에 검색하세요. 호텔명, 지역, 브랜드, 여행 정보를 통합 검색하여 최적의 호텔과 여행 가이드를 찾아보세요.',
  keywords: [
    '호텔 검색',
    '아티클 검색',
    '럭셔리 호텔 검색',
    '여행 정보 검색',
    '호텔 통합 검색',
    '투어비스 셀렉트 검색',
    '프리미엄 호텔 검색'
  ],
  openGraph: {
    title: '호텔 & 아티클 검색 | 투어비스 셀렉트',
    description: '전 세계 럭셔리 호텔과 여행 아티클을 한 번에 검색하세요. 호텔명, 지역, 브랜드, 여행 정보를 통합 검색하여 최적의 호텔과 여행 가이드를 찾아보세요.',
    url: `${baseUrl}/search`,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 검색',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '호텔 & 아티클 검색 | 투어비스 셀렉트',
    description: '전 세계 럭셔리 호텔과 여행 아티클을 한 번에 검색하세요.',
    images: [`${baseUrl}/select_logo.avif`],
  },
  alternates: {
    canonical: `${baseUrl}/search`
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

export default function SearchPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // SearchActionPage Structured Data
  const searchPageData = {
    '@context': 'https://schema.org',
    '@type': 'SearchActionPage',
    name: '호텔 & 아티클 검색',
    description: '전 세계 럭셔리 호텔과 여행 아티클을 한 번에 검색하세요.',
    url: `${baseUrl}/search`,
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
          name: '검색',
          item: `${baseUrl}/search`
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
      <div className="min-h-screen flex flex-col">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchPageData) }}
        />
        <Header />
        <main className="flex-1">
          <UnifiedSearchResults />
        </main>
        <Footer />
      </div>
    </Suspense>
  )
}



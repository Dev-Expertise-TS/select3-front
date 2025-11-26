import { Suspense } from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { UnifiedSearchResults } from '@/features/search/unified-search-results'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '검색 | 투어비스 셀렉트',
  description: '호텔/아티클 통합 검색 결과',
  openGraph: {
    title: '검색 | 투어비스 셀렉트',
    description: '호텔/아티클 통합 검색 결과',
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
    title: '검색 | 투어비스 셀렉트',
    description: '호텔/아티클 통합 검색 결과',
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <UnifiedSearchResults />
        </main>
        <Footer />
      </div>
    </Suspense>
  )
}



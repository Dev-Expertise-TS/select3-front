import { Suspense } from "react"
import { Metadata } from 'next'
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '호텔 검색 결과 | 투어비스 셀렉트',
  description: '투어비스 셀렉트에서 원하는 호텔을 검색해보세요. 전 세계 최고의 럭셔리 호텔과 리조트를 찾아 특별한 혜택과 함께 예약하실 수 있습니다.',
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HotelSearchResults 
        title="호텔 검색 결과"
        subtitle="검색어에 맞는 호텔을 찾아보세요"
        showAllHotels={false}
      />
    </Suspense>
  )
}

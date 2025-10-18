import { Suspense } from "react"
import { Metadata } from 'next'
import { HotelSearchResults } from "@/components/shared/hotel-search-results"
import { getHotelPageData } from './hotel-page-server'

// 호텔 목록 페이지 캐시: 5분마다 재검증
export const revalidate = 300
// 동적 렌더링
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '전체 호텔 & 리조트 | 투어비스 셀렉트',
  description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요. 투어비스 셀렉트에서 제공하는 특별한 혜택과 함께 럭셔리 숙박을 예약하실 수 있습니다.',
  openGraph: {
    title: '전체 호텔 & 리조트 | 투어비스 셀렉트',
    description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요. 투어비스 셀렉트에서 제공하는 특별한 혜택과 함께 럭셔리 숙박을 예약하실 수 있습니다.',
    images: [
      {
        url: '/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 전체 호텔',
      },
    ],
  },
  twitter: {
    title: '전체 호텔 & 리조트 | 투어비스 셀렉트',
    description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요. 투어비스 셀렉트에서 제공하는 특별한 혜택과 함께 럭셔리 숙박을 예약하실 수 있습니다.',
    images: ['/select_logo.avif'],
  },
}

export default async function AllHotelResortPage() {
  // 서버에서 초기 데이터 조회
  const { allHotels, filterOptions, bannerHotel } = await getHotelPageData()
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HotelSearchResults 
        title="호텔 & 리조트 전체보기"
        subtitle="전 세계 프리미엄 호텔과 리조트를 모두 확인해보세요"
        showAllHotels={true}
        hideSearchBar={true}
        showFilters={true}
        initialHotels={allHotels}
        serverFilterOptions={filterOptions}
        serverBannerHotel={bannerHotel}
      />
    </Suspense>
  )
}

import { Suspense } from "react"
import { Metadata } from 'next'
import { HotelSearchResults } from "@/components/shared/hotel-search-results"
import { getHotelPageData } from './hotel-page-server'

// 호텔 목록 페이지 캐시: 5분마다 재검증
export const revalidate = 300

export const metadata: Metadata = {
  title: '전체 호텔 & 리조트 | 투어비스 셀렉트',
  description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요. 투어비스 셀렉트에서 제공하는 특별한 혜택과 함께 럭셔리 숙박을 예약하실 수 있습니다. 2인 조식, $100 크레딧, 객실 업그레이드 등 다양한 혜택을 누리세요.',
  keywords: [
    '럭셔리 호텔',
    '프리미엄 호텔',
    '5성급 호텔',
    '특급 호텔',
    '호텔 예약',
    '리조트',
    '호텔 컨시어지',
    '투어비스 셀렉트',
    '호텔 혜택',
    'Virtuoso'
  ],
  openGraph: {
    title: '전체 호텔 & 리조트 | 투어비스 셀렉트',
    description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요. 투어비스 셀렉트에서 제공하는 특별한 혜택과 함께 럭셔리 숙박을 예약하실 수 있습니다.',
    url: 'https://luxury-select.co.kr/hotel',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://luxury-select.co.kr/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 전체 호텔',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전체 호텔 & 리조트 | 투어비스 셀렉트',
    description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요. 투어비스 셀렉트에서 제공하는 특별한 혜택과 함께 럭셔리 숙박을 예약하실 수 있습니다.',
    images: ['https://luxury-select.co.kr/select_logo.avif'],
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/hotel'
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

export default async function AllHotelResortPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 쿼리 파라미터에서 필터 읽기
  const params = await searchParams
  const regionParamRaw = params.region
  const regionParam =
    typeof regionParamRaw === 'string'
      ? regionParamRaw
      : Array.isArray(regionParamRaw)
        ? regionParamRaw[0]
        : undefined

  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const { getCompanyFromServer } = await import('@/lib/company-filter')
  const company = await getCompanyFromServer(searchParams)
  
  // 서버에서 초기 데이터 조회 (region 필터 지원)
  const { allHotels, filterOptions, bannerHotel } = await getHotelPageData({ 
    region: regionParam,
    company 
  })

  // initialFilters 구성 (전체보기 페이지에서는 브랜드 필터 제외)
  const initialFilters = undefined
  
  // CollectionPage Structured Data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const collectionPageData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '전체 호텔 & 리조트',
    description: '전 세계 최고의 프리미엄 호텔과 리조트를 만나보세요.',
    url: `${baseUrl}/hotel`,
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
          name: '호텔',
          item: `${baseUrl}/hotel`
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
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageData) }}
      />
      
      <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
        <HotelSearchResults 
        title="호텔 & 리조트 전체보기"
        subtitle="전 세계 프리미엄 호텔과 리조트를 모두 확인해보세요"
        showAllHotels={true}
        hideSearchBar={true}
        showFilters={true}
        hidePromotionBanner={false}
        initialHotels={allHotels}
        serverFilterOptions={filterOptions}
        serverBannerHotel={bannerHotel}
        initialFilters={initialFilters}
        company={company}
      />
      </Suspense>
    </>
  )
}

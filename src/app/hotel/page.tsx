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

  // 서버에서 초기 데이터 조회 (region 필터 지원)
  const { allHotels, filterOptions, bannerHotel } = await getHotelPageData({ region: regionParam })

  const brandIdParam = params.brand_id as string | undefined
  const brandNameParam = params.brand as string | undefined
  
  // brand_id 우선 사용, 없으면 brand 이름으로 매칭
  let brandId: string | undefined
  
  if (brandIdParam) {
    // brand_id가 직접 전달된 경우 (권장 방식)
    brandId = brandIdParam
    console.log('✅ [Brand Filter] brand_id 직접 사용:', brandId)
  } else if (brandNameParam && filterOptions) {
    // 레거시: 브랜드 이름으로 매칭 (하위 호환성)
    console.log('🔍 [Brand Filter Debug] brandParam:', brandNameParam)
    console.log('🔍 [Brand Filter Debug] Available brands:', filterOptions.brands?.map((b: any) => ({ id: b.id, label: b.label })))
    console.log('🔍 [Brand Filter Debug] filterOptions.brands 길이:', filterOptions.brands?.length || 0)
    
    // 브랜드 옵션이 없거나 비어있으면 경고
    if (!filterOptions.brands || filterOptions.brands.length === 0) {
      console.warn('⚠️ [Brand Filter Debug] 브랜드 필터 옵션이 비어있습니다!')
    }
    
    const paramLower = brandNameParam.toLowerCase().trim()
    
    const matchingBrand = filterOptions.brands?.find((b: any) => {
      if (!b || !b.label) return false
      
      const label = b.label.toLowerCase().trim()
      
      // 1. 정확히 일치
      if (label === paramLower) {
        console.log('✅ [Brand Filter Debug] 정확히 일치:', label, '===', paramLower)
        return true
      }
      
      // 2. label에서 괄호 앞부분만 추출해서 비교 (가장 중요)
      const labelBeforeParenthesis = label.split('(')[0].trim()
      if (labelBeforeParenthesis === paramLower) {
        console.log('✅ [Brand Filter Debug] 괄호 앞부분 일치:', labelBeforeParenthesis, '===', paramLower)
        return true
      }
      
      // 3. label이 "param (..." 형식으로 시작
      if (label.startsWith(paramLower + ' (')) {
        console.log('✅ [Brand Filter Debug] 시작 부분 일치:', label, 'startsWith', paramLower + ' (')
        return true
      }
      
      // 4. label에 param이 포함 (예: "Aman (Aman Resorts)" includes "aman")
      if (label.includes(paramLower)) {
        console.log('✅ [Brand Filter Debug] 포함 관계:', label, 'includes', paramLower)
        return true
      }
      
      // 5. brand_name_en과 직접 비교 (추가 안전장치)
      const brandNameEn = b.brand_name_en?.toLowerCase().trim()
      if (brandNameEn && brandNameEn === paramLower) {
        console.log('✅ [Brand Filter Debug] brand_name_en 일치:', brandNameEn, '===', paramLower)
        return true
      }
      
      return false
    })
    
    console.log('🔍 [Brand Filter Debug] Matching brand:', matchingBrand)
    brandId = matchingBrand?.id
    console.log('🔍 [Brand Filter Debug] brandId:', brandId)
    
    // 매칭 실패 시 추가 디버깅
    if (!matchingBrand) {
      console.error('❌ [Brand Filter Debug] 브랜드 매칭 실패!')
      console.error('  - brandParam:', brandNameParam)
      console.error('  - paramLower:', paramLower)
      console.error('  - Available labels:', filterOptions.brands?.map((b: any) => b.label))
      console.error('  - Available brand_name_en:', filterOptions.brands?.map((b: any) => b.brand_name_en).filter(Boolean))
    }
  }
  
  // initialFilters 구성 (brand_id 사용 - 배열 형식으로 전달)
  const initialFilters = brandId ? { brands: [brandId] } : undefined
  console.log('🔍 [Brand Filter] initialFilters:', initialFilters)
  
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
      />
      </Suspense>
    </>
  )
}

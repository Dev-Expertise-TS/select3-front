import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { HotelSearchResults } from '@/components/shared/hotel-search-results'
import { getChainHotelsData } from './chain-hotels-server'
import { getAllActiveChains } from '@/lib/chain-data-server'

// 정적 경로 생성 (SSG)
export async function generateStaticParams() {
  const chains = await getAllActiveChains()
  
  return chains
    .filter(chain => chain.chain_slug) // chain_slug가 있는 것만
    .map(chain => ({
      chainSlug: chain.chain_slug!
    }))
}

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ chainSlug: string }> }): Promise<Metadata> {
  const { chainSlug } = await params
  const data = await getChainHotelsData(chainSlug)
  
  if (!data) {
    return {
      title: '체인을 찾을 수 없습니다',
      description: '요청하신 체인 정보를 찾을 수 없습니다.'
    }
  }
  
  const { chain, hotels } = data
  const chainName = chain.chain_name_ko || chain.chain_name_en || '체인'
  const hotelCount = hotels.length
  
  const title = `${chainName} 호텔 ${hotelCount}곳 | 투어비스 셀렉트`
  const description = `${chainName}의 프리미엄 호텔 ${hotelCount}곳을 만나보세요. 투어비스 셀렉트에서 특별한 혜택과 함께 예약하세요.`
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const url = `${baseUrl}/hotel/chain/${chainSlug}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: '투어비스 셀렉트',
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/select_logo.avif`,
          width: 1200,
          height: 630,
          alt: `${chainName} 호텔`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}/select_logo.avif`]
    },
    alternates: {
      canonical: url
    }
  }
}

// 체인별 호텔 목록 페이지
export default async function ChainHotelsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ chainSlug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { chainSlug } = await params
  
  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const { getCompanyFromServer } = await import('@/lib/company-filter')
  const company = searchParams ? await getCompanyFromServer(searchParams) : null
  
  const data = await getChainHotelsData(chainSlug, company)
  
  // 체인을 찾을 수 없는 경우 404
  if (!data) {
    notFound()
  }
  
  const { chain, hotels, filterOptions } = data
  const chainName = chain.chain_name_ko || chain.chain_name_en || '체인'
  
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HotelSearchResults 
        title={`${chainName} 호텔 & 리조트`}
        subtitle={`${chainName}의 프리미엄 호텔 ${hotels.length}곳`}
        showAllHotels={true}
        hideSearchBar={false}
        showFilters={true}
        hidePromotionBanner={false}
        initialHotels={hotels}
        serverFilterOptions={filterOptions}
        initialFilters={{
          chains: [String(chain.chain_id)]
        }}
        enableFilterNavigation={true}
      />
    </Suspense>
  )
}


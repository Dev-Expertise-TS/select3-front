import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBrandHotelsData } from './brand-hotels-server'
import { getAllActiveBrands } from '@/lib/brand-data-server'
import { BrandImmersivePage } from './components/brand-immersive-page'

// 정적 경로 생성 (SSG)
export async function generateStaticParams() {
  const brands = await getAllActiveBrands()
  
  return brands
    .filter(brand => brand.brand_slug) // brand_slug가 있는 것만
    .map(brand => ({
      brandSlug: brand.brand_slug!
    }))
}

// 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ brandSlug: string }> }): Promise<Metadata> {
  const { brandSlug } = await params
  const data = await getBrandHotelsData(brandSlug)
  
  if (!data) {
    return {
      title: '브랜드를 찾을 수 없습니다',
      description: '요청하신 브랜드 정보를 찾을 수 없습니다.'
    }
  }
  
  const { brand, hotels } = data
  const brandName = brand.brand_name_ko || brand.brand_name_en || '브랜드'
  const brandNameEn = brand.brand_name_en || brandName
  const hotelCount = hotels.length
  
  const title = `${brandName}(${brandNameEn}) 럭셔리 호텔 ${hotelCount}곳 | 투어비스 셀렉트`
  const description = `${brandName}(${brandNameEn})의 프리미엄 럭셔리 호텔 ${hotelCount}곳. 한국 최고의 호텔 전문 컨시어지가 고객님의 ${brandName} 호텔 예약을 도와드립니다. 특별한 혜택과 전문 상담 서비스를 경험하세요.`
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const url = `${baseUrl}/hotel/brand/${brandSlug}`
  
  // 대표 이미지 선택 (첫 번째 호텔 이미지 또는 로고)
  const ogImage = hotels[0]?.image || `${baseUrl}/select_logo.avif`
  
  return {
    title,
    description,
    keywords: [
      brandName,
      brandNameEn,
      '럭셔리 호텔',
      '프리미엄 호텔',
      '호텔 예약',
      '컨시어지',
      '투어비스 셀렉트',
      '특급 호텔',
      `${brandName} 호텔`,
      `${brandNameEn} hotels`
    ],
    openGraph: {
      title,
      description,
      url,
      siteName: '투어비스 셀렉트',
      locale: 'ko_KR',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brandName}(${brandNameEn}) 럭셔리 호텔`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  }
}

// 브랜드별 호텔 목록 페이지
export default async function BrandHotelsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ brandSlug: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { brandSlug } = await params
  
  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const { getCompanyFromServer } = await import('@/lib/company-filter')
  const company = searchParams ? await getCompanyFromServer(searchParams) : null
  
  const data = await getBrandHotelsData(brandSlug, company)
  
  // 브랜드를 찾을 수 없는 경우 404
  if (!data) {
    notFound()
  }
  
  const { brand, hotels, allHotelImages } = data
  
  // 폴백 설명 (초기 렌더링용)
  const brandName = brand.brand_name_ko || brand.brand_name_en
  const brandNameEn = brand.brand_name_en || brandName
  const fallbackDescription = brand.brand_description_ko || brand.brand_description || 
    `${brandName}는 세계적인 럭셔리 호텔 브랜드로, 최고의 서비스를 제공하고 있습니다.`
  
  // Structured Data (JSON-LD) 생성
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brandName}(${brandNameEn}) 럭셔리 호텔`,
    description: fallbackDescription,
    url: `${baseUrl}/hotel/brand/${brandSlug}`,
    mainEntity: {
      '@type': 'ItemList',
      name: `${brandName} 호텔 목록`,
      numberOfItems: hotels.length,
      itemListElement: hotels.slice(0, 10).map((hotel: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Hotel',
          name: hotel.property_name_ko || hotel.property_name_en,
          url: `${baseUrl}/hotel/${hotel.slug}`,
          image: hotel.image,
          brand: {
            '@type': 'Brand',
            name: brandNameEn
          }
        }
      }))
    },
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
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: '브랜드',
          item: `${baseUrl}/hotel/brand`
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: brandName,
          item: `${baseUrl}/hotel/brand/${brandSlug}`
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BrandImmersivePage 
        brand={brand} 
        hotels={hotels || []} 
        allHotelImages={allHotelImages || []} 
        aiDescription={fallbackDescription} 
      />
    </>
  )
}


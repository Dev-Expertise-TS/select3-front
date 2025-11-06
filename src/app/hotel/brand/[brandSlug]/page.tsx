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
  const hotelCount = hotels.length
  
  const title = `${brandName} 호텔 ${hotelCount}곳 | 투어비스 셀렉트`
  const description = `${brandName}의 프리미엄 호텔 ${hotelCount}곳을 만나보세요. 투어비스 셀렉트에서 특별한 혜택과 함께 예약하세요.`
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const url = `${baseUrl}/hotel/brand/${brandSlug}`
  
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
          alt: `${brandName} 호텔`
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

// 브랜드별 호텔 목록 페이지
export default async function BrandHotelsPage({ params }: { params: Promise<{ brandSlug: string }> }) {
  const { brandSlug } = await params
  const data = await getBrandHotelsData(brandSlug)
  
  // 브랜드를 찾을 수 없는 경우 404
  if (!data) {
    notFound()
  }
  
  const { brand, hotels, allHotelImages } = data
  
  // 폴백 설명 (초기 렌더링용)
  const brandName = brand.brand_name_ko || brand.brand_name_en
  const fallbackDescription = brand.brand_description_ko || brand.brand_description || 
    `${brandName}는 세계적인 럭셔리 호텔 브랜드로, 최고의 서비스를 제공하고 있습니다.`
  
  return <BrandImmersivePage brand={brand} hotels={hotels || []} allHotelImages={allHotelImages || []} aiDescription={fallbackDescription} />
}


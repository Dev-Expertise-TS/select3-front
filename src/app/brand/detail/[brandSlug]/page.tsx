import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ScrollToTop } from '@/features/scroll-to-top'
import { getBrandDetailData } from './brand-detail-server'
import { getAllActiveBrands } from '@/lib/brand-data-server'
import { BrandDetailClient } from './brand-detail-client'
import { getCompanyFromSearchParams } from '@/lib/company-filter'

// 정적 경로 생성 (SSG)
export async function generateStaticParams() {
  const brands = await getAllActiveBrands()
  
  return brands
    .filter(brand => brand.brand_slug)
    .map(brand => ({
      brandSlug: brand.brand_slug!
    }))
}

// 메타데이터 생성
export async function generateMetadata({ 
  params,
  searchParams
}: { 
  params: Promise<{ brandSlug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}): Promise<Metadata> {
  const { brandSlug } = await params
  const resolvedSearchParams = await searchParams
  const company = getCompanyFromSearchParams(resolvedSearchParams)
  const data = await getBrandDetailData(brandSlug, company)
  
  if (!data) {
    return {
      title: '브랜드를 찾을 수 없습니다',
      description: '요청하신 브랜드 정보를 찾을 수 없습니다.'
    }
  }
  
  const { brand, hotels, articles } = data
  const brandName = brand.brand_name_ko || brand.brand_name_en
  const hotelCount = hotels.length
  
  const title = `${brandName} | 투어비스 셀렉트`
  const description = `${brandName}의 럭셔리 호텔 ${hotelCount}곳과 특별한 혜택을 만나보세요. ${brandName}의 철학과 서비스를 경험하실 수 있습니다.`
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const url = `${baseUrl}/brand/detail/${brandSlug}`
  
  // 첫 번째 호텔 이미지 또는 브랜드 로고
  const ogImage = hotels[0]?.image || `${baseUrl}/select_logo.avif`
  
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
          url: ogImage,
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
      images: [ogImage]
    },
    alternates: {
      canonical: url
    }
  }
}

// 브랜드 상세 페이지
export default async function BrandDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ brandSlug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { brandSlug } = await params
  const resolvedSearchParams = await searchParams
  const company = getCompanyFromSearchParams(resolvedSearchParams)
  const data = await getBrandDetailData(brandSlug, company)
  
  // 브랜드를 찾을 수 없는 경우 404
  if (!data) {
    notFound()
  }
  
  const { brand, hotels, articles } = data
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <BrandDetailClient 
          brand={brand}
          hotels={hotels}
          articles={articles}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}


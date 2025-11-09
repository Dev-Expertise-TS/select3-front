import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PromotionBannerWrapper } from '@/components/promotion-banner-wrapper'
import { getRecommendationPageData } from './recommendation-page-server'
import { RecommendationPageContent } from '@/features/recommendation-pages/RecommendationPageContent'

// 캐시: 1시간마다 재검증
export const revalidate = 3600

interface RecommendationPageProps {
  params: Promise<{ slug: string }>
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: RecommendationPageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getRecommendationPageData(slug)
  
  if (!data) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 페이지를 찾을 수 없습니다.'
    }
  }
  
  const { recommendationPage } = data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // SEO 메타데이터
  const title = recommendationPage.seo_title_ko || recommendationPage.title_ko || '호텔 추천'
  const description = recommendationPage.seo_description_ko || `${recommendationPage.title_ko} - 투어비스 셀렉트에서 엄선한 특별한 호텔을 만나보세요.`
  const canonicalUrl = recommendationPage.seo_canonical_url || `${baseUrl}/hotel-recommendations/${slug}`
  const ogImage = recommendationPage.og_image_url || recommendationPage.hero_image_url || `${baseUrl}/select_logo.avif`
  
  return {
    title,
    description,
    robots: recommendationPage.meta_robots || 'index,follow',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: recommendationPage.og_title || title,
      description: recommendationPage.og_description || description,
      url: canonicalUrl,
      siteName: '투어비스 셀렉트',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: recommendationPage.title_ko,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: recommendationPage.twitter_title || title,
      description: recommendationPage.twitter_description || description,
      images: [recommendationPage.twitter_image_url || ogImage],
    },
  }
}

// Structured Data 생성
function generateStructuredData(recommendationPage: any, hotels: any[], slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // ItemList Schema for hotel recommendations
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: recommendationPage.title_ko,
    description: recommendationPage.seo_description_ko || recommendationPage.intro_rich_ko,
    url: `${baseUrl}/hotel-recommendations/${slug}`,
    numberOfItems: hotels.length,
    itemListElement: hotels.slice(0, 10).map((item, index) => {
      const hotel = item.hotel
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Hotel',
          name: hotel.property_name_ko || hotel.property_name_en,
          description: item.card_blurb_ko || hotel.property_details,
          image: item.card_image_url || hotel.image_1,
          address: {
            '@type': 'PostalAddress',
            streetAddress: hotel.property_address,
            addressLocality: hotel.city_ko || hotel.city,
            addressCountry: hotel.country_ko,
          },
          url: `${baseUrl}/hotel/${hotel.slug}`,
        }
      }
    })
  }
  
  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '호텔 추천',
        item: `${baseUrl}/hotel-recommendations`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: recommendationPage.title_ko,
        item: `${baseUrl}/hotel-recommendations/${slug}`
      }
    ]
  }
  
  // 커스텀 스키마가 있으면 추가
  const schemas = [itemListSchema, breadcrumbSchema]
  if (recommendationPage.seo_schema_json) {
    schemas.push(recommendationPage.seo_schema_json)
  }
  
  return JSON.stringify(schemas)
}

export default async function RecommendationPage({ params }: RecommendationPageProps) {
  const { slug } = await params
  const data = await getRecommendationPageData(slug)
  
  if (!data) {
    notFound()
  }
  
  const { recommendationPage, hotels } = data
  const structuredData = generateStructuredData(recommendationPage, hotels, slug)
  
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      
      <Header />
      
      <PromotionBannerWrapper>
        <main>
          <RecommendationPageContent
            recommendationPage={recommendationPage}
            hotels={hotels}
            slug={slug}
          />
        </main>
      </PromotionBannerWrapper>
      
      <Footer />
    </div>
  )
}


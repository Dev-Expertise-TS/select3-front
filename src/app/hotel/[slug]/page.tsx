import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { HotelDetail } from "@/features/hotels/hotel-detail"
import { Metadata } from "next"
import { HotelNotFound } from "@/components/hotel/HotelNotFound"
import { getHotelDetailData } from './hotel-detail-server'
import { getCityBySlug } from '@/lib/city-data-server'
import { getCityHotelsData } from './city-hotels-server'
import { HotelSearchResults } from '@/components/shared/hotel-search-results'
import { Suspense } from 'react'

// URL을 절대 URL로 변환하는 함수
function toAbsoluteUrl(url: string): string {
  if (!url) return ''
  
  // 이미 절대 URL인 경우
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 상대 URL인 경우 도메인 추가
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // '/'로 시작하는 경우
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`
  }
  
  // '/'로 시작하지 않는 경우
  return `${baseUrl}/${url}`
}

// HTML 태그를 제거하고 텍스트만 추출하는 함수
function stripHtmlTags(html: string): string {
  if (!html) return ''
  
  // HTML 태그 제거
  let text = html.replace(/<[^>]*>/g, '')
  
  // HTML 엔티티 디코딩
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  // 연속된 공백과 줄바꿈 정리
  text = text.replace(/\s+/g, ' ').trim()
  
  // 길이 제한 (메타 디스크립션은 보통 160자 이하 권장)
  if (text.length > 160) {
    text = text.substring(0, 157) + '...'
  }
  
  return text
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  
  // 1순위: 도시 slug 확인
  const city = await getCityBySlug(slug)
  if (city) {
    const cityData = await getCityHotelsData(slug)
    if (cityData) {
      const cityName = cityData.city.city_ko || cityData.city.city_en || '도시'
      const countryName = cityData.city.country_ko || cityData.city.country_en || ''
      const hotelCount = cityData.hotels.length
      
      const title = `${cityName} 프리미엄 호텔 ${hotelCount}곳 | 투어비스 셀렉트`
      const description = `${cityName}${countryName ? `, ${countryName}` : ''}의 최고급 호텔 ${hotelCount}곳을 만나보세요. 프리미엄 호텔 컨시어지 투어비스 셀렉트에서 특별한 혜택과 함께 예약하세요.`
      
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
      const url = `${baseUrl}/hotel/${slug}`
      
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
              alt: `${cityName} 프리미엄 호텔`
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
  }
  
  // 2순위: 호텔 slug로 처리
  const detailData = await getHotelDetailData(slug)
  
  if (!detailData) {
    return {
      title: '호텔을 찾을 수 없습니다',
      description: '요청하신 호텔 정보를 찾을 수 없습니다.'
    }
  }
  
  const hotel = detailData.hotel
  const reviews = detailData.reviews || { count: 0, averageRating: 0 }
  
  // Long-tail 키워드가 포함된 제목 생성
  const hotelName = hotel.property_name_ko || hotel.property_name_en
  const cityName = hotel.city_ko || hotel.city_eng || ''
  const countryName = hotel.country_ko || hotel.country_en || ''
  const locationText = cityName ? (countryName ? `${cityName}, ${countryName}` : cityName) : ''
  
  // SEO Title: DB 값이 있으면 우선 사용, 없으면 동적 생성
  const title = hotel.seo_title || (reviews.count > 0
    ? `${hotelName}${locationText ? ` (${locationText})` : ''} 후기 및 가격 비교 | 투어비스 셀렉트`
    : `${hotelName}${locationText ? ` (${locationText})` : ''} 상세 정보 및 가격 | 투어비스 셀렉트`)
  
  // Long-tail 키워드가 포함된 디스크립션 생성
  const rawDescription = hotel.property_details || hotel.property_location || ''
  const cleanDescription = rawDescription ? stripHtmlTags(rawDescription) : ''
  
  // SEO Description: DB 값이 있으면 우선 사용, 없으면 동적 생성
  let description = hotel.seo_description || ''
  if (!description) {
    // 후기 개수와 위치 정보를 활용한 SEO 최적화 디스크립션
    if (reviews.count > 0) {
      description = `${hotelName}${locationText ? ` (${locationText})` : ''}의 실제 고객 후기 ${reviews.count}개와 객실 가격을 비교해보세요. ${cleanDescription ? cleanDescription.substring(0, 80) : '프리미엄 호텔 컨시어지 투어비스 셀렉트에서 특별한 혜택과 함께 예약하세요.'}`
    } else {
      description = `${hotelName}${locationText ? ` (${locationText})` : ''}의 상세 정보, 위치, 시설을 확인하고 최적의 가격으로 예약하세요. ${cleanDescription ? cleanDescription.substring(0, 80) : '프리미엄 호텔 컨시어지 투어비스 셀렉트에서 특별한 혜택과 함께 예약하세요.'}`
    }
    
    // 디스크립션 길이 제한 (160자 권장)
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  // Canonical URL: DB 값이 있으면 우선 사용, 없으면 기본 URL
  const canonicalUrl = hotel.canonical_url || `${baseUrl}/hotel/${decodedSlug}`
  const url = canonicalUrl
  
  // 이미 조회한 이미지 데이터 중 첫 번째 이미지만 사용 (OG 이미지용)
  const firstImage = detailData.images.length > 0 
    ? toAbsoluteUrl(detailData.images[0].public_url || detailData.images[0].storage_path)
    : null
  
  // OG 이미지 (하나만 설정하여 불필요한 프리로드 방지)
  const ogImage = firstImage
    ? {
        url: firstImage,
        width: 1200,
        height: 630,
        alt: `${hotel.property_name_ko || hotel.property_name_en} 이미지`
      }
    : {
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: 'Select Hotels'
      }
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: '투어비스 셀렉트',
      url,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage.url],
      site: '@selecthotels',
      creator: '@selecthotels',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: hotel.publish !== false,
      follow: true,
      googleBot: {
        index: hotel.publish !== false,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      // LCP 이미지 preload (Next.js 15에서는 other에 직접 추가할 수 없으므로 클라이언트에서 처리)
      'lcp-image': firstImage || '',
      ...(hotel.seo_keywords ? { 'keywords': hotel.seo_keywords } : {}),
    },
  }
}

// ISR을 위한 revalidate 설정 (5분마다 재생성)
export const revalidate = 300

// 동적 파라미터 허용
export const dynamicParams = true

// 구조화된 데이터 생성
function generateHotelStructuredData(hotel: any, images: any[], slug: string, reviews?: { count: number; averageRating: number }) {
  if (!hotel) return null

  const decodedSlug = decodeURIComponent(slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // 이미지 배열 생성 (최대 10개)
  const imageUrls = images.slice(0, 10).map((img: any) => 
    toAbsoluteUrl(img.public_url || img.storage_path)
  ).filter(Boolean)
  const firstImageUrl = imageUrls[0] || `${baseUrl}/select_logo.avif`
  
  // AggregateRating 추가 (후기 데이터 활용)
  const aggregateRating = reviews && reviews.count > 0 ? {
    "@type": "AggregateRating",
    "ratingValue": reviews.averageRating,
    "reviewCount": reviews.count,
    "bestRating": 5,
    "worstRating": 1
  } : undefined
  
  // BreadcrumbList 추가
  const breadcrumbList = {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "홈",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": hotel.city_ko || hotel.city_eng || "호텔",
        "item": hotel.city_ko ? `${baseUrl}/hotel/${hotel.city_ko.toLowerCase().replace(/\s+/g, '-')}` : baseUrl
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": hotel.property_name_ko || hotel.property_name_en,
        "item": `${baseUrl}/hotel/${decodedSlug}`
      }
    ]
  }
  
  // FAQ 구조화된 데이터 추가
  const faqData = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${hotel.property_name_ko || hotel.property_name_en} 위치는 어디인가요?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": hotel.property_address 
            ? `${hotel.property_address}에 위치하고 있습니다.`
            : `${hotel.city_ko || hotel.city_eng || ''}에 위치하고 있습니다.`
        }
      },
      {
        "@type": "Question",
        "name": `${hotel.property_name_ko || hotel.property_name_en} 체크인/체크아웃 시간은?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "체크인 시간은 오후 3시, 체크아웃 시간은 오전 11시입니다. (호텔별로 상이할 수 있으니 예약 시 확인해주세요)"
        }
      },
      {
        "@type": "Question",
        "name": `${hotel.property_name_ko || hotel.property_name_en} 예약은 어떻게 하나요?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "투어비스 셀렉트에서 날짜와 인원을 선택하여 예약하실 수 있습니다. 카카오톡 상담을 통해 더 자세한 정보를 받아보실 수 있습니다."
        }
      },
      ...(reviews && reviews.count > 0 ? [{
        "@type": "Question",
        "name": `${hotel.property_name_ko || hotel.property_name_en} 후기는 어떤가요?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `실제 고객 후기 ${reviews.count}개가 있으며, 평균 평점은 ${reviews.averageRating}점입니다. 상세 후기는 페이지에서 확인하실 수 있습니다.`
        }
      }] : [])
    ]
  }
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.property_name_ko || hotel.property_name_en,
    "description": hotel.property_details ? stripHtmlTags(String(hotel.property_details)).substring(0, 200) : (hotel.description_ko || hotel.description_en || ""),
    "url": `${baseUrl}/hotel/${decodedSlug}`,
    "image": imageUrls.length > 0 ? imageUrls : firstImageUrl,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": hotel.property_address || "",
      "addressLocality": hotel.city_ko || hotel.city_eng || "",
      "addressRegion": hotel.city_ko || hotel.city_eng || "",
      "addressCountry": hotel.country_code || "KR"
    },
    "geo": hotel.property_address ? {
      "@type": "GeoCoordinates",
      "address": hotel.property_address
    } : undefined,
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.star_rating || hotel.rating || 5
    },
    ...(aggregateRating ? { "aggregateRating": aggregateRating } : {}),
    "amenityFeature": hotel.amenities ? hotel.amenities.map((amenity: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    })) : [],
    "priceRange": "₩₩₩₩",
    "checkinTime": "15:00",
    "checkoutTime": "11:00",
    "petsAllowed": false,
    "smokingAllowed": false,
    "hasMap": hotel.property_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.property_address)}` : undefined,
    "telephone": hotel.phone || undefined,
    "email": hotel.email || undefined
  }

  // 여러 구조화된 데이터를 배열로 반환
  return JSON.stringify([
    structuredData,
    breadcrumbList,
    faqData
  ])
}

export default async function HotelDetailPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const productCode = resolvedSearchParams.productCode as string | undefined
  const checkIn = resolvedSearchParams.checkIn as string | undefined
  const checkOut = resolvedSearchParams.checkOut as string | undefined
  
  // 1순위: 도시 slug 확인
  const city = await getCityBySlug(slug)
  if (city) {
    const cityData = await getCityHotelsData(slug)
    
    if (cityData) {
      const { city: cityInfo, hotels, filterOptions } = cityData
      const cityName = cityInfo.city_ko || cityInfo.city_en || '도시'
      const countryName = cityInfo.country_ko || cityInfo.country_en || ''
      
      return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
          <HotelSearchResults 
            title={`${cityName} 호텔 & 리조트`}
            subtitle={`${cityName}${countryName ? `, ${countryName}` : ''}의 프리미엄 호텔 ${hotels.length}곳`}
            showAllHotels={true}
            hideSearchBar={false}
            showFilters={true}
            hidePromotionBanner={false}
            initialHotels={hotels}
            serverFilterOptions={filterOptions}
            initialFilters={{
              countries: cityInfo.country_code ? [cityInfo.country_code] : [],
              cities: [cityInfo.city_code]
            }}
            enableFilterNavigation={true}
          />
        </Suspense>
      )
    }
  }
  
  // 2순위: 호텔 slug로 처리
  const detailData = await getHotelDetailData(slug)
  
  // 호텔을 찾을 수 없는 경우 HotelNotFound 페이지 표시 (Header/Footer 포함)
  if (!detailData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HotelNotFound slug={slug} />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    )
  }
  
  const { hotel, images, benefits, promotions, blogs, reviews } = detailData
  
  // 구조화된 데이터 생성
  const structuredData = generateHotelStructuredData(hotel, images, slug, reviews)
  
  // 구조화된 데이터 파싱 (배열 또는 단일 객체)
  let structuredDataArray: any[] = []
  if (structuredData) {
    try {
      const parsed = JSON.parse(structuredData)
      structuredDataArray = Array.isArray(parsed) ? parsed : [parsed]
    } catch {
      // 파싱 실패 시 빈 배열
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 구조화된 데이터 (여러 개) */}
      {structuredDataArray.map((data, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      
      <Header />
      <main>
        <HotelDetail 
          hotelSlug={slug} 
          initialHotel={hotel}
          initialImages={images}
          initialBenefits={benefits}
          initialPromotions={promotions}
          initialBlogs={blogs}
          initialProductCode={productCode}
          searchDates={checkIn && checkOut ? { checkIn, checkOut } : undefined}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

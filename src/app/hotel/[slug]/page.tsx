import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { HotelDetail } from "@/features/hotels/hotel-detail"
import { Metadata } from "next"
import { HotelNotFound } from "@/components/hotel/HotelNotFound"
import { getHotelDetailData } from './hotel-detail-server'

// URL을 절대 URL로 변환하는 함수
function toAbsoluteUrl(url: string): string {
  if (!url) return ''
  
  // 이미 절대 URL인 경우
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 상대 URL인 경우 도메인 추가
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://select-hotels.com'
  
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
  
  // getHotelDetailData를 재사용하여 중복 조회 방지
  const detailData = await getHotelDetailData(slug)
  
  if (!detailData) {
    return {
      title: '호텔을 찾을 수 없습니다',
      description: '요청하신 호텔 정보를 찾을 수 없습니다.'
    }
  }
  
  const hotel = detailData.hotel
  
  const title = `${hotel.property_name_ko || hotel.property_name_en} | 투어비스 셀렉트`
  
  // property_details에서 HTML 태그 제거하여 디스크립션 생성
  const rawDescription = hotel.property_details || hotel.property_location || ''
  const cleanDescription = rawDescription ? stripHtmlTags(rawDescription) : ''
  const description = cleanDescription || '프리미엄 호텔 컨시어지 : 투어비스 셀렉트'
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://select-hotels.com'
  const url = `${baseUrl}/hotel/${decodedSlug}`
  
  // 이미 조회한 이미지 데이터 재사용
  const hotelImages = detailData.images
    .map(img => toAbsoluteUrl(img.public_url || img.storage_path))
    .filter(Boolean)
    .slice(0, 3)
  
  // OG 이미지 배열 생성
  const ogImages = hotelImages.length > 0 
    ? hotelImages.map(imagePath => ({
        url: imagePath, // 이미 절대 URL로 변환됨
        width: 1200,
        height: 630,
        alt: `${hotel.property_name_ko || hotel.property_name_en} 이미지`
      }))
    : [{
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: 'Select Hotels'
      }]
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: 'Select Hotels',
      url,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImages.map(img => img.url),
      site: '@selecthotels',
      creator: '@selecthotels',
    },
    alternates: {
      canonical: url,
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
    },
  }
}

// ISR을 위한 revalidate 설정 (5분마다 재생성)
export const revalidate = 300

// 동적 파라미터 허용
export const dynamicParams = true

// 구조화된 데이터 생성
function generateHotelStructuredData(hotel: any, images: any[], slug: string) {
  if (!hotel) return null

  const decodedSlug = decodeURIComponent(slug)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://select-hotels.com'
  
  // 이미 조회한 이미지 데이터 재사용
  const hotelImages = images
    .map(img => toAbsoluteUrl(img.public_url || img.storage_path))
    .filter(Boolean)
    .slice(0, 3)
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.property_name_ko || hotel.property_name_en,
    "description": hotel.description_ko || hotel.description_en,
    "url": `${baseUrl}/hotel/${decodedSlug}`,
    "image": hotelImages.length > 0 ? hotelImages : [`${baseUrl}/select_logo.avif`],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": hotel.property_address || "",
      "addressLocality": hotel.city_ko || hotel.city_eng || "",
      "addressCountry": hotel.country_code || "KR"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.rating || hotel.star_rating || 5
    },
    "amenityFeature": hotel.amenities ? hotel.amenities.map((amenity: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    })) : [],
    "priceRange": "₩₩₩₩",
    "checkinTime": "15:00",
    "checkoutTime": "11:00",
    "petsAllowed": false,
    "smokingAllowed": false,
    "hasMap": hotel.property_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.property_address)}` : undefined
  }

  return JSON.stringify(structuredData)
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // 서버사이드에서 호텔 상세 데이터 미리 페칭 (호텔 + 이미지 + 혜택 + 프로모션 + 블로그)
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
  
  const { hotel, images, benefits, promotions, blogs } = detailData
  
  // 구조화된 데이터 생성
  const structuredData = generateHotelStructuredData(hotel, images, slug)
  
  return (
    <div className="min-h-screen bg-background">
      {/* 구조화된 데이터 */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />
      )}
      
      <Header />
      <main>
        <HotelDetail 
          hotelSlug={slug} 
          initialHotel={hotel}
          initialImages={images}
          initialBenefits={benefits}
          initialPromotions={promotions}
          initialBlogs={blogs}
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { HotelDetail } from "@/features/hotels/hotel-detail"
import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"
import { HotelNotFound } from "@/components/hotel/HotelNotFound"

// 호텔 데이터를 서버사이드에서 미리 페칭
async function getHotelBySlug(slug: string) {
  try {
    const supabase = await createClient()
    
    // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
    const decodedSlug = decodeURIComponent(slug)
    
    console.log('🔍 호텔 검색:', {
      originalSlug: slug,
      decodedSlug: decodedSlug,
      hasSpecialChars: slug !== decodedSlug
    })
    
    const { data: hotel, error } = await supabase
      .from('select_hotels')
      .select('*')
      .eq('slug', decodedSlug)
      .maybeSingle()
    
    if (error) {
      // 호텔을 찾을 수 없는 경우는 정상적인 상황이므로 경고 수준으로 로깅
      console.warn('호텔 데이터 조회 실패:', {
        originalSlug: slug,
        decodedSlug: decodedSlug,
        error: error.message || error,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return null
    }
    
    // publish가 false면 null 반환
    if (hotel && hotel.publish === false) {
      console.log('호텔이 publish=false로 숨겨짐:', { slug, sabre_id: hotel.sabre_id })
      return null
    }
    
    return hotel
  } catch (error) {
    // 예상치 못한 오류만 error로 로깅
    console.error('getHotelBySlug 예상치 못한 오류:', {
      originalSlug: slug,
      decodedSlug: decodeURIComponent(slug),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })
    return null
  }
}

// 호텔 이미지를 가져오는 함수
async function getHotelImages(sabreId: string) {
  try {
    const supabase = await createClient()
    
    const { data: images, error } = await supabase
      .from('select_hotel_media')
      .select('media_path, sequence')
      .eq('sabre_id', sabreId)
      .order('sequence', { ascending: true })
      .limit(3)
    
    if (error || !images || images.length === 0) {
      return []
    }
    
    return images.map(img => img.media_path)
  } catch (error) {
    console.error('호텔 이미지 조회 오류:', error)
    return []
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const hotel = await getHotelBySlug(slug)
  
  if (!hotel) {
    return {
      title: '호텔을 찾을 수 없습니다',
      description: '요청하신 호텔 정보를 찾을 수 없습니다.'
    }
  }
  
  const title = `${hotel.property_name_ko || hotel.property_name_en} | Select Hotels`
  const description = hotel.description_ko || hotel.description_en || `${hotel.property_name_ko || hotel.property_name_en}의 최고의 숙박 경험을 제공합니다.`
  const url = `https://select-hotels.com/hotel/${decodedSlug}`
  
  // 호텔 이미지 가져오기
  const hotelImages = hotel.sabre_id ? await getHotelImages(hotel.sabre_id) : []
  
  // OG 이미지 배열 생성
  const ogImages = hotelImages.length > 0 
    ? hotelImages.map(imagePath => ({
        url: imagePath,
        width: 1200,
        height: 630,
        alt: `${hotel.property_name_ko || hotel.property_name_en} 이미지`
      }))
    : [{
        url: 'https://select-hotels.com/select_logo.avif',
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

// 정적 생성 비활성화 (ISR 사용으로 대체)
// export async function generateStaticParams() {
//   // generateStaticParams는 정적 생성 시점에 실행되므로
//   // cookies가 필요한 createClient()를 사용할 수 없음
//   // 대신 ISR(revalidate)을 사용하여 동적으로 생성
//   return []
// }

// 구조화된 데이터 생성
async function generateHotelStructuredData(hotel: any, slug: string) {
  if (!hotel) return null

  const decodedSlug = decodeURIComponent(slug)
  
  // 호텔 이미지 가져오기
  const hotelImages = hotel.sabre_id ? await getHotelImages(hotel.sabre_id) : []
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.property_name_ko || hotel.property_name_en,
    "description": hotel.description_ko || hotel.description_en,
    "url": `https://select-hotels.com/hotel/${decodedSlug}`,
    "image": hotelImages.length > 0 ? hotelImages : ["https://select-hotels.com/select_logo.avif"],
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
  
  // 서버사이드에서 호텔 데이터 미리 페칭
  const hotel = await getHotelBySlug(slug)
  
  // 호텔을 찾을 수 없는 경우 HotelNotFound 페이지 표시 (Header/Footer 포함)
  if (!hotel) {
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
  
  // 구조화된 데이터 생성
  const structuredData = await generateHotelStructuredData(hotel, slug)
  
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
        <HotelDetail hotelSlug={slug} initialHotel={hotel} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

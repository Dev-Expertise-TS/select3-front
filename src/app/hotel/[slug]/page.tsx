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
      .select('*, image_1, image_2, image_3, image_4, image_5, property_location, property_address, city, city_ko, city_en')
      .neq('publish', false)
      .eq('slug', decodedSlug)
      .single()
    
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
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: 'Select Hotels',
      images: hotel.image_1 ? [
        {
          url: hotel.image_1,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: hotel.image_1 ? [hotel.image_1] : [],
    },
    alternates: {
      canonical: `https://select-hotels.com/hotel/${decodedSlug}`,
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
function generateHotelStructuredData(hotel: any, slug: string) {
  if (!hotel) return null

  const decodedSlug = decodeURIComponent(slug)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.property_name_ko || hotel.property_name_en,
    "description": hotel.description_ko || hotel.description_en,
    "url": `https://select-hotels.com/hotel/${decodedSlug}`,
    "image": hotel.image_1 ? [hotel.image_1] : [],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": hotel.city,
      "addressCountry": hotel.country || "KR"
    },
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.star_rating || 5
    },
    "amenityFeature": hotel.amenities ? hotel.amenities.map((amenity: string) => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity
    })) : [],
    "checkinTime": "15:00",
    "checkoutTime": "11:00",
    "petsAllowed": false,
    "smokingAllowed": false
  }

  return JSON.stringify(structuredData)
}

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  // 서버사이드에서 호텔 데이터 미리 페칭
  const hotel = await getHotelBySlug(slug)
  
  // 호텔을 찾을 수 없는 경우 HotelNotFound 페이지 표시
  if (!hotel) {
    return <HotelNotFound slug={slug} />
  }
  
  // 구조화된 데이터 생성
  const structuredData = generateHotelStructuredData(hotel, slug)
  
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

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { HotelDetail } from "@/features/hotels/hotel-detail"
import { createClient } from "@/lib/supabase/server"
import { Metadata } from "next"

// 호텔 데이터를 서버사이드에서 미리 페칭
async function getHotelBySlug(slug: string) {
  try {
    const supabase = await createClient()
    
    const { data: hotel, error } = await supabase
      .from('select_hotels')
      .select('*, image_1, image_2, image_3, image_4, image_5')
      .eq('slug', slug)
      .single()
    
    if (error) {
      console.error('호텔 데이터 조회 실패:', error)
      return null
    }
    
    return hotel
  } catch (error) {
    console.error('getHotelBySlug 에러:', error)
    return null
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
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
      canonical: `https://select-hotels.com/hotel/${slug}`,
    },
  }
}

// ISR을 위한 revalidate 설정 (5분마다 재생성)
export const revalidate = 300

// 인기 있는 호텔들을 미리 정적 생성
export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    
    // 인기 있는 호텔들 (예: 상위 50개)을 미리 생성
    const { data: hotels } = await supabase
      .from('select_hotels')
      .select('slug')
      .not('slug', 'is', null)
      .limit(50)
    
    return hotels?.map((hotel) => ({
      slug: hotel.slug,
    })) || []
  } catch (error) {
    console.error('generateStaticParams 에러:', error)
    // 에러 발생 시 빈 배열 반환 (빌드 실패 방지)
    return []
  }
}

// 구조화된 데이터 생성
function generateHotelStructuredData(hotel: any, slug: string) {
  if (!hotel) return null

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.property_name_ko || hotel.property_name_en,
    "description": hotel.description_ko || hotel.description_en,
    "url": `https://select-hotels.com/hotel/${slug}`,
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

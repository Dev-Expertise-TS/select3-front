import { HotelCardData } from "@/components/shared/hotel-card"

// Supabase 호텔 데이터를 HotelCardData로 변환
export function transformHotelToCardData(
  hotel: any,
  imageUrl?: string,
  benefits?: string[]
): HotelCardData {
  return {
    sabre_id: hotel.sabre_id,
    property_name_kor: hotel.property_name_kor || hotel.property_name_eng || `호텔 ${hotel.sabre_id}`,
    city: hotel.city || hotel.city_kor || hotel.city_eng || '위치 정보 없음',
    property_address: hotel.property_address || '주소 정보 없음',
    image: imageUrl || hotel.image_1 || '/placeholder.svg',
    benefits: benefits || [
      hotel.benefit,
      hotel.benefit_1,
      hotel.benefit_2,
      hotel.benefit_3,
      hotel.benefit_4,
      hotel.benefit_5,
      hotel.benefit_6
    ].filter(Boolean),
    slug: hotel.slug,
    rating: hotel.rating,
    price: hotel.price,
    original_price: hotel.original_price,
    badge: hotel.badge || hotel.badge_1,
    isPromotion: false
  }
}

// 프로모션 호텔 데이터 변환
export function transformPromotionHotelToCardData(
  hotel: any,
  imageUrl?: string,
  benefits?: string[]
): HotelCardData {
  return {
    ...transformHotelToCardData(hotel, imageUrl, benefits),
    isPromotion: true
  }
}

// 호텔 목록을 카드 데이터로 일괄 변환
export function transformHotelsToCardData(
  hotels: any[],
  mediaData?: any[],
  isPromotion: boolean = false
): HotelCardData[] {
  return hotels.map(hotel => {
    // 해당 호텔의 이미지 찾기
    const media = mediaData?.find(m => m.sabre_id === hotel.sabre_id)
    const imageUrl = media?.media_path || hotel.image_1 || '/placeholder.svg'
    
    // 혜택 정보 정리
    const benefits = [
      hotel.benefit,
      hotel.benefit_1,
      hotel.benefit_2,
      hotel.benefit_3,
      hotel.benefit_4,
      hotel.benefit_5,
      hotel.benefit_6
    ].filter(Boolean)
    
    if (isPromotion) {
      return transformPromotionHotelToCardData(hotel, imageUrl, benefits)
    }
    
    return transformHotelToCardData(hotel, imageUrl, benefits)
  })
}

// 호텔 검색 결과를 카드 데이터로 변환
export function transformSearchResultsToCardData(
  searchResults: any[],
  mediaData?: any[]
): HotelCardData[] {
  return transformHotelsToCardData(searchResults, mediaData, false)
}

// 호텔 필터링 및 정렬 유틸리티
export function filterAndSortHotels(
  hotels: HotelCardData[],
  filters: {
    city?: string
    minRating?: number
    maxPrice?: number
    hasBenefits?: boolean
  } = {},
  sortBy: 'name' | 'rating' | 'price' | 'city' = 'name'
): HotelCardData[] {
  let filteredHotels = [...hotels]
  
  // 도시 필터
  if (filters.city) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.city.toLowerCase().includes(filters.city!.toLowerCase())
    )
  }
  
  // 최소 평점 필터
  if (filters.minRating && filters.minRating > 0) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.rating && hotel.rating >= filters.minRating!
    )
  }
  
  // 최대 가격 필터
  if (filters.maxPrice && filters.maxPrice > 0) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.price && hotel.price <= filters.maxPrice!
    )
  }
  
  // 혜택 보유 필터
  if (filters.hasBenefits) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.benefits && hotel.benefits.length > 0
    )
  }
  
  // 정렬
  switch (sortBy) {
    case 'name':
      filteredHotels.sort((a, b) => a.property_name_kor.localeCompare(b.property_name_kor))
      break
    case 'rating':
      filteredHotels.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      break
    case 'price':
      filteredHotels.sort((a, b) => (a.price || 0) - (b.price || 0))
      break
    case 'city':
      filteredHotels.sort((a, b) => a.city.localeCompare(b.city))
      break
  }
  
  return filteredHotels
}

// 호텔 데이터 검증
export function validateHotelData(hotel: any): boolean {
  return !!(
    hotel.sabre_id &&
    (hotel.property_name_kor || hotel.property_name_eng) &&
    hotel.city
  )
}

// 호텔 이미지 URL 검증
export function validateImageUrl(url: string): boolean {
  if (!url) return false
  if (url === '/placeholder.svg') return true
  
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

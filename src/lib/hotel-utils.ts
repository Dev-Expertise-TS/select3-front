import { HotelCardData } from "@/components/shared/hotel-card"

// property_name_kor을 기반으로 slug 생성
export function generateSlug(propertyName: string): string {
  return propertyName
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-') // 한글, 영문, 숫자만 유지하고 나머지는 하이픈으로
    .replace(/-+/g, '-') // 연속된 하이픈을 하나로
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
}

// Supabase 호텔 데이터를 HotelCardData로 변환
export function transformHotelToCardData(
  hotel: any,
  imageUrl?: string,
  benefits?: string[]
): HotelCardData {
  // slug 사용: 기존 slug가 있으면 사용, 없으면 undefined
  const slug = hotel.slug || undefined
  
  return {
    sabre_id: hotel.sabre_id,
    property_name_ko: hotel.property_name_ko || hotel.property_name_en || `호텔 ${hotel.sabre_id}`,
    property_name_en: hotel.property_name_en || undefined,
    city: hotel.city || hotel.city_ko || hotel.city_en || '위치 정보 없음',
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
    slug: slug,
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

// 전체보기용 호텔 데이터 타입 (HotelCardAllViewData와 동일)
export interface HotelCardAllViewData {
  sabre_id: number
  property_name_ko: string
  property_name_en?: string
  city: string
  city_ko?: string
  property_address: string
  image: string
  benefits: string[]
  slug?: string
  rating?: number
  price?: number
  original_price?: number
  badge?: string
  isPromotion?: boolean
  // 전체보기용 추가 필드
  country_ko?: string
  country_en?: string
  chain?: string
  benefit_1?: string
  benefit_2?: string
  benefit_3?: string
  benefit_4?: string
  benefit_5?: string
  benefit_6?: string
}

// 전체보기용 호텔 데이터 변환 함수
export function transformHotelToAllViewCardData(
  hotel: any,
  imageUrl?: string
): HotelCardAllViewData {
  const slug = hotel.slug || undefined
  
  return {
    sabre_id: hotel.sabre_id,
    property_name_ko: hotel.property_name_ko || hotel.property_name_en || `호텔 ${hotel.sabre_id}`,
    property_name_en: hotel.property_name_en || undefined,
    city: hotel.city || hotel.city_ko || hotel.city_en || '위치 정보 없음',
    city_ko: hotel.city_ko || undefined,
    property_address: hotel.property_address || '주소 정보 없음',
    image: imageUrl || hotel.image_1 || '/placeholder.svg',
    benefits: [
      hotel.benefit,
      hotel.benefit_1,
      hotel.benefit_2,
      hotel.benefit_3,
      hotel.benefit_4,
      hotel.benefit_5,
      hotel.benefit_6
    ].filter(Boolean),
    slug: slug,
    rating: hotel.rating,
    price: hotel.price,
    original_price: hotel.original_price,
    badge: hotel.badge || hotel.badge_1,
    isPromotion: false,
    // 전체보기용 추가 필드
    country_ko: hotel.country_ko || undefined,
    country_en: hotel.country_en || undefined,
    chain: hotel.chain_ko || hotel.chain_en || undefined,
    benefit_1: hotel.benefit_1 || undefined,
    benefit_2: hotel.benefit_2 || undefined,
    benefit_3: hotel.benefit_3 || undefined,
    benefit_4: hotel.benefit_4 || undefined,
    benefit_5: hotel.benefit_5 || undefined,
    benefit_6: hotel.benefit_6 || undefined
  }
}

// 전체보기용 호텔 목록을 카드 데이터로 일괄 변환
export function transformHotelsToAllViewCardData(
  hotels: any[],
  mediaData?: any[]
): HotelCardAllViewData[] {
  return hotels.map(hotel => {
    // 해당 호텔의 이미지 찾기
    const media = mediaData?.find(m => m.sabre_id === hotel.sabre_id)
    const imageUrl = media?.media_path || hotel.image_1 || '/placeholder.svg'
    
    return transformHotelToAllViewCardData(hotel, imageUrl)
  })
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
      filteredHotels.sort((a, b) => a.property_name_ko.localeCompare(b.property_name_ko))
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
    (hotel.property_name_ko || hotel.property_name_en) &&
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

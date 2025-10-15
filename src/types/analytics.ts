// Google Analytics 이벤트 타입 정의
export interface GAEvent {
  action: string
  category: string
  label?: string
  value?: number
}

// 호텔 관련 Analytics 이벤트
export interface HotelAnalyticsEvent {
  hotelName: string
  hotelId: string
  location?: string
  price?: number
}

// 검색 관련 Analytics 이벤트
export interface SearchAnalyticsEvent {
  searchTerm: string
  resultsCount: number
  filters?: {
    city?: string
    country?: string
    brand?: string
    chain?: string
  }
}

// 전환 관련 Analytics 이벤트
export interface ConversionAnalyticsEvent {
  conversionType: 'kakao_consultation' | 'hotel_inquiry' | 'booking_inquiry' | 'contact_form'
  source: 'hotel_detail' | 'search_results' | 'banner' | 'footer'
  hotelId?: string
  hotelName?: string
}

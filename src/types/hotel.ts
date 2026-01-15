// Hotel 관련 기본 타입 정의
export interface Hotel {
  id: number
  sabre_id: string
  name_ko: string
  name_en: string
  city_ko: string
  city_en: string
  city: string
  country_ko: string
  country_en: string
  country: string
  description_ko: string
  description_en: string
  address_ko: string
  address_en: string
  phone: string
  email: string
  website: string
  latitude: number | null
  longitude: number | null
  star_rating: number | null
  brand_id: number | null
  brand_id_2?: number | null
  brand_id_3?: number | null
  chain_id: number | null
  slug: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 브랜드 타입
export interface HotelBrand {
  brand_id: number
  brand_name_ko: string
  brand_name_en: string
  brand_description_ko?: string
  brand_description_en?: string
  brand_logo?: string
  brand_website?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 체인 타입
export interface HotelChain {
  chain_id: number
  chain_name_ko: string
  chain_name_en: string
  chain_description_ko?: string
  chain_description_en?: string
  chain_logo?: string
  chain_website?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 미디어 타입
export interface HotelMedia {
  id: number
  hotel_id: number
  media_type: 'image' | 'video'
  media_url: string
  media_alt?: string
  media_caption?: string
  sort_order: number
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 혜택 타입
export interface HotelBenefit {
  id: number
  benefit_id: number
  name_ko: string
  name_en: string
  description_ko?: string
  description_en?: string
  icon?: string
  sort: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 프로모션 타입
export interface HotelPromotion {
  id: number
  promotion_id: number
  title_ko: string
  title_en: string
  description_ko?: string
  description_en?: string
  discount_percentage?: number
  discount_amount?: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 블로그 타입
export interface HotelBlog {
  id: number
  blog_id: number
  title_ko: string
  title_en: string
  content_ko: string
  content_en: string
  excerpt_ko?: string
  excerpt_en?: string
  featured_image?: string
  slug: string
  published_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// 호텔 상세 정보 타입 (관계 포함)
export interface HotelDetail extends Hotel {
  hotel_brands?: HotelBrand
  hotel_chains?: HotelChain
  hotel_media?: HotelMedia[]
  hotel_benefits?: HotelBenefit[]
  hotel_promotions?: HotelPromotion[]
  hotel_blogs?: HotelBlog[]
}

// 호텔 검색 결과 타입
export interface HotelSearchResult {
  hotels: HotelDetail[]
  total_count: number
  page: number
  page_size: number
  has_more: boolean
}

// 호텔 검색 파라미터 타입
export interface HotelSearchParams {
  query?: string
  city?: string
  country?: string
  brand_id?: number
  chain_id?: number
  check_in?: string
  check_out?: string
  guests?: number
  page?: number
  page_size?: number
  sort_by?: 'name' | 'rating' | 'price'
  sort_order?: 'asc' | 'desc'
}

// 호텔 필터 타입
export interface HotelFilters {
  city: string
  country: string
  brand: string
  chain: string
}

// 필터 옵션 타입
export interface FilterOption {
  id: string
  label: string
  count: number
  chain_id?: number | null
  chain_name_ko?: string | null
}

// 필터 데이터 타입
export interface FilterData {
  countries: FilterOption[]
  cities: FilterOption[]
  brands: FilterOption[]
  chains: FilterOption[]
}

// API 응답 타입들
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
  page?: number
  page_size?: number
  has_more?: boolean
}

// 호텔 상세 API 응답
export type HotelDetailsApiResponse = ApiResponse<HotelDetail>

// 호텔 검색 API 응답
export type HotelSearchApiResponse = ApiResponse<HotelSearchResult>

// 호텔 목록 API 응답
export type HotelListApiResponse = ApiResponse<HotelDetail[]>

// 필터 옵션 API 응답
export type FilterOptionsApiResponse = ApiResponse<FilterData>

// Rate Plan 관련 타입들
export interface RatePlanCode {
  RateKey: string
  RoomType: string
  RoomName: string
  Description: string
  RoomViewDescription?: string
  Currency: string
  AmountAfterTax: number
  AmountBeforeTax: number
  AverageNightlyRate: number
  StartDate: string
  EndDate: string
  RoomTypeCode: string
  BookingCode: string
  ProductCode?: string
  RatePlanDescription: string
  RatePlanType: string
  RateDescription: string
  PlanDescription: string
  CancellationPolicy: string
  DiscountAmount?: number
  _original?: any
}

// Rate Plan API 응답
export type RatePlansApiResponse = ApiResponse<RatePlanCode[]>

// Rate Plan Codes API 응답
export type RatePlanCodesApiResponse = ApiResponse<string[]>
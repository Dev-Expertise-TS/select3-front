// 검색 관련 타입 정의
export interface SearchParams {
  query: string
  checkIn?: string
  checkOut?: string
  guests?: {
    rooms: number
    adults: number
  }
}

// 검색 결과 타입
export interface SearchResult<T = any> {
  data: T[]
  total_count: number
  page: number
  page_size: number
  has_more: boolean
  query: string
  filters?: any
}

// 검색 상태 타입
export interface SearchState {
  query: string
  isLoading: boolean
  error: string | null
  results: any[]
  total_count: number
  page: number
  has_more: boolean
}

// 검색 필터 타입
export interface SearchFilters {
  city: string
  country: string
  brand: string
  chain: string
  price_min?: number
  price_max?: number
  star_rating?: number[]
  amenities?: string[]
}

// 검색 정렬 타입
export interface SearchSort {
  field: 'name' | 'rating' | 'price' | 'distance'
  order: 'asc' | 'desc'
}

// 검색 UI 상태 타입
export interface SearchUIState {
  isFilterOpen: boolean
  isSortOpen: boolean
  viewMode: 'grid' | 'list'
  isLoadingMore: boolean
  selectedItems: string[]
}

// 검색 히스토리 타입
export interface SearchHistory {
  id: string
  query: string
  filters: SearchFilters
  timestamp: string
  result_count: number
}

// 검색 제안 타입
export interface SearchSuggestion {
  id: string
  text: string
  type: 'hotel' | 'city' | 'country' | 'brand' | 'chain'
  count?: number
  metadata?: any
}

// 검색 자동완성 타입
export interface SearchAutocomplete {
  suggestions: SearchSuggestion[]
  query: string
  total_count: number
}

// 검색 분석 타입
export interface SearchAnalytics {
  query: string
  filters: SearchFilters
  result_count: number
  click_count: number
  conversion_count: number
  timestamp: string
  session_id: string
  user_id?: string
}

// 검색 성능 메트릭 타입
export interface SearchMetrics {
  query_time: number
  result_count: number
  cache_hit: boolean
  api_calls: number
  error_count: number
  timestamp: string
}

// 검색 설정 타입
export interface SearchConfig {
  default_page_size: number
  max_page_size: number
  cache_ttl: number
  debounce_delay: number
  max_suggestions: number
  enable_analytics: boolean
  enable_autocomplete: boolean
  enable_filters: boolean
  enable_sorting: boolean
}

// 검색 훅 반환 타입
export interface UseSearchReturn<T = any> {
  // 상태
  query: string
  isLoading: boolean
  error: string | null
  results: T[]
  total_count: number
  page: number
  has_more: boolean
  
  // 함수
  search: (query: string, filters?: SearchFilters) => Promise<void>
  loadMore: () => Promise<void>
  clearResults: () => void
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  setSort: (sort: SearchSort) => void
  
  // UI 상태
  isFilterOpen: boolean
  isSortOpen: boolean
  viewMode: 'grid' | 'list'
  isLoadingMore: boolean
  
  // UI 함수
  toggleFilter: () => void
  toggleSort: () => void
  changeViewMode: (mode: 'grid' | 'list') => void
  setLoadingMore: (loading: boolean) => void
}

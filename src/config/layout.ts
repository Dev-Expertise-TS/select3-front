/**
 * 레이아웃 관련 공통 설정
 * 모든 컴포넌트에서 사용하는 레이아웃 설정을 중앙 관리
 */

// 호텔 카드 관련 설정
export const HOTEL_CARD_CONFIG = {
  // 카드 높이 설정
  HEIGHT: {
    DEFAULT: 480, // 기본 카드 높이 (px)
  },
  
  // 프로모션 박스 설정
  PROMOTION_BOX: {
    HEIGHT: 60, // 프로모션 박스 높이 (px)
    TEXT_HEIGHT: 32, // 프로모션 텍스트 영역 높이 (px)
  },
  
  // 이미지 aspect ratio 설정
  IMAGE_ASPECT: {
    DEFAULT: "aspect-[4/3] h-48",
    FEATURED: "aspect-[4/3] h-52", 
    COMPACT: "aspect-[3/2] h-40",
    PROMOTION: "aspect-[4/3] h-48"
  },
  
  // 그리드 컬럼 설정
  GRID_COLUMNS: {
    THREE: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    FOUR: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }
} as const

// 히어로 캐로셀 관련 설정
export const HERO_CONFIG = {
  // 기본 호텔 개수 설정
  DEFAULT_HOTEL_COUNT: 3,
  
  // 자동 슬라이드 간격 (ms)
  AUTO_SLIDE_INTERVAL: 5000,
  
  // 이미지 새로고침 지연 (ms)
  IMAGE_REFRESH_DELAY: 100
} as const

// 프로모션 섹션 관련 설정
export const PROMOTION_CONFIG = {
  // 기본 호텔 개수 설정
  DEFAULT_HOTEL_COUNT: 3,
  
  // 데이터베이스 조회 제한
  DATABASE_LIMIT: 3,
  
  // 캐시 시간 (ms)
  CACHE_TIME: 5 * 60 * 1000 // 5분
} as const

// 호텔 그리드 관련 설정
export const HOTEL_GRID_CONFIG = {
  // 기본 컬럼 수
  DEFAULT_COLUMNS: 4,
  
  // 기본 간격
  DEFAULT_GAP: "md",
  
  // 기본 스켈레톤 개수
  DEFAULT_SKELETON_COUNT: 4,
  
  // 3개 그리드 스켈레톤 개수
  THREE_GRID_SKELETON_COUNT: 3
} as const

// 검색 결과 관련 설정
export const SEARCH_RESULTS_CONFIG = {
  // 초기 표시 개수
  INITIAL_DISPLAY_COUNT: 12,
  
  // 더보기 시 추가 개수
  LOAD_MORE_COUNT: 12,
  
  // 캐시 시간 (ms)
  CACHE_TIME: 5 * 60 * 1000 // 5분
} as const

// 배너 관련 설정
export const BANNER_CONFIG = {
  // 캐시 시간 (ms)
  CACHE_TIME: 10 * 60 * 1000, // 10분
  
  // 데이터베이스 조회 제한
  DATABASE_LIMIT: 50
} as const

// 타입 정의
export type HotelCount = 3 | 4
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6
export type GridGap = 'sm' | 'md' | 'lg' | 'xl'
export type CardVariant = 'default' | 'featured' | 'compact' | 'promotion'

import { getHeroImages } from './hero-data'
import { HeroCarousel3Client } from '@/components/shared/hero-carousel-3-client'
import { HERO_CONFIG, type HotelCount } from '@/config/layout'

interface HeroProps {
  hotelCount?: HotelCount
}

/**
 * 히어로 섹션 (서버 컴포넌트)
 * 
 * 성능 최적화:
 * - 서버에서 모든 데이터 조회 (5개 테이블)
 * - 클라이언트 API 호출 제거 (1-2초 절약)
 * - 즉시 이미지 표시 (빠른 LCP)
 */
export async function HeroServer({ hotelCount = HERO_CONFIG.DEFAULT_HOTEL_COUNT }: HeroProps) {
  const heroImages = await getHeroImages()
  
  // 현재는 3개 카드만 지원
  return <HeroCarousel3Client heroImages={heroImages} />
}


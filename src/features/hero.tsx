"use client"

import { useHeroImages } from "@/hooks/use-hero-images"
import { HeroCarousel3 } from "@/components/shared/hero-carousel-3"
import { HeroCarousel4 } from "@/components/shared/hero-carousel-4"
import { HERO_CONFIG, type HotelCount } from "@/config/layout"

interface HeroProps {
  hotelCount?: HotelCount // 호텔 개수 설정
}

export function Hero({ hotelCount = HERO_CONFIG.DEFAULT_HOTEL_COUNT }: HeroProps) {
  const { data: heroImages } = useHeroImages()
  
  // 호텔 개수에 따라 적절한 컴포넌트 렌더링
  if (hotelCount === 3) {
    return <HeroCarousel3 />
  }
  
  return <HeroCarousel4 />
}

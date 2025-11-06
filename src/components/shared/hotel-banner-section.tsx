"use client"

import { HotelAdBanner } from './hotel-ad-banner'
import { SectionContainer } from "@/components/shared/section-container"

interface HotelBannerSectionProps {
  bannerHotel: {
    sabre_id: number
    slug: string
    property_name_ko: string
    property_name_en: string
    city: string
    city_ko?: string
    media_path?: string
    image_1?: string
    brand_name_en?: string | null
    chain_name_en?: string | null
  } | null
  isBannerLoading: boolean
  className?: string
}

export function HotelBannerSection({ 
  bannerHotel, 
  isBannerLoading, 
  className 
}: HotelBannerSectionProps) {
  if (!bannerHotel || isBannerLoading) {
    return null
  }

  return (
    <section className={`py-[10px] ${className || ''}`}>
      <SectionContainer>
        <HotelAdBanner hotel={bannerHotel} />
      </SectionContainer>
    </section>
  )
}

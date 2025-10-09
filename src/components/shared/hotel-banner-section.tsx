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
    benefit?: string
    benefit_1?: string
    benefit_2?: string
    benefit_3?: string
    benefit_4?: string
    benefit_5?: string
    benefit_6?: string
    media_path?: string
    image_1?: string
    brand_name_en?: string | null
    chain_name_en?: string | null
  } | null
  isBannerLoading: boolean
  copywriter?: string
  className?: string
}

export function HotelBannerSection({ 
  bannerHotel, 
  isBannerLoading, 
  copywriter,
  className 
}: HotelBannerSectionProps) {
  if (!bannerHotel || isBannerLoading) {
    return null
  }

  return (
    <section className={`py-4 sm:py-8 ${className || ''}`}>
      <SectionContainer>
        <HotelAdBanner 
          hotel={bannerHotel}
          copywriter={copywriter}
        />
      </SectionContainer>
    </section>
  )
}

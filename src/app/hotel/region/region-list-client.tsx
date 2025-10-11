"use client"

import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { CityCard } from "@/components/shared/city-card"

interface Region {
  city_code: string
  city_ko: string
  city_en: string | null
  city_slug: string | null
  country_ko: string | null
  city_sort_order: number
}

interface RegionListClientProps {
  regions: Region[]
  cityImages: Record<string, string>  // 서버에서 미리 가져온 이미지 URL
}

export function RegionListClient({ regions, cityImages }: RegionListClientProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      
      <main>
        {/* Page Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto max-w-[1440px] px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              지역별 호텔 & 리조트
            </h1>
            <p className="text-gray-600">
              전 세계 {regions.length}개 주요 도시의 프리미엄 호텔을 찾아보세요
            </p>
          </div>
        </div>

        {/* Region Grid */}
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {regions.map((region, index) => {
                // 필터 파라미터 생성 (city_code 사용)
                const filterParams = new URLSearchParams({
                  city: region.city_code, // city_code를 필터 ID로 사용
                })
                
                return (
                  <CityCard
                    key={`${region.city_code}-${index}`}  // 중복 방지: city_code + index
                    cityCode={region.city_code}
                    cityKo={region.city_ko}
                    cityEn={region.city_en}
                    countryKo={region.country_ko}
                    href={`/hotel?${filterParams.toString()}`}
                    preloadedImageUrl={cityImages[region.city_code]}  // 서버에서 미리 가져온 이미지
                    priority={index < 8}  // 첫 8개는 우선 로딩
                  />
                )
              })}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  )
}


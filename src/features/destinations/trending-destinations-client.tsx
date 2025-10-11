"use client"

import Link from "next/link"
import { CityCard } from "@/components/shared/city-card"

interface Destination {
  city_code: string
  city_ko: string
  city_en: string | null
  city_slug: string | null
  country_ko: string | null
  country_en: string | null
  city_sort_order: number
}

interface TrendingDestinationsClientProps {
  destinations: Destination[]
  cityImages: Record<string, string>  // 서버에서 미리 가져온 이미지 URL
}

export function TrendingDestinationsClient({ 
  destinations, 
  cityImages 
}: TrendingDestinationsClientProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto max-w-[1440px] px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Immerse yourself in trending destinations
          </h2>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {destinations.map((destination, index) => {
            // 필터 파라미터 생성 (city_code 사용)
            const filterParams = new URLSearchParams({
              city: destination.city_code, // city_code를 필터 ID로 사용
            })
            
            return (
              <CityCard
                key={`${destination.city_code}-${index}`}  // 중복 방지
                cityCode={destination.city_code}
                cityKo={destination.city_ko}
                cityEn={destination.city_en}
                countryKo={destination.country_ko}
                href={`/hotel?${filterParams.toString()}`}
                preloadedImageUrl={cityImages[destination.city_code]}  // ⚡ 서버에서 미리 가져온 이미지
                priority={index < 4}  // 첫 4개는 우선 로딩
              />
            )
          })}
        </div>

        {/* 더 보기 버튼 */}
        <div className="text-center mt-8">
          <Link
            href="/hotel/region"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            지역 더 보기
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}


"use client"

import Image from "next/image"
import { Header } from "@/components/header"
import { PromotionBannerWrapper } from "@/components/promotion-banner-wrapper"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { CityCard } from "@/components/shared/city-card"

interface Region {
  city_code: string
  city_ko: string
  city_en: string | null
  city_slug: string | null
  country_code: string | null
  country_ko: string | null
  country_en: string | null
  continent_ko: string | null
  continent_en: string | null
  city_sort_order: number
  country_sort_order: number | null
}

interface RegionListClientProps {
  regions: Region[]
  cityImages: Record<string, string>  // 서버에서 미리 가져온 이미지 URL
  hotelCounts: Record<string, number> // 서버에서 미리 집계한 호텔 개수
}

/**
 * 국가 코드를 국기 이미지 URL로 변환
 * @param countryCode ISO 3166-1 alpha-2 코드 (예: "KR", "JP", "TH")
 */
function getCountryFlagUrl(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return ''
  
  // flagcdn.com CDN 사용 (무료, 고품질 SVG 국기 이미지)
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`
}

/**
 * 대륙별로 도시를 그룹화
 */
function groupByContinent(regions: Region[]) {
  const grouped = new Map<string, Map<string, { 
    country_ko: string
    country_en: string | null
    country_code: string | null
    cities: Region[] 
  }>>()
  
  regions.forEach(region => {
    const continent = region.continent_ko || '기타'
    const country = region.country_ko || '기타'
    
    if (!grouped.has(continent)) {
      grouped.set(continent, new Map())
    }
    
    const continentGroup = grouped.get(continent)!
    if (!continentGroup.has(country)) {
      continentGroup.set(country, {
        country_ko: region.country_ko || '기타',
        country_en: region.country_en,
        country_code: region.country_code,
        cities: []
      })
    }
    
    continentGroup.get(country)!.cities.push(region)
  })
  
  return grouped
}

export function RegionListClient({ regions, cityImages, hotelCounts }: RegionListClientProps) {
  const groupedRegions = groupByContinent(regions)
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBannerWrapper>
        <main>
        {/* Page Header */}
        <div className="bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              지역별 호텔 & 리조트
            </h1>
            <p className="text-gray-600">
              전 세계 {regions.length}개 주요 도시의 프리미엄 호텔을 찾아보세요
            </p>
          </div>
        </div>

        {/* Region Grid - 대륙/국가별 그룹화 */}
        <div className="bg-gray-50 pt-4 pb-12">
          <div className="container mx-auto max-w-[1440px] px-4 space-y-12">
            {Array.from(groupedRegions.entries()).map(([continentName, countries]) => (
              <div key={continentName}>
                {/* 대륙 제목 */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-600">
                  {continentName}
                </h2>
                
                {/* 국가별 섹션 */}
                <div className="space-y-8">
                  {Array.from(countries.entries()).map(([countryName, countryData]) => (
                    <div key={`${continentName}-${countryName}`}>
                      {/* 국가 제목 */}
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        {/* 국기 이미지 */}
                        {countryData.country_code && (
                          <div className="relative w-8 h-6 mr-3 rounded shadow-sm overflow-hidden">
                            <Image
                              src={getCountryFlagUrl(countryData.country_code)}
                              alt={`${countryData.country_ko} 국기`}
                              fill
                              className="object-cover"
                              sizes="32px"
                              unoptimized
                            />
                          </div>
                        )}
                        {/* 한글 국가명 */}
                        <span>{countryData.country_ko}</span>
                        {/* 영문 국가명 (동일한 스타일) */}
                        {countryData.country_en && (
                          <span className="ml-3">
                            {countryData.country_en}
                          </span>
                        )}
                      </h3>
                      
                      {/* 도시 카드 그리드 */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                        {countryData.cities.map((region, index) => {
                          // city_slug가 있으면 새 경로 방식, 없으면 기존 쿼리 방식 (fallback)
                          const href = region.city_slug 
                            ? `/hotel/${region.city_slug}`
                            : `/hotel?city=${region.city_code}`
                          
                          return (
                            <CityCard
                              key={`${region.city_code}-${index}`}
                              cityCode={region.city_code}
                              cityKo={region.city_ko}
                              cityEn={region.city_en}
                              countryKo={region.country_ko}
                              href={href}
                              preloadedImageUrl={cityImages[region.city_code]}
                              priority={index < 12}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        </main>
      </PromotionBannerWrapper>
      
      <Footer />
      <ScrollToTop />
    </div>
  )
}


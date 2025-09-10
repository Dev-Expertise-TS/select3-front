'use client'

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BrandHotelCard } from "@/components/shared/brand-hotel-card"
import { ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/hotel-utils"

interface Hotel {
  id: number
  name: string
  nameKo?: string
  location: string
  address: string
  image: string
  rating: number
  price: string
  brand?: string
  chain?: string
  slug?: string // slug 정보 추가
  benefits: Array<{
    icon: any
    text: string
  }>
  promotion: {
    title: string
    bookingDeadline: string
    stayPeriod: string
    highlight: string
  }
}

// 링크 경로 생성 함수 (검색 컴포넌트와 동일한 로직)
function makeHotelHref(hotel: Hotel) {
  // 데이터베이스의 실제 slug가 있으면 사용, 없으면 호텔명으로 생성
  const slug = hotel.slug || generateSlug(hotel.nameKo || hotel.name)
  return `/hotel/${slug}`
}

interface BrandHotelsClientProps {
  hotels: Hotel[]
  displayName: string
  allChains: Array<{ chain_id: number; chain_name_en: string; chain_name_kr?: string; slug: string }>
  selectedChainBrands: Array<{ brand_id: number; brand_name_en: string; brand_name_kr?: string }>
}

export function BrandHotelsClient({ hotels, displayName, allChains, selectedChainBrands }: BrandHotelsClientProps) {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedBrand, setSelectedBrand] = useState<string>("all")

  // 첫 6개 이미지 preload
  useEffect(() => {
    const priorityImages = hotels.slice(0, 6).map(hotel => hotel.image)
    
    priorityImages.forEach(imageUrl => {
      if (imageUrl && imageUrl !== '/placeholder.svg') {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = imageUrl
        document.head.appendChild(link)
      }
    })

    // cleanup function
    return () => {
      priorityImages.forEach(imageUrl => {
        if (imageUrl && imageUrl !== '/placeholder.svg') {
          const existingLink = document.querySelector(`link[href="${imageUrl}"]`)
          if (existingLink) {
            document.head.removeChild(existingLink)
          }
        }
      })
    }
  }, [hotels])

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(hotels.map((hotel) => hotel.location)))
    return uniqueCities.sort()
  }, [hotels])

  // 현재 체인에 속한 브랜드들 표시
  const availableBrands = useMemo(() => {
    return selectedChainBrands.map(brand => brand.brand_name_en).sort()
  }, [selectedChainBrands])

  // 현재 선택된 체인의 한국어 이름
  const currentChainName = useMemo(() => {
    const currentChain = allChains.find(chain => chain.chain_name_en === displayName)
    return currentChain?.chain_name_kr || currentChain?.chain_name_en || displayName
  }, [allChains, displayName])

  const filteredHotels = useMemo(() => {
    let filtered = hotels

    if (selectedCity !== "all") {
      filtered = filtered.filter((hotel) => hotel.location === selectedCity)
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter((hotel) => hotel.brand === selectedBrand)
    }

    return filtered
  }, [hotels, selectedCity, selectedBrand])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-[1440px] px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-1" />
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName}</h1>
              <p className="text-gray-600">
                {filteredHotels.length}개의 {displayName}의 체인 브랜드를 만나보세요
              </p>
              
              {/* 필터 상태 표시 */}
              {(selectedCity !== "all" || selectedBrand !== "all") && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">적용된 필터:</span>
                  {selectedCity !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      도시: {selectedCity}
                    </span>
                  )}
                  {selectedBrand !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      브랜드: {selectedBrand}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCity("all")
                      setSelectedBrand("all")
                    }}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    모든 필터 초기화
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 space-y-6">
                {/* 체인 선택 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    체인 선택
                  </h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 mb-2">
                      현재: <span className="font-medium text-blue-600">{currentChainName}</span>
                    </div>
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          // 체인 변경 시 즉시 페이지 이동
                          router.push(`/chain/${e.target.value}`)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                    >
                      <option value="">다른 체인 선택...</option>
                      {allChains
                        .filter(chain => chain.slug !== '') // 빈 slug 제외
                        .sort((a, b) => (a.chain_name_kr || a.chain_name_en).localeCompare(b.chain_name_kr || b.chain_name_en))
                        .map((chain) => (
                          <option key={chain.chain_id} value={chain.slug}>
                            {chain.chain_name_kr || chain.chain_name_en}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* 도시별 필터 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    도시별 필터
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCity("all")}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCity === "all" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      전체 ({hotels.length})
                    </button>
                    {cities.map((city) => {
                      const cityCount = hotels.filter((hotel) => hotel.location === city).length
                      return (
                        <button
                          key={city}
                          onClick={() => setSelectedCity(city)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCity === city
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {city} ({cityCount})
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 브랜드별 필터 */}
                {availableBrands.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      브랜드별 필터
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedBrand("all")}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedBrand === "all" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        전체 ({hotels.length})
                      </button>
                      {availableBrands.map((brand) => {
                        const brandCount = hotels.filter((hotel) => hotel.brand === brand).length
                        return (
                          <button
                            key={brand}
                            onClick={() => setSelectedBrand(brand || "all")}
                            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                              selectedBrand === brand
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {brand} ({brandCount})
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {filteredHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel, index) => (
                    <BrandHotelCard
                      key={hotel.id}
                      href={makeHotelHref(hotel)}
                      image={hotel.image}
                      name={hotel.name}
                      nameKo={hotel.nameKo}
                      city={hotel.location}
                      address={hotel.address}
                      brandLabel={hotel.brand || hotel.promotion?.title || undefined}
                      priority={index < 6} // 첫 6개 이미지는 우선 로딩
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  {hotels.length === 0 ? (
                    <div className="max-w-md mx-auto">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">호텔이 없습니다</h3>
                      <p className="text-gray-600 mb-4">
                        현재 {displayName} 체인에 속한 호텔이 등록되어 있지 않습니다.
                      </p>
                      <p className="text-sm text-gray-500">
                        새로운 호텔이 추가되면 여기에 표시됩니다.
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-lg">선택한 도시에 호텔이 없습니다.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

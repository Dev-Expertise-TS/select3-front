'use client'

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { BrandHotelCard } from "@/components/shared/brand-hotel-card"
import { ArrowLeft, MapPin } from "lucide-react"
import Link from "next/link"

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

// 링크 경로 생성 함수
function makeHotelHref(hotel: Hotel) {
  return `/hotel/hotel-${hotel.id}`
}

interface BrandHotelsClientProps {
  hotels: Hotel[]
  displayName: string
}

export function BrandHotelsClient({ hotels, displayName }: BrandHotelsClientProps) {
  const [selectedCity, setSelectedCity] = useState<string>("all")

  const cities = useMemo(() => {
    const uniqueCities = Array.from(new Set(hotels.map((hotel) => hotel.location)))
    return uniqueCities.sort()
  }, [hotels])

  const filteredHotels = useMemo(() => {
    if (selectedCity === "all") return hotels
    return hotels.filter((hotel) => hotel.location === selectedCity)
  }, [hotels, selectedCity])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b">
        <div className="container mx-auto max-w-[1200px] px-4 py-6">
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
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
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
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {filteredHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel) => (
                    <BrandHotelCard
                      key={hotel.id}
                      href={makeHotelHref(hotel)}
                      image={hotel.image}
                      name={hotel.name}
                      nameKo={hotel.nameKo}
                      city={hotel.location}
                      address={hotel.address}
                      brandLabel={hotel.brand || hotel.promotion?.title || undefined}
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

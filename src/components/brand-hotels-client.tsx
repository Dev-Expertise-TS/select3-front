'use client'

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { ArrowLeft, MapPin, Calendar, Gift, Clock, Coffee, Bed, CreditCard, Star, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Hotel {
  id: number
  name: string
  location: string
  address: string
  image: string
  rating: number
  price: string
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

interface BrandHotelsClientProps {
  hotels: Hotel[]
  displayName: string
}

export function BrandHotelsClient({ hotels, displayName }: BrandHotelsClientProps) {
  const [selectedCity, setSelectedCity] = useState<string>("all")

  // 아이콘 문자열을 실제 아이콘 컴포넌트로 매핑
  const iconMap: Record<string, any> = {
    Coffee,
    Bed,
    CreditCard,
    Clock,
    Zap,
    Star,
    Gift,
    MapPin,
    Calendar
  }

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{displayName} Hotels</h1>
              <p className="text-gray-600">
                {filteredHotels.length}개의 {displayName} 브랜드 호텔을 만나보세요
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
                    <Link key={hotel.id} href={`/hotel/${hotel.id}`}>
                      <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-0">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image
                            src={hotel.image || "/placeholder.svg"}
                            alt={`${hotel.name} - ${hotel.location}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{hotel.rating}</span>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {hotel.name}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {hotel.location}
                            </p>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-2xl font-bold text-blue-600">{hotel.price}</p>
                          </div>

                          <div className="mb-3">
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="font-medium text-blue-900 text-sm mb-2">{hotel.promotion.title}</h4>
                              <div className="space-y-1 text-xs text-blue-700">
                                <p>예약 마감: {hotel.promotion.bookingDeadline}</p>
                                <p>숙박 기간: {hotel.promotion.stayPeriod}</p>
                                <p className="font-medium">특별 혜택: {hotel.promotion.highlight}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {hotel.benefits.slice(0, 4).map((benefit, index) => {
                              const IconComponent = iconMap[benefit.icon]
                              return (
                                <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                  {IconComponent && <IconComponent className="h-3 w-3 text-blue-500" />}
                                  <span>{benefit.text}</span>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">선택한 도시에 호텔이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

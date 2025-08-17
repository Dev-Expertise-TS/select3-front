"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "./common-search-bar"
import { Star, MapPin, MessageCircle, Car, Utensils, Heart, ArrowLeft, Shield, Bed } from "lucide-react"
import { useState } from "react"

const hotel = {
  id: 1,
  name: "엔 호텔 하카타",
  englishName: "EN HOTEL Hakata",
  location: "Choeng Thale, Phuket, Thailand",
  address: "3 Chome-30-25 Hakata Ekimae, 하카타 구, 812-0011 후쿠오카시, 후쿠오카 현, 일본",
  image: "/twinpalms-surin-luxury-hotel.png",
  originalPrice: "97,503원",
  price: "94,384원",
  rating: 3,
  description: "하카타 구에 머무시는 동안 엔 호텔 하카타에서 경험하실 수 있는 모든 즐거움과 만나보세요.",
  benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit", "Late Checkout", "WiFi", "Spa Access"],
  category: "City Center",
  amenities: ["Free WiFi", "Valet Parking", "Fine Dining", "Fitness Center", "Spa & Wellness", "Concierge"],
  images: [
    "/hotels/resort-pool-view.png",
    "/hotels/ocean-view-suite.png",
    "/hotels/luxury-restaurant-dining.png",
    "/hotels/spa-wellness-center.png",
    "/hotels/hotel-lobby-entrance.png",
    "/hotels/beachfront-terrace.png",
  ],
  reviewScore: 8.8,
  reviewCount: 1020,
  totalPhotos: 135,
}

interface HotelDetailProps {
  hotelSlug: string
}

export function HotelDetail({ hotelSlug }: HotelDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("benefits")

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header with Back Button */}
      <div className="py-3">
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
              <ArrowLeft className="h-4 w-4 mr-1" />
              후쿠오카 모든 숙소
            </Button>
          </div>
        </div>
      </div>

      {/* Combined Hotel Info Header and Image Gallery */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Hotel Info Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
                  <div className="flex items-center">
                    {[...Array(hotel.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>
                <div className="text-gray-600 mb-2">{hotel.englishName}</div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{hotel.address}</span>
                  <Link href="#" className="text-blue-600 text-sm hover:underline ml-2">
                    지도에서 호텔보기
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500 line-through">{hotel.originalPrice}</div>
                  <div className="text-2xl font-bold text-gray-900">{hotel.price}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <span>💚</span>
                    <span>최저가 보장제</span>
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3">객실 선택</Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="flex gap-2 h-[400px] rounded-lg overflow-hidden">
              <div
                className="w-[60%] relative group cursor-pointer rounded-lg overflow-hidden"
                onClick={() => setSelectedImage(0)}
              >
                <Image
                  src={hotel.images[selectedImage] || "/placeholder.svg"}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {hotel.images.slice(1, 5).map((image, index) => (
                  <div
                    key={index + 1}
                    className="relative group cursor-pointer rounded-lg overflow-hidden"
                    onClick={() => setSelectedImage(index + 1)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Gallery ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                    {index === 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-lg font-bold">사진 모두보기</div>
                          <div className="text-sm">({hotel.totalPhotos}장)</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-8 border-b mb-6">
              <button
                onClick={() => setActiveTab("benefits")}
                className={`flex items-center gap-2 pb-3 font-semibold ${
                  activeTab === "benefits"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="text-xl">🏆</span>
                예약 혜택
              </button>
              <button
                onClick={() => setActiveTab("introduction")}
                className={`pb-3 font-semibold ${
                  activeTab === "introduction"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                호텔 소개
              </button>
              <button
                onClick={() => setActiveTab("transportation")}
                className={`pb-3 font-semibold ${
                  activeTab === "transportation"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                위치 및 교통
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "benefits" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Utensils className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="text-sm font-medium">2인 조식 무료 제공</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold text-sm">$</span>
                  </div>
                  <div className="text-sm font-medium">100$ 상당의 식음료 크레딧</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-sm font-medium">얼리 체크인, 레이트 체크아웃 (현장 가능시)</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bed className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium">객실 무료 업그레이드 (현장 가능시)</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="text-sm font-medium">글로벌 체인 멤버십 포인트 적립</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-sm font-medium">투숙 후 호텔에서 체크아웃 시 결제</div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="text-sm font-medium">전문 컨시어지를 통한 1:1 프라이빗 상담 예약</div>
                </div>
              </div>
            )}

            {activeTab === "introduction" && (
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold mb-3">엔 호텔 하카타 소개</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    하카타 구의 중심부에 위치한 엔 호텔 하카타는 현대적인 시설과 전통적인 일본의 환대 정신을 완벽하게
                    조화시킨 프리미엄 호텔입니다. JR 하카타역에서 도보로 5분 거리에 위치하여 교통이 매우 편리하며,
                    비즈니스와 레저 여행객 모두에게 최적의 선택입니다.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    모든 객실은 현대적인 디자인과 최신 편의시설을 갖추고 있으며, 편안한 휴식을 위한 프리미엄 침구류와
                    업무를 위한 넓은 데스크 공간을 제공합니다. 또한 무료 Wi-Fi와 스마트 TV 등 다양한 편의시설을 이용하실
                    수 있습니다.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">체크인/체크아웃</h5>
                      <p className="text-sm text-gray-600">체크인: 15:00 / 체크아웃: 11:00</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">언어 서비스</h5>
                      <p className="text-sm text-gray-600">일본어, 영어, 한국어</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transportation" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    교통편 안내
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">🚄 기차역</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>JR 하카타역</span>
                          <span className="text-blue-600 font-medium">도보 5분 (400m)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>지하철 하카타역</span>
                          <span className="text-blue-600 font-medium">도보 7분 (550m)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">✈️ 공항</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>후쿠오카 공항</span>
                          <span className="text-green-600 font-medium">지하철 11분</span>
                        </div>
                        <div className="flex justify-between">
                          <span>택시 이용시</span>
                          <span className="text-green-600 font-medium">약 15분 (4.6km)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-orange-900 mb-2">🚌 버스</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>하카타 버스터미널</span>
                          <span className="text-orange-600 font-medium">도보 8분</span>
                        </div>
                        <div className="flex justify-between">
                          <span>공항 리무진 버스</span>
                          <span className="text-orange-600 font-medium">하카타역 정류장 이용</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">🚗 자동차</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>주차장</span>
                          <span className="text-gray-600 font-medium">1박 1,500엔</span>
                        </div>
                        <div className="flex justify-between">
                          <span>발렛 파킹</span>
                          <span className="text-gray-600 font-medium">이용 가능</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1200px] px-4">
          <CommonSearchBar
            variant="hotel-detail"
            location="후쿠오카"
            checkIn="8월 16일(토)"
            checkOut="8월 17일(일)"
            guests="객실 1개, 성인 2명, 어린이 0명"
          />
        </div>
      </div>
    </div>
  )
}

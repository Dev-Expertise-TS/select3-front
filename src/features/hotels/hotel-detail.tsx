"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search"
import { Star, MapPin, MessageCircle, Car, Utensils, Heart, ArrowLeft, Shield, Bed } from "lucide-react"
import { useState } from "react"
import { useHotelBySlug, useHotelMedia } from "@/hooks/use-hotels"

interface HotelDetailProps {
  hotelSlug: string
}

export function HotelDetail({ hotelSlug }: HotelDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("benefits")
  
  // slug로 호텔 데이터 조회
  const { data: hotel, isLoading, error } = useHotelBySlug(hotelSlug)
  
  // 호텔 미디어 이미지 조회
  const { data: hotelMedia = [] } = useHotelMedia(hotel?.sabre_id || 0)

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-[1440px] px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error || !hotel) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-[1440px] px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">호텔을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-4">요청하신 호텔 정보를 불러올 수 없습니다.</p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header with Back Button */}
      <div className="py-3">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="flex items-center gap-3">
            <Link href={`/destination/${hotel.city_ko || hotel.city_eng || 'unknown'}`}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {hotel.city_ko || hotel.city_eng || '모든 숙소'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Combined Hotel Info Header and Image Gallery */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Hotel Info Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{hotel.property_name_ko || '호텔명'}</h1>
                  {hotel.property_name_en && (
                    <span className="text-2xl font-bold text-gray-900">({hotel.property_name_en})</span>
                  )}
                  <div className="flex items-center">
                    {hotel.rating && [...Array(hotel.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{hotel.property_address || '주소 정보 없음'}</span>
                  <Link href="#" className="text-blue-600 text-sm hover:underline ml-2">
                    지도에서 호텔보기
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="flex gap-2 h-[400px] rounded-lg overflow-hidden">
              <div
                className="w-[60%] relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                onClick={() => setSelectedImage(0)}
              >
                {hotelMedia.length > 0 ? (
                  <Image
                    src={hotelMedia[selectedImage]?.media_path || hotelMedia[0]?.media_path}
                    alt={hotel.property_name_ko || '호텔 이미지'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">📷</div>
                      <div className="text-sm font-medium">No Image</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {/* 호텔 미디어 이미지가 있는 경우 순차적으로 표시 */}
                {hotelMedia.length > 0 ? (
                  <>
                    {hotelMedia.slice(1, 5).map((media, index) => (
                      <div
                        key={media.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => setSelectedImage(index + 1)}
                      >
                        <Image
                          src={media.media_path}
                          alt={`Gallery ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && hotelMedia.length > 5 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white text-center">
                              <div className="text-lg font-bold">사진 모두보기</div>
                              <div className="text-sm">({hotelMedia.length}장)</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 5개 미만인 경우 빈 썸네일 표시 */}
                    {hotelMedia.length < 5 && Array.from({ length: 5 - hotelMedia.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-lg mb-1">📷</div>
                          <div className="text-xs font-medium">No Image</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
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
                  <h4 className="text-lg font-semibold mb-3">{hotel.property_name_ko || '호텔'} 소개</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {hotel.property_description || `${hotel.property_name_ko || '호텔'}에 대한 상세한 정보가 제공되지 않았습니다.`}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">위치</h5>
                      <p className="text-sm text-gray-600">{hotel.city_ko || hotel.city_eng || '위치 정보 없음'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">체인</h5>
                      <p className="text-sm text-gray-600">{hotel.chain_ko || hotel.chain_eng || '체인 정보 없음'}</p>
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
                      <h5 className="font-semibold text-blue-900 mb-2">📍 위치 정보</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>도시</span>
                          <span className="text-blue-600 font-medium">{hotel.city_ko || hotel.city_eng || '정보 없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>주소</span>
                          <span className="text-blue-600 font-medium">{hotel.property_address || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">🏨 호텔 정보</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>체인</span>
                          <span className="text-green-600 font-medium">{hotel.chain_ko || hotel.chain_eng || '정보 없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>브랜드</span>
                          <span className="text-green-600 font-medium">{hotel.brand_ko || hotel.brand_eng || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-orange-900 mb-2">⭐ 등급</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>호텔 등급</span>
                          <span className="text-orange-600 font-medium">{hotel.rating || '정보 없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>카테고리</span>
                          <span className="text-orange-600 font-medium">{hotel.category || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">ℹ️ 추가 정보</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>설명</span>
                          <span className="text-gray-600 font-medium">{hotel.property_description ? '있음' : '없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>이미지</span>
                          <span className="text-gray-600 font-medium">{hotel.image ? '있음' : '없음'}</span>
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
        <div className="container mx-auto max-w-[1440px] px-4">
          <CommonSearchBar
            variant="hotel-detail"
            location={hotel.city_ko || hotel.city_eng || '도시'}
            checkIn="체크인 날짜"
            checkOut="체크아웃 날짜"
            guests="객실 1개, 성인 2명, 어린이 0명"
          />
        </div>
      </div>
    </div>
  )
}

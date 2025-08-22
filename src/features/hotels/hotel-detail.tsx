"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search"
import { Star, MapPin, MessageCircle, Car, Utensils, Heart, ArrowLeft, Shield, Bed, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useHotelBySlug, useHotelMedia } from "@/hooks/use-hotels"
import { useEffect } from "react"

interface HotelDetailProps {
  hotelSlug: string
}

export function HotelDetail({ hotelSlug }: HotelDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("benefits")
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showImageDetail, setShowImageDetail] = useState(false)
  const [selectedDetailImage, setSelectedDetailImage] = useState(0)
  
  // slug로 호텔 데이터 조회
  const { data: hotel, isLoading, error } = useHotelBySlug(hotelSlug)
  
  // 호텔 미디어 이미지 조회
  const { data: hotelMedia = [] } = useHotelMedia(hotel?.sabre_id || 0)

  // 이미지 갤러리 열기
  const openImageGallery = () => {
    setShowImageGallery(true)
    setGalleryIndex(0)
  }

  // 이미지 갤러리 닫기
  const closeImageGallery = () => {
    setShowImageGallery(false)
  }

  // 이미지 상세 보기 열기
  const openImageDetail = (index: number) => {
    setSelectedDetailImage(index)
    setShowImageDetail(true)
  }

  // 이미지 상세 보기 닫기
  const closeImageDetail = () => {
    setShowImageDetail(false)
  }

  // 이전 이미지
  const prevImage = () => {
    setSelectedDetailImage((prev) => (prev === 0 ? hotelMedia.length - 1 : prev - 1))
  }

  // 다음 이미지
  const nextImage = () => {
    setSelectedDetailImage((prev) => (prev === hotelMedia.length - 1 ? 0 : prev + 1))
  }

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageDetail) return
      
      if (e.key === 'Escape') {
        closeImageDetail()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageDetail])

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
      <div className="bg-gray-100 py-1.5">
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
                onClick={() => openImageGallery()}
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
                        onClick={() => {
                          setSelectedImage(index + 1)
                          openImageGallery()
                        }}
                      >
                        <Image
                          src={media.media_path}
                          alt={`Gallery ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && hotelMedia.length > 5 && (
                          <div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              openImageGallery()
                            }}
                          >
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

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] max-h-[800px] overflow-hidden">
            {/* Top Header Bar */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {hotel.property_name_ko || hotel.property_name_en || '호텔명'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>2026년 7월 15일</span>
                  <span>-</span>
                  <span>2026년 7월 16일</span>
                  <span className="ml-2">성인 2명</span>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  확인
                </Button>
              </div>
              <button
                onClick={closeImageGallery}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Image Category Tabs */}
            <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-200 overflow-x-auto">
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                슬라이드쇼
              </button>
              <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-2 whitespace-nowrap">
                전체({hotelMedia.length})
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                동영상(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                객실(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                숙소(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                편의/부대시설(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                식사 공간/장소(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                주변 명소(0)
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex h-[calc(100%-140px)]">
              {/* Left Section - Image Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!showImageDetail ? (
                  <div className="grid grid-cols-3 gap-4">
                    {hotelMedia.map((media, index) => (
                      <div 
                        key={media.id} 
                        className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => openImageDetail(index)}
                      >
                        <Image
                          src={media.media_path}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {index === 0 && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                  </div>
                ) : (
                  /* Image Detail View */
                  <div className="h-full flex flex-col">
                    {/* Detail Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={closeImageDetail}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>갤러리로 돌아가기</span>
                      </button>
                      <div className="text-sm text-gray-500">
                        {selectedDetailImage + 1} / {hotelMedia.length}
                      </div>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100">
                      {hotelMedia.length > 0 ? (
                        <Image
                          src={hotelMedia[selectedDetailImage]?.media_path}
                          alt={`Detail ${selectedDetailImage + 1}`}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-4">📷</div>
                            <div className="text-xl">이미지가 없습니다</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Controls */}
                    {hotelMedia.length > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <button
                          onClick={prevImage}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>이전</span>
                        </button>
                        <button
                          onClick={nextImage}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <span>다음</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Thumbnail Navigation */}
                    {hotelMedia.length > 1 && (
                      <div className="mt-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {hotelMedia.map((media, index) => (
                            <button
                              key={media.id}
                              onClick={() => setSelectedDetailImage(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                index === selectedDetailImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Image
                                src={media.media_path}
                                alt={`Thumbnail ${index + 1}`}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Section - Information Sidebar */}
              <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      [숙소 100배 즐기기]
                    </h3>
                  </div>

                  {/* Benefit List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">대중교통(260m 거리)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">공항 이동 교통편 서비스</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {hotel.city_ko || hotel.city_eng || '도시'}의 중심지에 위치
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">무료 Wi-Fi (모든 객실)</span>
                    </div>
                  </div>

                  {/* Promotional Text */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-600">인기 많은 숙소입니다!</p>
                    <p className="text-xs text-gray-600">오늘 21명의 여행객이 이 숙소 예약함</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                      숙소 인근 명소 보기
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      예약 가능한 객실 보기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion */}
      <div className="bg-gray-100 py-4 mt-1.5">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="font-medium text-lg">프로모션</span>
              <div className="flex gap-2">
                <span className="bg-pink-500 px-3 py-1 rounded text-sm font-medium">% 최대 8,000원 할인</span>
                <span className="bg-orange-500 px-3 py-1 rounded text-sm font-medium">① 최대 27,882원</span>
                <span className="bg-pink-500 px-3 py-1 rounded text-sm font-medium">최대 20% 할인</span>
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
              <div className="space-y-3">
                <h4 className="text-base font-medium text-gray-700 mb-4">예약 시 제공되는 혜택</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Utensils className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">2인 조식 무료 제공</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-xs">$</span>
                    </div>
                    <div className="text-xs text-gray-700">100$ 상당의 식음료 크레딧</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="text-xs text-gray-700">얼리 체크인, 레이트 체크아웃 (현장 가능시)</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Bed className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div className="text-xs text-gray-700">객실 무료 업그레이드 (현장 가능시)</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-amber-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Star className="h-3 w-3 text-amber-600" />
                    </div>
                    <div className="text-xs text-gray-700">글로벌 체인 멤버십 포인트 적립</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Shield className="h-3 w-3 text-slate-600" />
                    </div>
                    <div className="text-xs text-gray-700">투숙 후 호텔에서 체크아웃 시 결제</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-rose-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-rose-600" />
                    </div>
                    <div className="text-xs text-gray-700">전문 컨시어지를 통한 1:1 프라이빗 상담 예약</div>
                  </div>
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
                          <span className="text-blue-600 font-medium">{hotel.brand_ko || hotel.brand_eng || '정보 없음'}</span>
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

      {/* Search Bar */}
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

      {/* Room types & rates */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-white rounded-lg shadow-sm">


            {/* Room Details and Pricing Table */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">객실 타입별 요금 상세</h3>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">타입</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">뷰</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">베드</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">어메니티</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">객실 설명</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">포함 서비스</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">추가 서비스</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">부가 설명</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">가격</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample Room Row 1 */}
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="font-medium">퀸룸</div>
                        <div className="text-xs text-gray-500 mt-1">편안한 퀸 사이즈 침대로 구성된 객실</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>Standard</div>
                        <div className="text-xs text-gray-500">STD</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>코트야드 뷰</div>
                        <div className="text-xs text-gray-500">Courtyard</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>퀸 1개</div>
                        <div className="text-xs text-gray-500">160cm x 200cm</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🛁 욕조</div>
                          <div className="text-xs">🚿 샤워</div>
                          <div className="text-xs">❄️ 에어컨</div>
                          <div className="text-xs">📶 Wi-Fi</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🏨 숙박</div>
                          <div className="text-xs">🍳 조식 (선택)</div>
                          <div className="text-xs">🧹 청소</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🚭 금연</div>
                          <div className="text-xs">🌿 발코니</div>
                          <div className="text-xs">🅿️ 주차</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          40m², 2층, 엘리베이터 이용 가능, 24시간 프론트 데스크
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-right">
                          <div className="line-through text-gray-400">₩1,200,000</div>
                          <div className="text-red-600 font-semibold">₩980,000</div>
                        </div>
                      </td>
                    </tr>

                    {/* Sample Room Row 2 */}
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="font-medium">디럭스 킹룸</div>
                        <div className="text-xs text-gray-500 mt-1">넓은 공간과 킹 사이즈 침대의 프리미엄 객실</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>Deluxe</div>
                        <div className="text-xs text-gray-500">DLX</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>시티 뷰</div>
                        <div className="text-xs text-gray-500">City View</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>킹 1개</div>
                        <div className="text-xs text-gray-500">180cm x 200cm</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🛁 욕조</div>
                          <div className="text-xs">🚿 샤워</div>
                          <div className="text-xs">❄️ 에어컨</div>
                          <div className="text-xs">📶 Wi-Fi</div>
                          <div className="text-xs">🛋️ 소파</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🏨 숙박</div>
                          <div className="text-xs">🍳 조식 포함</div>
                          <div className="text-xs">🧹 청소</div>
                          <div className="text-xs">☕ 미니바</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🚭 금연</div>
                          <div className="text-xs">🌿 발코니</div>
                          <div className="text-xs">🅿️ 주차</div>
                          <div className="text-xs">🏊 수영장</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          55m², 5층, 엘리베이터 이용 가능, 24시간 프론트 데스크, 컨시어지 서비스
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-right">
                          <div className="line-through text-gray-400">₩1,500,000</div>
                          <div className="text-red-600 font-semibold">₩1,250,000</div>
                        </div>
                      </td>
                    </tr>

                    {/* Sample Room Row 3 */}
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="font-medium">스위트룸</div>
                        <div className="text-xs text-gray-500 mt-1">최고급 시설과 넓은 공간의 프리미엄 스위트</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>Suite</div>
                        <div className="text-xs text-gray-500">SUITE</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>오션 뷰</div>
                        <div className="text-xs text-gray-500">Ocean View</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>킹 1개 + 소파베드</div>
                        <div className="text-xs text-gray-500">180cm x 200cm + 120cm x 200cm</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🛁 욕조</div>
                          <div className="text-xs">🚿 샤워</div>
                          <div className="text-xs">❄️ 에어컨</div>
                          <div className="text-xs">📶 Wi-Fi</div>
                          <div className="text-xs">🛋️ 소파</div>
                          <div className="text-xs">🍽️ 다이닝</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🏨 숙박</div>
                          <div className="text-xs">🍳 조식 포함</div>
                          <div className="text-xs">🧹 청소</div>
                          <div className="text-xs">☕ 미니바</div>
                          <div className="text-xs">🍷 웰컴 드링크</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🚭 금연</div>
                          <div className="text-xs">🌿 발코니</div>
                          <div className="text-xs">🅿️ 주차</div>
                          <div className="text-xs">🏊 수영장</div>
                          <div className="text-xs">💆 스파</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          80m², 8층, 엘리베이터 이용 가능, 24시간 프론트 데스크, 전용 컨시어지, 발코니 테라스
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-sm text-gray-700">
                        <div className="text-right">
                          <div className="line-through text-gray-400">₩2,200,000</div>
                          <div className="text-red-600 font-semibold">₩1,850,000</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">테이블 설명</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">타입:</span> 객실 등급과 코드
                  </div>
                  <div>
                    <span className="font-medium">뷰:</span> 객실에서 보이는 전망
                  </div>
                  <div>
                    <span className="font-medium">베드:</span> 침대 타입과 크기
                  </div>
                  <div>
                    <span className="font-medium">어메니티:</span> 객실 내 제공 시설
                  </div>
                  <div>
                    <span className="font-medium">객실 설명:</span> 객실명과 간단한 설명
                  </div>
                  <div>
                    <span className="font-medium">포함 서비스:</span> 숙박료에 포함된 서비스
                  </div>
                  <div>
                    <span className="font-medium">추가 서비스:</span> 추가 제공되는 옵션
                  </div>
                  <div>
                    <span className="font-medium">부가 설명:</span> 기타 상세 정보
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

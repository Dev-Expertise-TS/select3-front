'use client'

import Link from "next/link"
import { MapPin, Coffee, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"
import { useState, useEffect, useCallback, useRef } from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { generateHotelImageUrl } from "@/lib/supabase-image-loader"
import { optimizeHotelCardImage } from "@/lib/image-optimization"

// CTA용 호텔 데이터 타입 정의
export interface HotelCardCtaData {
  sabre_id: number
  property_name_ko: string
  property_name_en?: string
  city: string
  city_ko?: string
  property_address: string
  image: string
  benefits: string[]
  slug?: string
  rating?: number
  price?: number
  original_price?: number
  badge?: string
  isPromotion?: boolean
}

// CTA용 호텔 카드 Props 타입 정의
export interface HotelCardCtaProps {
  hotel: HotelCardCtaData
  variant?: 'default' | 'promotion' | 'featured'
  showBenefits?: boolean
  showRating?: boolean
  showPrice?: boolean
  showBadge?: boolean
  className?: string
  imageClassName?: string
  contentClassName?: string
}

// CTA용 호텔 카드 컴포넌트
export function HotelCardCta({
  hotel,
  variant = 'default',
  showBenefits = true,
  showRating = false,
  showPrice = false,
  showBadge = false,
  className,
  imageClassName,
  contentClassName
}: HotelCardCtaProps) {
  
  // 혜택 관련 상태
  const [hotelBenefits, setHotelBenefits] = useState<string[]>([])
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(false)
  
  // 중복 호출 방지를 위한 ref
  const benefitsFetchedRef = useRef(false)
  
  // 호텔별 혜택 데이터 가져오기
  const fetchHotelBenefits = useCallback(async () => {
    if (!hotel.sabre_id || benefitsFetchedRef.current || isLoadingBenefits) {
      return
    }

    try {
      benefitsFetchedRef.current = true
      setIsLoadingBenefits(true)
      
      const response = await fetch(`/api/hotels/${hotel.sabre_id}/benefits`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.data) {
        // benefit_description 대신 benefit 컬럼 사용
        const formattedBenefits = data.data.map((item: any) => 
          item.select_hotel_benefits?.benefit || "혜택 정보 없음"
        ).filter((benefit: string) => benefit !== "혜택 정보 없음")
        
        setHotelBenefits(formattedBenefits)
      }
    } catch (error) {
      console.error("Hotel benefits fetch error:", error instanceof Error ? error.message : String(error))
    } finally {
      setIsLoadingBenefits(false)
    }
  }, [hotel.sabre_id])

  // 컴포넌트 마운트 시 혜택 데이터 가져오기
  useEffect(() => {
    if (showBenefits && hotel.sabre_id) {
      fetchHotelBenefits()
    }
  }, [showBenefits, hotel.sabre_id, fetchHotelBenefits])
  
  // variant별 스타일 클래스
  const variantClasses = {
    default: "border border-gray-200 bg-white shadow-sm hover:shadow-md",
    promotion: "border border-red-200 bg-white shadow-md hover:shadow-lg",
    featured: "border border-blue-200 bg-white shadow-md hover:shadow-lg"
  }

  return (
    <Link href={hotel.slug ? `/hotel/${hotel.slug}` : `/hotel/${hotel.sabre_id}`}>
      <div 
        className={cn(
          "group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 rounded-lg",
          variantClasses[variant],
          className
        )}
      >
        <div className="flex flex-col sm:flex-row">
          {/* 이미지 영역 - 왼쪽 */}
          <div className={cn(
            "relative overflow-hidden w-full sm:w-1/2",
            "aspect-[4/3] sm:aspect-auto sm:min-h-[200px]",
            imageClassName
          )}>
            {/* select_hotel_media 테이블의 이미지 사용 (호텔 카드와 동일한 최적화 적용) */}
            <OptimizedImage
              src={optimizeHotelCardImage(getSafeImageUrl(hotel.image))}
              alt={`${hotel.property_name_ko} - ${hotel.city}`}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
              priority={variant === 'featured' || variant === 'promotion'}
              quality={variant === 'featured' || variant === 'promotion' ? 85 : 75}
              format="webp"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onError={(e) => {
                console.warn(`🖼️ [HotelCardCta] 이미지 로딩 실패:`, {
                  sabre_id: hotel.sabre_id,
                  hotel_name: hotel.property_name_ko,
                  image_url: hotel.image,
                  optimized_url: optimizeHotelCardImage(getSafeImageUrl(hotel.image))
                })
              }}
            />

            {/* 배지들 */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {showBadge && hotel.badge && (
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                  {hotel.badge}
                </span>
              )}
              {hotel.isPromotion && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                  프로모션
                </span>
              )}
            </div>

            {/* 우측 상단 정보 */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-2 z-10">
              {showRating && hotel.rating && (
                <div className="flex items-center bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-sm">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {hotel.rating}
                </div>
              )}
              {showPrice && hotel.price && (
                <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
                  ₩{hotel.price.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* 콘텐츠 영역 - 오른쪽 */}
          <div className={cn(
            "flex-1 p-6 flex flex-col justify-between",
            "bg-white",
            contentClassName
          )}>
            {/* 호텔 기본 정보 */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {hotel.property_name_ko}
              </h3>
              
              {hotel.property_name_en && (
                <p className="text-gray-600 text-sm mb-3">
                  {hotel.property_name_en}
                </p>
              )}

              {/* 주소 정보 */}
              {hotel.property_address && hotel.property_address !== '주소 정보 없음' && (
                <div className="flex items-start text-gray-500 text-xs mb-3">
                  <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{hotel.property_address}</span>
                </div>
              )}
            </div>

            {/* 혜택 정보 */}
            {showBenefits && !isLoadingBenefits && hotelBenefits.length > 0 && (
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {hotelBenefits.slice(0, 6).map((benefit, index) => (
                    <div key={index} className="flex items-start text-sm text-gray-600">
                      <Coffee className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 하단 정보 */}
            <div className="flex items-center justify-between">
              {/* 도시 태그 */}
              <div className="text-sm text-gray-500">
                {hotel.city_ko || hotel.city}
              </div>
              
              {/* CTA 버튼 */}
              <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                자세히 보기
                <svg
                  className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

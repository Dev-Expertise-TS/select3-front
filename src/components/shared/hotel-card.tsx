'use client'

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Coffee, Star, Badge } from "lucide-react"
import { cn } from "@/lib/utils"

// 호텔 데이터 타입 정의
export interface HotelCardData {
  sabre_id: number
  property_name_kor: string
  city: string
  property_address: string
  image: string
  benefits: string[]
  link: string
  rating?: number
  price?: number
  original_price?: number
  badge?: string
  isPromotion?: boolean
}

// 호텔 카드 Props 타입 정의
export interface HotelCardProps {
  hotel: HotelCardData
  variant?: 'default' | 'featured' | 'compact' | 'promotion'
  showBenefits?: boolean
  showRating?: boolean
  showPrice?: boolean
  showBadge?: boolean
  showPromotionBadge?: boolean
  className?: string
  imageClassName?: string
  contentClassName?: string
}

// 호텔 카드 컴포넌트
export function HotelCard({
  hotel,
  variant = 'default',
  showBenefits = true,
  showRating = false,
  showPrice = false,
  showBadge = false,
  showPromotionBadge = false,
  className,
  imageClassName,
  contentClassName
}: HotelCardProps) {
  // variant별 스타일 클래스
  const variantClasses = {
    default: "border border-gray-200 bg-white shadow-sm hover:shadow-md",
    featured: "border border-gray-200 bg-white shadow-lg hover:shadow-xl",
    compact: "border border-gray-200 bg-white shadow-sm",
    promotion: "border border-gray-200 bg-white shadow-lg hover:shadow-xl"
  }

  // 이미지 aspect ratio 클래스
  const imageAspectClasses = {
    default: "aspect-[4/3]",
    featured: "aspect-[4/3]",
    compact: "aspect-[3/2]",
    promotion: "aspect-[4/3]"
  }

  return (
    <Link href={hotel.link}>
      <Card className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1",
        variantClasses[variant],
        className
      )}>
        {/* 이미지 영역 */}
        <div className={cn(
          "relative overflow-hidden",
          imageAspectClasses[variant],
          imageClassName
        )}>
          <Image
            src={hotel.image}
            alt={`${hotel.property_name_kor} - ${hotel.city}`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={variant === 'featured' || variant === 'promotion'}
            onError={(e) => {
              console.error(`❌ 이미지 로딩 실패: ${hotel.image}`)
              const target = e.target as HTMLImageElement
              target.src = '/placeholder.svg'
            }}
          />
          
          {/* 이미지 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* 배지들 */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {showPromotionBadge && hotel.isPromotion && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                프로모션
              </span>
            )}
            {showBadge && hotel.badge && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {hotel.badge}
              </span>
            )}
          </div>

          {/* 우측 상단 정보 */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {showRating && hotel.rating && (
              <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {hotel.rating}
              </div>
            )}
            {showPrice && hotel.price && (
              <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                ₩{hotel.price.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <CardContent className={cn(
          "px-4 pt-1 pb-4",
          contentClassName
        )}>
          {/* 호텔 기본 정보 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-900 text-sm truncate flex-1 mr-2 group-hover:text-blue-600 transition-colors">
                {hotel.property_name_kor}
              </h3>
              <span className="text-xs text-gray-500 font-medium flex-shrink-0">
                {hotel.city}
              </span>
            </div>

            <div className="flex items-start text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
              <span className="truncate">{hotel.property_address}</span>
            </div>
          </div>

          {/* 혜택 정보 */}
          {showBenefits && hotel.benefits && hotel.benefits.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-1 h-[54px]">
                {hotel.benefits.slice(0, 6).map((benefit, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-600">
                    <Coffee className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{benefit}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 6 - hotel.benefits.length) }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-[18px]"></div>
                ))}
              </div>
            </div>
          )}

          {/* 가격 정보 */}
          {showPrice && hotel.price && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">가격</p>
                  {hotel.original_price && hotel.original_price > hotel.price && (
                    <p className="text-xs text-gray-500 line-through">
                      ₩{hotel.original_price.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    ₩{hotel.price.toLocaleString()}
                  </p>
                  {hotel.original_price && hotel.original_price > hotel.price && (
                    <p className="text-xs text-green-600">
                      {Math.round(((hotel.original_price - hotel.price) / hotel.original_price) * 100)}% 할인
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 액션 영역 */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {variant === 'promotion' ? (
                  <>
                    <p className="text-xs font-semibold text-gray-900 mb-1">프로모션 혜택</p>
                    <div className="text-xs text-gray-500">
                      <span>특별 혜택이 포함된 패키지</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-600">호텔 상세 정보</p>
                )}
              </div>
              
              <div className="flex items-center text-blue-600 text-xs font-medium group-hover:text-blue-700">
                자세히 보기
                <svg
                  className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

'use client'

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { MapPin, Coffee, Star, Badge } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"
import { useHotelPromotion } from "@/hooks/use-hotel-promotion"
import { HOTEL_CARD_CONFIG, type CardVariant } from "@/config/layout"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { generateHotelImageUrl } from "@/lib/supabase-image-loader"
import { PromotionBox } from "@/components/shared/promotion-box"
import { formatDateDot } from "@/lib/date-utils"
import { optimizeHotelCardImage } from "@/lib/image-optimization"

// 호텔 데이터 타입 정의
export interface HotelCardData {
  sabre_id: number
  property_name_ko: string
  property_name_en?: string // 영문 호텔명 추가
  brand_names_en?: string[] // 브랜드 영문명 배열 (brand_id, brand_id_2, brand_id_3 모두 포함)
  city: string
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

// 호텔 카드 Props 타입 정의
export interface HotelCardProps {
  hotel: HotelCardData
  variant?: CardVariant
  showBenefits?: boolean
  showRating?: boolean
  showPrice?: boolean
  showBadge?: boolean
  showPromotionBadge?: boolean
  className?: string
  imageClassName?: string
  contentClassName?: string
  isThreeGrid?: boolean // 3개 그리드 여부
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
  contentClassName,
  isThreeGrid = false
}: HotelCardProps) {
  // 프로모션 정보 조회
  const { data: promotions } = useHotelPromotion(hotel.sabre_id)

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}.${month}.${day}`
    } catch (error) {
      console.error('날짜 포맷 오류:', error instanceof Error ? error.message : String(error))
      return dateString
    }
  }
  
  // variant별 스타일 클래스
  const variantClasses = {
    default: "border border-gray-200 bg-white shadow-sm hover:shadow-md",
    featured: "border border-gray-200 bg-white shadow-lg hover:shadow-xl",
    compact: "border border-gray-200 bg-white shadow-sm",
    promotion: "border border-gray-200 bg-white shadow-lg hover:shadow-xl"
  }

    // 이미지 aspect ratio 클래스
  const imageAspectClasses = {
    default: HOTEL_CARD_CONFIG.IMAGE_ASPECT.DEFAULT,
    featured: HOTEL_CARD_CONFIG.IMAGE_ASPECT.FEATURED, 
    compact: HOTEL_CARD_CONFIG.IMAGE_ASPECT.COMPACT,
    promotion: HOTEL_CARD_CONFIG.IMAGE_ASPECT.PROMOTION
  }
  
  // 디버깅: isThreeGrid 값 확인
  console.log('HotelCard Debug:', { 
    sabre_id: hotel.sabre_id, 
    isThreeGrid, 
    variant,
    imageClass: isThreeGrid ? HOTEL_CARD_CONFIG.IMAGE_ASPECT.THREE_GRID : imageAspectClasses[variant],
    height: isThreeGrid ? 'h-72 (288px)' : 'default height'
  })

  return (
    <Link href={hotel.slug ? `/hotel/${hotel.slug}` : `/hotel/${hotel.sabre_id}`}>
      <Card className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 p-0 flex flex-col",
        `h-[${HOTEL_CARD_CONFIG.HEIGHT.DEFAULT}px]`,
        variantClasses[variant],
        className
      )}>
        {/* 이미지 영역 */}
        <div className={cn(
          "relative overflow-hidden w-full",
          isThreeGrid ? HOTEL_CARD_CONFIG.IMAGE_ASPECT.THREE_GRID : imageAspectClasses[variant],
          imageClassName
        )}>
          {/* select_hotel_media 테이블의 이미지 우선 사용 (호텔 카드와 동일) */}
          <OptimizedImage
            src={optimizeHotelCardImage(getSafeImageUrl(hotel.image))}
            alt={`${hotel.property_name_ko} - ${hotel.city}`}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={variant === 'featured'}
            quality={variant === 'featured' ? 85 : 75}
            format="webp"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            onError={(e) => {
              console.warn(`🖼️ [HotelCard] 이미지 로딩 실패:`, {
                sabre_id: hotel.sabre_id,
                hotel_name: hotel.property_name_ko,
                image_url: hotel.image,
                optimized_url: optimizeHotelCardImage(getSafeImageUrl(hotel.image))
              })
            }}
          />

          {/* 좌측 상단: 브랜드 배지 (히어로 캐로셀 스타일) */}
          {hotel.brand_names_en && hotel.brand_names_en.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {hotel.brand_names_en.map((brandName, index) => (
                <span
                  key={index}
                  className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded"
                >
                  {brandName}
                </span>
              ))}
            </div>
          )}

          {/* 우측 상단: 프로모션 배지 및 기타 배지 */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
            {showPromotionBadge && hotel.isPromotion && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                프로모션
              </span>
            )}
            {showBadge && hotel.badge && (
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {hotel.badge}
              </span>
            )}
            {/* 브랜드가 없을 때만 평점/가격 표시 */}
            {(!hotel.brand_names_en || hotel.brand_names_en.length === 0) && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <CardContent className={cn(
          "px-4 pt-1 pb-4 flex-1 flex flex-col",
          contentClassName
        )}>
          {/* 호텔 기본 정보 */}
          <div className="mb-3">
            <div className="flex items-end justify-between mb-1">
              <div className="flex-1 mr-2">
                <h3 className={cn(
                  "font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors",
                  isThreeGrid ? "text-lg" : "text-base"
                )}>
                  {hotel.property_name_ko}
                </h3>
                {hotel.property_name_en && (
                  <p className={cn(
                    "text-gray-600 truncate mt-1",
                    isThreeGrid ? "text-base" : "text-sm"
                  )}>
                    {hotel.property_name_en}
                  </p>
                )}
              </div>
              <span className={cn(
                "text-gray-500 font-medium flex-shrink-0",
                isThreeGrid ? "text-sm" : "text-xs"
              )}>
                {hotel.city}
              </span>
            </div>

            {/* 주소 정보가 있을 때만 표시 */}
            {hotel.property_address && hotel.property_address !== '주소 정보 없음' && (
              <div className={cn(
                "flex items-start text-gray-500 mb-2",
                isThreeGrid ? "text-sm" : "text-xs"
              )}>
                <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span className="truncate">{hotel.property_address}</span>
              </div>
            )}
          </div>

          {/* 혜택 정보 - 주석 처리 */}
          {/* {showBenefits && hotel.benefits && hotel.benefits.length > 0 && (
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
          )} */}

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

          {/* 프로모션 정보 */}
          {variant === 'promotion' && Array.isArray(promotions) && promotions.length > 0 && (
            <div className="border-t pt-3 mt-3 flex-1 flex flex-col">
              <div className="flex-1 flex flex-col">
                <p className={cn(
                  "font-semibold text-gray-900 mb-2",
                  isThreeGrid ? "text-sm" : "text-xs"
                )}>프로모션 혜택</p>
                <div className="flex-1 flex flex-col justify-center">
                  {/* 첫 번째 프로모션만 표시하고 텍스트 길이 제한 (27자) */}
                  {promotions.slice(0, 1).map((p: any, index: number) => (
                    <PromotionBox
                      key={index}
                      text={p.promotion}
                      bookingDate={p.booking_date}
                      checkInDate={p.check_in_date}
                      isThreeGrid={isThreeGrid}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 액션 영역 */}
          <div className="pt-3 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {variant !== 'promotion' && (
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

'use client'

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"
import { useHotelPromotion } from "@/hooks/use-hotel-promotion"
import { HOTEL_CARD_CONFIG, type CardVariant } from "@/config/layout"

// 전체보기용 호텔 데이터 타입 정의
export interface HotelCardAllViewData {
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
  // 전체보기용 추가 필드
  country_ko?: string
  country_en?: string
  chain?: string
  benefit_1?: string
  benefit_2?: string
  benefit_3?: string
  benefit_4?: string
  benefit_5?: string
  benefit_6?: string
  // 브랜드와 체인 정보
  brand_id?: number
  chain_id?: number
  brand_name_en?: string
  chain_name_en?: string
}

// 전체보기용 호텔 카드 Props 타입 정의
export interface HotelCardAllViewProps {
  hotel: HotelCardAllViewData
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

// 호텔 이미지 영역 컴포넌트
interface HotelImageSectionProps {
  hotel: HotelCardAllViewData
  variant: CardVariant
  showBadge: boolean
  showPromotionBadge: boolean
  promotion: any
  imageClassName?: string
}

function HotelImageSection({
  hotel,
  variant,
  showBadge,
  showPromotionBadge,
  promotion,
  imageClassName
}: HotelImageSectionProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg aspect-square", // 정사각형 비율로 설정
        imageClassName
      )}
      style={{ 
        width: '100%',
        backgroundColor: '#f0f0f0', // 디버깅용 배경색
        borderRadius: '8px' // CSS로 라운딩 강제 적용
      }}
    >
      <Image
        src={getSafeImageUrl(hotel.image)}
        alt={`${hotel.property_name_ko} - ${hotel.city}`}
        fill
        className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        style={{
          borderRadius: '8px' // 이미지에도 CSS로 라운딩 강제 적용
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
        priority={variant === 'featured' || variant === 'promotion'}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        loading={variant === 'featured' || variant === 'promotion' ? 'eager' : 'lazy'}
        onLoad={() => handleImageLoad(hotel.image)}
        onError={handleImageError}
      />
      
      {/* 배지들 */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {/* 브랜드 배지 (brand_name_en만 표시) */}
        {hotel.brand_name_en && (
          <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-md text-sm font-medium shadow-sm">
            {hotel.brand_name_en}
          </div>
        )}
        {/* 기타 배지들 */}
        <div className="flex flex-wrap gap-2">
          {showBadge && hotel.badge && (
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
              {hotel.badge}
            </div>
          )}
          {showPromotionBadge && promotion && (
            <div className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              {promotion.promotion}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 호텔 정보 영역 컴포넌트
interface HotelInfoSectionProps {
  hotel: HotelCardAllViewData
  contentClassName?: string
}

function HotelInfoSection({ hotel, contentClassName }: HotelInfoSectionProps) {
  return (
    <CardContent className={cn("px-2 pt-0 pb-4 flex flex-col flex-1 !border-0 !shadow-none", contentClassName)}>
      <div className="flex-1 space-y-2">
        {/* 호텔명 */}
        <div>
          <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {hotel.property_name_ko}
          </h3>
          {hotel.property_name_en && (
            <p className="text-sm text-gray-600 line-clamp-1 mt-1">
              {hotel.property_name_en}
            </p>
          )}
        </div>

        {/* 위치 정보 */}
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1 flex-1">
            <p className="line-clamp-1 font-medium">
              {hotel.city_ko || hotel.city}
              {hotel.country_ko && `, ${hotel.country_ko}`}
            </p>
            {/* 주소 영역을 항상 2행으로 유지 */}
            <div className="h-8 flex items-center"> {/* 고정 높이 2행 (text-xs * 2 + line-height) */}
              {hotel.property_address && hotel.property_address !== '주소 정보 없음' ? (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {hotel.property_address}
                </p>
              ) : (
                <p className="text-xs text-gray-400 line-clamp-2">
                  &nbsp; {/* 빈 공간 유지 */}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  )
}

// 전체보기용 호텔 카드 컴포넌트
export function HotelCardAllView({
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
}: HotelCardAllViewProps) {
  console.log('HotelCardAllView 렌더링:', {
    hotelName: hotel.property_name_ko,
    sabre_id: hotel.sabre_id,
    isThreeGrid,
    variant,
    component: 'HotelCardAllView',
    'data-component': 'HotelCardAllView'
  })
  
  const promotionQuery = useHotelPromotion(hotel.sabre_id)
  const promotion = promotionQuery.data as any
  
  // 전체보기용 카드 스타일 클래스 (테두리와 그림자 제거)
  const variantClasses = {
    default: "bg-white",
    featured: "bg-gradient-to-br from-blue-50 to-indigo-50",
    compact: "bg-white",
    promotion: "bg-white"
  }

  return (
    <Link href={hotel.slug ? `/hotel/${hotel.slug}` : `/hotel/${hotel.sabre_id}`}>
      <Card 
        className={cn(
          "group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 p-0 flex flex-col !border-0 !shadow-none", // 테두리와 그림자 강제 제거
          `h-[${HOTEL_CARD_CONFIG.HEIGHT.DEFAULT}px]`, // 전체보기용 높이
          variantClasses[variant],
          className
        )}
        data-component="HotelCardAllView"
      >
        {/* 이미지 영역 */}
        <HotelImageSection
          hotel={hotel}
          variant={variant}
          showBadge={showBadge}
          showPromotionBadge={showPromotionBadge}
          promotion={promotion}
          imageClassName={imageClassName}
        />

        {/* 정보 영역 */}
        <HotelInfoSection
          hotel={hotel}
          contentClassName={contentClassName}
        />
      </Card>
    </Link>
  )
}
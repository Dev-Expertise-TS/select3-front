'use client'

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSafeImageUrl } from "@/lib/image-utils"
import { useHotelPromotion } from "@/hooks/use-hotel-promotion"
import { HOTEL_CARD_CONFIG, type CardVariant } from "@/config/layout"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { optimizeHotelCardImage } from "@/lib/image-optimization"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// 프로모션 타입 정의
interface HotelPromotion {
  promotion_id: number
  promotion: string
  booking_date: string | null
  check_in_date: string | null
}

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
  hotel_area?: string
  benefit_1?: string
  benefit_2?: string
  benefit_3?: string
  benefit_4?: string
  benefit_5?: string
  benefit_6?: string
  // 브랜드와 체인 정보
  brand_id?: number
  brand_id_2?: number
  brand_id_3?: number
  chain_id?: number
  brand_name_en?: string
  brand_names_en?: string[]
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
  promotion: HotelPromotion | null | undefined
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
  const supabase = createClient()
  
  // brand_id, brand_id_2, brand_id_3를 순서대로 수집
  const allBrandIds = [
    hotel.brand_id,
    hotel.brand_id_2,
    hotel.brand_id_3
  ].filter((id) => id !== null && id !== undefined && id !== '')
  
  // 기존 브랜드명 정보
  const existingBrandNames = (hotel.brand_names_en || []).filter(Boolean)
  const hasAllBrandNames = existingBrandNames.length > 0 && existingBrandNames.length === allBrandIds.length
  
  // 누락된 브랜드 ID 찾기 (brand_names_en 배열이 없거나 개수가 맞지 않으면 모든 ID 조회)
  const missingBrandIds = hasAllBrandNames ? [] : allBrandIds
  
  // 누락된 브랜드 정보 조회
  const { data: missingBrandData } = useQuery({
    queryKey: ['brand-names', missingBrandIds.sort().join(',')],
    queryFn: async () => {
      if (missingBrandIds.length === 0) return []
      
      const { data, error } = await supabase
        .from('hotel_brands')
        .select('brand_id, brand_name_en')
        .in('brand_id', missingBrandIds)
      
      if (error) {
        console.error('❌ 브랜드 정보 조회 오류:', error)
        return []
      }
      
      return data || []
    },
    enabled: missingBrandIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  })
  
  // 브랜드 라벨 생성
  const brandLabels = (() => {
    // 1순위: brand_names_en 배열이 있고 개수가 맞으면 사용
    if (hasAllBrandNames) {
      return existingBrandNames
    }

    // 2순위: brand_names_en + 조회한 누락 브랜드 정보 조합
    const labels: string[] = []
    const brandMap = new Map<string, string>()
    
    // 기존 brand_names_en 매핑 (순서대로)
    if (existingBrandNames.length > 0) {
      existingBrandNames.forEach((name, index) => {
        if (allBrandIds[index]) {
          brandMap.set(String(allBrandIds[index]), name)
        }
      })
    }
    
    // hotel.brand_name_en이 있으면 brand_id에 매핑
    if (hotel.brand_name_en && hotel.brand_id) {
      brandMap.set(String(hotel.brand_id), hotel.brand_name_en)
    }
    
    // 조회한 누락 브랜드 정보 매핑
    if (missingBrandData && missingBrandData.length > 0) {
      missingBrandData.forEach((brand: any) => {
        if (brand.brand_name_en) {
          brandMap.set(String(brand.brand_id), brand.brand_name_en)
        }
      })
    }
    
    // allBrandIds 순서대로 라벨 생성
    allBrandIds.forEach((id) => {
      const brandName = brandMap.get(String(id))
      if (brandName) {
        labels.push(brandName)
      } else {
        // 브랜드 정보를 찾을 수 없으면 ID로 표시
        labels.push(`Brand ${id}`)
      }
    })

    return labels
  })()

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg aspect-square w-full",
        imageClassName
      )}
    >
      {/* select_hotel_media 테이블의 이미지 사용 (호텔 카드와 동일한 최적화 적용) */}
      <OptimizedImage
        src={optimizeHotelCardImage(getSafeImageUrl(hotel.image))}
        alt={`${hotel.property_name_ko} - ${hotel.city}`}
        fill
        className="object-cover object-center group-hover:scale-105 transition-transform duration-300 rounded-lg w-full h-full"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={variant === 'featured' || variant === 'promotion'}
        quality={variant === 'featured' || variant === 'promotion' ? 85 : 75}
        format="webp"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onError={() => {
          // 이미지 로딩 실패 시 자동으로 placeholder 표시됨
        }}
      />
      
      {/* 배지들 */}
      <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
        {/* 브랜드 배지 (여러 브랜드 지원) */}
        {brandLabels.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {brandLabels.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-0.5 rounded text-xs font-medium shadow-sm w-fit"
              >
                {label}
              </div>
            ))}
          </div>
        )}
        {/* 기타 배지들 */}
        <div className="flex flex-wrap gap-1.5">
          {showBadge && hotel.badge && (
            <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-1.5 py-0.5 rounded text-[10px] font-medium w-fit">
              {hotel.badge}
            </div>
          )}
          {showPromotionBadge && promotion && (
            <div className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-medium w-fit">
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
    <CardContent className={cn("px-2 pt-0 pb-4 flex flex-col flex-1 border-0 shadow-none", contentClassName)}>
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
          <MapPin className="h-4 w-4 shrink-0 text-gray-400 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              {hotel.hotel_area && (
                <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {hotel.hotel_area}
                </span>
              )}
              <p className="min-w-0 line-clamp-1 font-medium">
              {hotel.city_ko || hotel.city}
              {hotel.country_ko && `, ${hotel.country_ko}`}
            </p>
            </div>
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
  const promotionQuery = useHotelPromotion(hotel.sabre_id)
  const promotions: HotelPromotion[] = Array.isArray(promotionQuery.data) ? promotionQuery.data : []
  const promotion = promotions.length > 0 ? promotions[0] : null
  
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
          "group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 p-0 flex flex-col border-0 shadow-none", // 테두리와 그림자 강제 제거
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
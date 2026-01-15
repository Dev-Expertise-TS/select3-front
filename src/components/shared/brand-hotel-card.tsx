'use client'

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"
import { OptimizedImage } from "@/components/ui/optimized-image"
import { optimizeHotelCardImage } from "@/lib/image-optimization"
import { getSafeImageUrl } from "@/lib/image-utils"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface BrandHotelCardProps {
  href: string
  image: string
  name: string
  nameKo?: string
  city: string
  address: string
  brandLabel?: string
  brandLabels?: string[]
  // 브랜드 ID를 받아서 동적으로 조회할 수 있도록 추가
  brandId?: number
  brandId2?: number
  brandId3?: number
  className?: string
  priority?: boolean
}

export function BrandHotelCard({
  href,
  image,
  name,
  nameKo,
  city,
  address,
  brandLabel,
  brandLabels,
  brandId,
  brandId2,
  brandId3,
  className,
  priority = false,
}: BrandHotelCardProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority) // priority 이미지는 즉시 로드
  const cardRef = useRef<HTMLDivElement>(null)
  
  // brand_id, brand_id_2, brand_id_3를 순서대로 수집
  const allBrandIds = [
    brandId,
    brandId2,
    brandId3
  ].filter((id) => id !== null && id !== undefined && id !== '')
  
  // 기존 브랜드명 정보
  const existingBrandNames = (brandLabels || []).filter(Boolean)
  const hasAllBrandNames = existingBrandNames.length > 0 && existingBrandNames.length === allBrandIds.length
  
  // 누락된 브랜드 ID 찾기 (brandLabels 배열이 없거나 개수가 맞지 않으면 모든 ID 조회)
  const missingBrandIds = hasAllBrandNames ? [] : allBrandIds
  
  // 누락된 브랜드 정보 조회
  const { data: missingBrandData } = useQuery({
    queryKey: ['brand-names-card', missingBrandIds.sort().join(',')],
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
  const finalBrandLabels = (() => {
    // 1순위: brandLabels 배열이 있고 개수가 맞으면 사용
    if (hasAllBrandNames) {
      return existingBrandNames
    }

    // 2순위: brandLabels + 조회한 누락 브랜드 정보 조합
    const labels: string[] = []
    const brandMap = new Map<string, string>()
    
    // 기존 brandLabels 매핑 (순서대로)
    if (existingBrandNames.length > 0) {
      existingBrandNames.forEach((name, index) => {
        if (allBrandIds[index]) {
          brandMap.set(String(allBrandIds[index]), name)
        }
      })
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
      }
    })

    // brandLabels가 있고 누락된 것이 없으면 그대로 사용
    if (labels.length === 0 && existingBrandNames.length > 0) {
      return existingBrandNames
    }

    return labels.length > 0 ? labels : (brandLabels || [])
  })()

  // Intersection Observer로 뷰포트 진입 감지
  useEffect(() => {
    if (priority) return // priority 이미지는 즉시 로드

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        rootMargin: '50px', // 50px 전에 미리 로드 시작
        threshold: 0.1 
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  return (
    <Link href={href}>
      <Card
        ref={cardRef}
        className={cn(
          "group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-0 bg-white gap-3",
          className
        )}
      >
        <div className="relative aspect-[4/3] h-48 overflow-hidden">
          {/* 로딩 스켈레톤 */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* 에러 상태 */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs">이미지 로드 실패</p>
              </div>
            </div>
          )}
          
          {isInView && (
            <OptimizedImage
              src={hasError ? '/placeholder.svg' : optimizeHotelCardImage(getSafeImageUrl(image))}
              alt={`${name} - ${city}`}
              fill
              className={cn(
                "object-cover object-center group-hover:scale-105 transition-transform duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              quality={priority ? 85 : 75}
              format="webp"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pV2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true)
                setIsLoading(false)
                console.warn(`🖼️ [BrandHotelCard] 이미지 로딩 실패:`, {
                  name,
                  city,
                  image_url: image,
                  optimized_url: optimizeHotelCardImage(getSafeImageUrl(image))
                })
              }}
            />
          )}

          {(finalBrandLabels?.length || brandLabel) && (
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
              {(finalBrandLabels?.length ? finalBrandLabels : brandLabel ? [brandLabel] : []).map((label, index) => (
                <span
                  key={`${label}-${index}`}
                  className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-900 w-fit"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <CardContent className="pt-0 px-4 pb-4">
          <div className="mb-1">
            {nameKo && (
              <h3 className="font-semibold text-lg text-gray-900 mb-0.5 group-hover:text-blue-600 transition-colors truncate">
                {nameKo}
              </h3>
            )}
            <h4 className="font-medium text-base text-gray-700 mb-0.5 group-hover:text-blue-600 transition-colors truncate">
              {name}
            </h4>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city}
            </p>
          </div>

          <div className="text-xs text-gray-500 truncate">
            {address}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}



'use client'

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useRef, useEffect } from "react"

export interface BrandHotelCardProps {
  href: string
  image: string
  name: string
  nameKo?: string
  city: string
  address: string
  brandLabel?: string
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
  className,
  priority = false,
}: BrandHotelCardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority) // priority 이미지는 즉시 로드
  const cardRef = useRef<HTMLDivElement>(null)

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
            <Image
              src={hasError ? '/placeholder.svg' : image}
              alt={`${name} - ${city}`}
              fill
              className={cn(
                "object-cover object-center group-hover:scale-110 transition-transform duration-500",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              quality={priority ? 90 : 75} // 우선 로딩 이미지는 더 높은 품질
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pV2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              loading={priority ? "eager" : "lazy"}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setHasError(true)
                setIsLoading(false)
              }}
            />
          )}
          
          {/* 이미지 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {brandLabel && (
            <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-900">
              {brandLabel}
            </span>
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



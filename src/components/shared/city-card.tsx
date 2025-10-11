"use client"

import Link from "next/link"
import { MapPin } from "lucide-react"
import { CityImage } from "./city-image"

interface CityCardProps {
  cityCode: string
  cityKo: string
  cityEn?: string | null
  countryKo?: string | null
  href: string
  priority?: boolean
  preloadedImageUrl?: string  // 서버에서 미리 가져온 이미지 URL (성능 최적화)
}

/**
 * 도시 카드 컴포넌트 (성능 최적화)
 * 
 * Best Practice:
 * - preloadedImageUrl 사용 시 API 호출 생략 (빠른 로딩)
 * - API 호출 없이 즉시 이미지 표시
 * 
 * 사용 예시:
 * <CityCard
 *   cityCode="TYO"
 *   cityKo="도쿄"
 *   countryKo="일본"
 *   href="/hotel?city=TYO"
 *   preloadedImageUrl="https://..." // 서버에서 가져온 URL
 * />
 */
export function CityCard({
  cityCode,
  cityKo,
  cityEn,
  countryKo,
  href,
  priority = false,
  preloadedImageUrl
}: CityCardProps) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
          <CityImage
            cityCode={cityCode}
            cityKo={cityKo}
            alt={`${cityKo}, ${countryKo}`}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
            priority={priority}
            preloadedImageUrl={preloadedImageUrl}  // 서버에서 가져온 이미지 전달
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg mb-1">{cityKo}</h3>
            {countryKo && (
              <p className="text-white/90 text-sm flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {countryKo}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}


'use client'

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/hotel-card"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BrandHotelCardProps {
  href: string
  image: string
  name: string
  nameKo?: string
  city: string
  address: string
  brandLabel?: string
  className?: string
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
}: BrandHotelCardProps) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "group cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 p-0 bg-white gap-3",
          className
        )}
      >
        <div className="relative aspect-[4/3] h-48 overflow-hidden">
          <Image
            src={image}
            alt={`${name} - ${city}`}
            fill
            className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={false}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/placeholder.svg'
            }}
          />
          
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



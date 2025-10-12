'use client'

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface BrandCardProps {
  chainId: number
  chainName: string
  chainNameKr?: string
  slug: string
  logoPath: string
  className?: string
}

export function BrandCard({
  chainId,
  chainName,
  chainNameKr,
  slug,
  logoPath,
  className
}: BrandCardProps) {
  return (
    <Link 
      href={`/brand/${slug}`} 
      className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      aria-label={`${chainNameKr || chainName} 브랜드 페이지로 이동`}
    >
      <div className={cn(
        "bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden aspect-[4/3] relative border border-gray-100",
        className
      )}>
        <Image
          src={logoPath || "/placeholder.svg"}
          alt={chainName}
          fill
          className="object-contain p-4 transition-all duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
          priority={false}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
        
        {/* 호버 시 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* 브랜드 이름 (카드 외부) */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
          {chainNameKr || chainName}
        </h3>
      </div>
    </Link>
  )
}

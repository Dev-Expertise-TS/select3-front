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
        "bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden aspect-[4/3] relative",
        "hover:bg-gray-100 hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
        className
      )}>
        <Image
          src={logoPath || "/placeholder.svg"}
          alt={chainName}
          fill
          className="object-contain p-1 md:p-4 transition-all duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 15vw"
          priority={false}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
        
        {/* 호버 시 브랜드 이름 표시 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center opacity-0 group-hover:opacity-100">
          <div className="text-white text-center p-4 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <h3 className="font-semibold text-sm md:text-base mb-1">
              {chainNameKr || chainName}
            </h3>
            {chainNameKr && (
              <p className="text-xs text-gray-200">
                {chainName}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

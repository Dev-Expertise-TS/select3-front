'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface BrandMosaicCardProps {
  brand: {
    brand_id: number
    brand_name_en: string | null
    brand_name_ko: string | null
    brand_slug: string | null
    hotel_images: Array<{ url: string; alt: string }>
  }
}

export function BrandMosaicCard({ brand }: BrandMosaicCardProps) {
  const [mounted, setMounted] = useState(false)
  const [shuffledImages, setShuffledImages] = useState<Array<{ url: string; alt: string }>>([])

  useEffect(() => {
    if (brand.hotel_images.length === 0) {
      setMounted(true)
      return
    }

    // 최소 20개 이미지 확보
    const minImages = 20
    let filledImages = [...brand.hotel_images]
    
    while (filledImages.length < minImages) {
      filledImages = [...filledImages, ...brand.hotel_images]
    }

    // 셔플
    const shuffled = filledImages
      .slice(0, minImages)
      .sort(() => Math.random() - 0.5)
    
    setShuffledImages(shuffled)
    setMounted(true)
  }, [brand.hotel_images])

  const brandName = brand.brand_name_ko || brand.brand_name_en || 'Brand'

  if (!brand.brand_slug) {
    return null
  }

  return (
    <Link
      href={`/hotel/brand/${brand.brand_slug}`}
      className="group relative aspect-square overflow-hidden bg-black transition-all duration-300 active:scale-95"
    >
      {/* 모자이크 배경 그리드 */}
      {mounted && shuffledImages.length > 0 && (
        <div className="absolute inset-0 grid grid-cols-4 gap-px overflow-hidden">
          {shuffledImages.map((img, idx) => (
            <div
              key={`${brand.brand_id}-${idx}`}
              className="relative overflow-hidden"
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="25vw"
                className="object-cover transition-all duration-500 group-hover:scale-110 brightness-90 group-hover:brightness-50 group-hover:grayscale-[50%]"
                quality={75}
              />
            </div>
          ))}
        </div>
      )}

      {/* 오버레이 - 호버 시 흰색으로 */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-white/95 transition-all duration-500"></div>

      {/* 중앙 브랜드명 */}
      <div className="absolute inset-0 flex items-center justify-center z-10 px-6">
        <div className="text-center transition-all duration-300 group-hover:scale-105">
          <h2 
            className="brand-title text-2xl md:text-3xl lg:text-4xl font-light text-white group-hover:text-black tracking-wider uppercase transition-all duration-300"
            style={{ 
              lineHeight: '1.3'
            }}
          >
            {brand.brand_name_en || brandName}
          </h2>
          {brand.brand_name_ko && brand.brand_name_en && (
            <p 
              className="brand-subtitle mt-2 text-sm md:text-base text-white/80 group-hover:text-black/70 font-light tracking-wide transition-all duration-300"
            >
              {brand.brand_name_ko}
            </p>
          )}
        </div>
      </div>

      {/* 호버 테두리 효과 */}
      <div className="absolute inset-0 border-2 border-white/0 group-hover:border-black/20 transition-all duration-300"></div>
      
      {/* 클릭 효과 - 펄스 애니메이션 */}
      <div className="absolute inset-0 bg-white/0 group-active:bg-white/20 transition-all duration-150"></div>
      
      {/* CSS 애니메이션 및 스타일 */}
      <style jsx>{`
        .brand-title {
          text-shadow: 0 4px 16px rgba(0,0,0,0.95), 0 2px 6px rgba(0,0,0,0.9);
        }
        
        .brand-subtitle {
          text-shadow: 0 2px 8px rgba(0,0,0,0.9);
        }
        
        :global(.group:hover) .brand-title,
        :global(.group:hover) .brand-subtitle {
          text-shadow: none;
        }
        
        @keyframes click-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.98);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Link>
  )
}


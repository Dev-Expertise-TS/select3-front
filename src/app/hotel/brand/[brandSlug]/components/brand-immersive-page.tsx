'use client'

import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface BrandImmersivePageProps {
  brand: {
    brand_id: number
    brand_name_en: string
    brand_name_ko?: string | null
    brand_slug: string
    brand_description?: string | null
    brand_description_ko?: string | null
  }
  hotels: any[]
  aiDescription: string
}

export function BrandImmersivePage({ brand, hotels, aiDescription }: BrandImmersivePageProps) {
  const [mounted, setMounted] = useState(false)
  const [shuffledImages, setShuffledImages] = useState<Array<{url: string, alt: string, slug: string}>>([])
  
  // 이미지 셔플 및 그리드 채우기
  useEffect(() => {
    // 모든 호텔 이미지 수집
    const hotelImages = hotels
      .filter(h => h.image)
      .map(h => ({
        url: h.image,
        alt: h.property_name_ko || h.property_name_en,
        slug: h.slug
      }))

    if (hotelImages.length === 0) {
      setMounted(true)
      return
    }

    // 화면을 채우기 위한 최소 이미지 개수 계산
    // 모바일: 4열 × 15행 = 60개 (col-span 고려하면 ~40개)
    // 태블릿: 5열 × 12행 = 60개
    // 데스크톱: 6열 × 10행 = 60개
    const minRequiredImages = 80

    // 이미지가 부족하면 반복해서 채우기
    let filledImages = [...hotelImages]
    while (filledImages.length < minRequiredImages) {
      filledImages = [...filledImages, ...hotelImages]
    }

    // 클라이언트에서만 셔플 (Hydration 오류 방지)
    const shuffled = filledImages
      .slice(0, minRequiredImages)
      .sort(() => Math.random() - 0.5)
    
    setShuffledImages(shuffled)
    setMounted(true)
  }, [hotels])

  const brandName = brand.brand_name_ko || brand.brand_name_en

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* 모자이크 배경 그리드 - 클릭 불가 */}
      {mounted && shuffledImages.length > 0 && (
        <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 auto-rows-[minmax(120px,1fr)] gap-1 p-1 pointer-events-none overflow-hidden">
          {shuffledImages.map((img, idx) => (
          <div
            key={`${img.slug}-${idx}`}
            className={`relative overflow-hidden ${
              idx % 7 === 0 ? 'col-span-2 row-span-2' : 
              idx % 5 === 0 ? 'row-span-2' : 
              ''
            } ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{
              animationDelay: `${idx * 50}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
              className="object-cover hover:scale-110 transition-transform duration-700 brightness-110"
              quality={85}
              priority={idx < 6}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE1MTUxNSIvPjwvc3ZnPg=="
            />
            <div className="absolute inset-0 bg-black/5 hover:bg-black/10 transition-colors duration-300"></div>
          </div>
          ))}
        </div>
      )}

      {/* 전체 오버레이 - 밝게 조정 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/15 pointer-events-none"></div>
      
      {/* 중앙 텍스트 영역만 어둡게 - radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.2) 50%, transparent 70%)'
        }}
      ></div>

      {/* 중앙 콘텐츠 - 최상위 레이어 */}
      <div className="relative z-50 min-h-screen flex items-center justify-center px-6 pointer-events-none">
        <div className="max-w-4xl text-center">
          {/* 브랜드명 */}
          <div 
            className={`mb-8 ${mounted ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            {brand.brand_name_ko && (
              <h1 
                className="text-3xl md:text-5xl lg:text-6xl font-extralight text-white mb-4 tracking-tighter leading-none"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9)' }}
              >
                {brand.brand_name_ko}
              </h1>
            )}
            <p 
              className="text-2xl md:text-4xl lg:text-5xl font-light text-white tracking-[0.2em] uppercase"
              style={{ textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.8)' }}
            >
              {brand.brand_name_en}
            </p>
          </div>

          {/* 구분선 */}
          <div 
            className={`flex justify-center mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            <div className="w-32 h-px bg-white/60 shadow-lg"></div>
          </div>

          {/* 브랜드 설명 */}
          <p 
            className={`text-base md:text-xl text-white leading-relaxed font-medium mb-12 max-w-2xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ 
              animationDelay: '900ms', 
              animationFillMode: 'forwards',
              textShadow: '0 3px 12px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)'
            }}
          >
            {aiDescription}
          </p>

          {/* 호텔 수 */}
          <div 
            className={`text-sm md:text-base text-white mb-12 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ 
              animationDelay: '1200ms', 
              animationFillMode: 'forwards',
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)'
            }}
          >
            <div className="mb-1">TOURVIS SELECT에서 예약 가능한</div>
            <div className="text-white font-medium">{hotels.length}개 {brand.brand_name_en.toUpperCase()} 호텔</div>
          </div>

          {/* CTA 버튼 */}
          <div 
            className={`pointer-events-auto ${mounted ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '1500ms', animationFillMode: 'forwards' }}
          >
            <a
              href={`/hotel?brand_id=${brand.brand_id}`}
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 rounded-full cursor-pointer pointer-events-auto relative z-[100] no-underline"
            >
              <span className="text-white text-sm md:text-base font-medium tracking-wide pointer-events-none">
                {brand.brand_name_ko || brand.brand_name_en} 호텔 보기
              </span>
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1 pointer-events-none" />
            </a>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}


'use client'

import Image from 'next/image'
import { Sparkles } from 'lucide-react'

interface HeroMosaicProps {
  title: string
  hashtags: string[] | null
  hotelCount: number
  hotelImages: string[]
}

export function HeroMosaic({ title, hashtags, hotelCount, hotelImages }: HeroMosaicProps) {
  return (
    <div className="relative overflow-hidden bg-black min-h-[600px] sm:min-h-[700px]">
      {/* Mosaic Background */}
      {hotelImages.length > 0 ? (
        <div className="absolute inset-0">
          <div className="grid grid-cols-6 grid-rows-3 h-full w-full gap-1">
            {hotelImages.map((url, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden ${
                  idx === 0 ? 'col-span-2 row-span-2' : 
                  idx === 4 ? 'col-span-2 row-span-2' :
                  idx === 8 ? 'col-span-2 row-span-1' :
                  'col-span-1 row-span-1'
                }`}
              >
                <Image
                  src={url}
                  alt="Hotel"
                  fill
                  className="object-cover opacity-80 hover:scale-110 hover:opacity-100 transition-all duration-700"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[600px] sm:min-h-[700px]">
        <div className="container mx-auto max-w-[1440px] px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border-2 border-white/30 text-sm font-bold shadow-2xl">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-white">큐레이션된 호텔 컬렉션</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-2xl">
              {title}
            </h1>
            
            {hashtags && hashtags.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mt-8">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-5 py-2.5 bg-white/15 backdrop-blur-xl rounded-full text-sm font-bold text-white border border-white/30 hover:bg-white/25 hover:scale-105 transition-all duration-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {hotelCount > 0 && (
              <div className="pt-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400/90 backdrop-blur-sm rounded-full text-gray-900 font-black text-lg shadow-xl">
                  <span>{hotelCount}개의 엄선된 호텔</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg className="w-full h-16 text-white drop-shadow-2xl" viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 64h1440V0c-120 32-240 48-360 48S960 32 840 32 600 16 480 16 240 32 120 32 0 48 0 48z" fill="currentColor"/>
        </svg>
      </div>
    </div>
  )
}


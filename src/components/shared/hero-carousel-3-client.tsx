"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SectionContainer } from "@/components/shared/section-container"
import { optimizeHeroImageMobile, optimizeHeroImageDesktop } from "@/lib/image-optimization"
import type { HeroImageData } from "@/features/hero/hero-data"

interface CarouselSlide {
  id: number
  title: string
  subtitle: string
  description: string
  image: string
  hotelName: string
  location: string
  hotelId: string
  category: string
  date: string
  city: string
  chain_name_en: string
  brand_name_en: string
}

interface HeroCarousel3ClientProps {
  heroImages: HeroImageData[]
}

// 기본 carouselSlides (데이터가 없을 때 fallback용)
const defaultCarouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "Premium Luxury Experience",
    subtitle: "at the world's finest properties",
    description: "Experience luxury with exclusive perks",
    image: "/placeholder.svg",
    hotelName: "Luxury Hotel & Resort",
    location: "Premium Destination",
    hotelId: "default-hotel-1",
    category: "LUXURY",
    date: "AVAILABLE NOW",
    city: "Destination",
    chain_name_en: "LUXURY",
    brand_name_en: "PREMIUM",
  },
]

export function HeroCarousel3Client({ heroImages }: HeroCarousel3ClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [shuffleToken] = useState(() => Math.random())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 서버에서 받은 데이터 사용
  const baseSlides: CarouselSlide[] = Array.isArray(heroImages) && heroImages.length > 0 
    ? heroImages.slice(0, 3).map((image: HeroImageData, index: number) => ({
        id: index + 1,
        title: "Premium Luxury Experience",
        subtitle: "at the world's finest properties",
        description: "Experience luxury with exclusive perks",
        image: image.media_path,
        hotelName: image.property_name_ko,
        location: image.property_name_en,
        hotelId: image.slug || `hotel-${image.sabre_id}`,
        category: "LUXURY",
        date: "DECEMBER 15, 2024",
        city: image.city,
        chain_name_en: image.chain_name_en,
        brand_name_en: image.brand_name_en,
      }))
    : defaultCarouselSlides

  // 모바일에서는 무작위 순서
  const carouselSlides = useMemo(() => {
    const arr = [...baseSlides]
    if (isMobile) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = arr[i]
        arr[i] = arr[j]
        arr[j] = tmp
      }
    }
    return arr
  }, [isMobile, heroImages, shuffleToken])

  // 모바일에서 시작 슬라이드도 랜덤
  useEffect(() => {
    if (isMobile && carouselSlides.length > 0) {
      setCurrentSlide(Math.floor(Math.random() * carouselSlides.length))
    }
  }, [shuffleToken])

  // 슬라이드 변경
  const changeSlide = useCallback((newSlide: number) => {
    setCurrentSlide(newSlide)
  }, [])

  useEffect(() => {
    const intervalMs = isMobile ? 6200 : 5000
    const timer = setInterval(() => {
      const nextSlide = (currentSlide + 1) % carouselSlides.length
      changeSlide(nextSlide)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [currentSlide, carouselSlides.length, changeSlide, isMobile])

  const nextSlide = () => {
    const nextSlideIndex = (currentSlide + 1) % carouselSlides.length
    changeSlide(nextSlideIndex)
  }

  const prevSlide = () => {
    const prevSlideIndex = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length
    changeSlide(prevSlideIndex)
  }

  return (
    <div className="w-full">
      <section className="relative mt-0.5 pt-0 pb-0 sm:py-8">
        <SectionContainer className="px-0 sm:px-4">
          <div className="relative">
            {/* 모바일 슬라이드 뷰 */}
            <div className="lg:hidden">
              <div className="relative aspect-[4/2] md:aspect-[4/3] overflow-hidden group rounded-none sm:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href={`/hotel/${carouselSlides[currentSlide].hotelId}`}>
                  <div className="relative w-full h-full">
                    <Image
                      src={optimizeHeroImageMobile(carouselSlides[currentSlide].image || "/placeholder.svg")}
                      alt={`${carouselSlides[currentSlide].hotelName} - Premium Hotel Property`}
                      fill
                      priority
                      unoptimized={true}
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw"
                      fetchPriority="high"
                      loading="eager"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {/* Top: Category Badge */}
                      <div className="flex justify-start p-4">
                        <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          {carouselSlides[currentSlide].brand_name_en || carouselSlides[currentSlide].chain_name_en || 'LUXURY'}
                        </span>
                      </div>
                      
                      {/* Bottom: Title and Date */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                        <div className="relative text-white p-4">
                          <h2 className="text-sm font-bold mb-2 leading-tight line-clamp-2">
                            {carouselSlides[currentSlide].hotelName}({carouselSlides[currentSlide].location})
                          </h2>
                          <p className="text-xs opacity-90">{carouselSlides[currentSlide].city}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Navigation Buttons */}
                    {carouselSlides.length > 1 && (
                      <div className="pointer-events-auto">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            prevSlide()
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                          aria-label="이전 슬라이드"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            nextSlide()
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
                          aria-label="다음 슬라이드"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              </div>

              {/* Carousel Indicators */}
              {carouselSlides.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        changeSlide(index)
                      }}
                      className="p-2"
                      aria-label={`슬라이드 ${index + 1}로 이동`}
                    >
                      <span className={`block h-1.5 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white w-8' : 'bg-white/60 w-1.5'
                      }`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 데스크탑 그리드 뷰 */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-3">
              {carouselSlides.map((slide, index) => (
                <Link key={slide.id} href={`/hotel/${slide.hotelId}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                    <Image
                      src={optimizeHeroImageDesktop(slide.image || "/placeholder.svg")}
                      alt={`${slide.hotelName} - Premium Hotel Property`}
                      fill
                      priority={index === 0}
                      unoptimized={true}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                    
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {/* Top: Category Badge */}
                      <div className="flex justify-start p-4">
                        <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          {slide.brand_name_en || slide.chain_name_en || 'LUXURY'}
                        </span>
                      </div>
                      
                      {/* Bottom: Title and Date */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                        <div className="relative text-white p-4">
                          <h2 className="text-sm font-bold mb-2 leading-tight line-clamp-2">
                            {slide.hotelName}({slide.location})
                          </h2>
                          <p className="text-xs opacity-90">{slide.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  )
}


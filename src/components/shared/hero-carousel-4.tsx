"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { useHeroImages, type HeroImageData } from "@/hooks/use-hero-images"
import { SectionContainer } from "@/components/shared/section-container"

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

// 기본 carouselSlides (데이터가 없을 때 fallback용)
const defaultCarouselSlides: CarouselSlide[] = [
  {
    id: 1,
    title: "Your Guide to Tokyo's Finest Luxury Hotels",
    subtitle: "Premium Experience",
    description: "Discover the most exclusive accommodations in Japan's capital",
    image: "/destination-image/tokyo.jpg",
    hotelName: "Park Hyatt Tokyo",
    location: "Park Hyatt Tokyo",
    hotelId: "park-hyatt-tokyo",
    category: "LUXURY",
    date: "DECEMBER 15, 2024",
    city: "Tokyo",
    chain_name_en: "HYATT",
    brand_name_en: "PARK HYATT",
  },
  {
    id: 2,
    title: "6 Perfect Places to Experience Luxury in London",
    subtitle: "Royal Hospitality",
    description: "Experience world-class service in iconic British destinations",
    image: "/destination-image/london.jpg",
    hotelName: "The Ritz-Carlton",
    location: "The Ritz-Carlton",
    hotelId: "ritz-carlton-london",
    category: "EXPERIENCE",
    date: "DECEMBER 15, 2024",
    city: "London",
    chain_name_en: "MARRIOTT",
    brand_name_en: "THE RITZ-CARLTON",
  },
  {
    id: 3,
    title: "10 Summer Safety Tips For Luxury Travelers",
    subtitle: "Travel Guide",
    description: "Essential advice for safe and luxurious summer adventures",
    image: "/destination-image/bali.webp",
    hotelName: "Four Seasons New York",
    location: "Four Seasons New York",
    hotelId: "four-seasons-ny",
    category: "GUIDE",
    date: "DECEMBER 15, 2024",
    city: "New York",
    chain_name_en: "FOUR SEASONS",
    brand_name_en: "FOUR SEASONS",
  },
  {
    id: 4,
    title: "Expert Tips: How To Choose The Perfect Luxury Hotel",
    subtitle: "Travel Tips",
    description: "Professional advice for selecting premium accommodations",
    image: "/destination-image/singapore.jpg",
    hotelName: "Mandarin Oriental Bangkok",
    location: "Mandarin Oriental Bangkok",
    hotelId: "mandarin-oriental-bangkok",
    category: "TIPS",
    date: "DECEMBER 15, 2024",
    city: "Bangkok",
    chain_name_en: "MANDARIN ORIENTAL",
    brand_name_en: "MANDARIN ORIENTAL",
  },
]

export function HeroCarousel4() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [shuffleToken] = useState(() => Math.random())
  const [currentImages, setCurrentImages] = useState<CarouselSlide[]>([])
  const { data: heroImages, isLoading, error, refetch } = useHeroImages()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // 동적 데이터가 있으면 사용, 없으면 기본 데이터 사용
  const baseSlides: CarouselSlide[] = Array.isArray(heroImages) && heroImages.length > 0 
    ? heroImages.map((image: HeroImageData, index: number) => ({
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

  // 모바일에서는 접속/리프레시마다 무작위 순서
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

  // 모바일에서 접속/리프레시 시 시작 슬라이드도 랜덤
  useEffect(() => {
    if (isMobile && carouselSlides.length > 0) {
      setCurrentSlide(Math.floor(Math.random() * carouselSlides.length))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleToken])

  // 이미지 전환 시 새로운 랜덤 이미지 가져오기
  const refreshImages = useCallback(async () => {
    if (Array.isArray(heroImages) && heroImages.length > 0) {
      await refetch()
    }
  }, [heroImages, refetch])

  // 슬라이드 변경 시 이미지 새로고침
  const changeSlide = useCallback((newSlide: number) => {
    setCurrentSlide(newSlide)
    // 다음 슬라이드로 이동할 때마다 이미지 새로고침
    setTimeout(() => {
      refreshImages()
    }, 100)
  }, [refreshImages])

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
      <section className="relative mt-0.5 pt-0 pb-3 sm:py-8">
        <SectionContainer className="px-0 sm:px-4">
          {/* 모바일: 1개 슬라이드, PC: 4개 그리드 */}
          <div className="relative">
            {/* 모바일 슬라이드 뷰 */}
            <div className="lg:hidden">
              <div className="relative aspect-[4/2.1] sm:aspect-[4/3] overflow-hidden group rounded-none sm:rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Link href={`/hotel/${carouselSlides[currentSlide].hotelId}`}>
                  <div className="relative w-full h-full">
                    {/* Background Image */}
                    {isLoading ? (
                      <div className="w-full h-full bg-gray-300 animate-pulse" />
                    ) : error ? (
                      <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                        <p className="text-gray-600">이미지를 불러올 수 없습니다.</p>
                      </div>
                    ) : (
                      <Image
                        src={carouselSlides[currentSlide].image || "/placeholder.svg"}
                        alt={`${carouselSlides[currentSlide].hotelName} - Premium Hotel Property`}
                        fill
                        priority
                        className="object-cover transition-all duration-300 group-hover:scale-105"
                        sizes="100vw"
                        onError={(e) => {
                          console.error(`❌ 히어로 이미지 로딩 실패: ${carouselSlides[currentSlide].image}`)
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg'
                        }}
                      />
                    )}
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {/* Top: Category Badge */}
                      <div className="flex justify-start p-4">
                        <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-1">
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
                  </div>
                </Link>

                {/* 좌우 네비게이션 버튼 (이미지 영역 내부) */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    prevSlide()
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous slide"
                >
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    nextSlide()
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next slide"
                >
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 하단 도트 인디케이터 */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        changeSlide(index)
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentSlide ? 'bg-white w-8' : 'bg-white/60 w-1.5'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* PC 그리드 뷰 */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-3">
              {carouselSlides.map((slide, index) => (
                <div key={slide.id} className="relative aspect-[4/3] overflow-hidden group cursor-pointer rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <Link href={`/hotel/${slide.hotelId}`}>
                    <div className="relative w-full h-full">
                      {/* Background Image */}
                      {isLoading ? (
                        <div className="w-full h-full bg-gray-300 animate-pulse" />
                      ) : error ? (
                        <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                          <p className="text-gray-600">이미지를 불러올 수 없습니다.</p>
                        </div>
                      ) : (
                        <Image
                          src={slide.image || "/placeholder.svg"}
                          alt={`${slide.hotelName} - Premium Hotel Property`}
                          fill
                          priority={index < 2}
                          className="object-cover transition-all duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          onError={(e) => {
                            console.error(`❌ 히어로 이미지 로딩 실패: ${slide.image}`)
                            const target = e.target as HTMLImageElement
                            target.src = '/placeholder.svg'
                          }}
                        />
                      )}
                      
                      {/* Content Overlay */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {/* Top: Category Badge */}
                        <div className="flex justify-start p-4">
                          <span className="inline-block bg-orange-500 text-white text-xs font-semibold px-2 py-1">
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
                </div>
              ))}
            </div>
          </div>
        </SectionContainer>
      </section>
    </div>
  )
}

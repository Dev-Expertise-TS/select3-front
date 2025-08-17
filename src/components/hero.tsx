"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useHeroImages } from "@/hooks/use-hero-images"



// 기본 carouselSlides (데이터가 없을 때 fallback용)
const defaultCarouselSlides = [
  {
    id: 1,
    title: "Over 900",
    subtitle: "luxury hotels around the world",
    description: "Hundreds under $299/night",
    image: "/park-hyatt-tokyo-city-view.png",
    hotelName: "Park Hyatt Tokyo",
    location: "Tokyo, Japan",
    hotelId: "park-hyatt-tokyo",
  },
  {
    id: 2,
    title: "Premium Benefits",
    subtitle: "designed for Visa Signature cardholders",
    description: "Experience luxury with exclusive perks",
    image: "/ritz-carlton-laguna-niguel-ocean-view.png",
    hotelName: "The Ritz-Carlton",
    location: "Laguna Niguel, CA",
    hotelId: "ritz-carlton-laguna",
  },
  {
    id: 3,
    title: "Exceptional Service",
    subtitle: "at the world's finest properties",
    description: "Personalized experiences in iconic destinations",
    image: "/four-seasons-new-york-luxury-suite.png",
    hotelName: "Four Seasons New York",
    location: "New York, NY",
    hotelId: "four-seasons-ny",
  },
  {
    id: 4,
    title: "Cultural Immersion",
    subtitle: "with legendary hospitality",
    description: "Discover authentic luxury in exotic locations",
    image: "/mandarin-oriental-bangkok-riverside-view.png",
    hotelName: "Mandarin Oriental Bangkok",
    location: "Bangkok, Thailand",
    hotelId: "mandarin-oriental-bangkok",
  },
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { data: heroImages, isLoading, error } = useHeroImages()

  // 동적 데이터가 있으면 사용, 없으면 기본 데이터 사용
  const carouselSlides = heroImages && heroImages.length > 0 
    ? heroImages.map((image, index) => ({
        id: index + 1,
        title: "Premium Luxury",
        subtitle: "at the world's finest properties",
        description: "Experience luxury with exclusive perks",
        image: image.media_path,
        hotelName: image.property_name_ko,
        location: image.property_name_en,
        hotelId: image.slug || `hotel-${image.sabre_id}`,
      }))
    : defaultCarouselSlides

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselSlides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  const currentSlideData = carouselSlides[currentSlide]

  return (
    <div className="container mx-auto max-w-[1200px] px-4">
      <section className="relative h-[40.8vh] min-h-[307px] overflow-hidden rounded-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full bg-gray-300 animate-pulse" />
          ) : error ? (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center">
              <p className="text-gray-600">이미지를 불러올 수 없습니다.</p>
            </div>
          ) : (
            <Image
              src={currentSlideData.image || "/placeholder.svg"}
              alt={`${currentSlideData.hotelName} - Premium Hotel Property`}
              fill
              priority
              className="object-cover transition-all duration-1000"
              onError={(e) => {
                console.error(`❌ 히어로 이미지 로딩 실패: ${currentSlideData.image}`)
                const target = e.target as HTMLImageElement
                target.src = '/placeholder.svg'
              }}
            />
          )}
          {/* Dark Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="px-4 md:px-8">
            <div className="max-w-2xl text-white">
              {/* Main Headline */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mb-4">{currentSlideData.title}</h1>
                <p className="text-base md:text-xl font-light mb-2">{currentSlideData.subtitle}</p>
                <p className="text-base opacity-90">{currentSlideData.description}</p>
              </div>





              {/* Hotel Info Badge */}
              <div className="absolute bottom-6 right-8 z-20">
                <Link href={`/hotel/${currentSlideData.hotelId}`}>
                  <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors cursor-pointer group">
                    <div>
                      <div className="font-semibold text-sm group-hover:text-blue-200 transition-colors">
                        {currentSlideData.hotelName}
                      </div>
                      <div className="text-xs opacity-80">{currentSlideData.location}</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

                            {/* Carousel Controls */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Carousel Indicators - integrated with controls */}
          <div className="flex space-x-3">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white w-8" : "bg-white/50"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 text-white rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

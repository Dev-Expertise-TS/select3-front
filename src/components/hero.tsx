"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, ChevronLeft, ChevronRight } from "lucide-react"

const benefits = [
  "Best available rate guarantee",
  "Automatic room upgrade upon arrival, when available",
  "Complimentary in-room Wi-Fi, when available",
  "Complimentary breakfast for two",
  "$25 USD food or beverage credit",
  "VIP Guest status",
  "Late check-out upon request, when available",
]

const carouselSlides = [
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  const currentSlideData = carouselSlides[currentSlide]

  return (
    <div className="container mx-auto max-w-[1200px] px-4">
      <section className="relative h-[51vh] min-h-[384px] overflow-hidden rounded-lg">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentSlideData.image || "/placeholder.svg"}
            alt={`${currentSlideData.hotelName} - Premium Hotel Property`}
            fill
            priority
            className="object-cover transition-all duration-1000"
          />
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

              {/* Benefits List */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">7 premium benefits:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                      <span className="text-sm font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="mb-8">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 text-lg rounded-lg amex-transition"
                >
                  go experience more
                </Button>
              </div>

              {/* Hotel Info Badge */}
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

        {/* Carousel Controls */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-20">
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

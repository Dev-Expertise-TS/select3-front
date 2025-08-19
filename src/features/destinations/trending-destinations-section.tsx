"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

const destinations = [
  {
    id: 1,
    name: "Tokyo",
    country: "Japan",
    image: "/destinations/tokyo.png",
    hotelsCount: 245,
    toursCount: 32,
  },
  {
    id: 2,
    name: "Paris",
    country: "France",
    image: "/destinations/paris.png",
    hotelsCount: 189,
    toursCount: 28,
  },
  {
    id: 3,
    name: "Bali",
    country: "Indonesia",
    image: "/destinations/bali.png",
    hotelsCount: 156,
    toursCount: 24,
  },
  {
    id: 4,
    name: "New York",
    country: "USA",
    image: "/destinations/newyork.png",
    hotelsCount: 298,
    toursCount: 41,
  },
  {
    id: 5,
    name: "Dubai",
    country: "UAE",
    image: "/destinations/dubai.png",
    hotelsCount: 134,
    toursCount: 19,
  },
  {
    id: 6,
    name: "London",
    country: "UK",
    image: "/destinations/london.png",
    hotelsCount: 267,
    toursCount: 35,
  },
  {
    id: 7,
    name: "Singapore",
    country: "Singapore",
    image: "/destinations/singapore.png",
    hotelsCount: 98,
    toursCount: 16,
  },
  {
    id: 8,
    name: "Sydney",
    country: "Australia",
    image: "/destinations/sydney.png",
    hotelsCount: 123,
    toursCount: 22,
  },
]

export function TrendingDestinationsSection() {
  return (
    <section className="py-16 bg-gray-50">
              <div className="container mx-auto max-w-[1440px] px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Immerse yourself in trending destinations
          </h2>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {destinations.map((destination) => (
            <Link key={destination.id} href={`/destination/${destination.name.toLowerCase()}`}>
              <div className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={destination.image || "/placeholder.svg"}
                    alt={`${destination.name}, ${destination.country}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">{destination.name}</h3>
                    <p className="text-white/90 text-sm flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {destination.country}
                    </p>
                    <p className="text-white/80 text-xs mt-1">{destination.hotelsCount} hotels</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent">
            View all destinations
          </Button>
        </div>
      </div>
    </section>
  )
}

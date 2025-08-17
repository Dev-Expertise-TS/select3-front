"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, ArrowUpRight } from "lucide-react"

const hotels = [
  {
    id: 1,
    name: "The St. Regis New York",
    location: "New York, NY",
    image: "/st-regis-new-york-luxury-hotel.png",
    price: "From $650",
    rating: 5,
    description: "Iconic luxury in the heart of Manhattan with timeless elegance and world-class service.",
    benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit"],
    category: "City Center",
  },
  {
    id: 2,
    name: "Park Hyatt Tokyo",
    location: "Tokyo, Japan",
    image: "/park-hyatt-tokyo-city-view.png",
    price: "From $480",
    rating: 5,
    description: "Urban sanctuary with stunning city views and contemporary Japanese design.",
    benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit"],
    category: "Urban Luxury",
  },
  {
    id: 3,
    name: "The Ritz-Carlton Laguna Niguel",
    location: "Dana Point, CA",
    image: "/ritz-carlton-laguna-niguel-ocean-view.png",
    price: "From $750",
    rating: 5,
    description: "Oceanfront resort with world-class amenities and breathtaking Pacific views.",
    benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit"],
    category: "Beach Resort",
  },
  {
    id: 4,
    name: "Four Seasons George V",
    location: "Paris, France",
    image: "/four-seasons-george-v-paris.png",
    price: "From $900",
    rating: 5,
    description: "Parisian elegance steps from the Champs-Élysées with Michelin-starred dining.",
    benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit"],
    category: "Historic Luxury",
  },
  {
    id: 5,
    name: "Aman Tokyo",
    location: "Tokyo, Japan",
    image: "/aman-tokyo-minimalist-luxury-hotel.png",
    price: "From $1,200",
    rating: 5,
    description: "Minimalist luxury in the heart of Tokyo with serene spa and wellness facilities.",
    benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit"],
    category: "Modern Luxury",
  },
  {
    id: 6,
    name: "The Peninsula Beverly Hills",
    location: "Beverly Hills, CA",
    image: "/peninsula-beverly-hills-luxury-hotel.png",
    price: "From $650",
    rating: 5,
    description: "Hollywood glamour meets timeless elegance in the heart of Beverly Hills.",
    benefits: ["12pm Check-in", "Room Upgrade", "Daily Breakfast", "$100 Credit"],
    category: "Hollywood Luxury",
  },
]

function HotelCard({ hotel }: { hotel: (typeof hotels)[0] }) {
  return (
    <Link href={`/hotel/${hotel.id}`} className="block h-full">
      <Card className="group overflow-hidden border border-gray-200 bg-white hover:shadow-xl amex-transition rounded-xl h-full cursor-pointer">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="relative aspect-[3/2] amex-hover">
            <Image src={hotel.image || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600 text-white font-semibold shadow-lg border-0 text-xs px-2 py-1">
                Fine Hotels®
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge
                variant="secondary"
                className="bg-white/95 text-blue-600 font-bold shadow-lg border-0 text-xs px-2 py-1"
              >
                $550 Value
              </Badge>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(hotel.rating)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-blue-600 text-blue-600" />
              ))}
              <span className="text-xs text-gray-500 ml-1 font-medium">{hotel.category}</span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight line-clamp-2">{hotel.name}</h3>

            <div className="flex items-center gap-1 text-gray-600 mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs font-medium">{hotel.location}</span>
            </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed flex-1 line-clamp-2">{hotel.description}</p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Benefits:</p>
              <div className="flex flex-wrap gap-1">
                {hotel.benefits.slice(0, 2).map((benefit) => (
                  <Badge
                    key={benefit}
                    variant="outline"
                    className="text-xs border-blue-200 text-blue-700 bg-blue-50 font-medium px-1.5 py-0.5"
                  >
                    {benefit}
                  </Badge>
                ))}
                {hotel.benefits.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-200 text-gray-600 bg-gray-50 font-medium px-1.5 py-0.5"
                  >
                    +{hotel.benefits.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-base font-bold text-gray-900">{hotel.price}</p>
                <p className="text-xs text-gray-500">per night</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white amex-transition font-semibold px-4 py-1.5 rounded-md group text-sm">
                View Details
                <ArrowUpRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function HotelGrid() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Featured Fine Hotels + Resorts® Properties
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our curated collection of over{" "}
            <strong className="text-blue-600">1,600 luxury properties worldwide</strong>. Each booking includes
            exclusive benefits worth an <strong className="text-blue-600">average of $550</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotels.map((hotel, index) => (
            <div key={hotel.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent font-semibold px-6 py-2.5 rounded-lg amex-transition"
          >
            View All 1,600+ Properties
          </Button>
        </div>
      </div>
    </section>
  )
}

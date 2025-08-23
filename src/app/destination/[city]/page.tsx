import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Coffee, Utensils, Waves, Heart, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search/common-search-bar"

const destinationHotels: Record<string, any[]> = {
  thailand: [
    {
      id: 1,
      name: "Twinpalms Surin Beach Phuket",
      location: "Phuket, Thailand",
      address: "106/46 Moo 3, Surin Beach Road, Choeng Thale, Thalang, Phuket 83110, Thailand",
      image: "/hotels/resort-pool-view.png",
      rating: 9.4,
      reviews: 1262,
      price: "₩1,269,000",
      originalPrice: "₩1,450,000",
      coordinates: { lat: 7.9519, lng: 98.2842 },
      amenities: [
        "Daily buffet breakfast",
        "Daily lunch or dinner",
        "One nightly cocktail per adult",
        "One 30-minute massage per adult",
        "Full-day luxury yacht cruise with welcome drink",
        "50% discount on sunbeds at Catch Beach Club",
      ],
      description: "Exceptional beachfront resort with world-class amenities",
      badge: "Limited Time LUX Exclusive",
      savings: "Save ₩900,000+ with LUXPLUS+ Month",
      cancellation: "Flexible cancellation available (hotel only)",
      nights: 5,
      rooms: 1,
      luxPlusPrice: "₩1,269,000",
      nonMemberPrice: "₩1,359,000",
      valueUp: "₩2,512,541",
      discount: "45%",
    },
    {
      id: 2,
      name: "Aleenta Phuket Phang Nga Resort & Spa",
      location: "Phuket, Thailand",
      address: "33 Moo 5, Khok Kloi, Takua Thung, Phang Nga 82140, Thailand",
      image: "/hotels/ocean-view-suite.png",
      rating: 9.4,
      reviews: 972,
      price: "₩2,579,000",
      originalPrice: "₩2,890,000",
      coordinates: { lat: 8.4304, lng: 98.2463 },
      amenities: [
        "Daily a la carte and buffet breakfast",
        "Daily a la carte lunch",
        "Nightly a la carte dinner",
        "Daily free-flow drinks",
        "One 60-minute massage per adult",
        "Welcome drink",
        "Complimentary wellness activities",
      ],
      description: "Luxury beachfront resort with pristine natural surroundings",
      badge: "Limited Time LUX Exclusive",
      savings: "Save ₩800,000+ with LUXPLUS+ Month",
      cancellation: "Flexible cancellation available (hotel only)",
      nights: 5,
      rooms: 1,
      luxPlusPrice: "₩2,579,000",
      nonMemberPrice: "₩2,689,000",
      valueUp: "₩4,827,392",
      discount: "44%",
    },
  ],
  tokyo: [
    {
      id: 3,
      name: "Park Hyatt Tokyo",
      location: "Tokyo, Japan",
      address: "3-7-1-2 Nishi-Shinjuku, Shinjuku City, Tokyo 163-1055, Japan",
      image: "/hotels/luxury-restaurant-dining.png",
      rating: 9.2,
      reviews: 1247,
      price: "¥85,000",
      originalPrice: "¥95,000",
      coordinates: { lat: 35.6762, lng: 139.6503 },
      amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Gym"],
      description: "Luxury hotel in the heart of Tokyo with stunning city views",
      badge: "Limited Time LUX Exclusive",
      nights: 1,
      rooms: 1,
    },
  ],
}

export default async function DestinationPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  const hotels = destinationHotels[city] || []

  return (
    <div className="min-h-screen bg-white">
      {/* Top Search Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto max-w-[1440px] px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                List view
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Log in
              </Button>
            </div>
          </div>

          <CommonSearchBar 
            variant="destination" 
            location={cityName} 
            guests={{ rooms: 1, adults: 1, children: 0 }}
            checkIn={(() => {
              const today = new Date()
              const twoWeeksLater = new Date(today)
              twoWeeksLater.setDate(today.getDate() + 14)
              return twoWeeksLater.toISOString().split('T')[0]
            })()}
            checkOut={(() => {
              const today = new Date()
              const twoWeeksLater = new Date(today)
              twoWeeksLater.setDate(today.getDate() + 14)
              const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
              twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
              return twoWeeksLaterPlusOne.toISOString().split('T')[0]
            })()}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="container mx-auto max-w-[1440px]">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              All filters
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Customer rating
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Inclusions
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Type of escape
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              Amenities
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Side - Hotel List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-gray-600">{hotels.length.toLocaleString()} offers found</div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  Recommended
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex">
                    {/* Hotel Image */}
                    <div className="relative w-80 h-64 flex-shrink-0">
                      <Image
                        src={hotel.image || "/placeholder.svg"}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                        sizes="320px"
                      />
                      {hotel.badge && (
                        <div className="absolute top-3 left-3 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                          {hotel.badge}
                        </div>
                      )}
                      <Button variant="ghost" size="sm" className="absolute top-3 right-3 bg-white/80 hover:bg-white">
                        <Heart className="h-4 w-4" />
                        Save
                      </Button>
                      <div className="absolute bottom-3 left-3 text-white text-sm font-medium">1 / 14</div>
                    </div>

                    {/* Hotel Info */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <span>{hotel.location}</span>
                            <span>•</span>
                            <Link href="#" className="text-blue-600 hover:underline">
                              Show on map
                            </Link>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{hotel.name}</h3>

                          {hotel.savings && (
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block">
                              {hotel.savings}
                            </div>
                          )}

                          {hotel.cancellation && (
                            <div className="text-sm text-green-600 mb-3">{hotel.cancellation}</div>
                          )}

                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-900 mb-2">Your handpicked inclusions:</div>
                            <div className="space-y-1">
                              {hotel.amenities.slice(0, 6).map((amenity: string, index: number) => (
                                <div key={index} className="flex items-center text-sm text-gray-600">
                                  <div className="w-4 h-4 mr-2 flex-shrink-0">
                                    {amenity.includes("breakfast") && <Coffee className="w-4 h-4" />}
                                    {amenity.includes("massage") && <Waves className="w-4 h-4" />}
                                    {amenity.includes("cocktail") && <Utensils className="w-4 h-4" />}
                                    {amenity.includes("yacht") && <Waves className="w-4 h-4" />}
                                    {!amenity.includes("breakfast") &&
                                      !amenity.includes("massage") &&
                                      !amenity.includes("cocktail") &&
                                      !amenity.includes("yacht") && (
                                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                      )}
                                  </div>
                                  <span>{amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-6 flex-shrink-0">
                          <div className="flex items-center justify-end mb-2">
                            <span className="text-sm text-gray-600 mr-1">Exceptional</span>
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">
                              {hotel.rating}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-4">{hotel.reviews.toLocaleString()} reviews</div>

                          <div className="text-right mb-4">
                            <div className="text-sm text-gray-600">
                              {hotel.nights} nights, {hotel.rooms} room from
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{hotel.price}</div>
                            <div className="text-sm text-gray-600">total</div>
                            <div className="text-sm text-blue-600 font-medium">with LUXPLUS+</div>
                            {hotel.nonMemberPrice && (
                              <div className="text-sm text-gray-500">Non-member {hotel.nonMemberPrice}</div>
                            )}
                            {hotel.valueUp && hotel.discount && (
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mt-1">
                                Valued up to {hotel.valueUp} | {hotel.discount}
                              </div>
                            )}
                          </div>

                          <Button className="w-full bg-gray-800 hover:bg-gray-900">View offer</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Google Map */}
        <div className="w-1/2 relative">
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-sm z-10">
            <div className="text-sm font-medium">
              Showing {Math.min(20, hotels.length)} of {hotels.length}
            </div>
          </div>

          <div className="h-full bg-gray-200">
            <iframe
              src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_BcqCGUOdFZE&center=7.9519,98.2842&zoom=10`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

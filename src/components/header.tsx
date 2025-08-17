"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/fine-hotels", label: "Fine Hotels + Resorts" },
  { href: "/destinations", label: "Destinations" },
  { href: "/benefits", label: "Member Benefits" },
  { href: "/platinum-card", label: "Platinum Card" },
  { href: "/travel", label: "Travel" },
  { href: "/support", label: "Support" },
]

const sponsoredHotels = [
  {
    id: 1,
    name: "The St. Regis New York",
    location: "New York, NY",
    image: "/luxury-hotel-st-regis-new-york.png",
    offer: "Exclusive Amex Benefits + $100 Credit",
    sponsor: "Fine Hotels + Resorts®",
    price: "From $650/night",
  },
  {
    id: 2,
    name: "Park Hyatt Tokyo",
    location: "Tokyo, Japan",
    image: "/luxury-hotel-tokyo.png",
    offer: "Room Upgrade + Daily Breakfast for Two",
    sponsor: "Fine Hotels + Resorts®",
    price: "From $480/night",
  },
  {
    id: 3,
    name: "The Ritz-Carlton Laguna Niguel",
    location: "Dana Point, CA",
    image: "/ritz-carlton-laguna-niguel-ocean-view.png",
    offer: "4pm Late Checkout + Complimentary Wi-Fi",
    sponsor: "Fine Hotels + Resorts®",
    price: "From $750/night",
  },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showPromoBanner, setShowPromoBanner] = useState(true)
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (showPromoBanner) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => (prev + 1) % sponsoredHotels.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [showPromoBanner])

  const currentPromo = sponsoredHotels[currentPromoIndex]

  return (
    <>
      {showPromoBanner && (
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="container mx-auto max-w-[1200px] px-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={currentPromo.image || "/placeholder.svg"}
                    alt={currentPromo.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold bg-white/25 text-white px-3 py-1 rounded-full">
                      {currentPromo.sponsor}
                    </span>
                    <span className="text-xs font-bold bg-yellow-400 text-blue-900 px-3 py-1 rounded-full">
                      Avg. $550 Value
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {currentPromo.name} - {currentPromo.offer}
                  </h3>
                  <p className="text-xs text-blue-100">
                    {currentPromo.location} • {currentPromo.price} • Platinum Card® Benefits Included
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={() =>
                    setCurrentPromoIndex((prev) => (prev - 1 + sponsoredHotels.length) % sponsoredHotels.length)
                  }
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-white hover:bg-white/20"
                  onClick={() => setCurrentPromoIndex((prev) => (prev + 1) % sponsoredHotels.length)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-2 text-white hover:bg-white/20"
                  onClick={() => setShowPromoBanner(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 bg-white border-b border-gray-200",
          isScrolled ? "shadow-md" : "",
        )}
      >
        <div className="container mx-auto max-w-[1200px] px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition-colors">
              <div className="w-9 h-9 bg-blue-600 rounded-sm flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-base">TS</span>
              </div>
              <div className="flex flex-col">
                <div className="text-lg font-bold text-gray-900 leading-tight">Tourvis Select</div>
                <div className="text-xs text-blue-600 font-medium -mt-0.5">Fine Hotels + Resorts®</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                Sign In
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Apply Now
              </Button>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full bg-white border-none">
                <div className="flex flex-col h-full pt-8">
                  <nav className="flex flex-col space-y-6">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-8 space-y-4">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 bg-transparent">
                      Sign In
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Apply Now</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/about", label: "셀렉트 소개" },
  { href: "/promotion", label: "프로모션" },
  { href: "/brand", label: "브랜드 & 프로그램" },
  { href: "/blog", label: "아티클" },
  { href: "/hotel", label: "호텔 & 리조트 전체보기" },
  { href: "/support", label: "투어비스" },
]

// 프로모션 호텔 데이터는 usePromotionHotels 훅에서 가져옴

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 bg-white border-b border-gray-200",
          isScrolled ? "shadow-md" : "",
        )}
              >
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
              <div className="w-24 h-12">
                <Image
                  src="/select_logo.avif"
                  alt="Tourvis Select Logo"
                  width={96}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center">
              {navigationItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                  >
                    {item.label}
                  </Link>
                  {index < navigationItems.length - 1 && (
                    <div className="w-px h-4 bg-gray-300 mx-2"></div>
                  )}
                </div>
              ))}
            </nav>

            {/* 로그인/회원가입 버튼 - 주석 처리됨
            <div className="hidden lg:flex items-center space-x-4">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                로그인 / 회원가입
              </Button>
            </div>
            */}

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
                  {/* 로그인/회원가입 버튼 - 주석 처리됨
                  <div className="mt-8 space-y-4">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">로그인 / 회원가입</Button>
                  </div>
                  */}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}

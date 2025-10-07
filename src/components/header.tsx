"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { desktopNavItems } from "@/config/navigation"

/**
 * 상단 헤더
 * - 모든 페이지에서 공통으로 사용
 * - 데스크톱에서 전체 메뉴 표시
 * - 모바일에서는 로고만 표시 (하단 네비게이션 사용)
 * - 설정: src/config/navigation.ts
 */
export function Header() {
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
              {desktopNavItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  <Link
                    href={item.href}
                    className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                  >
                    {item.label}
                  </Link>
                  {index < desktopNavItems.length - 1 && (
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
          </div>
        </div>
      </header>
    </>
  )
}

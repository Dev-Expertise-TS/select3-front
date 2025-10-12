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
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
              >
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="flex h-12 md:h-16 items-center justify-between">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors py-0 my-0">
              <div className="w-20 h-10 md:w-28 md:h-14 py-0 my-0">
                <Image
                  src="/select_logo.avif"
                  alt="Tourvis Select Logo"
                  width={112}
                  height={56}
                  className="w-full h-full object-contain py-0 my-0"
                />
              </div>
            </Link>

            <nav className="hidden lg:flex items-center">
              {desktopNavItems.map((item, index) => (
                <div key={item.href} className="flex items-center">
                  {item.href === "https://tourvis.com" ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                    >
                      <Image
                        src="/tourvis_logo.jpg"
                        alt=""
                        width={20}
                        height={20}
                        className="mr-1.5 rounded-sm"
                        aria-hidden="true"
                      />
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                    >
                      {item.label}
                    </Link>
                  )}
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

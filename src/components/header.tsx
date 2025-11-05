"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { desktopNavItems } from "@/config/navigation"
import { ChevronDown } from "lucide-react"

/**
 * 상단 헤더
 * - 모든 페이지에서 공통으로 사용
 * - 데스크톱에서 전체 메뉴 표시
 * - 모바일에서는 로고만 표시 (하단 네비게이션 사용)
 * - 설정: src/config/navigation.ts
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [topicPages, setTopicPages] = useState<Array<{ slug: string; title_ko: string }>>([])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // 호텔 추천 토픽 페이지 목록 가져오기
  useEffect(() => {
    async function fetchTopicPages() {
      try {
        const response = await fetch('/api/topic-pages/list')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTopicPages(data.pages || [])
          }
        }
      } catch (error) {
        console.error('토픽 페이지 목록 조회 실패:', error)
      }
    }
    fetchTopicPages()
  }, [])

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-white border-b border-gray-200",
          isScrolled ? "shadow-md" : "",
        )}
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
                <div 
                  key={item.href} 
                  className="relative flex items-center"
                  onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.href)}
                  onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
                >
                  {item.href === "https://tourvis.com" ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).dataLayer) {
                          (window as any).dataLayer.push({
                            event: 'nav_click',
                            event_category: 'navigation',
                            event_label: item.label,
                            nav_location: 'header',
                            nav_href: item.href,
                            timestamp: new Date().toISOString(),
                          })
                        }
                      }}
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
                  ) : item.hasDropdown ? (
                    <>
                      <Link
                        href={item.href}
                        className="flex items-center gap-1 text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                        onClick={() => {
                          if (typeof window !== 'undefined' && (window as any).dataLayer) {
                            (window as any).dataLayer.push({
                              event: 'nav_click',
                              event_category: 'navigation',
                              event_label: item.label,
                              nav_location: 'header',
                              nav_href: item.href,
                              timestamp: new Date().toISOString(),
                            })
                          }
                        }}
                      >
                        {item.label}
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform",
                          openDropdown === item.href && "rotate-180"
                        )} />
                      </Link>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === item.href && topicPages.length > 0 && (
                        <div className="absolute top-full left-0 mt-0 w-64 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                          <Link
                            href="/hotel-recommendations"
                            className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            전체 추천 보기
                          </Link>
                          <div className="border-t border-gray-100 my-2" />
                          <div className="max-h-96 overflow-y-auto">
                            {topicPages.map((page) => (
                              <Link
                                key={page.slug}
                                href={`/hotel-recommendations/${page.slug}`}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {page.title_ko}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors px-4"
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).dataLayer) {
                          (window as any).dataLayer.push({
                            event: 'nav_click',
                            event_category: 'navigation',
                            event_label: item.label,
                            nav_location: 'header',
                            nav_href: item.href,
                            timestamp: new Date().toISOString(),
                          })
                        }
                      }}
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
      
      {/* Spacer */}
      <div className="h-12 md:h-16" aria-hidden="true" />
    </>
  )
}

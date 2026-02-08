"use client"

import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { desktopNavItems } from "@/config/navigation"
import { ChevronDown } from "lucide-react"
import { getCompanyFromURL } from "@/lib/company-filter"
import { addCompanyParam } from "@/lib/url-utils"

interface HeaderProps {
  /** 서버에서 전달한 company 값 (하이드레이션 일치용) */
  initialCompany?: string | null
}

/**
 * 상단 헤더
 * - 모든 페이지에서 공통으로 사용
 * - 데스크톱에서 전체 메뉴 표시
 * - 모바일에서는 로고만 표시 (하단 네비게이션 사용)
 * - 설정: src/config/navigation.ts
 */
export function Header({ initialCompany = null }: HeaderProps) {
  const searchParams = useSearchParams()
  const [isScrolled, setIsScrolled] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [topicPages, setTopicPages] = useState<Array<{ slug: string; title_ko: string }>>([])
  const [company, setCompany] = useState<string | null>(initialCompany ?? null)

  useEffect(() => {
    setCompany(initialCompany ?? getCompanyFromURL())
  }, [searchParams, initialCompany])

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
        console.error('토픽 페이지 목록 조회 실패:', error instanceof Error ? error.message : String(error))
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
          <div className="container mx-auto max-w-[1440px] px-2 lg:px-2 xl:px-4">
            <div className="flex h-12 md:h-16 items-center justify-between">
            <Link
              href={addCompanyParam("/", initialCompany)}
              className="flex items-center gap-1.5 transition-colors py-0 my-0 [color:var(--company-primary)] hover:[color:var(--company-primary-hover)]"
              aria-label={company === "benepia" ? "SELECT for Benepia" : "Tourvis Select Logo"}
            >
              <div className="w-20 h-10 md:w-28 md:h-14 py-0 my-0 shrink-0">
                <Image
                  src="/select_logo.avif"
                  alt="SELECT"
                  width={112}
                  height={56}
                  className="w-full h-full object-contain py-0 my-0"
                />
              </div>
              {company === "benepia" && (
                <div className="h-10 md:h-14 flex items-end gap-1.5 shrink-0 pb-0.5 md:pb-1">
                  <span className="text-gray-500 font-medium text-sm md:text-base -translate-y-0.5">for</span>
                  <div className="h-6 md:h-8 w-auto flex items-end shrink-0">
                    <Image
                      src="/logo_benepia.png"
                      alt="Benepia"
                      width={80}
                      height={32}
                      className="h-full w-auto object-contain object-bottom"
                    />
                  </div>
                </div>
              )}
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
                      className="flex items-center whitespace-nowrap text-xs lg:text-xs xl:text-base font-semibold text-gray-900 transition-colors px-2 lg:px-2 xl:px-4 hover:[color:var(--company-primary)]"
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
                        href={item.href.startsWith("http") ? item.href : addCompanyParam(item.href, initialCompany)}
                        className="flex items-center gap-1 whitespace-nowrap text-xs lg:text-xs xl:text-base font-semibold text-gray-900 transition-colors px-2 lg:px-2 xl:px-4 hover:[color:var(--company-primary)]"
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
                            href={addCompanyParam("/hotel-recommendations", initialCompany)}
                            className="block px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-[var(--company-primary-light)] hover:[color:var(--company-primary)]"
                          >
                            전체 추천 보기
                          </Link>
                          <div className="border-t border-gray-100 my-2" />
                          <div className="max-h-96 overflow-y-auto">
                            {topicPages.map((page) => (
                              <Link
                                key={page.slug}
                                href={addCompanyParam(`/hotel-recommendations/${page.slug}`, initialCompany)}
                                className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-[var(--company-primary-light)] hover:[color:var(--company-primary)]"
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
                      href={item.href.startsWith("http") ? item.href : addCompanyParam(item.href, initialCompany)}
                      className="whitespace-nowrap text-xs lg:text-xs xl:text-base font-semibold text-gray-900 transition-colors px-2 lg:px-2 xl:px-4 hover:[color:var(--company-primary)]"
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
                    <div className="w-px h-4 bg-gray-300 mx-0.5 lg:mx-1 xl:mx-2"></div>
                  )}
                </div>
              ))}
            </nav>

            {/* 로그인/회원가입 버튼 - 주석 처리됨
            <div className="hidden lg:flex items-center space-x-4">
              <Button size="sm" className="text-white bg-[var(--company-primary)] hover:bg-[var(--company-primary-hover)]">
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

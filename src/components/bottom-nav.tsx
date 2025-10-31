"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { mobileNavItems, navigationItems } from "@/config/navigation"
import { Menu, X } from "lucide-react"
import { TourvisIcon } from "@/components/shared/icons/TourvisIcon"

/**
 * 모바일 하단 네비게이션 바
 * - 모바일에서만 표시 (lg:hidden)
 * - 하단 고정 (fixed bottom-0)
 * - 모든 페이지에서 공통으로 사용
 * - 설정: src/config/navigation.ts
 */
export function BottomNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // 전체 메뉴 아이템 (모바일 전용 제외)
  const allMenuItems = navigationItems.filter(item => !item.mobileOnly)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <>
      <nav 
        data-bottom-nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        style={{
          transform: 'translate3d(0, 0, 0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <div className="flex items-center justify-between h-20 px-1">
          {/* 기존 네비게이션 아이템들 */}
          {mobileNavItems.map((item) => {
            const Icon = item.icon!
            const isActive = pathname === item.href || 
                            (item.href !== "/" && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex flex-col items-center justify-center h-full transition-colors flex-1 active:opacity-80",
                  isActive 
                    ? "text-blue-600" 
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).dataLayer) {
                    ;(window as any).dataLayer.push({
                      event: 'nav_click',
                      event_category: 'navigation',
                      event_label: item.label,
                      nav_location: 'bottom_nav',
                      nav_href: item.href,
                      timestamp: new Date().toISOString(),
                    })
                  }
                }}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-1 transition-transform group-active:scale-90",
                  isActive && "stroke-[2.5]"
                )} />
                <span className={cn(
                  "text-[10px] leading-tight text-center px-0.5 transition-opacity group-active:opacity-80",
                  isActive && "font-semibold"
                )}>
                  {item.mobileLabel || item.label}
                </span>
              </Link>
            )
          })}

          {/* 전체메뉴 버튼 - 맨 오른쪽 */}
          <button
            onClick={toggleMenu}
            className="group flex flex-col items-center justify-center h-full transition-colors flex-1 active:opacity-80 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-5 h-5 mb-1 transition-transform group-active:scale-90" />
            <span className="text-[10px] leading-tight text-center px-0.5 transition-opacity group-active:opacity-80">
              전체메뉴
            </span>
          </button>
        </div>
      </nav>

      {/* 전체 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] bg-black/50" onClick={toggleMenu}>
          <div className="absolute bottom-20 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">전체 메뉴</h2>
              <button
                onClick={toggleMenu}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* 메뉴 리스트 */}
            <div className="p-4">
              <div className="space-y-1">
                {allMenuItems.map((item) => {
                  const isActive = pathname === item.href || 
                                  (item.href !== "/" && pathname.startsWith(item.href))
                  
                  // 투어비스 메뉴인지 확인
                  const isTourvisMenu = item.href === "https://tourvis.com"
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (typeof window !== 'undefined' && (window as any).dataLayer) {
                          ;(window as any).dataLayer.push({
                            event: 'nav_click',
                            event_category: 'navigation',
                            event_label: item.label,
                            nav_location: 'bottom_nav_menu',
                            nav_href: item.href,
                            timestamp: new Date().toISOString(),
                          })
                        }
                        toggleMenu()
                      }}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-lg transition-colors",
                        isActive 
                          ? "bg-blue-50 text-blue-600 font-medium" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {/* 투어비스 메뉴인 경우 아이콘 추가 */}
                      {isTourvisMenu && (
                        <TourvisIcon className="w-5 h-5 mr-3" />
                      )}
                      <span className="text-base">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { mobileNavItems } from "@/config/navigation"

/**
 * 모바일 하단 네비게이션 바
 * - 모바일에서만 표시 (lg:hidden)
 * - 하단 고정 (fixed bottom-0)
 * - 모든 페이지에서 공통으로 사용
 * - 설정: src/config/navigation.ts
 */
export function BottomNav() {
  const pathname = usePathname()

  return (
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
      <div className="grid grid-flow-col auto-cols-fr items-center h-20 px-4">
        {mobileNavItems.map((item) => {
          const Icon = item.icon!
          const isActive = pathname === item.href || 
                          (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center h-full transition-colors min-w-0",
                isActive 
                  ? "text-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1",
                isActive && "stroke-[2.5]"
              )} />
              <span className={cn(
                "text-xs leading-tight text-center px-0.5",
                isActive && "font-semibold"
              )}>
                {item.mobileLabel || item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}


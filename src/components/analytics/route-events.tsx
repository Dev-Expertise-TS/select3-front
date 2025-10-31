"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * 경로 변화 시 페이지 유형별 커스텀 이벤트를 GTM으로 전송
 * - GTM에서 맞춤 이벤트 트리거로 손쉽게 태깅 가능
 */
export function RouteEvents() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === "undefined") return
    const dl: any[] | undefined = (window as any).dataLayer
    if (!dl) return

    const pageType = resolvePageType(pathname)
    dl.push({
      event: "page_view_custom",
      page_path: pathname,
      page_type: pageType,
      timestamp: new Date().toISOString(),
    })
    // 특정 주요 섹션에 대해 별도 이벤트도 함께 전송 (필요한 경우만 발화)
    const sectionEvent = resolveSectionEvent(pathname)
    if (sectionEvent) {
      dl.push({
        event: sectionEvent,
        page_path: pathname,
        page_type: pageType,
        timestamp: new Date().toISOString(),
      })
    }
  }, [pathname])

  return null
}

function resolvePageType(pathname: string | null): string {
  const path = pathname || "/"
  if (path === "/") return "home"
  if (path.startsWith("/testimonials")) return "testimonials"
  if (path.startsWith("/promotion")) return "promotion"
  if (path === "/hotel") return "hotel_list"
  if (path.startsWith("/hotel/region")) return "hotel_region"
  if (path.startsWith("/blog")) return "blog"
  if (path.startsWith("/brand")) return "brand"
  if (path.startsWith("/hotel/")) return "hotel_detail"
  return "other"
}

function resolveSectionEvent(pathname: string | null): string | null {
  const path = pathname || "/"
  if (path.startsWith("/testimonials")) return "view_testimonials"
  if (path.startsWith("/promotion")) return "view_promotion"
  if (path === "/hotel") return "view_hotel_list"
  if (path.startsWith("/hotel/region")) return "view_hotel_region"
  if (path.startsWith("/blog")) return "view_blog"
  return null
}



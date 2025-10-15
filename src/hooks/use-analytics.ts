'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

// Google Analytics 이벤트 추적 타입
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}

export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 페이지 뷰 추적
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_title: document.title,
        page_location: window.location.origin + url,
      })
    }
  }, [pathname, searchParams])

  // 이벤트 추적 함수
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      })
    }
  }

  // 호텔 상세 페이지 뷰 추적
  const trackHotelView = (hotelName: string, hotelId: string) => {
    trackEvent('view_item', 'hotel', `${hotelName} (${hotelId})`)
  }

  // 검색 이벤트 추적
  const trackSearch = (searchTerm: string, resultsCount: number) => {
    trackEvent('search', 'hotel_search', searchTerm, resultsCount)
  }

  // 클릭 이벤트 추적
  const trackClick = (element: string, location: string) => {
    trackEvent('click', 'engagement', `${element}_${location}`)
  }

  // 전환 이벤트 추적 (카카오톡 상담 등)
  const trackConversion = (conversionType: string) => {
    console.log('🎯 [Analytics] 전환 이벤트 발생:', conversionType)
    trackEvent('conversion', 'engagement', conversionType)
  }

  return {
    trackEvent,
    trackHotelView,
    trackSearch,
    trackClick,
    trackConversion,
  }
}

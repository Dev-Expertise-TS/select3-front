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

  // 호텔 검색 이벤트 추적
  const trackHotelSearch = (params: {
    searchTerm: string
    checkIn: string
    checkOut: string
    rooms: number
    adults: number
    children?: number
    searchLocation?: string
    hotelId?: number | null
    hotelName?: string | null
  }) => {
    // 숙박일 계산
    const checkInDate = new Date(params.checkIn)
    const checkOutDate = new Date(params.checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // GA4 기본 검색 이벤트
    trackEvent('search', 'hotel_search', params.searchTerm)
    
    // GTM dataLayer 상세 데이터
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'hotel_search',
        search_term: params.searchTerm,
        check_in_date: params.checkIn,
        check_out_date: params.checkOut,
        nights: nights,
        rooms: params.rooms,
        adults: params.adults,
        children: params.children || 0,
        total_guests: params.adults + (params.children || 0),
        search_type: params.hotelId ? 'hotel_specific' : 'keyword_search',
        search_location: params.searchLocation || 'unknown',
        selected_hotel_id: params.hotelId || null,
        selected_hotel_name: params.hotelName || null,
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('🔍 [Analytics] 호텔 검색:', {
      검색어: params.searchTerm,
      체크인: params.checkIn,
      체크아웃: params.checkOut,
      숙박일: nights,
      룸: params.rooms,
      성인: params.adults,
      어린이: params.children || 0,
      검색위치: params.searchLocation
    })
  }

  return {
    trackEvent,
    trackHotelView,
    trackSearch,
    trackClick,
    trackConversion,
    trackHotelSearch,
  }
}

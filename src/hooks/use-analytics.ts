'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function useAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 페이지 뷰 추적 - GTM을 통해 전송
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      
      // GTM을 통해 페이지 뷰 전송 (GTM의 GA4 Configuration 태그가 자동 처리)
      (window as any).dataLayer.push({
        event: 'page_view',
        page_title: document.title,
        page_location: window.location.origin + url,
        page_path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      })
    }
  }, [pathname, searchParams])

  // 이벤트 추적 함수 - dataLayer 사용
  const trackEvent = (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      try {
        (window as any).dataLayer.push({
          event: action,
          event_category: category,
          event_label: label,
          value: value,
        })
        // 디버깅: 개발 환경에서만 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 [Analytics] 이벤트 전송:', { action, category, label, value })
        }
      } catch (error) {
        console.error('❌ [Analytics] 이벤트 전송 실패:', error)
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [Analytics] dataLayer가 로드되지 않았습니다.')
      }
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
    try {
      // 숙박일 계산
      const checkInDate = new Date(params.checkIn)
      const checkOutDate = new Date(params.checkOut)
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // ✅ GTM을 통해 이벤트 전송 (GTM이 GA4로 전달)
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'hotel_search',
          event_category: 'search',
          event_label: params.searchTerm,
          search_term: params.searchTerm,
          check_in: params.checkIn,
          check_out: params.checkOut,
          nights: nights,
          rooms: params.rooms,
          adults: params.adults,
          children: params.children || 0,
          total_guests: params.adults + (params.children || 0),
          search_type: params.hotelId ? 'hotel_specific' : 'keyword_search',
          search_location: params.searchLocation || 'unknown',
          hotel_id: params.hotelId || undefined,
          hotel_name: params.hotelName || undefined,
          timestamp: new Date().toISOString()
        })
        console.log('✅ [GTM] 호텔 검색 이벤트 전송 완료: hotel_search')
      } else {
        console.warn('⚠️ [GTM] dataLayer가 없습니다.')
      }
      
      // ✅ 기존 trackEvent도 유지 (호환성)
      trackEvent('hotel_search', 'search', params.searchTerm)
      
      console.log('🔍 [Analytics] 호텔 검색:', {
        검색어: params.searchTerm,
        체크인: params.checkIn,
        체크아웃: params.checkOut,
        숙박일: nights,
        룸: params.rooms,
        성인: params.adults,
        어린이: params.children || 0,
        검색위치: params.searchLocation,
        호텔ID: params.hotelId,
        호텔명: params.hotelName,
        검색타입: params.hotelId ? '특정 호텔 검색' : '키워드 검색',
        dataLayer_로드: typeof window !== 'undefined' && typeof (window as any).dataLayer !== 'undefined'
      })
    } catch (error) {
      console.error('❌ [Analytics] 호텔 검색 이벤트 전송 실패:', error)
    }
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

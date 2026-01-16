"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

// Hotel analytics and tracking utilities
export function useHotelAnalytics() {
  const [viewStartTime, setViewStartTime] = useState<number | null>(null)
  const [scrollDepth, setScrollDepth] = useState(0)
  const [timeOnPage, setTimeOnPage] = useState(0)

  // 페이지 뷰 시작 시간 기록
  const startViewTracking = useCallback(() => {
    setViewStartTime(Date.now())
  }, [])

  // 스크롤 깊이 추적
  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)
    setScrollDepth(Math.max(scrollDepth, scrollPercent))
  }, [scrollDepth])

  // 페이지 체류 시간 계산
  const calculateTimeOnPage = useCallback(() => {
    if (viewStartTime) {
      const currentTime = Date.now()
      const timeSpent = Math.round((currentTime - viewStartTime) / 1000)
      setTimeOnPage(timeSpent)
      return timeSpent
    }
    return 0
  }, [viewStartTime])

  // 호텔 상세 페이지 뷰 이벤트 전송
  const trackHotelDetailView = useCallback((hotelData: any) => {
    if (!hotelData) return

    const eventData = {
      hotel_id: hotelData.sabre_id,
      hotel_name: hotelData.name_ko || hotelData.name_en,
      city: hotelData.city_ko || hotelData.city_en || hotelData.city,
      country: hotelData.country_ko || hotelData.country_en || hotelData.country,
      brand_id: hotelData.brand_id,
      chain_id: hotelData.chain_id,
      star_rating: hotelData.star_rating,
      view_timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }

    // GTM을 통해 이벤트 전송 (GTM이 GA4로 전달)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: 'hotel_detail_view',
        hotel_id: eventData.hotel_id,
        hotel_name: eventData.hotel_name,
        city: eventData.city,
        country: eventData.country,
        brand_id: eventData.brand_id,
        chain_id: eventData.chain_id,
        star_rating: eventData.star_rating
      })
    }

    // Supabase에 이벤트 로그 저장 (선택사항)
    supabase
      .from('hotel_view_events')
      .insert([eventData])
      .then(({ error }) => {
        if (error) {
          console.warn('호텔 뷰 이벤트 저장 실패:', error instanceof Error ? error.message : String(error))
        }
      })
      .catch((error) => {
        console.warn('호텔 뷰 이벤트 저장 중 오류:', error instanceof Error ? error.message : String(error))
      })
  }, [])

  // 호텔 검색 이벤트 전송
  const trackHotelSearch = useCallback((searchData: {
    query: string
    city?: string
    country?: string
    checkIn?: string
    checkOut?: string
    guests?: number
    resultsCount?: number
  }) => {
    const eventData = {
      search_query: searchData.query,
      city: searchData.city || '',
      country: searchData.country || '',
      check_in: searchData.checkIn || '',
      check_out: searchData.checkOut || '',
      guests: searchData.guests || 0,
      results_count: searchData.resultsCount || 0,
      search_timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }

    // GTM을 통해 이벤트 전송 (GTM이 GA4로 전달)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: 'hotel_search',
        search_term: eventData.search_query,
        city: eventData.city,
        country: eventData.country,
        check_in: eventData.check_in,
        check_out: eventData.check_out,
        guests: eventData.guests,
        results_count: eventData.results_count
      })
    }

    // Supabase에 검색 이벤트 로그 저장 (선택사항)
    supabase
      .from('hotel_search_events')
      .insert([eventData])
      .then(({ error }) => {
        if (error) {
          console.warn('호텔 검색 이벤트 저장 실패:', error instanceof Error ? error.message : String(error))
        }
      })
      .catch((error) => {
        console.warn('호텔 검색 이벤트 저장 중 오류:', error instanceof Error ? error.message : String(error))
      })
  }, [])

  // 호텔 문의 이벤트 전송
  const trackHotelInquiry = useCallback((inquiryData: {
    hotel_id: string
    hotel_name: string
    inquiry_type: 'kakao' | 'phone' | 'email' | 'website'
    contact_method?: string
  }) => {
    const eventData = {
      hotel_id: inquiryData.hotel_id,
      hotel_name: inquiryData.hotel_name,
      inquiry_type: inquiryData.inquiry_type,
      contact_method: inquiryData.contact_method || '',
      inquiry_timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }

    // GTM을 통해 이벤트 전송 (GTM이 GA4로 전달)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      ;(window as any).dataLayer.push({
        event: 'hotel_inquiry',
        hotel_id: eventData.hotel_id,
        hotel_name: eventData.hotel_name,
        inquiry_type: eventData.inquiry_type,
        contact_method: eventData.contact_method
      })
    }

    // Supabase에 문의 이벤트 로그 저장 (선택사항)
    supabase
      .from('hotel_inquiry_events')
      .insert([eventData])
      .then(({ error }) => {
        if (error) {
          console.warn('호텔 문의 이벤트 저장 실패:', error instanceof Error ? error.message : String(error))
        }
      })
      .catch((error) => {
        console.warn('호텔 문의 이벤트 저장 중 오류:', error instanceof Error ? error.message : String(error))
      })
  }, [])

  // 스크롤 이벤트 리스너 설정
  useEffect(() => {
    const handleScroll = () => {
      trackScrollDepth()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [trackScrollDepth])

  // 페이지 체류 시간 추적
  useEffect(() => {
    const interval = setInterval(() => {
      calculateTimeOnPage()
    }, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeOnPage])

  return {
    viewStartTime,
    scrollDepth,
    timeOnPage,
    startViewTracking,
    trackHotelDetailView,
    trackHotelSearch,
    trackHotelInquiry,
    calculateTimeOnPage
  }
}

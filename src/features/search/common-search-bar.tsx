"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Loader2, Users, X } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { GuestSelector } from "@/components/ui/guest-selector"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/hotel-utils"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { useAnalytics } from "@/hooks/use-analytics"

interface CommonSearchBarProps {
  variant?: "landing" | "hotel-detail" | "destination"
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: { rooms: number; adults: number }
  onSearch?: (query: string, dates?: { checkIn: string; checkOut: string }, guests?: { rooms: number; adults: number }) => void
  onDatesChange?: (dates: { checkIn: string; checkOut: string }) => void
  onGuestsChange?: (guests: { rooms: number; adults: number }) => void
  className?: string
  initialQuery?: string
  isSabreLoading?: boolean
}

export function CommonSearchBar({
  variant = "landing",
  location = "",
  checkIn = "",
  checkOut = "",
  guests,
  onSearch,
  onDatesChange,
  onGuestsChange,
  className = "",
  initialQuery = "",
  isSabreLoading = false,
}: CommonSearchBarProps) {
  const router = useRouter()
  const supabase = createClient()
  const { trackHotelSearch } = useAnalytics()
  // 기본값 설정: undefined나 빈 객체일 때 기본값 사용
  const defaultGuests = { rooms: 1, adults: 2 }

  // 초기 날짜 값 계산 (useMemo로 안전하게)
  const initialDates = useMemo(() => {
    if (checkIn && checkOut) {
      return { checkIn, checkOut }
    }
    
    const today = new Date()
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
    twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
    
    return {
      checkIn: twoWeeksLater.toISOString().split('T')[0],
      checkOut: twoWeeksLaterPlusOne.toISOString().split('T')[0]
    }
  }, [checkIn, checkOut])

  // 로컬 상태로 날짜 관리
  const [localCheckIn, setLocalCheckIn] = useState(initialDates.checkIn)
  const [localCheckOut, setLocalCheckOut] = useState(initialDates.checkOut)
  const [localGuests, setLocalGuests] = useState(defaultGuests)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGuestSelector, setShowGuestSelector] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery || "")
  const [displayQuery, setDisplayQuery] = useState(initialQuery || "")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [hotelSuggestions, setHotelSuggestions] = useState<Array<{
    slug: string
    sabre_id: number
    property_name_ko: string | null
    property_name_en: string | null
    city?: string | null
  }>>([])
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const [selectedHotel, setSelectedHotel] = useState<{
    slug?: string | null
    sabre_id: number
    name: string
  } | null>(null)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  // Display text limit: desktop (>=640px) uses 35, mobile uses 30
  const getDisplayLimit = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches) {
      return 35
    }
    return 30
  }

  // Mobile detection (shared hook)
  const isMobile = useIsMobile()

  // Mobile full-screen search overlay
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const original = document.body.style.overflow
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = original || ''
    }
    return () => {
      document.body.style.overflow = original || ''
    }
  }, [isMobileSearchOpen])

  // 이전 props 값을 추적하여 무한 루프 방지
  const prevCheckInRef = useRef<string | undefined>(checkIn)
  const prevCheckOutRef = useRef<string | undefined>(checkOut)

  // 입력어 하이라이트 유틸
  const highlightText = (text: string, q: string) => {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + q.length)
    const after = text.slice(idx + q.length)
    return (
      <>
        {before}
        <span className="font-semibold text-blue-700">{match}</span>
        {after}
      </>
    )
  }

  // props가 변경될 때 로컬 상태 동기화 (안전한 방식)
  useEffect(() => {
    const checkInChanged = prevCheckInRef.current !== checkIn
    const checkOutChanged = prevCheckOutRef.current !== checkOut
    
    if (checkInChanged || checkOutChanged) {
      if (checkIn && checkOut) {
        setLocalCheckIn(checkIn)
        setLocalCheckOut(checkOut)
      }
      
      // 이전 값 업데이트
      prevCheckInRef.current = checkIn
      prevCheckOutRef.current = checkOut
    }
  }, [checkIn, checkOut])

  // 기본 게스트 정보 설정 (useMemo로 안전하게 처리)
  const safeGuests = useMemo(() => {
    return guests || defaultGuests
  }, [guests?.rooms, guests?.adults]) // guests 객체의 실제 값만 의존성으로 사용

  // safeGuests가 변경될 때만 로컬 상태 업데이트
  useEffect(() => {
    setLocalGuests(safeGuests)
  }, [safeGuests])

  // initialQuery 변경 시 searchQuery 업데이트
  useEffect(() => {
    const query = initialQuery || ""
    setSearchQuery(query)
    // 초기 로드 시에도 30자 제한 적용
    setDisplayQuery(query.length > getDisplayLimit() ? query.substring(0, getDisplayLimit()) + '...' : query)
  }, [initialQuery])

  // variant가 hotel-detail이고 initialQuery가 있을 때 기본값 설정
  useEffect(() => {
    if (variant === "hotel-detail") {
      // 호텔 상세 페이지에서는 initialQuery가 있으면 그것을 사용, 없으면 빈 문자열
      const query = initialQuery || ""
      setSearchQuery(query)
      // 초기 로드 시에도 30자 제한 적용
      setDisplayQuery(query.length > getDisplayLimit() ? query.substring(0, getDisplayLimit()) + '...' : query)
    }
  }, [variant, initialQuery])





  // 날짜 변경 핸들러
  const handleDatesChange = (dates: { checkIn: string; checkOut: string }) => {
    setLocalCheckIn(dates.checkIn)
    setLocalCheckOut(dates.checkOut)
    
    // 날짜 변경 시에는 부모 컴포넌트에 알리지 않음
    // 검색 버튼을 눌렀을 때만 onDatesChange 호출
  }

  // 게스트 변경 핸들러
  const handleGuestsChange = (guests: { rooms: number; adults: number }) => {
    setLocalGuests(guests)
    
    // 부모 컴포넌트에 알림
    if (onGuestsChange) {
      onGuestsChange(guests)
    }
  }

  // 날짜 포맷팅 함수 (YYYY-MM-DD → 한국어 표시)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return ""
    // YYYY-MM-DD 형식을 직접 파싱하여 시간대 문제 방지
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month는 0부터 시작
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일(${weekday})`
  }

  // 숙박 일수 계산
  const calculateNights = () => {
    if (!localCheckIn || !localCheckOut) return 0
    // YYYY-MM-DD 형식을 직접 파싱하여 시간대 문제 방지
    const [checkInYear, checkInMonth, checkInDay] = localCheckIn.split('-').map(Number)
    const [checkOutYear, checkOutMonth, checkOutDay] = localCheckOut.split('-').map(Number)
    const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay)
    const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  // 입력어 기반 호텔 자동완성 (Supabase)
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setHotelSuggestions([])
      setSuggestionError(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        setIsSuggesting(true)
        setSuggestionError(null)
        
        // 쿼리 최적화: 개별 쿼리로 분리하여 or() 문제 해결
        const queries = [
          supabase
            .from('select_hotels')
            .select('slug,sabre_id,property_name_ko,property_name_en,city,publish')
            .ilike('property_name_ko', `%${q}%`),
          supabase
            .from('select_hotels')
            .select('slug,sabre_id,property_name_ko,property_name_en,city,publish')
            .ilike('property_name_en', `%${q}%`),
          supabase
            .from('select_hotels')
            .select('slug,sabre_id,property_name_ko,property_name_en,city,publish')
            .ilike('city', `%${q}%`)
        ]
        
        const results = await Promise.all(queries)
        const allHotels: Array<{
          slug: string
          sabre_id: number
          property_name_ko: string | null
          property_name_en: string | null
          city?: string | null
          publish?: boolean | null
        }> = []
        
        // 결과 병합 및 중복 제거
        results.forEach((result, index) => {
          if (result.error) {
            console.error(`쿼리 ${index + 1} 오류:`, result.error)
            return
          }
          if (result.data) {
            allHotels.push(...result.data)
          }
        })
        
        // 중복 제거 (sabre_id 기준) 및 publish 필터링 (false 제외)
        const uniqueHotels = allHotels
          .filter((hotel, index, self) => 
            index === self.findIndex(h => h.sabre_id === hotel.sabre_id)
          )
          .filter((hotel) => hotel.publish !== false)
        
        // 정렬
        const sortedHotels = uniqueHotels
          .sort((a, b) => a.sabre_id - b.sabre_id)
        
        if (!cancelled) {
          setHotelSuggestions(sortedHotels)
        }
      } catch (e) {
        // 상세한 오류 정보 로깅
        console.error('자동완성 조회 오류 상세:', {
          error: e,
          message: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
          query: q,
          timestamp: new Date().toISOString()
        })
        
        if (!cancelled) {
          setHotelSuggestions([])
          setSuggestionError('자동완성 기능에 일시적인 문제가 발생했습니다.')
        }
      } finally {
        if (!cancelled) setIsSuggesting(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchQuery, supabase])

  // 키보드 네비게이션
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => {
        const next = prev + 1
        return next >= hotelSuggestions.length ? 0 : next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => {
        const next = prev - 1
        return next < 0 ? Math.max(hotelSuggestions.length - 1, 0) : next
      })
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < hotelSuggestions.length) {
        const h = hotelSuggestions[highlightIndex]
        const primary = h.property_name_ko || h.property_name_en || '-'
        setSearchQuery(primary)
        // 선택된 호텔명 필드는 30자로 제한
        setDisplayQuery(primary.length > getDisplayLimit() ? primary.substring(0, getDisplayLimit()) + '...' : primary)
        setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
        setShowSuggestions(false)
        setHighlightIndex(-1)
      } else {
        // 하이라이트가 없으면 일반 검색 실행 (Enter키는 검색 버튼 동작으로 간주)
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // 게스트 정보 표시 텍스트 생성
  const getGuestDisplayText = () => {
    // 기본값 설정: 객실 1, 성인 2
    const safeRooms = localGuests?.rooms || 1
    const safeAdults = localGuests?.adults || 2
    
    if (variant === "destination") {
      return `${safeAdults} adults (${safeRooms} room)`
    }
    return `룸 ${safeRooms}, 성인 ${safeAdults}`
  }

  // 검색 핸들러
  const handleSearch = async () => {
    if (isSearching) return // 이미 검색 중이면 중복 실행 방지
    
    // 검색 시 오류 상태 초기화
    setSuggestionError(null)
    setIsSearching(true)
    
    try {
      // 입력값 유효성: 호텔명/목적지가 비어있으면 경고 후 중단
      const trimmed = searchQuery.trim()
      if (!trimmed && !selectedHotel) {
        setIsSearching(false)
        // 간단한 알림. 추후 toast로 교체 가능
        alert('목적지 또는 호텔명을 입력해주세요.')
        return
      }

      // 사용자가 입력한 검색어를 사용 (빈 값이면 fallback 제거)
      const query = trimmed || initialQuery || location || ""
      const dates = { checkIn: localCheckIn, checkOut: localCheckOut }
      
      // ✅ GTM 이벤트 추적
      trackHotelSearch({
        searchTerm: query,
        checkIn: localCheckIn,
        checkOut: localCheckOut,
        rooms: localGuests.rooms,
        adults: localGuests.adults,
        children: (localGuests as any).children,
        searchLocation: variant,
        hotelId: selectedHotel?.sabre_id || null,
        hotelName: selectedHotel?.name || null
      })
      
      // 검색 버튼을 눌렀을 때만 부모에게 날짜 변경 알림 (onDatesChange가 제공된 경우)
      if (onDatesChange && localCheckIn && localCheckOut) {
        onDatesChange(dates)
      }
      
      // 선택된 호텔이 있으면 상세 페이지로 이동, 없으면 검색 결과로
      if (selectedHotel) {
        const slug = selectedHotel.slug || generateSlug(selectedHotel.name)
        const params = new URLSearchParams()
        if (localCheckIn) params.set('checkIn', localCheckIn)
        if (localCheckOut) params.set('checkOut', localCheckOut)
        const queryString = params.toString()
        router.push(`/hotel/${slug}${queryString ? `?${queryString}` : ''}`)
      } else if (onSearch) {
        const result = onSearch(query, dates, localGuests) as unknown
        if (typeof (result as any)?.then === 'function') {
          await (result as Promise<any>)
        }
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error)
    } finally {
      // 검색 완료 후 즉시 로딩 해제 (Sabre API 상태는 별도로 관리)
      setIsSearching(false)
    }
  }

  return (
    <>
      <div className={`${className} bg-white rounded-none sm:rounded-xl py-3 px-2 sm:p-4 shadow-none sm:shadow-xl sm:hover:shadow-2xl transition-all duration-500 border-0 sm:border-2 ${variant === 'hotel-detail' ? 'sm:bg-transparent sm:shadow-none sm:border-0' : ''}`}
      style={{ borderColor: '#C7D2FE' }}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        {/* 호텔명 검색 영역 - 1행 (모바일: 혜택 카드 스타일) */}
        <div className="flex sm:hidden items-center gap-2 w-full relative">
          <div 
            className={cn(
              "flex items-center flex-1 rounded-md bg-white shadow-xl border-2 h-[42px] px-3 relative backdrop-blur-sm transition-all duration-500",
              isSearching && "cursor-not-allowed opacity-50"
            )}
            style={{ borderColor: '#C7D2FE' }}
          >
            <MapPin className="h-4 w-4 text-gray-800 flex-shrink-0 mr-2" />
            <Input
              type="text"
              placeholder="어디로 떠날까요?"
              value={displayQuery}
              onChange={(e) => {
                const value = e.target.value
                // 전체 텍스트는 searchQuery에 저장 (검색용)
                setSearchQuery(value)
                // 화면 표시용은 30글자로 제한
                const displayValue = value.length > getDisplayLimit() ? value.substring(0, getDisplayLimit()) + '...' : value
                setDisplayQuery(displayValue)
                setSelectedHotel(null)
                setShowSuggestions(value.length > 0)
                
                // 입력값이 변경될 때는 검색하지 않고 제안 목록만 표시
                // onSearch 호출 제거
              }}
              onFocus={() => {
                if (isMobile) {
                  setIsMobileSearchOpen(true)
                } else {
                  setShowSuggestions(searchQuery.length > 0)
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={onKeyDown}
              className="border-0 bg-transparent p-0 text-gray-800 font-medium text-xs placeholder:text-gray-400 focus:ring-0 focus:outline-none shadow-none transition-all duration-200 flex-1"
              disabled={isSearching}
            />
            {searchQuery && (
              <button 
                className={cn(
                  "text-gray-500 hover:text-gray-700 transition-colors ml-2",
                  isSearching && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  setSearchQuery("")
                  setDisplayQuery("")
                  setSelectedHotel(null)
                  setShowSuggestions(false)
                  if (onSearch) {
                    onSearch("", { checkIn: localCheckIn, checkOut: localCheckOut })
                  }
                }}
                disabled={isSearching}
              >
                <span className="text-sm">×</span>
              </button>
            )}
            
            {/* 자동완성 제안 목록 (호텔) */}
            {showSuggestions && !isMobileSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-72 overflow-y-auto" style={{ zIndex: 999999, marginTop: '60px' }}>
                {isSuggesting && hotelSuggestions.length === 0 && (
                  <div className="p-3 text-sm text-gray-500">불러오는 중...</div>
                )}
                {!isSuggesting && hotelSuggestions.length === 0 && !suggestionError && (
                  <div className="p-3 text-sm text-gray-500">검색 결과가 없습니다</div>
                )}
                {suggestionError && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center justify-between">
                      <span>⚠️ {suggestionError}</span>
                      <button
                        onClick={() => {
                          setSuggestionError(null)
                          // 검색어가 있으면 자동으로 재시도
                          if (searchQuery.trim()) {
                            const event = { target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>
                            setSearchQuery(searchQuery)
                          }
                        }}
                        className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                      >
                        재시도
                      </button>
                    </div>
                  </div>
                )}
                {hotelSuggestions.map((h, idx) => {
                  const primary = h.property_name_ko || h.property_name_en || '-'
                  const secondary = h.property_name_ko && h.property_name_en ? (primary === h.property_name_ko ? h.property_name_en : h.property_name_ko) : h.city || ''
                  return (
                    <div
                      key={`${h.slug || h.sabre_id}`}
                      className={cn(
                        "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                        highlightIndex === idx && "bg-gray-50"
                      )}
                      onClick={() => {
                        setSearchQuery(primary)
                        // 선택된 호텔명 필드는 25자로 제한
                        setDisplayQuery(primary.length > 25 ? primary.substring(0, 25) + '...' : primary)
                        setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
                        setShowSuggestions(false)
                        setHighlightIndex(-1)
                      }}
                    >
                      <span className="text-lg">🏨</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{highlightText(primary, searchQuery)}</div>
                        {secondary && (
                          <div className="text-sm text-gray-500 truncate">{highlightText(secondary, searchQuery)}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 데스크톱용 호텔명 검색 영역 (기존 스타일) */}
        <div className="hidden sm:flex items-center gap-2 w-full sm:w-[30%] relative group">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 transition-colors group-focus-within:text-blue-600 flex-shrink-0" />
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="어디로 떠날까요?"
              value={displayQuery}
              onChange={(e) => {
                const value = e.target.value
                // 전체 텍스트는 searchQuery에 저장 (검색용)
                setSearchQuery(value)
                // 화면 표시용은 30글자로 제한
                const displayValue = value.length > getDisplayLimit() ? value.substring(0, getDisplayLimit()) + '...' : value
                setDisplayQuery(displayValue)
                setSelectedHotel(null)
                setShowSuggestions(value.length > 0)
                
                // 입력값이 변경될 때는 검색하지 않고 제안 목록만 표시
                // onSearch 호출 제거
              }}
              onFocus={() => {
                if (isMobile) {
                  setIsMobileSearchOpen(true)
                } else {
                  setShowSuggestions(searchQuery.length > 0)
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={onKeyDown}
              className="border-0 bg-transparent p-0 text-gray-900 font-medium text-sm sm:text-lg sm:font-bold placeholder:text-gray-400 focus:ring-0 focus:outline-none shadow-none transition-all duration-200"
              disabled={isSearching}
            />
          </div>
          
          {searchQuery && (
            <button 
              className={cn(
                "text-gray-400 hover:text-gray-600 transition-colors",
                isSearching && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                setSearchQuery("")
                setDisplayQuery("")
                setSelectedHotel(null)
                setShowSuggestions(false)
                if (onSearch) {
                  onSearch("", { checkIn: localCheckIn, checkOut: localCheckOut })
                }
              }}
              disabled={isSearching}
            >
              <span className="text-lg">×</span>
            </button>
          )}
          
          {/* 자동완성 제안 목록 (호텔) - 데스크톱용 */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-72 overflow-y-auto">
              {isSuggesting && hotelSuggestions.length === 0 && (
                <div className="p-3 text-sm text-gray-500">불러오는 중...</div>
              )}
              {!isSuggesting && hotelSuggestions.length === 0 && !suggestionError && (
                <div className="p-3 text-sm text-gray-500">검색 결과가 없습니다</div>
              )}
              {suggestionError && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center justify-between">
                    <span>⚠️ {suggestionError}</span>
                    <button
                      onClick={() => {
                        setSuggestionError(null)
                        // 검색어가 있으면 자동으로 재시도
                        if (searchQuery.trim()) {
                          const event = { target: { value: searchQuery } } as React.ChangeEvent<HTMLInputElement>
                          setSearchQuery(searchQuery)
                        }
                      }}
                      className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      재시도
                    </button>
                  </div>
                </div>
              )}
              {hotelSuggestions.map((h, idx) => {
                const primary = h.property_name_ko || h.property_name_en || '-'
                const secondary = h.property_name_ko && h.property_name_en ? (primary === h.property_name_ko ? h.property_name_en : h.property_name_ko) : h.city || ''
                return (
                  <div
                    key={`${h.slug || h.sabre_id}`}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                      highlightIndex === idx && "bg-gray-50"
                    )}
                    onClick={() => {
                      setSearchQuery(primary)
                      // 선택된 호텔명 필드는 30자로 제한
                      setDisplayQuery(primary.length > getDisplayLimit() ? primary.substring(0, getDisplayLimit()) + '...' : primary)
                      setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
                      setShowSuggestions(false)
                      setHighlightIndex(-1)
                    }}
                  >
                    <span className="text-lg">🏨</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{highlightText(primary, searchQuery)}</div>
                      {secondary && (
                        <div className="text-sm text-gray-500 truncate">{highlightText(secondary, searchQuery)}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 캘린더, 인원, 검색 아이콘 영역 - 2행 (모바일만) */}
        <div className="flex sm:hidden items-center gap-1 w-full">
          {/* 날짜 입력 영역 */}
          <div 
            className={cn(
              "flex items-center flex-1 rounded-md bg-white shadow-xl border-2 h-[42px] px-2 backdrop-blur-sm transition-all duration-500",
              isSearching 
                ? "cursor-not-allowed opacity-50" 
                : "cursor-pointer hover:scale-105 hover:-translate-y-1"
            )}
            style={{ borderColor: '#C7D2FE' }}
            onClick={() => !isSearching && setShowDatePicker(true)}
          >
            <span className="text-gray-800 font-medium text-xs truncate">
              {localCheckIn && localCheckOut
                ? `${formatDateForDisplay(localCheckIn)} - ${formatDateForDisplay(localCheckOut)}`
                : "날짜 선택"}
            </span>
            {localCheckIn && localCheckOut && (
              <span className="ml-1 px-1 py-0.5 bg-blue-50 text-blue-700 font-medium rounded text-[10px] whitespace-nowrap">
                {calculateNights()}박
              </span>
            )}
          </div>

          {/* 게스트 정보 영역 */}
          <div 
            className={cn(
              "flex items-center flex-1 rounded-md bg-white shadow-xl border-2 h-[42px] px-2 backdrop-blur-sm transition-all duration-500",
              isSearching 
                ? "cursor-not-allowed opacity-50" 
                : "cursor-pointer hover:scale-105 hover:-translate-y-1"
            )}
            style={{ borderColor: '#C7D2FE' }}
            onClick={() => !isSearching && setShowGuestSelector(true)}
          >
            <span className="text-gray-800 font-medium text-xs truncate text-center w-full">
              {getGuestDisplayText()}
            </span>
          </div>

          {/* 검색 아이콘 버튼 */}
          <button
            onClick={handleSearch}
            disabled={isSearching || isSabreLoading}
            className={cn(
              "flex items-center justify-center w-[42px] h-[42px] rounded-md bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl border border-blue-300/30 transition-all duration-500 flex-shrink-0 backdrop-blur-sm",
              isSearching || isSabreLoading
                ? "cursor-not-allowed opacity-50"
                : "hover:scale-105 hover:-translate-y-1 hover:shadow-2xl text-white"
            )}
            style={{ borderColor: '#E6CDB5' }}
            aria-label="호텔 검색"
          >
            {(isSearching || isSabreLoading) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        {/* 데스크톱용 기존 레이아웃 (숨김) */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-0 w-full sm:flex-[1.6] border-t sm:border-t-0 pt-2 sm:pt-0">
          {/* 날짜 입력 영역 */}
          <div className="flex items-center gap-1 flex-1 sm:border-l-2 sm:pl-4" style={{ borderLeftColor: '#C7D2FE' }}>
            <div className="flex items-center gap-1 text-blue-600 flex-shrink-0">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            
            <div 
              className={cn(
                "flex items-center gap-1 flex-1 rounded p-0.5 sm:p-1",
                isSearching 
                  ? "cursor-not-allowed opacity-50" 
                  : "cursor-pointer hover:bg-gray-50"
              )}
              onClick={() => !isSearching && setShowDatePicker(true)}
            >
              <span className="text-gray-900 font-medium text-xs sm:text-base truncate">
                {localCheckIn && localCheckOut
                  ? `${formatDateForDisplay(localCheckIn)} - ${formatDateForDisplay(localCheckOut)}`
                  : variant === "destination"
                    ? "Anytime"
                    : "날짜 선택"}
              </span>
              {variant !== "destination" && localCheckIn && localCheckOut && (
                <span className="ml-1 sm:ml-2 px-1 py-0.5 sm:px-2 sm:py-1 bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-200 text-[10px] sm:text-xs whitespace-nowrap">
                  {calculateNights()}박
                </span>
              )}
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-4 w-px bg-gray-300 mx-1 sm:hidden"></div>

          {/* 게스트 정보 영역 */}
          <div className="flex items-center gap-1 flex-1 sm:border-l-2 sm:pl-4" style={{ borderLeftColor: '#C7D2FE' }}>
            <div className="flex items-center gap-1 text-blue-600 flex-shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div 
              className={cn(
                "flex items-center gap-1 flex-1 rounded p-0.5 sm:p-1",
                isSearching 
                  ? "cursor-not-allowed opacity-50" 
                  : "cursor-pointer hover:bg-gray-50"
              )}
              onClick={() => !isSearching && setShowGuestSelector(true)}
            >
              <span className="text-gray-900 font-medium text-xs sm:text-base truncate">
                {getGuestDisplayText()}
              </span>
            </div>
          </div>
        </div>

        {/* 데스크톱용 검색 버튼 */}
        <Button 
          variant="brand"
          size="lg"
          className="hidden sm:flex font-bold w-[140px] items-center justify-center shrink-0 mt-1 sm:mt-0"
          onClick={handleSearch}
          disabled={isSearching || isSabreLoading}
        >
          {(isSearching || isSabreLoading) ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              검색 중...
            </>
          ) : (
            "검색"
          )}
        </Button>
      </div>
      
      {/* DatePicker 모달 */}
      {showDatePicker && (
        <DatePicker
          checkIn={localCheckIn}
          checkOut={localCheckOut}
          onDatesChange={(d) => {
            setLocalCheckIn(d.checkIn)
            setLocalCheckOut(d.checkOut)
            onDatesChange?.(d)
          }}
          onClose={() => setShowDatePicker(false)}
          guests={getGuestDisplayText()}
        />
      )}

      {/* GuestSelector 모달 */}
      {showGuestSelector && (
        <GuestSelector
          rooms={localGuests.rooms}
          adults={localGuests.adults}
          onGuestsChange={(g) => {
            setLocalGuests(g)
            onGuestsChange?.(g)
          }}
          onClose={() => setShowGuestSelector(false)}
        />
      )}
      </div>

      {/* Mobile full-screen search UI - render via portal to body */}
      {isMobileSearchOpen && typeof document !== 'undefined' && createPortal((
        <div className="fixed inset-0 sm:hidden bg-white" style={{ zIndex: 999999 }}>
          <div className="flex items-center gap-2 p-3 border-b">
            <button
              aria-label="닫기"
              onClick={() => {
                setIsMobileSearchOpen(false)
                setShowSuggestions(false)
              }}
              className="p-2"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="목적지 또는 숙소를 입력하세요"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  const displayValue = value.length > getDisplayLimit() ? value.substring(0, getDisplayLimit()) + '...' : value
                  setDisplayQuery(displayValue)
                  setSelectedHotel(null)
                  setShowSuggestions(value.length > 0)
                }}
                className="border-0 bg-transparent p-0 text-gray-900 font-medium text-base placeholder:text-gray-400 focus:ring-0 focus:outline-none shadow-none flex-1"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedHotel(null); setShowSuggestions(false) }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="지우기"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
            {isSuggesting && hotelSuggestions.length === 0 && (
              <div className="p-4 text-sm text-gray-500">불러오는 중...</div>
            )}
            {!isSuggesting && hotelSuggestions.length === 0 && !suggestionError && (
              <div className="p-4 text-sm text-gray-500">검색 결과가 없습니다</div>
            )}
            {suggestionError && (
              <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 m-3 rounded">
                <div className="flex items-center justify-between">
                  <span>⚠️ {suggestionError}</span>
                  <button
                    onClick={() => { setSuggestionError(null); if (searchQuery.trim()) setSearchQuery(searchQuery) }}
                    className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                  >
                    재시도
                  </button>
                </div>
              </div>
            )}
            {hotelSuggestions.map((h, idx) => {
              const primary = h.property_name_ko || h.property_name_en || '-'
              const secondary = h.property_name_ko && h.property_name_en ? (primary === h.property_name_ko ? h.property_name_en : h.property_name_ko) : h.city || ''
              return (
                <div
                  key={`${h.slug || h.sabre_id}`}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100",
                    highlightIndex === idx && "bg-gray-50"
                  )}
                  onClick={() => {
                    setSearchQuery(primary)
                    setDisplayQuery(primary.length > getDisplayLimit() ? primary.substring(0, getDisplayLimit()) + '...' : primary)
                    setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
                    setShowSuggestions(false)
                    setHighlightIndex(-1)
                    setIsMobileSearchOpen(false)
                  }}
                >
                  <span className="text-lg">🏨</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{highlightText(primary, searchQuery)}</div>
                    {secondary && (
                      <div className="text-sm text-gray-500 truncate">{highlightText(secondary, searchQuery)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ), document.body)}
    </>
  )
}
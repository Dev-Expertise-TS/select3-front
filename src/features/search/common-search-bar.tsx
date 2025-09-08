"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Loader2, Users } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { GuestSelector } from "@/components/ui/guest-selector"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/hotel-utils"

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
  // 기본값 설정: undefined나 빈 객체일 때 기본값 사용
  const defaultGuests = { rooms: 1, adults: 2 }
  const safeGuests = guests || defaultGuests

  // 로컬 상태로 날짜 관리
  const [localCheckIn, setLocalCheckIn] = useState(checkIn)
  const [localCheckOut, setLocalCheckOut] = useState(checkOut)
  const [localGuests, setLocalGuests] = useState(safeGuests)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGuestSelector, setShowGuestSelector] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialQuery || "")
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

  // 기본 날짜 설정 (2주 뒤와 2주 뒤 + 1일)
  useEffect(() => {
    if (!checkIn && !checkOut) {
      const today = new Date()
      const twoWeeksLater = new Date(today)
      twoWeeksLater.setDate(today.getDate() + 14)
      const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
      twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
      
      const twoWeeksLaterStr = twoWeeksLater.toISOString().split('T')[0]
      const twoWeeksLaterPlusOneStr = twoWeeksLaterPlusOne.toISOString().split('T')[0]
      
      setLocalCheckIn(twoWeeksLaterStr)
      setLocalCheckOut(twoWeeksLaterPlusOneStr)
    } else {
      setLocalCheckIn(checkIn)
      setLocalCheckOut(checkOut)
    }
  }, [checkIn, checkOut])

  // 기본 게스트 정보 설정
  useEffect(() => {
    const currentGuests = guests || defaultGuests
    setLocalGuests(currentGuests)
  }, [guests])

  // initialQuery 변경 시 searchQuery 업데이트
  useEffect(() => {
    setSearchQuery(initialQuery || "")
  }, [initialQuery])

  // variant가 hotel-detail이고 initialQuery가 있을 때 기본값 설정
  useEffect(() => {
    if (variant === "hotel-detail") {
      // 호텔 상세 페이지에서는 initialQuery가 있으면 그것을 사용, 없으면 빈 문자열
      setSearchQuery(initialQuery || "")
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
            .select('slug,sabre_id,property_name_ko,property_name_en,city')
            .ilike('property_name_ko', `%${q}%`),
          supabase
            .from('select_hotels')
            .select('slug,sabre_id,property_name_ko,property_name_en,city')
            .ilike('property_name_en', `%${q}%`),
          supabase
            .from('select_hotels')
            .select('slug,sabre_id,property_name_ko,property_name_en,city')
            .ilike('city', `%${q}%`)
        ]
        
        const results = await Promise.all(queries)
        const allHotels: Array<{
          slug: string
          sabre_id: number
          property_name_ko: string | null
          property_name_en: string | null
          city?: string | null
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
        
        // 중복 제거 (sabre_id 기준)
        const uniqueHotels = allHotels.filter((hotel, index, self) => 
          index === self.findIndex(h => h.sabre_id === hotel.sabre_id)
        )
        
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
    }, 250)
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
    return `객실 ${safeRooms}개, 성인 ${safeAdults}명`
  }

  // 검색 핸들러
  const handleSearch = async () => {
    if (isSearching) return // 이미 검색 중이면 중복 실행 방지
    
    // 검색 시 오류 상태 초기화
    setSuggestionError(null)
    setIsSearching(true)
    
    try {
      // 사용자가 입력한 검색어를 사용 (빈 값이면 기본값 사용)
      const query = searchQuery.trim() || initialQuery || location || "후쿠오카"
      const dates = { checkIn: localCheckIn, checkOut: localCheckOut }
      
      // 검색 버튼을 눌렀을 때만 부모에게 날짜 변경 알림 (onDatesChange가 제공된 경우)
      if (onDatesChange && localCheckIn && localCheckOut) {
        onDatesChange(dates)
      }
      
      // 선택된 호텔이 있으면 상세 페이지로 이동, 없으면 검색 결과로
      if (selectedHotel) {
        const params = new URLSearchParams()
        if (localCheckIn) params.set('checkIn', localCheckIn)
        if (localCheckOut) params.set('checkOut', localCheckOut)
        params.set('sabreId', String(selectedHotel.sabre_id))
        const slug = selectedHotel.slug || generateSlug(selectedHotel.name)
        router.push(`/hotel/${slug}?${params.toString()}`)
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
    <div className={`bg-gradient-to-br from-white via-gray-50/20 to-gray-100/40 rounded-xl p-3 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${className}`}
      style={{ borderColor: '#E6CDB5' }}>
      <div className="flex items-center gap-4">
        {/* 위치 검색 영역 - 30% 폭 */}
        <div className="flex items-center gap-2 w-[30%] relative group">
          <MapPin className="h-5 w-5 text-gray-600 transition-colors group-focus-within:text-blue-600" />
          <div className="flex-1 relative">
                         <Input
               type="text"
               placeholder="어디로 떠날까요?"
               value={searchQuery}
               onChange={(e) => {
                 const value = e.target.value
                 setSearchQuery(value)
                 setSelectedHotel(null)
                 setShowSuggestions(value.length > 0)
                 
                 // 입력값이 변경될 때는 검색하지 않고 제안 목록만 표시
                 // onSearch 호출 제거
               }}
               onFocus={() => setShowSuggestions(searchQuery.length > 0)}
               onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
               onKeyDown={onKeyDown}
               className="border-0 bg-transparent p-0 text-gray-900 font-medium text-base placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:bg-blue-50/30 rounded-md transition-all duration-200"
               disabled={isSearching}
             />
            {/* 포커스 배경 효과 */}
            <div className="absolute inset-0 bg-blue-50/30 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none -z-10" />
          </div>
          
          {searchQuery && (
            <button 
              className={cn(
                "text-gray-400 hover:text-gray-600 transition-colors",
                isSearching && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => {
                setSearchQuery("")
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
          
          {/* 자동완성 제안 목록 (호텔) */}
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
                    <span className="text-xs text-gray-400">#{h.sabre_id}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 날짜 입력 영역 - 더 좁게 */}
        <div className="flex items-center gap-2 flex-[0.8] border-l-2 pl-4"
          style={{ borderLeftColor: '#E6CDB5' }}>
          <div className="flex items-center gap-1 text-blue-600">
            <Calendar className="h-4 w-4" />
          </div>
          
          <div 
            className={cn(
              "flex items-center gap-2 flex-1 rounded p-1",
              isSearching 
                ? "cursor-not-allowed opacity-50" 
                : "cursor-pointer hover:bg-gray-50"
            )}
            onClick={() => !isSearching && setShowDatePicker(true)}
          >
            <span className="text-gray-900 font-medium">
              {localCheckIn && localCheckOut
                ? `${formatDateForDisplay(localCheckIn)} - ${formatDateForDisplay(localCheckOut)}`
                : variant === "destination"
                  ? "Anytime"
                  : "날짜 선택"}
            </span>
            {variant !== "destination" && localCheckIn && localCheckOut && (
              <span className="ml-4 px-2 py-1 bg-blue-50 text-blue-700 font-medium rounded-md border border-blue-200">
                {calculateNights()}박
              </span>
            )}
          </div>
        </div>

        {/* 게스트 정보 영역 - 더 좁게 */}
        <div className="flex items-center gap-2 flex-[0.8] border-l-2 pl-4"
          style={{ borderLeftColor: '#E6CDB5' }}>
          <div className="flex items-center gap-1 text-blue-600">
            <Users className="h-4 w-4" />
          </div>
          <div 
            className={cn(
              "flex items-center gap-2 flex-1 rounded p-1",
              isSearching 
                ? "cursor-not-allowed opacity-50" 
                : "cursor-pointer hover:bg-gray-50"
            )}
            onClick={() => !isSearching && setShowGuestSelector(true)}
          >
            <span className="text-gray-900 font-medium">
              {getGuestDisplayText()}
            </span>
          </div>
        </div>

        {/* 검색 버튼 */}
        <Button 
          variant="brand"
          size="lg"
          className="font-bold w-[140px] flex items-center justify-center shrink-0" 
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
          onDatesChange={handleDatesChange}
          onClose={() => setShowDatePicker(false)}
          guests={getGuestDisplayText()}
        />
      )}

      {/* GuestSelector 모달 */}
      {showGuestSelector && (
        <GuestSelector
          rooms={localGuests.rooms}
          adults={localGuests.adults}
          onGuestsChange={handleGuestsChange}
          onClose={() => setShowGuestSelector(false)}
        />
      )}
      
      {/* 검색 중 오버레이 (선택사항) */}
      {isSearching && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
          <div className="flex items-center gap-3 text-blue-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="font-medium">검색 중...</span>
          </div>
        </div>
      )}
    </div>
  )
}
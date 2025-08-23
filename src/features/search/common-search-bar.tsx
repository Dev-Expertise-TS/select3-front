"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar, Loader2, Users } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { GuestSelector } from "@/components/ui/guest-selector"
import { cn } from "@/lib/utils"

interface CommonSearchBarProps {
  variant?: "landing" | "hotel-detail" | "destination"
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: { rooms: number; adults: number; children: number }
  onSearch?: (query: string, dates?: { checkIn: string; checkOut: string }, guests?: { rooms: number; adults: number; children: number }) => void
  onDatesChange?: (dates: { checkIn: string; checkOut: string }) => void
  onGuestsChange?: (guests: { rooms: number; adults: number; children: number }) => void
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
  // 기본값 설정: undefined나 빈 객체일 때 기본값 사용
  const defaultGuests = { rooms: 1, adults: 1, children: 0 }
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
  const handleGuestsChange = (guests: { rooms: number; adults: number; children: number }) => {
    setLocalGuests(guests)
    
    // 부모 컴포넌트에 알림
    if (onGuestsChange) {
      onGuestsChange(guests)
    }
  }

  // 날짜 포맷팅 함수 (YYYY-MM-DD → 한국어 표시)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일(${weekday})`
  }

  // 숙박 일수 계산
  const calculateNights = () => {
    if (!localCheckIn || !localCheckOut) return 0
    const checkInDate = new Date(localCheckIn)
    const checkOutDate = new Date(localCheckOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  // 자동완성 제안 데이터
  const getSuggestions = (query: string) => {
    if (!query) return []
    
    const suggestions = [
      { type: 'city', icon: '📍', text: '다낭', subtext: '베트남' },
      { type: 'accommodation', icon: '🔍', text: '다낭 숙소', tag: '5등급' },
      { type: 'accommodation', icon: '🔍', text: '다낭 숙소', tag: '출장에 적합한' },
      { type: 'attraction', icon: '🏁', text: '미케 비치', subtext: '베트남, 다낭' },
      { type: 'airport', icon: '✈️', text: '다낭 국제공항(DAD)', subtext: '베트남, 다낭' }
    ]
    
    return suggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.subtext?.toLowerCase().includes(query.toLowerCase())
    )
  }

  // 게스트 정보 표시 텍스트 생성
  const getGuestDisplayText = () => {
    // 기본값 설정: 객실 1, 성인 1, 어린이 0
    const safeRooms = localGuests?.rooms || 1
    const safeAdults = localGuests?.adults || 1
    const safeChildren = localGuests?.children || 0
    
    if (variant === "destination") {
      return `${safeAdults} adults (${safeRooms} room)`
    }
    return `객실 ${safeRooms}개, 성인 ${safeAdults}명, 어린이 ${safeChildren}명`
  }

  // 검색 핸들러
  const handleSearch = async () => {
    if (isSearching) return // 이미 검색 중이면 중복 실행 방지
    
    setIsSearching(true)
    
    try {
      const query = initialQuery || location || "후쿠오카"
      const dates = { checkIn: localCheckIn, checkOut: localCheckOut }
      
      // 검색 버튼을 눌렀을 때만 부모에게 날짜 변경 알림 (onDatesChange가 제공된 경우)
      if (onDatesChange && localCheckIn && localCheckOut) {
        onDatesChange(dates)
      }
      
      // onSearch가 Promise를 반환하는 경우를 대비한 처리
      if (onSearch) {
        const result = onSearch(query, dates, localGuests)
        // Promise인 경우 await, 아닌 경우 즉시 로딩 해제
        if (result && typeof result.then === 'function') {
          await result
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
        {/* 위치 검색 영역 - 40% 폭 */}
        <div className="flex items-center gap-2 w-[40%] relative group">
          <MapPin className="h-5 w-5 text-gray-600 transition-colors group-focus-within:text-blue-600" />
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="어디로 떠날까요?"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value
                setSearchQuery(value)
                setShowSuggestions(value.length > 0)
                
                // 입력값이 변경될 때 부모 컴포넌트에 알림
                if (onSearch) {
                  onSearch(value, { checkIn: localCheckIn, checkOut: localCheckOut })
                }
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="border-0 bg-transparent p-0 text-gray-900 font-medium placeholder:text-gray-400 focus:ring-0 focus:outline-none focus:bg-blue-50/30 rounded-md transition-all duration-200"
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
          
          {/* 자동완성 제안 목록 */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
              {getSuggestions(searchQuery).map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setSearchQuery(suggestion.text)
                    setShowSuggestions(false)
                    if (onSearch) {
                      onSearch(suggestion.text, { checkIn: localCheckIn, checkOut: localCheckOut })
                    }
                  }}
                >
                  <span className="text-lg">{suggestion.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{suggestion.text}</div>
                    {suggestion.subtext && (
                      <div className="text-sm text-gray-500">{suggestion.subtext}</div>
                    )}
                  </div>
                  {suggestion.tag && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {suggestion.tag}
                    </span>
                  )}
                </div>
              ))}
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
          children={localGuests.children}
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
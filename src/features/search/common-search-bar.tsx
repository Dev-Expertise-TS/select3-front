"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Calendar } from "lucide-react"

interface CommonSearchBarProps {
  variant?: "landing" | "hotel-detail" | "destination"
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: string
  onSearch?: (query: string, dates?: { checkIn: string; checkOut: string }) => void
  onDatesChange?: (dates: { checkIn: string; checkOut: string }) => void
  className?: string
  initialQuery?: string
}

export function CommonSearchBar({
  variant = "landing",
  location = "",
  checkIn = "",
  checkOut = "",
  guests = "",
  onSearch,
  onDatesChange,
  className = "",
  initialQuery = "",
}: CommonSearchBarProps) {
  // 로컬 상태로 날짜 관리
  const [localCheckIn, setLocalCheckIn] = useState(checkIn)
  const [localCheckOut, setLocalCheckOut] = useState(checkOut)
  const [showDateInputs, setShowDateInputs] = useState(false)

  // 기본 날짜 설정 (오늘과 내일)
  useEffect(() => {
    if (!checkIn && !checkOut) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const todayStr = today.toISOString().split('T')[0]
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      setLocalCheckIn(todayStr)
      setLocalCheckOut(tomorrowStr)
    } else {
      setLocalCheckIn(checkIn)
      setLocalCheckOut(checkOut)
    }
  }, [checkIn, checkOut])





  // 체크인 날짜 변경 핸들러
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value
    setLocalCheckIn(newCheckIn)
    
    // 체크아웃 날짜가 체크아웃 날짜보다 빠르면 자동 조정
    if (localCheckOut && newCheckIn >= localCheckOut) {
      const nextDay = new Date(newCheckIn)
      nextDay.setDate(nextDay.getDate() + 1)
      const nextDayStr = nextDay.toISOString().split('T')[0]
      setLocalCheckOut(nextDayStr)
    }
  }

  // 체크아웃 날짜 변경 핸들러
  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckOut = e.target.value
    setLocalCheckOut(newCheckOut)
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

  // 검색 핸들러
  const handleSearch = () => {
    const query = initialQuery || location || "후쿠오카"
    const dates = { checkIn: localCheckIn, checkOut: localCheckOut }
    onSearch?.(query, dates)
    
    // 검색 시에만 부모에게 날짜 변경 알림
    if (onDatesChange && localCheckIn && localCheckOut) {
      onDatesChange(dates)
    }
  }

  return (
    <div className={`bg-gradient-to-br from-white via-gray-50/20 to-gray-100/40 rounded-xl p-3 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${className}`}
      style={{ borderColor: '#E6CDB5' }}>
      <div className="flex items-center gap-4">
        {/* 위치 검색 영역 */}
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-5 w-5 text-gray-600" />
          <span className="text-gray-900 font-medium">
            {initialQuery || (variant === "destination" ? location || "Thailand" : location || "후쿠오카")}
          </span>
          {initialQuery && (
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => onSearch?.("", { checkIn: localCheckIn, checkOut: localCheckOut })}
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>

        {/* 날짜 입력 영역 */}
        <div className="flex items-center gap-2 flex-1 border-l-2 pl-4"
          style={{ borderLeftColor: '#E6CDB5' }}>
          <div className="flex items-center gap-1 text-blue-600">
            <Calendar className="h-4 w-4" />
          </div>
          
          {showDateInputs ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                type="date"
                value={localCheckIn}
                onChange={handleCheckInChange}
                className="text-xs border-gray-300 h-8"
                min={new Date().toISOString().split('T')[0]} // 오늘 이후만 선택 가능
              />
              <span className="text-xs text-gray-500">-</span>
              <Input
                type="date"
                value={localCheckOut}
                onChange={handleCheckOutChange}
                className="text-xs border-gray-300 h-8"
                min={localCheckIn || new Date().toISOString().split('T')[0]} // 체크인 이후만 선택 가능
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDateInputs(false)}
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                ✓
              </Button>
            </div>
          ) : (
            <div 
              className="flex items-center gap-2 flex-1 cursor-pointer hover:bg-gray-50 rounded p-1"
              onClick={() => setShowDateInputs(true)}
            >
              <span className="text-gray-900 font-medium">
                {localCheckIn && localCheckOut
                  ? `${formatDateForDisplay(localCheckIn)} - ${formatDateForDisplay(localCheckOut)}`
                  : variant === "destination"
                    ? "Anytime"
                    : "날짜 선택"}
              </span>
              {variant !== "destination" && localCheckIn && localCheckOut && (
                <span className="text-sm text-gray-600">{calculateNights()}박</span>
              )}
            </div>
          )}
        </div>

        {/* 게스트 정보 영역 */}
        <div className="flex items-center gap-2 flex-1 border-l-2 pl-4"
          style={{ borderLeftColor: '#E6CDB5' }}>
          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-lg">👤</span>
          </div>
          <span className="text-gray-900 font-medium">
            {guests || (variant === "destination" ? "2 adults (1 room)" : "객실 1개, 성인 2명, 어린이 0명")}
          </span>
        </div>

        {/* 검색 버튼 */}
        <Button 
          variant="brand"
          size="lg"
          className="font-bold px-8" 
          onClick={handleSearch}
        >
          검색
        </Button>
      </div>
    </div>
  )
}
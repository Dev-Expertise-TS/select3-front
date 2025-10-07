"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  checkIn: string
  checkOut: string
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void
  onClose: () => void
  guests?: string
}

export function DatePicker({ checkIn, checkOut, onDatesChange, onClose, guests }: DatePickerProps) {
  const [selectedCheckIn, setSelectedCheckIn] = useState(checkIn)
  const [selectedCheckOut, setSelectedCheckOut] = useState(checkOut)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // 날짜 포맷팅 함수
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
    if (!selectedCheckIn || !selectedCheckOut) return 0
    const checkInDate = new Date(selectedCheckIn)
    const checkOutDate = new Date(selectedCheckOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 1
  }

  // 이전/다음 달 이동
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() - 1)
      return newMonth
    })
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + 1)
      return newMonth
    })
  }

  // 달력 데이터 생성
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [currentMonth])

  // 두 번째 달 데이터 생성
  const secondMonthData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= lastDay || days.length < 42) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }, [currentMonth])

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 유틸리티 함수 (로컬 시간 기준)
  const formatDateToLocalString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 날짜 선택 핸들러
  const handleDateClick = (date: Date) => {
    const dateStr = formatDateToLocalString(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // 과거 날짜와 오늘 날짜는 체크인으로 선택 불가
    if (date < tomorrow) return
    
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // 체크인 날짜 선택
      setSelectedCheckIn(dateStr)
      setSelectedCheckOut("")
    } else {
      // 체크아웃 날짜 선택
      if (dateStr > selectedCheckIn) {
        const newCheckOut = dateStr
        setSelectedCheckOut(newCheckOut)
        
        // 체크인과 체크아웃이 모두 선택되면 자동으로 날짜 적용 및 팝업 닫기
        setTimeout(() => {
          onDatesChange({ checkIn: selectedCheckIn, checkOut: newCheckOut })
          onClose()
        }, 300) // 300ms 지연으로 사용자가 선택을 확인할 수 있게 함
      } else {
        // 체크아웃이 체크인보다 빠르면 체크인으로 설정
        setSelectedCheckOut(dateStr)
      }
    }
  }



  // 날짜가 선택 범위 내에 있는지 확인
  const isInRange = (date: Date) => {
    if (!selectedCheckIn || !selectedCheckOut) return false
    const dateStr = formatDateToLocalString(date)
    return dateStr >= selectedCheckIn && dateStr <= selectedCheckOut
  }

  // 날짜가 선택된 날짜인지 확인
  const isSelected = (date: Date) => {
    const dateStr = formatDateToLocalString(date)
    return dateStr === selectedCheckIn || dateStr === selectedCheckOut
  }

  // 날짜가 현재 달에 속하는지 확인
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth()
  }

  // 날짜가 두 번째 달에 속하는지 확인
  const isSecondMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() + 1
  }

  // 특별한 날짜 (프로모션이나 특별 요금이 있는 날짜)
  const getSpecialDates = () => {
    const specialDates = ['2025-10-03', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09']
    return specialDates
  }

  const isSpecialDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return getSpecialDates().includes(dateStr)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pt-20 pb-20 sm:pt-0 sm:pb-0">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-2 sm:mx-4 max-h-full sm:max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-sm sm:text-base">
                  {selectedCheckIn && selectedCheckOut 
                    ? `${formatDateForDisplay(selectedCheckIn)} - ${formatDateForDisplay(selectedCheckOut)} ${calculateNights()}박`
                    : selectedCheckIn 
                      ? `${formatDateForDisplay(selectedCheckIn)} ~ 체크아웃 날짜 선택`
                      : "체크인 날짜 선택"
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{guests || "객실 1개, 성인 2명"}</span>
              </div>
            </div>
            {/* 닫기 버튼 */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="닫기"
            >
              <span className="text-2xl text-gray-500 hover:text-gray-700">×</span>
            </button>
          </div>
        </div>

        {/* 캘린더 */}
        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {/* 첫 번째 달 */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </h3>
                <div className="w-8"></div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className={cn(
                    "h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium",
                    day === '일' ? "text-red-500" : "text-gray-500"
                  )}>
                    {day}
                  </div>
                ))}
                
                {calendarData.slice(0, 42).map((date, index) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const tomorrow = new Date(today)
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  const isToday = date.getTime() === today.getTime()
                  const isPastOrToday = date < tomorrow
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      disabled={!isCurrentMonth(date) || isPastOrToday}
                      className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 relative",
                        !isCurrentMonth(date) && "text-gray-300 cursor-not-allowed",
                        isCurrentMonth(date) && isPastOrToday && "text-gray-400 cursor-not-allowed bg-gray-50",
                        isCurrentMonth(date) && !isPastOrToday && "hover:bg-gray-100",
                        isSelected(date) && "bg-blue-600 text-white hover:bg-blue-700",
                        isInRange(date) && !isSelected(date) && "bg-blue-100 text-blue-900",
                        date.getDay() === 0 && isCurrentMonth(date) && !isSelected(date) && !isPastOrToday && "text-red-500",
                        isToday && "bg-yellow-100 text-yellow-700 font-bold"
                      )}
                    >
                      {date.getDate()}
                      {isSpecialDate(date) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 두 번째 달 */}
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="w-8"></div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 2}월
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className={cn(
                    "h-8 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium",
                    day === '일' ? "text-red-500" : "text-gray-500"
                  )}>
                    {day}
                  </div>
                ))}
                
                {secondMonthData.slice(0, 42).map((date, index) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const tomorrow = new Date(today)
                  tomorrow.setDate(tomorrow.getDate() + 1)
                  const isToday = date.getTime() === today.getTime()
                  const isPastOrToday = date < tomorrow
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      disabled={!isSecondMonth(date) || isPastOrToday}
                      className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 relative",
                        !isSecondMonth(date) && "text-gray-300 cursor-not-allowed",
                        isSecondMonth(date) && isPastOrToday && "text-gray-400 cursor-not-allowed bg-gray-50",
                        isSecondMonth(date) && !isPastOrToday && "hover:bg-gray-100",
                        isSelected(date) && "bg-blue-600 text-white hover:bg-blue-700",
                        isInRange(date) && !isSelected(date) && "bg-blue-100 text-blue-900",
                        date.getDay() === 0 && isSecondMonth(date) && !isSelected(date) && !isPastOrToday && "text-red-500",
                        isToday && "bg-yellow-100 text-yellow-700 font-bold"
                      )}
                    >
                      {date.getDate()}
                      {isSpecialDate(date) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-400 rounded-full"></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2 sm:gap-4">
              <span>• 마우스를 위로 올려 휴일 확인</span>
            </div>
            <div className="text-right">
                             <div className="font-medium text-gray-900 text-xs sm:text-sm">
                 {selectedCheckIn && selectedCheckOut 
                   ? `${formatDateForDisplay(selectedCheckIn)} ~ ${formatDateForDisplay(selectedCheckOut)} (${calculateNights()}박)`
                   : selectedCheckIn 
                     ? "체크아웃 날짜를 선택해주세요"
                     : "체크인 날짜를 선택해주세요"
                 }
               </div>
              <div className="text-xs text-gray-500 mt-1">
                ※ 체크인 및 체크아웃은 현지 시각 기준입니다. 선택한 통화: KRW
              </div>
              <div className="text-xs text-gray-500">
                표시된 요금은 세금 포함 1박 기준으로, 참고용입니다.
              </div>
            </div>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}

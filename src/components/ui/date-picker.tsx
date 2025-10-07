"use client"

import { useState, useMemo, useEffect } from "react"
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

  // 추가 달들 데이터 생성 (3~6번째 달)
  const additionalMonthsData = useMemo(() => {
    const months = []
    for (let i = 2; i < 6; i++) {
      // JavaScript Date 객체를 사용하여 올바른 월과 년도 계산
      const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1)
      const year = targetDate.getFullYear()
      const month = targetDate.getMonth()
      
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
      
      months.push({
        month: month,
        year: year,
        days: days
      })
    }
    return months
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

  // 날짜가 특정 달에 속하는지 확인
  const isSpecificMonth = (date: Date, targetMonth: number, targetYear: number) => {
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear
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

  // 캘린더가 열릴 때 body 스크롤 막기 및 하단 네비게이터 숨기기
  useEffect(() => {
    // body 스크롤 막기
    document.body.style.overflow = 'hidden'
    
    // 하단 네비게이터 숨기기
    const bottomNav = document.querySelector('[data-bottom-nav]')
    if (bottomNav) {
      (bottomNav as HTMLElement).style.display = 'none'
    }

    // cleanup function
    return () => {
      document.body.style.overflow = 'unset'
      if (bottomNav) {
        (bottomNav as HTMLElement).style.display = 'flex'
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full h-[calc(100vh-4rem)] sm:h-auto sm:rounded-lg sm:shadow-2xl sm:max-w-4xl sm:w-full sm:mx-2 sm:mx-4 sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-4">
          <div className="flex items-center justify-between mb-4 sm:mb-0">
            <button
              onClick={() => {
                setSelectedCheckIn("")
                setSelectedCheckOut("")
              }}
              className="text-black font-medium text-sm"
            >
              초기화
            </button>
            <button
              onClick={onClose}
              className="text-black text-xl font-medium"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
          
          {/* 요일 표시 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className={cn(
                "h-8 flex items-center justify-center text-sm font-medium",
                day === '일' ? "text-orange-500" : "text-black"
              )}>
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* 캘린더 */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-4 space-y-6">
            {/* 첫 번째 달 */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4 text-center">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </h3>
              
              <div className="grid grid-cols-7 gap-1">
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
                        "h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative flex flex-col items-center justify-center",
                        !isCurrentMonth(date) && "text-gray-300 cursor-not-allowed",
                        isCurrentMonth(date) && isPastOrToday && "text-gray-400 cursor-not-allowed bg-gray-100",
                        isCurrentMonth(date) && !isPastOrToday && "hover:bg-gray-100 text-black",
                        isSelected(date) && "bg-orange-500 text-white",
                        isInRange(date) && !isSelected(date) && "bg-orange-100 text-orange-900",
                        date.getDay() === 0 && isCurrentMonth(date) && !isSelected(date) && !isPastOrToday && "text-orange-500",
                        isToday && "bg-yellow-100 text-yellow-700 font-bold"
                      )}
                    >
                      {date.getDate()}
                      {isSpecialDate(date) && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

             {/* 두 번째 달 */}
             <div>
               <h3 className="text-lg font-semibold text-black mb-4 text-center">
                 {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 2}월
               </h3>
               
               <div className="grid grid-cols-7 gap-1">
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
                         "h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative flex flex-col items-center justify-center",
                         !isSecondMonth(date) && "text-gray-300 cursor-not-allowed",
                         isSecondMonth(date) && isPastOrToday && "text-gray-400 cursor-not-allowed bg-gray-100",
                         isSecondMonth(date) && !isPastOrToday && "hover:bg-gray-100 text-black",
                         isSelected(date) && "bg-orange-500 text-white",
                         isInRange(date) && !isSelected(date) && "bg-orange-100 text-orange-900",
                         date.getDay() === 0 && isSecondMonth(date) && !isSelected(date) && !isPastOrToday && "text-orange-500",
                         isToday && "bg-yellow-100 text-yellow-700 font-bold"
                       )}
                     >
                       {date.getDate()}
                       {isSpecialDate(date) && (
                         <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"></div>
                       )}
                     </button>
                   )
                 })}
               </div>
             </div>

             {/* 추가 달들 (3~6번째 달) */}
             {additionalMonthsData.map((monthData, monthIndex) => (
               <div key={`month-${monthData.month}`}>
                 <h3 className="text-lg font-semibold text-black mb-4 text-center">
                   {monthData.year}년 {monthData.month + 1}월
                 </h3>
                 
                 <div className="grid grid-cols-7 gap-1">
                   {monthData.days.slice(0, 42).map((date, index) => {
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
                         disabled={!isSpecificMonth(date, monthData.month, monthData.year) || isPastOrToday}
                         className={cn(
                           "h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative flex flex-col items-center justify-center",
                           !isSpecificMonth(date, monthData.month, monthData.year) && "text-gray-300 cursor-not-allowed",
                           isSpecificMonth(date, monthData.month, monthData.year) && isPastOrToday && "text-gray-400 cursor-not-allowed bg-gray-100",
                           isSpecificMonth(date, monthData.month, monthData.year) && !isPastOrToday && "hover:bg-gray-100 text-black",
                           isSelected(date) && "bg-orange-500 text-white",
                           isInRange(date) && !isSelected(date) && "bg-orange-100 text-orange-900",
                           date.getDay() === 0 && isSpecificMonth(date, monthData.month, monthData.year) && !isSelected(date) && !isPastOrToday && "text-orange-500",
                           isToday && "bg-yellow-100 text-yellow-700 font-bold"
                         )}
                       >
                         {date.getDate()}
                         {isSpecialDate(date) && (
                           <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"></div>
                         )}
                       </button>
                     )
                   })}
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* 적용하기 버튼 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <button
            onClick={() => {
              if (selectedCheckIn && selectedCheckOut) {
                onDatesChange({ checkIn: selectedCheckIn, checkOut: selectedCheckOut })
                onClose()
              }
            }}
            disabled={!selectedCheckIn || !selectedCheckOut}
            className="w-full bg-black text-white font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  )
}

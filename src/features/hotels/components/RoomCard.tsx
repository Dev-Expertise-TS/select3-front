"use client"

import { useState } from "react"
import { Bed, Users, Ruler, Star } from "lucide-react"

interface RoomCardProps {
  roomType: string
  roomName: string
  description: string
  roomIntroduction?: string
  bedType: string
  area?: string
  occupancy: string
  amount: string
  currency: string
  discount?: string
  isGenerating?: boolean
  checkIn?: string
  checkOut?: string
  view?: string
}

export function RoomCard({
  roomType,
  roomName,
  description,
  roomIntroduction,
  bedType,
  area,
  occupancy,
  amount,
  currency,
  discount,
  isGenerating = false,
  checkIn,
  checkOut,
  view
}: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 베드 타입별 아이콘 선택
  const getBedIcon = (bedType: string) => {
    const type = bedType.toLowerCase()
    if (type.includes('킹')) return <Bed className="w-5 h-5" />
    if (type.includes('트윈')) return <Bed className="w-5 h-5" />
    if (type.includes('더블')) return <Bed className="w-5 h-5" />
    if (type.includes('퀸')) return <Bed className="w-5 h-5" />
    if (type.includes('싱글')) return <Bed className="w-5 h-5" />
    return <Bed className="w-5 h-5" />
  }

  // 베드 타입별 색상
  const getBedColor = (bedType: string) => {
    const type = bedType.toLowerCase()
    if (type.includes('킹')) return "text-purple-600 bg-purple-50"
    if (type.includes('트윈')) return "text-blue-600 bg-blue-50"
    if (type.includes('더블')) return "text-green-600 bg-green-50"
    if (type.includes('퀸')) return "text-pink-600 bg-pink-50"
    if (type.includes('싱글')) return "text-orange-600 bg-orange-50"
    return "text-gray-600 bg-gray-50"
  }

  // 날짜 기간 계산 함수
  const calculateNights = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return 1 // 기본값 1박
    
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(1, diffDays) // 최소 1박
  }

  const formatAmount = (amount: string, currency: string = 'KRW') => {
    if (!amount || amount === 'N/A' || amount === '0') return '요금 정보 없음'
    const numAmount = parseInt(amount)
    if (isNaN(numAmount)) return amount
    
    // KRW인 경우 원 문자를 오른쪽에 붙임
    if (currency === 'KRW') {
      return `${numAmount.toLocaleString()}원`
    }
    return `${numAmount.toLocaleString()} ${currency}`
  }

  // 1박 평균 금액 계산 함수
  const calculateAveragePerNight = (amount: string, checkIn?: string, checkOut?: string, currency: string = 'KRW') => {
    if (!amount || amount === 'N/A' || amount === '0') return '요금 정보 없음'
    
    const numAmount = parseInt(amount)
    if (isNaN(numAmount)) return amount
    
    const nights = calculateNights(checkIn, checkOut)
    const averagePerNight = Math.round(numAmount / nights)
    
    // KRW인 경우 원 문자를 오른쪽에 붙임
    if (currency === 'KRW') {
      return `${averagePerNight.toLocaleString()}원`
    }
    return `${averagePerNight.toLocaleString()} ${currency}`
  }

  const displayIntroduction = roomIntroduction && 
    roomIntroduction !== 'N/A' && 
    !roomIntroduction.includes('AI가 객실 소개를 생성 중입니다')
    ? roomIntroduction 
    : description || '객실 소개 정보를 준비 중입니다.'
  

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* 카드 헤더 - 객실 이미지 대신 아이콘 영역 */}
      <div className="h-32 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
        <div className={`p-6 rounded-full ${getBedColor(bedType)}`}>
          {getBedIcon(bedType)}
        </div>
        {discount && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {discount}
          </div>
        )}
      </div>

      {/* 카드 내용 */}
      <div className="p-4 sm:p-6">
        {/* 객실명과 타입 */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {roomName || roomType}
            </h3>
            {view && view !== 'N/A' && (
              <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded self-start">
                {view}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs self-start">{roomType}</span>
            {area && (
              <div className="flex items-center gap-1">
                <Ruler className="w-3 h-3" />
                <span>{area}</span>
              </div>
            )}
          </div>
        </div>

        {/* 베드 타입과 수용 인원 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${getBedColor(bedType)}`}>
              {getBedIcon(bedType)}
            </div>
            <span className="text-gray-700 font-medium">{bedType}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{occupancy}</span>
          </div>
        </div>

            {/* 객실 소개 - 고정 높이 */}
            <div className="mb-3 sm:mb-4">
              <div className="text-gray-700 text-sm leading-relaxed h-16 sm:h-20 overflow-hidden">
                {isGenerating ? (
                  <div className="flex items-center gap-2 h-full">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-gray-500">AI가 객실 소개를 생성 중입니다...</span>
                  </div>
                ) : (
                  <div className={isExpanded ? '' : 'h-full overflow-hidden'}>
                    <span className={isExpanded ? '' : 'line-clamp-3'}>
                      {displayIntroduction}
                    </span>
                  </div>
                )}
              </div>
              {!isGenerating && displayIntroduction && displayIntroduction.length > 100 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 text-xs mt-2 hover:underline"
                >
                  {isExpanded ? '접기' : '더보기'}
                </button>
              )}
            </div>

        {/* 가격 정보 */}
        <div className="border-t border-gray-100 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
            <span className="text-sm text-gray-600">
              {calculateNights(checkIn, checkOut)}박 세금 포함
            </span>
            <div className="text-left sm:text-right">
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {formatAmount(amount, currency)}
              </div>
              {/* 1박 평균 금액 - 1박이 아닌 경우에만 표시 */}
              {calculateNights(checkIn, checkOut) > 1 && (
                <div className="text-xs text-gray-500 mt-1">
                  {calculateAveragePerNight(amount, checkIn, checkOut, currency)} / 1박 평균가
                </div>
              )}
            </div>
          </div>

          {/* 예약 버튼 */}
          <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base">
            예약 컨시어지
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Bed, Users, Ruler } from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"

interface RoomCardProps {
  roomType: string
  roomName: string
  description: string
  roomIntroduction?: string
  bedType: string
  area?: string
  occupancy: string
  amount: string | number
  currency: string
  discount?: string
  isGenerating?: boolean
  checkIn?: string
  checkOut?: string
  view?: string | null
  isBeyondFirstRow?: boolean
  hasIntro?: boolean
  onRequestIntro?: () => void
  rooms?: number
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
  view,
  isBeyondFirstRow = false,
  hasIntro = false,
  onRequestIntro,
  rooms = 1
}: RoomCardProps) {
  const { trackEvent } = useAnalytics()
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

  const formatAmount = (amount: string | number, currency: string = 'KRW') => {
    if (!amount || amount === 'N/A' || amount === '0') return '요금 정보 없음'
    const numAmount = typeof amount === 'number' ? amount : parseInt(String(amount))
    if (isNaN(numAmount)) return String(amount)
    
    // KRW인 경우 원 문자를 오른쪽에 붙임
    if (currency === 'KRW') {
      return `${numAmount.toLocaleString()}원`
    }
    return `${numAmount.toLocaleString()} ${currency}`
  }

  // 1박 평균 금액 계산 함수
  const calculateAveragePerNight = (amount: string | number, checkIn?: string, checkOut?: string, currency: string = 'KRW') => {
    if (!amount || amount === 'N/A' || amount === '0') return '요금 정보 없음'
    
    const numAmount = typeof amount === 'number' ? amount : parseInt(String(amount))
    if (isNaN(numAmount)) return String(amount)
    
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
    !roomIntroduction.includes('호텔 전문 AI가 객실 소개를 준비 중입니다')
    ? roomIntroduction 
    : description || ''
  
  // 텍스트 오버플로우 감지용
  const descRef = useRef<HTMLSpanElement | null>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const el = descRef.current
    if (!el) return
    // isExpanded가 false일 때만 오버플로우 기준으로 판단 (클램프/높이 제한 상태)
    if (!isExpanded) {
      setIsOverflowing(el.scrollHeight > el.clientHeight + 1)
    } else {
      setIsOverflowing(false)
    }
  }, [displayIntroduction, isExpanded])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* 이미지 영역 (향후 사용 예정)
        유지 목적의 자리표시자입니다. 나중에 객실 썸네일/갤러리 영역을 복원할 때 이 위치를 사용합니다.
        예시 구조:
        <div className="h-32 sm:h-48 relative">
          <Image ... />
        </div>
      */}

      {/* 카드 내용 */}
      <div className="p-4 sm:p-6">
        {/* 객실명과 타입 */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 mb-1">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {roomType || roomName}
            </h3>
            {view && view !== 'N/A' && (
              <span className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded self-start">
                {view}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600">
            {/**
             * 작은 칩(배지) 영역 - 현재 미표시
             * 추후 roomType 또는 roomName을 표시할 때 아래 예시를 사용하세요.
             * 예시:
             * <span className="bg-gray-100 px-2 py-1 rounded text-xs self-start">{roomName || roomType}</span>
             */}
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
          <div className="relative">
            <div className={`text-gray-700 text-sm leading-relaxed h-28 sm:h-36 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'} ${(!hasIntro && !isGenerating) ? 'blur-[2px] opacity-60 select-none pointer-events-none' : ''}`}>
              {isGenerating ? (
                <div className="flex items-center gap-2 h-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-500">호텔 전문 AI가 객실 소개를 준비 중입니다...</span>
                </div>
              ) : (
                <div className={isExpanded ? '' : 'h-full overflow-hidden'}>
                  <span ref={descRef} className={isExpanded ? '' : 'line-clamp-8'}>
                    {displayIntroduction}
                  </span>
                </div>
              )}
            </div>

            {/* 더보기 영역은 AI 미생성 블러 상태에서는 노출하지 않음 */}
            {!isGenerating && hasIntro && (isOverflowing || isExpanded) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 text-xs mt-2 hover:underline"
              >
                {isExpanded ? '접기' : '더보기'}
              </button>
            )}

            {/* 4행 이후 + AI 미생성 시 중앙 버튼 표시 */}
            {!isGenerating && isBeyondFirstRow && !hasIntro && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={onRequestIntro}
                  className="px-3 py-1.5 text-xs sm:text-sm bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  객실 설명 AI 설명 보기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 가격 정보 */}
        <div className="border-t border-gray-100 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
            <span className="text-sm text-gray-600">
              {calculateNights(checkIn, checkOut)}박 세금 포함
            </span>
            <div className="text-left sm:text-right">
              <div className="text-base sm:text-lg font-bold text-gray-900">
                {formatAmount(Number(amount) * rooms, currency)}
              </div>
              {/* 룸 개수 표시 */}
              {rooms > 1 && (
                <div className="text-xs text-gray-500 mt-0.5">
                  (1실 {formatAmount(amount, currency)} × {rooms}실)
                </div>
              )}
              {/* 1박 평균 금액 - 1박이 아닌 경우에만 표시 */}
              {calculateNights(checkIn, checkOut) > 1 && (
                <div className="text-xs text-gray-500 mt-1">
                  {calculateAveragePerNight(Number(amount) * rooms, checkIn, checkOut, currency)} / 1박 평균가
                </div>
              )}
            </div>
          </div>

          {/* 예약 버튼 */}
          <a
            id="kakao-room-card-button"
            href="https://pf.kakao.com/_cxmxgNG/chat"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackEvent('click', 'kakao_consultation', 'room_card')
              if (typeof window !== 'undefined' && window.dataLayer) {
                window.dataLayer.push({
                  event: 'kakao_click',
                  button_location: 'room_card',
                  room_type: roomType,
                  button_type: 'reservation'
                })
              }
            }}
            className="w-full inline-block text-center bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            예약 컨시어지
          </a>
        </div>
      </div>
    </div>
  )
}

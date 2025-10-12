"use client"

import { useState, useEffect } from "react"
import { Users, Minus, Plus } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface GuestSelectorProps {
  rooms: number
  adults: number
  onGuestsChange: (guests: { rooms: number; adults: number }) => void
  onClose: () => void
}

export function GuestSelector({ rooms, adults, onGuestsChange, onClose }: GuestSelectorProps) {
  // 기본값 설정: 객실 1, 성인 2
  const defaultRooms = rooms || 1
  const defaultAdults = adults || 2
  
  const [localRooms, setLocalRooms] = useState(defaultRooms)
  const [localAdults, setLocalAdults] = useState(defaultAdults)

  // props가 변경되면 로컬 상태 업데이트
  useEffect(() => {
    setLocalRooms(defaultRooms)
    setLocalAdults(defaultAdults)
  }, [defaultRooms, defaultAdults])

  // 최소/최대 값 제한
  const MIN_ROOMS = 1
  const MAX_ROOMS = 5
  const MIN_ADULTS = 1
  const MAX_ADULTS = 10

  // 객실 수 변경 핸들러
  const handleRoomsChange = (increment: number) => {
    const newRooms = localRooms + increment
    if (newRooms >= MIN_ROOMS && newRooms <= MAX_ROOMS) {
      setLocalRooms(newRooms)
      // 객실 수 변경 시 다른 값들은 자동으로 조정하지 않음
    }
  }

  // 성인 수 변경 핸들러
  const handleAdultsChange = (increment: number) => {
    const newAdults = localAdults + increment
    if (newAdults >= MIN_ADULTS && newAdults <= MAX_ADULTS) {
      setLocalAdults(newAdults)
    }
  }



  // 확인 버튼 핸들러
  const handleConfirm = () => {
    onGuestsChange({
      rooms: localRooms,
      adults: localAdults
    })
    onClose()
  }

  // 한국어 표시 텍스트 생성
  const getDisplayText = () => {
    return `객실 ${localRooms}개, 성인 ${localAdults}명`
  }

  // 버튼 비활성화 상태 확인
  const isRoomsMinDisabled = localRooms <= MIN_ROOMS
  const isRoomsMaxDisabled = localRooms >= MAX_ROOMS
  const isAdultsMinDisabled = localAdults <= MIN_ADULTS
  const isAdultsMaxDisabled = localAdults >= MAX_ADULTS

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              {getDisplayText()}
            </span>
          </div>
        </div>

        {/* 선택 영역 */}
        <div className="p-6 space-y-6">
          {/* 객실 선택 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">객실</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoomsChange(-1)}
                disabled={isRoomsMinDisabled}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  isRoomsMinDisabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label="객실 수 감소"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center" aria-live="polite">
                {localRooms}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRoomsChange(1)}
                disabled={isRoomsMaxDisabled}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  isRoomsMaxDisabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label="객실 수 증가"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 성인 선택 */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">성인 만 18세 이상</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdultsChange(-1)}
                disabled={isAdultsMinDisabled}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  isAdultsMinDisabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label="성인 수 감소"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold text-gray-900 min-w-[2rem] text-center" aria-live="polite">
                {localAdults}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAdultsChange(1)}
                disabled={isAdultsMaxDisabled}
                className={cn(
                  "h-8 w-8 p-0 rounded-full",
                  isAdultsMaxDisabled && "opacity-50 cursor-not-allowed"
                )}
                aria-label="성인 수 증가"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>


        </div>

        {/* 확인 버튼 */}
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <Button
              onClick={handleConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              확인
            </Button>
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            aria-label="게스트 선택 닫기"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  )
}

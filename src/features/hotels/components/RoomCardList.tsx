"use client"

import { useState } from "react"
import { RoomCard } from "./RoomCard"

interface RoomCardListProps {
  ratePlans: any[]
  roomIntroductions: Map<string, string>
  globalOTAStyleRoomNames: Map<string, string>
  bedTypes: Map<string, string>
  isGeneratingIntroductions: boolean
  currentProcessingRow: number
  checkIn?: string
  checkOut?: string
}

export function RoomCardList({
  ratePlans,
  roomIntroductions,
  globalOTAStyleRoomNames,
  bedTypes,
  isGeneratingIntroductions,
  currentProcessingRow,
  checkIn,
  checkOut
}: RoomCardListProps) {
  const [showAll, setShowAll] = useState(false)
  
  // 처음 3개만 보여주고, 더보기 버튼 클릭 시 전체 표시
  const displayedRatePlans = showAll ? ratePlans : ratePlans.slice(0, 3)
  // 베드 타입 추출 함수
  const extractBedTypeFromDescription = (description: string): string => {
    if (!description || description === 'N/A') return '베드 정보 없음'
    
    const bedKeywords = [
      { keyword: 'KING BED', type: '킹 베드' },
      { keyword: 'TWIN BED', type: '트윈 베드' },
      { keyword: 'DOUBLE BED', type: '더블 베드' },
      { keyword: 'SINGLE BED', type: '싱글 베드' },
      { keyword: 'QUEEN BED', type: '퀸 베드' },
      { keyword: 'KING', type: '킹 베드' },
      { keyword: 'TWIN', type: '트윈 베드' },
      { keyword: 'DOUBLE', type: '더블 베드' },
      { keyword: 'SINGLE', type: '싱글 베드' },
      { keyword: 'QUEEN', type: '퀸 베드' },
      { keyword: '1 KING', type: '킹 베드 1개' },
      { keyword: '2 TWIN', type: '트윈 베드 2개' },
      { keyword: '1 DOUBLE', type: '더블 베드 1개' },
      { keyword: '1 SINGLE', type: '싱글 베드 1개' },
      { keyword: '1 QUEEN', type: '퀸 베드 1개' }
    ]
    
    const upperDescription = description.toUpperCase()
    
    for (const { keyword, type } of bedKeywords) {
      if (upperDescription.includes(keyword)) {
        return type
      }
    }
    
    return '베드 정보 없음'
  }

  // 수용 인원 추출 함수
  const extractOccupancy = (description: string): string => {
    if (!description || description === 'N/A') return '기준 2인 / 최대 2인'
    
    // 일반적인 수용 인원 패턴 매칭
    const occupancyPatterns = [
      { pattern: /최대\s*(\d+)인/i, format: (max: string) => `기준 2인 / 최대 ${max}인` },
      { pattern: /(\d+)인/i, format: (count: string) => `기준 ${count}인 / 최대 ${count}인` }
    ]
    
    for (const { pattern, format } of occupancyPatterns) {
      const match = description.match(pattern)
      if (match) {
        return format(match[1])
      }
    }
    
    return '기준 2인 / 최대 2인'
  }

  if (!ratePlans || ratePlans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        객실 정보가 없습니다.
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedRatePlans.map((rp: any, idx: number) => {
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const view = rp.RoomViewDescription || rp.RoomView || 'N/A'
        const amount = rp.AmountAfterTax || rp.Amount || rp.Total || '0'
        const currency = rp.Currency || 'KRW'
        const rateKey: string = rp.RateKey || 'N/A'
        
        // AI 처리 함수들과 동일한 키 생성 방식 사용
        const introKey = `${roomType}-${roomName}-${rp.RateKey || 'N/A'}`
        const roomIntroduction = roomIntroductions.get(introKey) || 'AI가 객실 소개를 생성 중입니다...'
        
        // 베드 타입과 수용 인원 추출
        const bedType = extractBedTypeFromDescription(description)
        const occupancy = extractOccupancy(description)
        
        // 면적 정보 (일반적으로 30-50m² 범위)
        const area = "35m²" // 기본값, 실제 데이터가 있다면 사용
        
        // 할인 정보 제거
        const discount = undefined
        
        // AI 처리 중인지 확인
        const isGenerating = isGeneratingIntroductions && currentProcessingRow === idx

        return (
          <RoomCard
            key={`room-card-${idx}`}
            roomType={roomType}
            roomName={roomName}
            description={description}
            roomIntroduction={roomIntroduction}
            bedType={bedType}
            area={area}
            occupancy={occupancy}
            amount={amount}
            currency={currency}
            discount={discount}
            isGenerating={isGenerating}
            checkIn={checkIn}
            checkOut={checkOut}
            view={view}
          />
        )
        })}
      </div>
      
      {/* 더보기 버튼 */}
      {ratePlans.length > 3 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            {showAll ? `객실 타입 접기 (${ratePlans.length}개)` : `객실 타입 더보기 (${ratePlans.length - 3}개 더)`}
          </button>
        </div>
      )}
    </div>
  )
}

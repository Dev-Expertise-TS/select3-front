"use client"

import { useState, useEffect } from "react"
import { RoomCard } from "./RoomCard"
import { TranslationErrorBoundary } from "@/components/shared/translation-error-boundary"
import { useAnalytics } from "@/hooks/use-analytics"

interface RoomCardListProps {
  ratePlans: any[]
  roomIntroductions: Map<string, string>
  globalOTAStyleRoomNames: Map<string, string>
  bedTypes: Map<string, string>
  isGeneratingIntroductions: boolean
  currentProcessingRow: number
  checkIn?: string
  checkOut?: string
  onRequestIntro?: (index: number) => void
  rooms?: number
  hotelId?: number
  hotelName?: string
  highlightedRateKey?: string
}

// localStorage 키
const KAKAO_FRIEND_ADDED_KEY = 'tourvis_select_kakao_friend_added'

export function RoomCardList({
  ratePlans,
  roomIntroductions,
  globalOTAStyleRoomNames,
  bedTypes,
  isGeneratingIntroductions,
  currentProcessingRow,
  checkIn,
  checkOut,
  onRequestIntro,
  rooms = 1,
  hotelId,
  hotelName,
  highlightedRateKey
}: RoomCardListProps) {
  const [showAll, setShowAll] = useState(false)
  const [hasAddedKakaoFriend, setHasAddedKakaoFriend] = useState(false)
  const [selectedBedTypes, setSelectedBedTypes] = useState<string[]>([])
  const [selectedViewTypes, setSelectedViewTypes] = useState<string[]>([])
  const { trackEvent } = useAnalytics()

  // 컴포넌트 마운트 시 localStorage에서 카카오 친구 추가 상태 확인
  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(KAKAO_FRIEND_ADDED_KEY)
      if (storedValue === 'true') {
        setHasAddedKakaoFriend(true)
      }
    } catch (error) {
      // localStorage 접근 실패 시 (예: 프라이빗 브라우징 모드)
      console.warn('localStorage 접근 실패:', error)
    }
  }, [])
  
  // AI 처리는 hotel-detail.tsx에서 자동으로 호출되므로 여기서는 제거
  // 베드 타입 추출 함수 (사용 전에 정의 필요)
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

  // 뷰 타입 추출 함수
  const extractViewTypeFromDescription = (roomViewDescription: string | null | undefined): string | null => {
    if (!roomViewDescription || roomViewDescription === 'N/A' || roomViewDescription === null) return null
    
    // 뷰 타입 키워드 매칭
    const viewKeywords = [
      { keyword: 'OCEAN VIEW', type: '오션 뷰' },
      { keyword: 'SEA VIEW', type: '바다 뷰' },
      { keyword: 'CITY VIEW', type: '시티 뷰' },
      { keyword: 'MOUNTAIN VIEW', type: '마운틴 뷰' },
      { keyword: 'GARDEN VIEW', type: '가든 뷰' },
      { keyword: 'POOL VIEW', type: '풀 뷰' },
      { keyword: 'RIVER VIEW', type: '리버 뷰' },
      { keyword: 'LAKE VIEW', type: '레이크 뷰' },
      { keyword: 'INTERIOR VIEW', type: '인테리어 뷰' },
      { keyword: 'STREET VIEW', type: '스트리트 뷰' },
      { keyword: 'HARBOR VIEW', type: '하버 뷰' },
      { keyword: 'OCEAN', type: '오션 뷰' },
      { keyword: 'SEA', type: '바다 뷰' },
      { keyword: 'CITY', type: '시티 뷰' },
      { keyword: 'MOUNTAIN', type: '마운틴 뷰' },
      { keyword: 'GARDEN', type: '가든 뷰' },
      { keyword: 'POOL', type: '풀 뷰' },
      { keyword: 'RIVER', type: '리버 뷰' },
      { keyword: 'LAKE', type: '레이크 뷰' },
      { keyword: 'INTERIOR', type: '인테리어 뷰' },
      { keyword: 'STREET', type: '스트리트 뷰' },
      { keyword: 'HARBOR', type: '하버 뷰' }
    ]
    
    const upperDescription = roomViewDescription.toUpperCase()
    
    for (const { keyword, type } of viewKeywords) {
      if (upperDescription.includes(keyword)) {
        return type
      }
    }
    
    return null
  }

  // 사용 가능한 베드 타입 목록 추출
  const availableBedTypes = Array.from(
    new Set(
      ratePlans.map((rp: any) => 
        extractBedTypeFromDescription(rp.Description || '')
      ).filter((bedType: string) => bedType && bedType !== '베드 정보 없음')
    )
  ).sort()

  // 사용 가능한 뷰 타입 목록 추출
  const availableViewTypes = Array.from(
    new Set(
      ratePlans.map((rp: any) => 
        extractViewTypeFromDescription(rp.RoomViewDescription || rp.RoomView || null)
      ).filter((viewType: string | null) => viewType !== null)
    )
  ).sort()

  // 베드 타입과 뷰 타입 필터링
  const filteredRatePlans = ratePlans.filter((rp: any) => {
    const bedType = extractBedTypeFromDescription(rp.Description || '')
    const viewType = extractViewTypeFromDescription(rp.RoomViewDescription || rp.RoomView || null)
    
    const bedTypeMatch = selectedBedTypes.length === 0 || selectedBedTypes.includes(bedType)
    const viewTypeMatch = selectedViewTypes.length === 0 || (viewType && selectedViewTypes.includes(viewType))
    
    return bedTypeMatch && viewTypeMatch
  })

  // 처음 3개만 보여주고, 더보기 버튼 클릭 시 전체 표시
  const displayedRatePlans = showAll ? filteredRatePlans : filteredRatePlans.slice(0, 3)

  // 베드 타입 필터 토글
  const toggleBedType = (bedType: string) => {
    setSelectedBedTypes(prev => 
      prev.includes(bedType)
        ? prev.filter(type => type !== bedType)
        : [...prev, bedType]
    )
    // 필터 변경 시 더보기 자동 펼침
    setShowAll(true)
  }

  // 뷰 타입 필터 토글
  const toggleViewType = (viewType: string) => {
    setSelectedViewTypes(prev => 
      prev.includes(viewType)
        ? prev.filter(type => type !== viewType)
        : [...prev, viewType]
    )
    // 필터 변경 시 더보기 자동 펼침
    setShowAll(true)
  }

  // 카카오 친구 추가 버튼 클릭 핸들러
  const handleKakaoFriendAdd = () => {
    // ✅ GTM을 통해 이벤트 전송 (GTM이 GA4로 전달)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'kakao_friend_add',
        event_category: 'engagement',
        event_label: 'hotel_detail_room_rates',
        hotel_id: hotelId || null,
        hotel_name: hotelName || null,
        check_in: checkIn || null,
        check_out: checkOut || null,
        rooms: rooms || 1,
        button_location: 'hotel_detail_room_rates',
        timestamp: new Date().toISOString()
      })
      console.log('✅ [GTM] 이벤트 전송 완료: kakao_friend_add')
    } else {
      console.warn('⚠️ [GTM] dataLayer가 없습니다.')
    }
    
    console.log('🎯 [Analytics] 카카오 친구 추가 클릭:', {
      위치: 'hotel_detail_room_rates',
      호텔ID: hotelId,
      호텔명: hotelName,
      체크인: checkIn,
      체크아웃: checkOut,
      룸수: rooms,
      dataLayer_로드: typeof window !== 'undefined' && typeof (window as any).dataLayer !== 'undefined'
    })
    
    try {
      // localStorage에 카카오 친구 추가 상태 저장 (영구 저장)
      localStorage.setItem(KAKAO_FRIEND_ADDED_KEY, 'true')
    } catch (error) {
      console.warn('localStorage 저장 실패:', error)
    }
    
    // 새 창에서 카카오 친구 추가 링크 열기
    window.open('https://pf.kakao.com/_cxmxgNG', '_blank', 'noopener,noreferrer')
    
    // 바로 객실 요금 표시
    setHasAddedKakaoFriend(true)
  }

  // 요금 정보가 없으면 카카오 친구 추가 화면을 건너뛰고 "객실 정보가 없습니다" 메시지 표시
  if (!ratePlans || ratePlans.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" suppressHydrationWarning>
        객실 정보가 없습니다.
      </div>
    )
  }

  // 카카오 친구 추가 전 화면 (요금 정보가 있을 때만 표시)
  if (!hasAddedKakaoFriend) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-8 sm:p-12 text-center border border-yellow-200" suppressHydrationWarning>
        <div className="max-w-md mx-auto">
          {/* 메시지 */}
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            객실별 요금 확인하기
          </h3>
          <p className="text-gray-700 mb-8 leading-relaxed">
            놓치기 아까운 혜택, 프로모션 정보를 제공하는<br />
            투어비스 셀렉트 카카오 친구 추가를 하시고<br />
            객실별 요금을 확인하세요.
          </p>

          {/* 카카오 친구 추가 버튼 */}
          <button
            onClick={handleKakaoFriendAdd}
            className="inline-flex items-center justify-center px-8 py-4 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.376 1.409 4.5 3.599 5.899-.143.537-.534 2.007-.617 2.33-.096.374.137.369.255.269.092-.078 1.486-1.017 2.07-1.417C8.372 17.844 10.138 18 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
            </svg>
            카카오 친구 추가하기
          </button>

          {/* 안내 문구 */}
          <p className="text-xs text-gray-500 mt-4">
            친구 추가 후 바로 객실 요금을 확인하실 수 있습니다
          </p>
        </div>
      </div>
    )
  }

  // 카카오 친구 추가 후 객실 요금 표시
  return (
    <TranslationErrorBoundary>
      <div suppressHydrationWarning translate="no">
        {/* 베드 타입 및 뷰 타입 필터 - 임시로 숨김 처리 (나중에 재사용 가능) */}
        {/* 주석 해제하여 다시 활성화: {(availableBedTypes.length > 0 || availableViewTypes.length > 0) && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {availableBedTypes.length > 0 && (
                <>
                  <span className="text-sm font-medium text-gray-700 mr-2">베드 타입:</span>
                  {availableBedTypes.map((bedType) => {
                    const isSelected = selectedBedTypes.includes(bedType)
                    return (
                      <button
                        key={bedType}
                        onClick={() => toggleBedType(bedType)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {bedType}
                        {isSelected && (
                          <span className="ml-2 text-xs">✓</span>
                        )}
                      </button>
                    )
                  })}
                </>
              )}
              {availableViewTypes.length > 0 && (
                <>
                  {availableBedTypes.length > 0 && (
                    <span className="text-sm text-gray-400 mx-2">|</span>
                  )}
                  <span className="text-sm font-medium text-gray-700 mr-2">전망:</span>
                  {availableViewTypes.map((viewType) => {
                    const isSelected = selectedViewTypes.includes(viewType)
                    return (
                      <button
                        key={viewType}
                        onClick={() => toggleViewType(viewType)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {viewType}
                        {isSelected && (
                          <span className="ml-2 text-xs">✓</span>
                        )}
                      </button>
                    )
                  })}
                </>
              )}
            </div>
            {(selectedBedTypes.length > 0 || selectedViewTypes.length > 0) && (
              <div className="text-sm text-gray-600 mb-2">
                {filteredRatePlans.length}개의 객실이 표시됩니다
              </div>
            )}
          </div>
        )} */}

        {/* 필터링된 결과가 없을 때 - 임시로 숨김 처리 (나중에 재사용 가능) */}
        {/* 주석 해제하여 다시 활성화: {filteredRatePlans.length === 0 && (selectedBedTypes.length > 0 || selectedViewTypes.length > 0) ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">선택한 필터에 해당하는 객실이 없습니다.</p>
          </div>
        ) : ( */}
        {(
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRatePlans.map((rp: any, idx: number) => {
                const roomType = rp.RoomType || rp.RoomName || ''
                const roomName = rp.RoomName || ''
                const description = rp.Description || ''
                const view = rp.RoomViewDescription || rp.RoomView || null
                const amount = rp.AmountAfterTax || rp.Amount || rp.Total || 0
                const currency = rp.Currency || 'KRW'
                const rateKey: string = rp.RateKey || ''
                
                // AI 처리 함수들과 동일한 키 생성 방식 사용
                const introKey = `${roomType}-${roomName}-${rp.RateKey || 'N/A'}`
                const roomIntroduction = roomIntroductions.get(introKey) || undefined
                
                
                // 베드 타입과 수용 인원 추출
                const bedType = extractBedTypeFromDescription(description)
                const occupancy = extractOccupancy(description)
                
                // 면적 정보 제거 (실제 데이터가 없으므로)
                const area = undefined
                
                // 할인 정보 제거
                const discount = undefined
                
                // AI 처리 중인지 확인 - 더 정확한 조건
                const isGenerating = isGeneratingIntroductions && 
                  currentProcessingRow === idx && 
                  (!roomIntroduction || roomIntroduction.includes('호텔 전문 AI가 객실 소개를 준비 중입니다'))

        const isHighlighted = highlightedRateKey === rateKey

        return (
                  <TranslationErrorBoundary key={`room-card-boundary-${rateKey}-${idx}`}>
                    <div key={`room-card-wrapper-${rateKey}-${idx}`} suppressHydrationWarning translate="no">
                      <RoomCard
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
                        isBeyondFirstRow={idx >= 3}
                        hasIntro={!!(roomIntroduction && roomIntroduction !== '호텔 전문 AI가 객실 소개를 준비 중입니다...')}
                        onRequestIntro={onRequestIntro ? () => onRequestIntro(idx) : undefined}
                rooms={rooms}
                isHighlighted={isHighlighted}
                      />
                    </div>
                  </TranslationErrorBoundary>
                )
              })} 
            </div>
            
            {/* 더보기 버튼 */}
            {filteredRatePlans.length > 3 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                  {showAll ? `객실 타입 접기 (${filteredRatePlans.length}개)` : `객실 타입 더보기 (${filteredRatePlans.length - 3}개 더)`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </TranslationErrorBoundary>
  )
}

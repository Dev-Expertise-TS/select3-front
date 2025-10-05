"use client"

import { useState } from "react"

interface RoomRatesTableProps {
  ratePlans: any[]
  roomIntroductions: Map<string, string>
  globalOTAStyleRoomNames: Map<string, string>
  bedTypes: Map<string, string>
  isGeneratingIntroductions: boolean
  isGeneratingRoomNames: boolean
  currentProcessingRow: number
  sabreLoading: boolean
  sabreError: any
  hasSearched: boolean
  cacheStats: {
    hits: number
    misses: number
    totalProcessed: number
  }
  clearCache: () => void
  getCacheInfo: () => {
    totalItems: number
    items: any[]
    stats: any
  }
  processRemainingRatePlans: (ratePlans: any[], hotelName: string, checkIn?: string, checkOut?: string) => Promise<void>
  hotelName: string
  checkIn: string
  checkOut: string
}

export function RoomRatesTable({
  ratePlans,
  roomIntroductions,
  globalOTAStyleRoomNames,
  bedTypes,
  isGeneratingIntroductions,
  isGeneratingRoomNames,
  currentProcessingRow,
  sabreLoading,
  sabreError,
  hasSearched,
  cacheStats,
  clearCache,
  getCacheInfo,
  processRemainingRatePlans,
  hotelName,
  checkIn,
  checkOut
}: RoomRatesTableProps) {
  const [copiedRateKeyRow, setCopiedRateKeyRow] = useState<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedBedTypes, setSelectedBedTypes] = useState<string[]>([])
  const [selectedViewTypes, setSelectedViewTypes] = useState<string[]>([])
  
  
  // 베드 타입 추출 함수 (객실 소개 데이터에서)
  const extractBedTypeFromDescription = (description: string): string => {
    if (!description || description === 'N/A') return ''
    
    // 베드 타입 키워드 매칭
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
    
    return ''
  }

  // 뷰 타입 추출 함수
  const extractViewTypeFromDescription = (roomViewDescription: string): string | null => {
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
      { keyword: 'OCEAN', type: '오션 뷰' },
      { keyword: 'SEA', type: '바다 뷰' },
      { keyword: 'CITY', type: '시티 뷰' },
      { keyword: 'MOUNTAIN', type: '마운틴 뷰' },
      { keyword: 'GARDEN', type: '가든 뷰' },
      { keyword: 'POOL', type: '풀 뷰' },
      { keyword: 'RIVER', type: '리버 뷰' },
      { keyword: 'LAKE', type: '레이크 뷰' },
      { keyword: 'INTERIOR', type: '인테리어 뷰' },
      { keyword: 'STREET', type: '스트리트 뷰' }
    ]
    
    const upperDescription = roomViewDescription.toUpperCase()
    
    for (const { keyword, type } of viewKeywords) {
      if (upperDescription.includes(keyword)) {
        return type
      }
    }
    
    return null
  }
  
  // 베드 타입과 뷰 타입 필터링된 데이터
  const filteredRatePlans = ratePlans.filter((rp: any) => {
    const bedType = extractBedTypeFromDescription(rp.Description || '')
    const viewType = extractViewTypeFromDescription(rp.RoomViewDescription || '')
    
    const bedTypeMatch = selectedBedTypes.length === 0 || selectedBedTypes.includes(bedType)
    const viewTypeMatch = selectedViewTypes.length === 0 || (viewType && selectedViewTypes.includes(viewType))
    
    return bedTypeMatch && viewTypeMatch
  })

  // 표시할 레코드 수 결정 (접힌 상태: 3개, 펼친 상태: 전체)
  const visibleRows = isExpanded ? filteredRatePlans.length : Math.min(3, filteredRatePlans.length)
  const hasMoreRows = filteredRatePlans.length > 3
  
  // 베드 타입 옵션 추출
  const availableBedTypes = Array.from(
    new Set(ratePlans.map((rp: any) => extractBedTypeFromDescription(rp.Description || '')).filter(bedType => bedType !== ''))
  ).sort()

  // 뷰 타입 옵션 추출 (null 값 제외)
  const availableViewTypes = Array.from(
    new Set(ratePlans.map((rp: any) => extractViewTypeFromDescription(rp.RoomViewDescription || '')).filter(viewType => viewType !== null))
  ).sort()

  // 접힌 상태의 레코드들에 대한 AI 처리 완료 상태 계산
  const hiddenRows = filteredRatePlans.slice(3)
  const hiddenRowsWithAI = hiddenRows.filter((rp: any, idx: number) => {
    const roomType = rp.RoomType || rp.RoomName || ''
    const roomName = rp.RoomName || ''
    const rateKey: string = rp.RateKey || ''
    const introKey = `${roomType}-${roomName}-${rateKey}`
    return roomIntroductions.has(introKey)
  }).length
  
  const hiddenRowsWithRoomNames = hiddenRows.filter((rp: any, idx: number) => {
    const roomType = rp.RoomType || rp.RoomName || ''
    const roomName = rp.RoomName || ''
    const rowKey = `${roomType}-${roomName}`
    return globalOTAStyleRoomNames.has(rowKey)
  }).length

  const copyRateKey = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRateKeyRow(index)
      setTimeout(() => setCopiedRateKeyRow(null), 1200)
    } catch (_e) {
      // noop
    }
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-8">
        <div className="text-blue-500 mb-3">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-lg font-medium text-blue-800 mb-2">검색을 시작해주세요</p>
        <p className="text-sm text-blue-600 mb-4">위의 검색창에서 날짜와 인원을 선택한 후 검색 버튼을 눌러주세요.</p>
        <div className="text-xs text-blue-500 space-y-1">
          <p>• 체크인/체크아웃 날짜를 선택해주세요</p>
          <p>• 객실, 성인, 어린이 수를 설정해주세요</p>
          <p>• 검색 버튼을 클릭하면 실시간 객실 정보를 확인할 수 있습니다</p>
        </div>
      </div>
    )
  }

  if (sabreLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">해당 일자와 인원에 맞는 객실 요금을 조회 중입니다.</span>
        </div>
      </div>
    )
  }

  if (sabreError) {
    return (
      <div className="text-center py-6">
        <div className="text-red-500 mb-2">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm text-red-600 mb-3">객실 정보 조회에 실패했습니다.</p>
        <div className="text-xs text-gray-500">
          <p>• Sabre API 연결을 확인해주세요</p>
          <p>• 호텔의 Rate Plan 정보가 있는지 확인해주세요</p>
          <p>• 잠시 후 다시 시도해주세요</p>
        </div>
      </div>
    )
  }

  if (!Array.isArray(ratePlans) || ratePlans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <div className="text-6xl mb-4">🏨</div>
          <h4 className="text-xl font-semibold text-gray-700 mb-4">
            해당 일자에 예약 가능한 객실이 조회되지 않습니다.
          </h4>
          <p className="text-gray-600 mb-6">
            호텔 전문 컨시어지 상담이나 전화를 해주시면 상세히 안내해 드리겠습니다.
          </p>
        </div>
        
        {/* 상담하기 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => {
              // 전화 걸기
              window.open('tel:1588-0000', '_self')
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            전화 상담
          </button>
          
          <button 
            onClick={() => {
              // 카카오톡 상담 (예시)
              window.open('https://pf.kakao.com/_your_kakao_channel', '_blank')
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3C6.486 3 2 6.262 2 10.2c0 2.4 1.6 4.5 4 5.8V21l3.5-2c.5.1 1 .1 1.5.1 5.514 0 10-3.262 10-7.2S17.514 3 12 3z"/>
            </svg>
            카카오톡 상담
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-500">
          <p>상담 시간: 평일 09:00 - 18:00</p>
          <p>전화: 1588-0000</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 캐시 상태 표시 */}
      {cacheStats.totalProcessed > 0 && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💾</span>
                <span className="text-sm font-medium text-green-800">AI 캐시 상태</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-green-700">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>캐시 히트: {cacheStats.hits}회</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span>캐시 미스: {cacheStats.misses}회</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>총 처리: {cacheStats.totalProcessed}개</span>
                </div>
                <div className="text-green-600 font-medium">
                  히트율: {cacheStats.totalProcessed > 0 ? Math.round((cacheStats.hits / cacheStats.totalProcessed) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const info = getCacheInfo()
                  console.log('캐시 정보:', info)
                  alert(`캐시 항목: ${info.totalItems}개\n히트율: ${info.stats.totalProcessed > 0 ? Math.round((info.stats.hits / info.stats.totalProcessed) * 100) : 0}%`)
                }}
                className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
              >
                상세 정보
              </button>
              <button
                onClick={() => {
                  if (confirm('캐시를 모두 삭제하시겠습니까?')) {
                    clearCache()
                    alert('캐시가 삭제되었습니다.')
                  }
                }}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              >
                캐시 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 베드 타입 & 뷰 타입 필터 */}
      {(availableBedTypes.length > 1 || availableViewTypes.length > 1) && (
        <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-700">필터</h4>
            {(selectedBedTypes.length > 0 || selectedViewTypes.length > 0) && (
              <button
                onClick={() => {
                  setSelectedBedTypes([])
                  setSelectedViewTypes([])
                }}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                전체 해제
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 베드 타입 필터 */}
            {availableBedTypes.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-medium text-gray-600">베드 타입</h5>
                  {selectedBedTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedBedTypes([])}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      해제
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableBedTypes.map((bedType) => {
                    const count = ratePlans.filter((rp: any) => 
                      extractBedTypeFromDescription(rp.Description || '') === bedType
                    ).length
                    
                    return (
                      <button
                        key={bedType}
                        onClick={() => {
                          if (selectedBedTypes.includes(bedType)) {
                            setSelectedBedTypes(selectedBedTypes.filter(type => type !== bedType))
                          } else {
                            setSelectedBedTypes([...selectedBedTypes, bedType])
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          selectedBedTypes.includes(bedType)
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {bedType} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 뷰 타입 필터 */}
            {availableViewTypes.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-medium text-gray-600">뷰 타입</h5>
                  {selectedViewTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedViewTypes([])}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      해제
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {availableViewTypes.map((viewType) => {
                    const count = ratePlans.filter((rp: any) => 
                      extractViewTypeFromDescription(rp.RoomViewDescription || '') === viewType
                    ).length
                    
                    return (
                      <button
                        key={viewType}
                        onClick={() => {
                          if (selectedViewTypes.includes(viewType)) {
                            setSelectedViewTypes(selectedViewTypes.filter(type => type !== viewType))
                          } else {
                            setSelectedViewTypes([...selectedViewTypes, viewType])
                          }
                        }}
                        className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                          selectedViewTypes.includes(viewType)
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {viewType} ({count})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 필터 상태 표시 */}
          {(selectedBedTypes.length > 0 || selectedViewTypes.length > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                {selectedBedTypes.length > 0 && (
                  <span className="mr-4">
                    <span className="text-blue-600 font-medium">베드:</span> {selectedBedTypes.join(', ')}
                  </span>
                )}
                {selectedViewTypes.length > 0 && (
                  <span>
                    <span className="text-green-600 font-medium">뷰:</span> {selectedViewTypes.join(', ')}
                  </span>
                )}
                <span className="ml-4 text-gray-500">
                  ({filteredRatePlans.length}개 객실 표시)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700 w-[168px] min-w-[168px] hidden">객실명</th>
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700 w-[100px] min-w-[100px] hidden">View</th>
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700 w-[100px] min-w-[100px]">베드 타입</th>
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700">객실 소개</th>
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700">총 요금</th>
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700">통화</th>
              <th className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-center text-sm sm:text-base font-semibold text-gray-700">RATEKEY</th>
            </tr>
          </thead>
          <tbody>
            {filteredRatePlans.slice(0, visibleRows).map((rp: any, idx: number) => {
              const roomType = rp.RoomType || rp.RoomName || ''
              const roomName = rp.RoomName || ''
              const amount = rp.AmountAfterTax || rp.Amount || rp.Total || '0'
              const currency = rp.Currency || 'KRW'
              const rateKey: string = rp.RateKey || ''
              const shortRateKey = typeof rateKey === 'string' && rateKey.length > 10 ? `${rateKey.slice(0, 10)}...` : rateKey
              
              // AI 처리 함수들과 동일한 키 생성 방식 사용
              const rowKey = `${roomType}-${roomName}`
              const introKey = `${roomType}-${roomName}-${rp.RateKey || ''}` // AI 처리 함수와 동일한 방식
              const roomIntroduction = roomIntroductions.get(introKey) || 'AI가 객실 소개를 생성 중입니다...'
              
              // 디버깅: 키와 Map 상태 확인
              if (idx >= 3) { // 4행부터 디버깅
                console.log(`🔍 ${idx + 1}행 디버깅:`, {
                  rowKey,
                  introKey,
                  hasRoomIntroduction: roomIntroductions.has(introKey),
                  roomIntroduction: roomIntroduction.substring(0, 50) + '...',
                  mapSize: roomIntroductions.size,
                  mapKeys: Array.from(roomIntroductions.keys()).slice(0, 3),
                  allMapKeys: Array.from(roomIntroductions.keys()),
                  roomType,
                  roomName,
                  rateKey
                })
              }
              
              return (
                <tr key={`rp-${idx}`} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-center w-[168px] min-w-[168px] hidden">
                    <div className="text-gray-700 font-medium">
                      {isGeneratingRoomNames && idx === 0 ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-500">AI가 객실 타입을 추출 중입니다...</span>
                        </div>
                      ) : (
                        globalOTAStyleRoomNames.get(rowKey) || ''
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-center w-[100px] min-w-[100px] hidden">
                    <div className="text-gray-700 font-medium">
                      {extractViewTypeFromDescription(rp.RoomViewDescription || '') || '-'}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-center w-[100px] min-w-[100px]">
                    <div className="text-gray-700 font-medium">
                      {extractBedTypeFromDescription(rp.Description || '')}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-left">
                    <div className="text-gray-700">
                      {(() => {
                        // 디버깅을 위한 로그 (4행부터만)
                        if (idx >= 3) {
                          console.log(`🔍 ${idx + 1}행 객실 소개 렌더링:`, {
                            introKey,
                            roomIntroduction: roomIntroduction.substring(0, 50) + '...',
                            hasValidIntro: roomIntroduction && roomIntroduction !== 'AI가 객실 소개를 생성 중입니다...',
                            isGenerating: isGeneratingIntroductions,
                            currentRow: currentProcessingRow,
                            idx
                          })
                        }
                        
                        if (roomIntroduction && roomIntroduction !== 'AI가 객실 소개를 생성 중입니다...') {
                          return roomIntroduction
                        } else if (isGeneratingIntroductions && currentProcessingRow === idx) {
                          return (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                              <span className="text-gray-500 text-xs">AI가 객실 소개 설명을 준비 중입니다.</span>
                            </div>
                          )
                        } else {
                          return rp.Description || ''
                        }
                      })()}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-center">
                    {amount && amount !== '' && !isNaN(Number(amount)) && Number(amount) > 0 ? 
                      `${parseInt(String(amount)).toLocaleString()}` : 
                      <span className="text-red-500">요금 정보 없음</span>
                    }
                  </td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-center">{currency}</td>
                  <td className="border border-gray-200 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 text-center">
                    <button
                      type="button"
                      title={typeof rateKey === 'string' ? rateKey : ''}
                      onClick={() => copyRateKey(String(rateKey), idx)}
                      className="font-mono underline decoration-dotted hover:text-blue-600"
                    >
                      {shortRateKey}
                    </button>
                    {copiedRateKeyRow === idx && (
                      <span className="ml-2 text-xs text-green-600">Copied</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 더보기/접기 버튼 */}
      {hasMoreRows && (
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              if (!isExpanded) {
                // 더보기 클릭 시 나머지 레코드 AI 처리 시작 (원본 ratePlans 사용)
                if (!processRemainingRatePlans || !ratePlans || ratePlans.length === 0 || !hotelName) {
                  return
                }
                
                processRemainingRatePlans(ratePlans, hotelName, checkIn, checkOut)
                  .catch((error: any) => {
                    console.error('❌ AI 처리 함수 호출 실패:', error)
                  })
              }
              
              setIsExpanded(!isExpanded)
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            {isExpanded ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                접기 ({filteredRatePlans.length - 3}개 숨기기)
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                더보기 ({filteredRatePlans.length - 3}개 더 보기)
              </>
            )}
          </button>
          
          {/* 접힌 상태에서 AI 처리 진행 상황 표시 */}
          {!isExpanded && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {(isGeneratingIntroductions || isGeneratingRoomNames) && currentProcessingRow >= 3 ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium">
                      나머지 {filteredRatePlans.length - 3}개 레코드에 대해 AI 처리가 진행 중입니다...
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 text-center">
                    현재 처리 중: {currentProcessingRow + 1}번째 레코드
                  </div>
                </>
              ) : (
                  <div className="text-center">
                    <div className="text-sm font-medium text-blue-700 mb-2">
                      나머지 {filteredRatePlans.length - 3}개 레코드 AI 처리 상태
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-blue-600">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>객실 소개: {hiddenRowsWithAI}/{filteredRatePlans.length - 3}개 완료</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>객실명: {hiddenRowsWithRoomNames}/{filteredRatePlans.length - 3}개 완료</span>
                      </div>
                    </div>
                  <div className="mt-2 text-xs text-blue-500">
                    더보기를 클릭하여 나머지 레코드의 AI 처리를 시작하세요.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Table Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">테이블 설명</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">베드:</span> AI가 해석한 침대 구성 (킹, 트윈, 더블 등)
          </div>
          <div>
            <span className="font-medium">객실 소개:</span> AI가 생성한 매력적인 객실 소개
          </div>
          <div>
            <span className="font-medium">총 요금:</span> 세금 포함 최종 요금
          </div>
          <div>
            <span className="font-medium">통화:</span> 요금 단위
          </div>
          <div>
            <span className="font-medium">RATEKEY:</span> 예약 시 필요한 고유 코드
          </div>
        </div>
        
        {/* 캐시 관련 설명 */}
        {cacheStats.totalProcessed > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <span className="text-lg">💾</span>
              AI 캐시 시스템
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>
                <span className="font-medium text-green-600">캐시 히트:</span> 동일한 객실 데이터에 대해 이전에 AI 처리한 결과를 재사용
              </div>
              <div>
                <span className="font-medium text-orange-600">캐시 미스:</span> 새로운 객실 데이터로 AI 처리 수행
              </div>
              <div>
                <span className="font-medium text-blue-600">캐시 만료:</span> 24시간 후 자동 만료 (브라우저 새로고침 시 초기화)
              </div>
              <div>
                <span className="font-medium text-purple-600">성능 향상:</span> 캐시 히트 시 AI API 호출 없이 즉시 표시
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
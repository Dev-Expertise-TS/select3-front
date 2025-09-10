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
  hasSearched
}: RoomRatesTableProps) {
  const [copiedRateKeyRow, setCopiedRateKeyRow] = useState<number | null>(null)

  const copyRateKey = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRateKeyRow(index)
      setTimeout(() => setCopiedRateKeyRow(null), 1200)
    } catch (_e) {
      // noop
    }
  }

  // 베드 타입 추출 함수 (객실 소개 데이터에서)
  const extractBedTypeFromDescription = (description: string): string => {
    if (!description || description === 'N/A') return '정보 없음'
    
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
    
    return '베드 정보 없음'
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
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[168px] min-w-[168px] hidden">객실명</th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px] min-w-[100px] hidden">View</th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px] min-w-[100px]">베드 타입</th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">객실 소개</th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">총 요금</th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">통화</th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">RATEKEY</th>
            </tr>
          </thead>
          <tbody>
            {ratePlans.map((rp: any, idx: number) => {
              const roomType = rp.RoomType || rp.RoomName || 'N/A'
              const roomName = rp.RoomName || 'N/A'
              const amount = rp.AmountAfterTax || rp.Amount || rp.Total || '0'
              const currency = rp.Currency || 'KRW'
              const rateKey: string = rp.RateKey || 'N/A'
              const shortRateKey = typeof rateKey === 'string' && rateKey.length > 10 ? `${rateKey.slice(0, 10)}...` : rateKey
              
              // AI 처리 함수들과 동일한 키 생성 방식 사용
              const rowKey = `${roomType}-${roomName}`
              const introKey = `${roomType}-${roomName}-${rateKey}`
              const roomIntroduction = roomIntroductions.get(introKey) || 'AI가 객실 소개를 생성 중입니다...'
              
              return (
                <tr key={`rp-${idx}`} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center w-[168px] min-w-[168px] hidden">
                    <div className="text-gray-700 font-medium">
                      {isGeneratingRoomNames && idx === 0 ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-500">AI가 객실 타입을 추출 중입니다...</span>
                        </div>
                      ) : (
                        globalOTAStyleRoomNames.get(rowKey) || '정보 없음'
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center w-[100px] min-w-[100px] hidden">
                    <div className="text-gray-700 font-medium">
                      {rp.RoomViewDescription || 'N/A'}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center w-[100px] min-w-[100px]">
                    <div className="text-gray-700 font-medium">
                      {extractBedTypeFromDescription(rp.Description || 'N/A')}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-left">
                    <div className="text-gray-700">
                      {roomIntroductions.has(introKey) ? (
                        roomIntroduction
                      ) : isGeneratingIntroductions && currentProcessingRow === idx ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-gray-500 text-xs">AI 가 객실 소개 설명을 준비 중입니다.</span>
                        </div>
                      ) : (
                        rp.Description || 'N/A'
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center">
                    {amount && amount !== 'N/A' && !isNaN(Number(amount)) && Number(amount) > 0 ? 
                      `${parseInt(String(amount)).toLocaleString()}` : 
                      <span className="text-red-500">요금 정보 없음</span>
                    }
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center">{currency}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center">
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
      </div>
    </>
  )
}
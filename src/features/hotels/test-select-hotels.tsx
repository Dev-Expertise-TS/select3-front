'use client'

import { useState } from 'react'
import { selectHotelUtils, supabaseConnectionTest } from '@/lib/supabase-utils'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type SelectHotel = Database['public']['Tables']['select_hotels']['Row']

export function TestSelectHotels() {
  const [hotels, setHotels] = useState<SelectHotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState<boolean | null>(null)

  const testConnection = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 1. 직접 Supabase 호출 테스트
      console.log('🔧 직접 Supabase 호출 테스트...')
      try {
        // 먼저 테이블 구조 확인 (모든 컬럼 조회)
        console.log('🔧 테이블 구조 확인 중...')
        const { data: structureData, error: structureError } = await supabase
          .from('select_hotels')
          .select('*')
          .limit(1)
        
        console.log('🔧 테이블 구조 확인 결과:', { structureData, structureError })
        
        if (structureError) {
          console.error('❌ 테이블 구조 확인 오류:', structureError)
          setError(`테이블 구조 확인 오류: ${structureError.message}`)
          return
        }
        
        if (structureData && structureData.length > 0) {
          console.log('🔧 실제 테이블 컬럼들:', Object.keys(structureData[0]))
          console.log('🔧 첫 번째 레코드:', structureData[0])
        }
        
        // 이제 id만 조회
        const { data, error } = await supabase
          .from('select_hotels')
          .select('id')
          .limit(1)
        
        console.log('🔧 ID 조회 결과:', { data, error })
        
        if (error) {
          console.error('❌ ID 조회 오류 상세:')
          console.error('  - 오류 객체:', error)
          console.error('  - 오류 JSON:', JSON.stringify(error, null, 2))
          console.error('  - 오류 속성들:')
          for (const [key, value] of Object.entries(error)) {
            console.error(`    ${key}:`, value, `(${typeof value})`)
          }
          
          setError(`ID 조회 오류: ${error.message || '알 수 없는 오류'}`)
          return
        }
        
        console.log('✅ 직접 호출 성공')
        
      } catch (directErr) {
        console.error('❌ 직접 호출 예외:', directErr)
        setError(`직접 호출 예외: ${String(directErr)}`)
        return
      }
      
      // 2. Supabase 연결 테스트
      console.log('🔧 Supabase 연결 테스트 시작...')
      const connectionResult = await supabaseConnectionTest.testConnection()
      
      if (!connectionResult.success) {
        setError(`연결 실패: ${connectionResult.error}`)
        return
      }
      
      // 2. 테이블 존재 여부 확인
      console.log('🔍 테이블 존재 여부 확인 중...')
      const exists = await selectHotelUtils.checkSelectHotelsTable()
      setTableExists(exists)
      console.log('✅ 테이블 존재 여부:', exists)
      
      if (!exists) {
        setError('select_hotels 테이블을 찾을 수 없습니다.')
        return
      }
      
      // 3. 모든 호텔 데이터 조회
      console.log('📊 호텔 데이터 조회 중...')
      const data = await selectHotelUtils.getAllSelectHotels()
      setHotels(data)
      console.log('✅ 조회된 호텔 수:', data.length)
      console.log('📋 호텔 데이터:', data)
      
    } catch (err) {
      console.error('❌ 오류 발생:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => {
    setHotels([])
    setError(null)
    setTableExists(null)
  }

  const checkEnvironment = () => {
    console.log('🔧 환경변수 확인 중...')
    supabaseConnectionTest.checkEnvironmentVariables()
  }

  const checkTableStructure = async () => {
    console.log('🔍 테이블 구조 확인 중...')
    await supabaseConnectionTest.checkTableStructure()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Hotels 테이블 연결 테스트</h2>
      
             {/* 컨트롤 버튼들 */}
       <div className="flex gap-3 mb-6">
         <button
           onClick={testConnection}
           disabled={loading}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
         >
           {loading ? '테스트 중...' : '연결 테스트'}
         </button>
         <button
           onClick={checkEnvironment}
           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
         >
           환경변수 확인
         </button>
         <button
           onClick={checkTableStructure}
           className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
         >
           테이블 구조 확인
         </button>
         <button
           onClick={clearData}
           className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
         >
           데이터 초기화
         </button>
       </div>

      {/* 상태 표시 */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="font-medium">테이블 존재:</span>
          {tableExists === null && <span className="text-gray-500">확인 안됨</span>}
          {tableExists === true && <span className="text-green-600">✅ 존재</span>}
          {tableExists === false && <span className="text-red-600">❌ 존재하지 않음</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">로딩 상태:</span>
          {loading ? (
            <span className="text-blue-600">🔄 로딩 중...</span>
          ) : (
            <span className="text-green-600">✅ 완료</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-medium">호텔 수:</span>
          <span className="text-gray-700">{hotels.length}개</span>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">오류 발생:</p>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 호텔 데이터 표시 */}
      {hotels.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3">조회된 호텔 데이터:</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{hotel.property_name_kor}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {hotel.sabre_id}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      🇰🇷 {hotel.property_name_kor}
                    </p>
                    {hotel.property_name_en && (
                      <p className="text-sm text-gray-600">{hotel.property_name_en}</p>
                    )}
                    <p className="text-sm text-gray-700">📍 {hotel.location}</p>
                    {hotel.rating && (
                      <p className="text-sm text-gray-600">⭐ {hotel.rating}</p>
                    )}
                    {hotel.price && (
                      <p className="text-sm font-medium text-blue-600">{hotel.price}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    ID: {hotel.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사용법 안내 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">사용법:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>"연결 테스트" 버튼을 클릭하여 Supabase 연결을 확인합니다.</li>
          <li>테이블 존재 여부와 데이터 조회를 테스트합니다.</li>
          <li>콘솔에서 자세한 로그를 확인할 수 있습니다.</li>
          <li>오류가 발생하면 환경변수와 테이블 설정을 확인하세요.</li>
        </ol>
      </div>
    </div>
  )
}

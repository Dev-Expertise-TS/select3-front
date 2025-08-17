import { createClient } from '@/lib/supabase/server'

export default async function TestSelectHotelsPage() {
  const supabase = await createClient()
  
  // select_hotels 테이블에서 데이터 조회
  const { data: hotels, error } = await supabase
    .from('select_hotels')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ select_hotels 조회 실패:', error)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Select Hotels 테스트</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>오류 발생:</strong> {error.message}
        </div>
      </div>
    )
  }
  
  // 첫 번째 레코드가 있으면 컬럼 정보 추출
  const tableColumns = hotels && hotels.length > 0 ? Object.keys(hotels[0]) : []
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Select Hotels 테스트</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">연결 상태</h2>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Supabase 연결 성공! {hotels?.length || 0}개의 호텔 데이터를 가져왔습니다.
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">테이블 구조 정보</h2>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <strong>📋 select_hotels 테이블 컬럼 ({tableColumns.length}개):</strong>
        </div>
        
        {/* 컬럼 그룹별로 표시 */}
        <div className="space-y-6">
          {/* 기본 식별자 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🔑 기본 식별자</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => ['id', 'id_old', 'sort_id', 'sabre_id', 'paragon_id', 'brand_id'].includes(col)).map((column, index) => (
                <div key={index} className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-blue-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 호텔 기본 정보 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🏨 호텔 기본 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => ['slug', 'property_name_kor', 'property_name_eng'].includes(col)).map((column, index) => (
                <div key={index} className="bg-green-50 border border-green-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-green-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 위치 정보 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">📍 위치 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => col.includes('city') || col.includes('country') || col.includes('continent') || col.includes('address') || col.includes('destination') || col.includes('location')).map((column, index) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-purple-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 체인 정보 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🏢 체인 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => col.includes('chain')).map((column, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-orange-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 이미지 정보 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🖼️ 이미지 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => col.includes('image')).map((column, index) => (
                <div key={index} className="bg-pink-50 border border-pink-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-pink-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 혜택 정보 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">🎁 혜택 정보</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => col.includes('benefit')).map((column, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-yellow-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 기타 컬럼들 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">📝 기타 컬럼들</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {tableColumns.filter(col => 
                !['id', 'id_old', 'sort_id', 'sabre_id', 'paragon_id', 'brand_id', 'slug', 'property_name_kor', 'property_name_eng'].includes(col) &&
                !col.includes('city') && !col.includes('country') && !col.includes('continent') && !col.includes('address') && !col.includes('destination') && !col.includes('location') &&
                !col.includes('chain') && !col.includes('image') && !col.includes('benefit')
              ).map((column, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm">
                  <span className="font-mono text-gray-800">{column}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">호텔 목록</h2>
        {hotels && hotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotels.map((hotel) => (
              <div key={hotel.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{hotel.property_name_kor || hotel.sabre_id}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {hotel.sabre_id}
                    </span>
                  </div>
                  {hotel.property_name_kor && (
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      🇰🇷 {hotel.property_name_kor}
                    </p>
                  )}
                  {hotel.property_name_eng && (
                    <p className="text-sm text-gray-600">{hotel.property_name_eng}</p>
                  )}
                  {hotel.city && (
                    <p className="text-sm text-gray-700">📍 {hotel.city}</p>
                  )}
                  {hotel.property_address && (
                    <p className="text-sm text-gray-600">🏠 {hotel.property_address}</p>
                  )}
                  {hotel.chain && (
                    <p className="text-sm text-gray-600">🏢 {hotel.chain}</p>
                  )}
                  {hotel.benefit && (
                    <p className="text-sm text-gray-500 mt-2">🎁 {hotel.benefit}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            ⚠️ 호텔 데이터가 없습니다.
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">데이터 구조 (첫 번째 레코드)</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(hotels?.[0] || {}, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">타입 정의 업데이트 완료</h2>
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <p className="text-sm text-green-800 mb-2">
            ✅ <code>src/lib/supabase.ts</code>의 <code>select_hotels</code> 타입이 실제 테이블의 68개 컬럼으로 업데이트되었습니다!
          </p>
          <p className="text-sm text-green-700">
            이제 실제 데이터베이스와 완벽하게 일치하는 타입 안전성을 제공합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

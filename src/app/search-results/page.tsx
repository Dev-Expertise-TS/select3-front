"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CommonSearchBar } from "@/features/search/common-search-bar"
import { HotelCardGrid } from "@/components/shared/hotel-card-grid"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformSearchResultsToCardData } from '@/lib/hotel-utils'

const supabase = createClient()

// 검색 결과 조회 훅
function useSearchResults(query: string) {
  return useQuery({
    queryKey: ['search-results', query],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%,city_ko.ilike.%${query}%,city_en.ilike.%${query}%`)
        .limit(20)
      
      if (error) throw error
      if (!data) return []
      
      // 호텔 미디어 조회
      const sabreIds = data.map(hotel => hotel.sabre_id)
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('sabre_id, media_path, sort_order')
        .in('sabre_id', sabreIds)
        .order('sort_order', { ascending: true })
      
      // 데이터 변환
      return transformSearchResultsToCardData(data, mediaData || [])
    },
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ""
  const checkInParam = searchParams.get('checkIn') || ""
  const checkOutParam = searchParams.get('checkOut') || ""
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [searchDates, setSearchDates] = useState(() => {
    // URL 파라미터가 있으면 사용, 없으면 기본값 (2주 뒤와 2주 뒤 + 1일)
    if (checkInParam && checkOutParam) {
      return {
        checkIn: checkInParam,
        checkOut: checkOutParam
      }
    }
    
    const today = new Date()
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
    twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
    
    return {
      checkIn: twoWeeksLater.toISOString().split('T')[0],
      checkOut: twoWeeksLaterPlusOne.toISOString().split('T')[0]
    }
  })
  
  const { data: searchResults, isLoading, error } = useSearchResults(searchQuery)

  const handleSearch = (newQuery: string, dates?: { checkIn: string; checkOut: string }) => {
    setSearchQuery(newQuery)
    if (dates) {
      setSearchDates(dates)
    }
    
    // URL 업데이트 (새로고침 시에도 검색어와 날짜 유지)
    const url = new URL(window.location.href)
    url.searchParams.set('q', newQuery)
    if (dates?.checkIn) url.searchParams.set('checkIn', dates.checkIn)
    if (dates?.checkOut) url.searchParams.set('checkOut', dates.checkOut)
    window.history.pushState({}, '', url.toString())
  }

  const handleDatesChange = (dates: { checkIn: string; checkOut: string }) => {
    setSearchDates(dates)
  }

  // URL 파라미터 변경 시 검색어와 날짜 동기화
  useEffect(() => {
    setSearchQuery(query)
    
    // URL 파라미터가 있으면 사용, 없으면 기본값 (오늘과 2주 뒤)
    if (checkInParam && checkOutParam) {
      setSearchDates({
        checkIn: checkInParam,
        checkOut: checkOutParam
      })
    } else {
      const today = new Date()
      const twoWeeksLater = new Date(today)
      twoWeeksLater.setDate(today.getDate() + 14)
      
      setSearchDates({
        checkIn: today.toISOString().split('T')[0],
        checkOut: twoWeeksLater.toISOString().split('T')[0]
      })
    }
  }, [query, checkInParam, checkOutParam])

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 검색 영역 */}
        <section className="bg-gray-50 py-8">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="bg-white rounded-lg shadow-sm">
              <CommonSearchBar 
                variant="landing" 
                onSearch={handleSearch}
                onDatesChange={handleDatesChange}
                initialQuery={searchQuery}
                checkIn={searchDates.checkIn}
                checkOut={searchDates.checkOut}
              />
            </div>
          </div>
        </section>

        {/* 검색 결과 */}
        <section className="py-8">
          <div className="container mx-auto max-w-[1440px] px-4">
            {searchQuery.trim() ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    "{searchQuery}" 검색 결과
                  </h1>
                  <p className="text-gray-600">
                    {isLoading ? "검색 중..." : 
                     searchResults && searchResults.length > 0 
                       ? `${searchResults.length}개의 호텔을 찾았습니다.`
                       : "검색 결과가 없습니다."}
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">검색 중...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="text-red-600 text-lg mb-2">검색 중 오류가 발생했습니다.</div>
                    <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <HotelCardGrid
                    hotels={searchResults}
                    variant="default"
                    columns={4}
                    gap="lg"
                    showBenefits={true}
                    showRating={false}
                    showPrice={false}
                    showBadge={false}
                    showPromotionBadge={false}
                    emptyMessage={`"${searchQuery}"에 대한 검색 결과가 없습니다.`}
                  />
                ) : searchQuery.trim() && (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      "{searchQuery}"에 대한 검색 결과가 없습니다.
                    </h3>
                    <p className="text-gray-600 mb-6">
                      다른 키워드로 검색해보시거나, 더 일반적인 검색어를 사용해보세요.
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>• 호텔명을 정확히 입력했는지 확인해주세요</p>
                      <p>• 도시명으로 검색해보세요</p>
                      <p>• 영어명으로도 검색해보세요</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  검색어를 입력해주세요
                </h3>
                <p className="text-gray-600">
                  호텔명, 도시명, 또는 지역명으로 검색할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  )
}

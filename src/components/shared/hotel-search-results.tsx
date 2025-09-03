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
import { HotelAdBanner } from './hotel-ad-banner'

const supabase = createClient()

// 검색 결과 조회 훅
function useSearchResults(query: string, tick: number) {
  return useQuery({
    queryKey: ['search-results', query, tick],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%,city_ko.ilike.%${query}%,city_en.ilike.%${query}%`)
      
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

// 모든 호텔 조회 훅 (검색어 없이)
function useAllHotels() {
  return useQuery({
    queryKey: ['all-hotels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug')
        .order('sabre_id', { ascending: true })
      
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
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 배너용 호텔 데이터 조회 훅 (랜덤하게 하나 선택)
function useBannerHotel() {
  return useQuery({
    queryKey: ['banner-hotel'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug')
        .not('benefit', 'is', null) // 혜택이 있는 호텔만
        .limit(50) // 성능을 위해 50개만 가져와서 랜덤 선택
      
      if (error) throw error
      if (!data || data.length === 0) return null
      
      // 랜덤하게 하나 선택
      const randomHotel = data[Math.floor(Math.random() * data.length)]
      
      // 해당 호텔의 미디어 데이터 가져오기
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('sabre_id, media_path, sort_order')
        .eq('sabre_id', randomHotel.sabre_id)
        .order('sort_order', { ascending: true })
        .limit(1)
      
      return {
        ...randomHotel,
        media_path: mediaData?.[0]?.media_path
      }
    },
    staleTime: 10 * 60 * 1000, // 10분 (배너는 더 오래 캐시)
  })
}

interface HotelSearchResultsProps {
  title?: string
  subtitle?: string
  showAllHotels?: boolean
}

export function HotelSearchResults({ 
  title = "호텔 & 리조트 검색", 
  subtitle = "전 세계 프리미엄 호텔과 리조트를 찾아보세요",
  showAllHotels = false 
}: HotelSearchResultsProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ""
  const checkInParam = searchParams.get('checkIn') || ""
  const checkOutParam = searchParams.get('checkOut') || ""
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [refreshTick, setRefreshTick] = useState(0)
  const [displayCount, setDisplayCount] = useState(12) // 초기 표시 개수
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
  
  const { data: searchResults, isLoading: isSearchLoading, error: searchError } = useSearchResults(searchQuery, refreshTick)
  const { data: allHotels, isLoading: isAllHotelsLoading, error: allHotelsError } = useAllHotels()
  const { data: bannerHotel, isLoading: isBannerLoading } = useBannerHotel()

  const handleSearch = (newQuery: string, dates?: { checkIn: string; checkOut: string }) => {
    setSearchQuery(newQuery)
    setDisplayCount(12) // 검색 시 표시 개수 초기화
    if (dates) {
      setSearchDates(dates)
    }
    // 클릭할 때마다 강제 리프레시 트리거
    setRefreshTick((v) => v + 1)
    
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

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12) // 12개씩 추가 로딩
  }

  // URL 파라미터 변경 시 검색어와 날짜 동기화
  useEffect(() => {
    setSearchQuery(query)
    setDisplayCount(12) // URL 파라미터 변경 시 표시 개수 초기화
    
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

  // 표시할 데이터 결정
  const allData = searchQuery.trim() ? searchResults : (showAllHotels ? allHotels : [])
  const displayData = allData?.slice(0, displayCount) || []
  const hasMoreData = allData && allData.length > displayCount
  const isLoading = searchQuery.trim() ? isSearchLoading : (showAllHotels ? isAllHotelsLoading : false)
  const error = searchQuery.trim() ? searchError : (showAllHotels ? allHotelsError : null)

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 호텔 광고 배너 */}
        {bannerHotel && !isBannerLoading && (
          <section className="py-8">
            <div className="container mx-auto max-w-[1440px] px-4">
              <HotelAdBanner 
                hotel={bannerHotel}
                copywriter={searchQuery.trim() ? "특별한 혜택과 함께하는 프리미엄 호텔 경험을 만나보세요" : "전 세계 프리미엄 호텔과 리조트의 특별한 경험을 만나보세요"}
              />
            </div>
          </section>
        )}
        
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
                     allData && allData.length > 0 
                       ? `${allData.length}개의 호텔을 찾았습니다.`
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
                ) : displayData && displayData.length > 0 ? (
                  <>
                    <HotelCardGrid
                      hotels={displayData}
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
                    {hasMoreData && (
                      <div className="text-center mt-12">
                        <button
                          onClick={handleLoadMore}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                          호텔 더보기
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          {allData?.length}개 중 {displayData.length}개 호텔
                        </p>
                      </div>
                    )}
                  </>
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
            ) : showAllHotels ? (
              <>
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {title}
                  </h1>
                  <p className="text-gray-600">
                    {subtitle}
                  </p>
                </div>
                
                {isLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">호텔 목록을 불러오는 중...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="text-red-600 text-lg mb-2">호텔 목록을 불러오는 중 오류가 발생했습니다.</div>
                    <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
                  </div>
                ) : displayData && displayData.length > 0 ? (
                  <>
                    <HotelCardGrid
                      hotels={displayData}
                      variant="default"
                      columns={4}
                      gap="lg"
                      showBenefits={true}
                      showRating={false}
                      showPrice={false}
                      showBadge={false}
                      showPromotionBadge={false}
                      emptyMessage="호텔 목록이 없습니다."
                    />
                    {hasMoreData && (
                      <div className="text-center mt-12">
                        <button
                          onClick={handleLoadMore}
                          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                        >
                          호텔 더보기
                          <svg
                            className="w-4 h-4 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                          {allData?.length}개 중 {displayData.length}개 호텔
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">🏨</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      호텔 목록이 없습니다.
                    </h3>
                    <p className="text-gray-600">
                      현재 등록된 호텔이 없습니다.
                    </p>
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

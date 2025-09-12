"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CommonSearchBar } from "@/features/search/common-search-bar"
import { HotelCardGrid } from "@/components/shared/hotel-card-grid"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformSearchResultsToCardData } from '@/lib/hotel-utils'
import { HotelAdBanner } from './hotel-ad-banner'
import { HotelFilter } from './hotel-filter'

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

// 배너용 호텔 데이터 조회 훅 (select_feature_slots 기반)
function useBannerHotel() {
  return useQuery({
    queryKey: ['banner-hotel'],
    queryFn: async () => {
      try {
        // 1. select_feature_slots에서 surface가 "상단베너"인 sabre_id 조회
        const { data: featureSlots, error: featureError } = await supabase
          .from('select_feature_slots')
          .select('sabre_id')
          .eq('surface', '상단베너')
        
        if (featureError) throw featureError
        if (!featureSlots || featureSlots.length === 0) return null
        
        const sabreIds = featureSlots.map(slot => slot.sabre_id)
        
        // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1, brand_id')
          .in('sabre_id', sabreIds)
          .not('image_1', 'is', null) // image_1이 있는 호텔만
        
        if (hotelsError) throw hotelsError
        if (!hotels || hotels.length === 0) return null
        
        // 3. hotel_brands에서 brand_id로 브랜드 정보 조회 (null이 아닌 것만)
        const brandIds = hotels.map(hotel => hotel.brand_id).filter(id => id !== null && id !== undefined)
        let brandsData: Array<{brand_id: string, brand_name_en: string, chain_id: string}> = []
        if (brandIds.length > 0) {
          const { data, error: brandsError } = await supabase
            .from('hotel_brands')
            .select('brand_id, brand_name_en, chain_id')
            .in('brand_id', brandIds)
          
          if (brandsError) throw brandsError
          brandsData = data || []
        }
        
        // 4. hotel_chains에서 chain_id로 체인 정보 조회
        const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
        const { data: chainsData, error: chainsError } = await supabase
          .from('hotel_chains')
          .select('chain_id, chain_name_en')
          .in('chain_id', chainIds)
        
        if (chainsError) throw chainsError
        
        // 5. 랜덤하게 하나 선택하고 브랜드 정보 매핑
        const randomHotel = hotels[Math.floor(Math.random() * hotels.length)]
        const hotelBrand = brandsData?.find(brand => brand.brand_id === randomHotel.brand_id)
        const hotelChain = chainsData?.find(chain => chain.chain_id === hotelBrand?.chain_id)
        
        return {
          ...randomHotel,
          media_path: randomHotel.image_1, // image_1을 media_path로 사용
          brand_name_en: hotelBrand?.brand_name_en || null,
          chain_name_en: hotelChain?.chain_name_en || null
        }
      } catch (error) {
        console.error('베너 호텔 조회 오류:', error)
        return null
      }
    },
    staleTime: 10 * 60 * 1000, // 10분 (배너는 더 오래 캐시)
  })
}

// 필터 옵션 조회 훅
function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      // 국가 데이터 조회
      const { data: countriesData } = await supabase
        .from('select_hotels')
        .select('country, country_ko')
        .not('country', 'is', null)
        .not('country_ko', 'is', null)

      // 도시 데이터 조회
      const { data: citiesData } = await supabase
        .from('select_hotels')
        .select('city, city_ko')
        .not('city', 'is', null)
        .not('city_ko', 'is', null)

      // 브랜드 데이터 조회 (임시로 하드코딩된 브랜드 목록)
      const brands = [
        { id: 'marriott', label: 'Marriott', count: 0 },
        { id: 'hilton', label: 'Hilton', count: 0 },
        { id: 'hyatt', label: 'Hyatt', count: 0 },
        { id: 'ihg', label: 'IHG', count: 0 },
        { id: 'accor', label: 'Accor', count: 0 },
        { id: 'shangri-la', label: 'Shangri-La', count: 0 },
        { id: 'mandarin', label: 'Mandarin Oriental', count: 0 },
        { id: 'aman', label: 'Aman', count: 0 },
        { id: 'capella', label: 'Capella', count: 0 },
        { id: 'pan-pacific', label: 'Pan Pacific', count: 0 },
        { id: 'virtuoso', label: 'Virtuoso', count: 0 },
        { id: 'platinum', label: 'Platinum', count: 0 },
        { id: 'heavens-portfolio', label: "Heaven's Portfolio", count: 0 },
        { id: 'bravos', label: 'Bravos', count: 0 },
        { id: 'lw', label: 'LW', count: 0 }
      ]

      // 국가 중복 제거 및 카운트 계산
      const countryMap = new Map()
      countriesData?.forEach(item => {
        const key = item.country
        if (!countryMap.has(key)) {
          countryMap.set(key, {
            id: key,
            label: item.country_ko || item.country,
            count: 0
          })
        }
        countryMap.get(key).count++
      })

      // 도시 중복 제거 및 카운트 계산
      const cityMap = new Map()
      citiesData?.forEach(item => {
        const key = item.city
        if (!cityMap.has(key)) {
          cityMap.set(key, {
            id: key,
            label: item.city_ko || item.city,
            count: 0
          })
        }
        cityMap.get(key).count++
      })

      // 체인 데이터 조회 (임시로 하드코딩된 체인 목록)
      const chains = [
        { id: 'marriott', label: 'Marriott International', count: 0 },
        { id: 'hilton', label: 'Hilton Worldwide', count: 0 },
        { id: 'hyatt', label: 'Hyatt Hotels', count: 0 },
        { id: 'ihg', label: 'InterContinental Hotels Group', count: 0 },
        { id: 'accor', label: 'Accor', count: 0 },
        { id: 'shangri-la', label: 'Shangri-La Hotels', count: 0 },
        { id: 'mandarin', label: 'Mandarin Oriental Hotel Group', count: 0 },
        { id: 'four-seasons', label: 'Four Seasons Hotels', count: 0 },
        { id: 'aman', label: 'Aman Resorts', count: 0 }
      ]

      return {
        countries: Array.from(countryMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
        cities: Array.from(cityMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
        brands: brands.sort((a, b) => a.label.localeCompare(b.label)),
        chains: chains.sort((a, b) => a.label.localeCompare(b.label))
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
  })
}

interface HotelSearchResultsProps {
  title?: string
  subtitle?: string
  showAllHotels?: boolean
  hideSearchBar?: boolean
  showFilters?: boolean
  // 체인 페이지용 props
  initialHotels?: any[]
  allChains?: Array<{ chain_id: number; chain_name_en: string; chain_name_kr?: string; slug: string }>
  selectedChainBrands?: Array<{ brand_id: number; brand_name_en: string; brand_name_kr?: string }>
  currentChainName?: string
  onChainChange?: (chainSlug: string) => void
  serverFilterOptions?: {
    countries: Array<{ id: string; label: string; count: number }>
    cities: Array<{ id: string; label: string; count: number }>
    brands: Array<{ id: string; label: string; count: number }>
    chains: Array<{ id: string; label: string; count: number }>
  }
}

export function HotelSearchResults({ 
  title = "호텔 & 리조트 검색", 
  subtitle = "전 세계 프리미엄 호텔과 리조트를 찾아보세요",
  showAllHotels = false,
  hideSearchBar = false,
  showFilters = false,
  // 체인 페이지용 props
  initialHotels = [],
  allChains = [],
  selectedChainBrands = [],
  currentChainName = "",
  onChainChange,
  serverFilterOptions
}: HotelSearchResultsProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ""
  const checkInParam = searchParams.get('checkIn') || ""
  const checkOutParam = searchParams.get('checkOut') || ""
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [refreshTick, setRefreshTick] = useState(0)
  const [displayCount, setDisplayCount] = useState(12) // 초기 표시 개수
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedChains, setSelectedChains] = useState<string[]>([])
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
  const { data: filterOptions, isLoading: isFilterLoading } = useFilterOptions()

  // 체인 페이지용 필터 옵션 (서버에서 계산된 것을 사용)
  const chainFilterOptions = serverFilterOptions || { countries: [], cities: [], brands: [], chains: [] }

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

  const handleClearAllFilters = () => {
    setSelectedCountries([])
    setSelectedCities([])
    setSelectedBrands([])
    setSelectedChains([])
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

  // 체인 페이지용 필터링된 데이터 (useMemo로 계산)
  const filteredChainHotels = useMemo(() => {
    if (initialHotels.length === 0) {
      return []
    }
    
    let filtered = initialHotels

    // 국가 필터 적용
    if (selectedCountries.length > 0) {
      filtered = filtered.filter(hotel => 
        selectedCountries.includes(hotel.country || 'Unknown')
      )
    }

    // 도시 필터 적용
    if (selectedCities.length > 0) {
      filtered = filtered.filter(hotel => 
        selectedCities.includes(hotel.location || hotel.city || 'Unknown')
      )
    }

    // 브랜드 필터 적용
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(hotel => 
        selectedBrands.some(brandId => {
          const brand = selectedChainBrands.find(b => String(b.brand_id) === brandId)
          return brand && (hotel.brand === brand.brand_name_en || hotel.brand === brand.brand_name_kr)
        })
      )
    }

    return filtered
  }, [initialHotels, selectedCountries, selectedCities, selectedBrands, selectedChainBrands])

  // 표시할 데이터 결정
  const allData = searchQuery.trim() ? searchResults : (showAllHotels ? allHotels : (initialHotels.length > 0 ? filteredChainHotels : []))
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
        
        {/* 검색 영역 - showAllHotels가 false일 때만 표시 */}
        {!showAllHotels && (
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
        )}


        {/* 검색 결과 */}
        <section className="py-8">
          <div className="container mx-auto max-w-[1440px] px-4">
            {showAllHotels ? (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* 필터 사이드바 */}
                <div className="lg:col-span-1">
                  {/* 체인 페이지용 체인 선택 필터 */}
                  {allChains.length > 0 && onChainChange && (
                    <div className="mb-6">
                      <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          체인 선택
                        </h3>
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600 mb-2">
                            현재: <span className="font-medium text-blue-600">{currentChainName}</span>
                          </div>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                onChainChange(e.target.value)
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                          >
                            <option value="">브랜드 선택</option>
                            {allChains
                              .filter(chain => chain.slug !== '')
                              .sort((a, b) => (a.chain_name_kr || a.chain_name_en).localeCompare(b.chain_name_kr || b.chain_name_en))
                              .map((chain) => (
                                <option key={chain.chain_id} value={chain.slug}>
                                  {chain.chain_name_kr || chain.chain_name_en}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 일반 필터 */}
                  {(filterOptions || chainFilterOptions.countries.length > 0) && (
                    <HotelFilter
                      countries={initialHotels.length > 0 ? chainFilterOptions.countries : (filterOptions?.countries || [])}
                      cities={initialHotels.length > 0 ? chainFilterOptions.cities : (filterOptions?.cities || [])}
                      brands={initialHotels.length > 0 ? chainFilterOptions.brands : (filterOptions?.brands || [])}
                      chains={initialHotels.length > 0 ? chainFilterOptions.chains : (filterOptions?.chains || [])}
                      selectedCountries={selectedCountries}
                      selectedCities={selectedCities}
                      selectedBrands={selectedBrands}
                      selectedChains={selectedChains}
                      onCountryChange={setSelectedCountries}
                      onCityChange={setSelectedCities}
                      onBrandChange={setSelectedBrands}
                      onChainChange={setSelectedChains}
                      onClearAll={handleClearAllFilters}
                    />
                  )}
                </div>
                
                {/* 호텔 목록 영역 */}
                <div className="lg:col-span-4">
                  <div className="mb-6">
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
                        columns={3}
                        gap="sm"
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
                </div>
              </div>
            ) : searchQuery.trim() ? (
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

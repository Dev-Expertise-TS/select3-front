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
import { HotelBannerSection } from './hotel-banner-section'
import { HotelFilterSection } from './hotel-filter-section'
import { HotelListSection } from './hotel-list-section'

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


// 선택된 체인의 브랜드 호텔 조회 훅
function useChainBrandHotels(selectedChainId: string | null) {
  return useQuery({
    queryKey: ['chain-brand-hotels', selectedChainId],
    queryFn: async () => {
      if (!selectedChainId) return []
      
      try {
        // 1. hotel_brands에서 해당 chain_id를 가진 브랜드들 조회
        const { data: brands, error: brandsError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en, brand_name_kr')
          .eq('chain_id', parseInt(selectedChainId))
        
        if (brandsError) throw brandsError
        if (!brands || brands.length === 0) return []
        
        const brandIds = brands.map(b => b.brand_id)
        
        // 2. select_hotels에서 해당 brand_id를 가진 호텔들 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1, brand_id')
          .in('brand_id', brandIds)
          .not('image_1', 'is', null) // 이미지가 있는 호텔만
        
        if (hotelsError) throw hotelsError
        
        // 데이터 변환
        return transformSearchResultsToCardData(hotels || [], undefined)
      } catch (error) {
        console.error('체인 브랜드 호텔 조회 오류:', error)
        return []
      }
    },
    enabled: !!selectedChainId,
    staleTime: 5 * 60 * 1000, // 5분
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


      return {
        countries: Array.from(countryMap.values()).sort((a, b) => a.label.localeCompare(b.label)),
        cities: Array.from(cityMap.values()).sort((a, b) => a.label.localeCompare(b.label))
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
  })
}

// 브랜드별 호텔 조회 훅
function useBrandHotels(brandId: string | null) {
  return useQuery({
    queryKey: ['brand-hotels', brandId],
    queryFn: async () => {
      if (!brandId) return []
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*, image_1, image_2, image_3, image_4, image_5')
        .eq('brand_id', parseInt(brandId))
        .order('property_name_ko')
      
      if (error) throw error
      return data || []
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 체인별 브랜드 조회 훅
function useChainBrands(chainId: string | null) {
  return useQuery({
    queryKey: ['chain-brands', chainId],
    queryFn: async () => {
      if (!chainId) return []
      
      try {
        // hotel_brands에서 해당 chain_id를 가진 브랜드들 조회
        const { data: brands, error: brandsError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en, brand_name_kr')
          .eq('chain_id', parseInt(chainId))
        
        if (brandsError) throw brandsError
        return brands || []
      } catch (error) {
        console.error('체인 브랜드 조회 오류:', error)
        return []
      }
    },
    enabled: !!chainId,
    staleTime: 5 * 60 * 1000, // 5분
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
  currentChainId?: string
  onChainChange?: (chainId: string) => void
  initialBrandId?: string | null
  onBrandChange?: (brandId: string) => void
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
  currentChainId,
  onChainChange,
  initialBrandId,
  onBrandChange,
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
  const [selectedChainId, setSelectedChainId] = useState<string | null>(currentChainId || null)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId || null)
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
  const { data: chainBrandHotels, isLoading: isChainBrandLoading, error: chainBrandError } = useChainBrandHotels(selectedChainId)
  const { data: brandHotels, isLoading: isBrandLoading, error: brandError } = useBrandHotels(selectedBrandId)
  const { data: chainBrands } = useChainBrands(selectedChainId)

  // 체인 페이지용 필터 옵션 (서버에서 계산된 것을 사용)
  const chainFilterOptions = serverFilterOptions || { countries: [], cities: [] }

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
    setSelectedChainId(null)
    setSelectedBrandId(null)
  }

  const handleChainSelect = (chainId: string) => {
    setSelectedChainId(chainId)
    // 체인 선택 시 국가/도시 필터만 초기화 (브랜드 선택은 유지)
    setSelectedCountries([])
    setSelectedCities([])
    
    // 외부 핸들러가 있으면 호출
    if (onChainChange) {
      onChainChange(chainId)
    }
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrandId(brandId)
    // 브랜드 선택 시 체인 선택과 다른 필터들 초기화
    setSelectedCountries([])
    setSelectedCities([])
    setSelectedChainId(null)
    
    // 외부 핸들러가 있으면 호출
    if (onBrandChange) {
      onBrandChange(brandId)
    }
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


    return filtered
  }, [initialHotels, selectedCountries, selectedCities, selectedChainBrands])

  // 표시할 데이터 결정 (우선순위: 검색 > 체인 선택 > 브랜드 선택 > 전체 호텔)
  const allData = searchQuery.trim() 
    ? searchResults 
    : selectedChainId 
      ? chainBrandHotels 
      : selectedBrandId 
        ? brandHotels 
        : (showAllHotels ? allHotels : (initialHotels.length > 0 ? filteredChainHotels : []))
  
  const displayData = allData?.slice(0, displayCount) || []
  const hasMoreData = allData && allData.length > displayCount
  const isLoading = searchQuery.trim() 
    ? isSearchLoading 
    : selectedChainId 
      ? isChainBrandLoading 
      : selectedBrandId 
        ? isBrandLoading 
        : (showAllHotels ? isAllHotelsLoading : false)
  const error = searchQuery.trim() 
    ? searchError 
    : selectedChainId 
      ? chainBrandError 
      : selectedBrandId 
        ? brandError 
        : (showAllHotels ? allHotelsError : null)

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 호텔 광고 배너 */}
        <HotelBannerSection
          bannerHotel={bannerHotel || null}
          isBannerLoading={isBannerLoading}
          copywriter={searchQuery.trim() ? "특별한 혜택과 함께하는 프리미엄 호텔 경험을 만나보세요" : "전 세계 프리미엄 호텔과 리조트의 특별한 경험을 만나보세요"}
        />
        
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
                <HotelFilterSection
                  allChains={allChains}
                  currentChainName={currentChainName}
                  onChainChange={onChainChange || handleChainSelect}
                  selectedChainBrands={chainBrands || selectedChainBrands}
                  selectedBrandId={selectedBrandId}
                  selectedChainId={selectedChainId}
                  onBrandChange={handleBrandSelect}
                  filterOptions={filterOptions}
                  chainFilterOptions={chainFilterOptions}
                  initialHotels={initialHotels}
                  selectedCountries={selectedCountries}
                  selectedCities={selectedCities}
                  onCountryChange={setSelectedCountries}
                  onCityChange={setSelectedCities}
                  onClearAllFilters={handleClearAllFilters}
                />
                
                {/* 호텔 목록 영역 */}
                <HotelListSection
                  title={selectedChainId ? 
                    (allChains.find(chain => chain.chain_id === parseInt(selectedChainId))?.chain_name_kr || 
                     allChains.find(chain => chain.chain_id === parseInt(selectedChainId))?.chain_name_en || 
                     "선택된 체인") : title}
                  subtitle={selectedChainId ? 
                    `${allData?.length || 0}개의 호텔을 찾았습니다.` : subtitle}
                  hotels={displayData}
                  isLoading={isLoading}
                  error={error}
                  hasMoreData={hasMoreData}
                  onLoadMore={handleLoadMore}
                  totalCount={allData?.length}
                  displayCount={displayData.length}
                  columns={3}
                  variant="default"
                  gap="sm"
                  showBenefits={true}
                  showRating={false}
                  showPrice={false}
                  showBadge={false}
                  showPromotionBadge={false}
                />
              </div>
            ) : searchQuery.trim() ? (
              <HotelListSection
                title={`"${searchQuery}" 검색 결과`}
                subtitle={isLoading ? "검색 중..." : 
                         allData && allData.length > 0 
                           ? `${allData.length}개의 호텔을 찾았습니다.`
                           : "검색 결과가 없습니다."}
                hotels={displayData}
                isLoading={isLoading}
                error={error}
                hasMoreData={hasMoreData}
                onLoadMore={handleLoadMore}
                totalCount={allData?.length}
                displayCount={displayData.length}
                columns={4}
                variant="default"
                gap="lg"
                showBenefits={true}
                showRating={false}
                showPrice={false}
                showBadge={false}
                showPromotionBadge={false}
                searchQuery={searchQuery}
              />
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

"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { SimpleHotelSearch } from "./simple-hotel-search"
import { HotelCardGrid } from "@/components/shared/hotel-card-grid"
import { BrandArticlesSection } from "@/features/brands/brand-articles-section"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformSearchResultsToCardData, transformHotelsToAllViewCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { HotelBannerSection } from './hotel-banner-section'
import { HotelListSection } from './hotel-list-section'
import { HotelListSectionAllView } from './hotel-list-section-all-view'
import { HotelFilterAllView } from './hotel-filter-all-view'

const supabase = createClient()

// 검색 결과 조회 훅
function useSearchResults(query: string, tick: number) {
  return useQuery({
    queryKey: ['search-results', query, tick],
    queryFn: async () => {
      if (!query.trim()) return []
      
      // 호텔 검색 (publish 컬럼 포함)
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, country_ko, country_en, property_address, slug, image_1, image_2, image_3, image_4, image_5, publish')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%,city_ko.ilike.%${query}%,city_en.ilike.%${query}%,country_ko.ilike.%${query}%,country_en.ilike.%${query}%`)
      
      if (error) throw error
      if (!data) return []
      
      // 클라이언트에서 publish 필터링 (false 제외)
      const filteredData = data.filter((hotel: any) => hotel.publish !== false)
      
      // 호텔 미디어 조회 (select_hotel_media 테이블, 각 호텔의 첫 번째 이미지)
      const sabreIds = filteredData.map((hotel: any) => String(hotel.sabre_id))
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', sabreIds)
        .order('image_seq', { ascending: true })
      
      // 각 호텔별로 첫 번째 이미지만 선택 (image_seq가 가장 작은 것)
      const firstImages = getFirstImagePerHotel(mediaData || [])
      
      // 데이터 변환
      return transformSearchResultsToCardData(filteredData, firstImages)
    },
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 필터 옵션 조회 훅 (서버 API 사용)
function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options', 'v5'], // 체인 필터 제거, 브랜드 표시 형식 변경 (브랜드영문명 (체인영문명))
    queryFn: async () => {
      const response = await fetch('/api/filter-options')
      
      if (!response.ok) {
        throw new Error(`필터 옵션 조회 실패: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '필터 옵션 조회 실패')
      }
      
      return result.data
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1,
    retryDelay: 500,
  })
}

// 기존 로직은 API 라우트로 이동됨 (src/app/api/filter-options/route.ts)

// 모든 호텔 조회 훅 (검색어 없이)
function useAllHotels() {
  return useQuery({
    queryKey: ['all-hotels'],
    queryFn: async () => {
      try {
        console.log('🏨 useAllHotels: 전체 호텔 조회 시작')
        
        const { data, error } = await supabase
          .from('select_hotels')
          .select('*')
          .order('sabre_id')
        
        console.log('🏨 useAllHotels: 호텔 데이터 조회 결과:', {
          총개수: data?.length || 0,
          에러: error?.message || 'none'
        })
        
        if (error) {
          console.error('❌ 호텔 목록 조회 오류:', error, JSON.stringify(error))
          throw error
        }
        if (!data) {
          console.warn('⚠️ 호텔 데이터가 null입니다')
          return []
        }
        
        // 클라이언트 측에서 publish 필터링 (publish가 false인 것 제외)
        const filteredData = data.filter((hotel: any) => hotel.publish !== false)
        console.log('🏨 useAllHotels: publish 필터링 후:', filteredData.length)
      
      // 호텔 미디어 조회 (select_hotel_media 테이블, 각 호텔의 첫 번째 이미지)
      const sabreIds = filteredData.map((hotel: any) => String(hotel.sabre_id))
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', sabreIds)
        .order('image_seq', { ascending: true })
      
      // 각 호텔별로 첫 번째 이미지만 선택 (image_seq가 가장 작은 것)
      const firstImages = getFirstImagePerHotel(mediaData || [])
      
      // 브랜드 정보 조회
      const brandIds = filteredData.filter((hotel: any) => hotel.brand_id).map((hotel: any) => hotel.brand_id)
      let brandData = []
      if (brandIds.length > 0) {
        const { data: brandResult, error: brandError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .in('brand_id', brandIds)
        
        if (brandError) {
          console.error('❌ 브랜드 정보 조회 오류:', brandError)
        } else {
          brandData = brandResult || []
          console.log('🏷️ 브랜드 정보 조회:', brandData.length)
        }
      }
      
        // 데이터 변환 (전체보기용) - 브랜드 정보 포함
        const result = transformHotelsToAllViewCardData(filteredData, firstImages, brandData)
        console.log('✅ useAllHotels: 최종 반환 데이터:', result?.length || 0)
        return result
      } catch (error) {
        console.error('전체 호텔 조회 중 오류 발생:', error)
        throw error
      }
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
        // 한국 시간(KST)의 오늘 날짜 (YYYY-MM-DD)
        const now = new Date()
        const kstMs = now.getTime() + 9 * 60 * 60 * 1000
        const todayKst = new Date(kstMs).toISOString().slice(0, 10)

        // 1) select_feature_slots에서 surface가 "상단베너"이고 start_date/end_date 범위에 포함되는 항목 조회
        const { data: featureSlots, error: featureError } = await supabase
          .from('select_feature_slots')
          .select('sabre_id, start_date, end_date')
          .eq('surface', '상단베너')

        if (featureError) throw featureError
        if (!featureSlots || featureSlots.length === 0) return null

        // 2) KST 오늘 날짜 기준으로 필터링 (start_date/end_date 모두 YYYY-MM-DD 가정)
        const activeSlots = featureSlots.filter((slot: any) => {
          const start = (slot.start_date ?? '').toString().slice(0, 10)
          const end = (slot.end_date ?? '').toString().slice(0, 10)
          if (!start && !end) return true
          if (start && todayKst < start) return false
          if (end && todayKst > end) return false
          return true
        })

        if (activeSlots.length === 0) return null

        const sabreIds = activeSlots.map((slot: any) => slot.sabre_id)
        
        // 3) select_hotels에서 해당 sabre_id의 호텔 정보 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('*')
          .in('sabre_id', sabreIds)
          .not('image_1', 'is', null) // image_1이 있는 호텔만
        
        if (hotelsError) throw hotelsError
        if (!hotels || hotels.length === 0) return null
        
        // 클라이언트에서 publish 필터링 (false 제외)
        const filteredHotels = hotels.filter((h: any) => h.publish !== false)
        if (filteredHotels.length === 0) return null
        
        // 4) hotel_brands에서 brand_id로 브랜드 정보 조회 (null이 아닌 것만)
        const brandIds = filteredHotels.map((hotel: any) => hotel.brand_id).filter((id: any) => id !== null && id !== undefined)
        let brandsData: Array<{brand_id: string, brand_name_en: string, chain_id: string}> = []
        if (brandIds.length > 0) {
          const { data, error: brandsError } = await supabase
            .from('hotel_brands')
            .select('brand_id, brand_name_en, chain_id')
            .in('brand_id', brandIds)
          
          if (brandsError) throw brandsError
          brandsData = data || []
        }
        
        // 5) hotel_chains에서 chain_id로 체인 정보 조회
        const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
        const { data: chainsData, error: chainsError } = await supabase
          .from('hotel_chains')
          .select('chain_id, chain_name_en')
          .in('chain_id', chainIds)
        
        if (chainsError) throw chainsError
        
        // 6) 활성 슬롯 안에서 랜덤하게 하나 선택하고 브랜드 정보 매핑
        const randomHotel = filteredHotels[Math.floor(Math.random() * filteredHotels.length)]
        const hotelBrand = brandsData?.find((brand: any) => brand.brand_id === randomHotel.brand_id)
        const hotelChain = chainsData?.find((chain: any) => chain.chain_id === hotelBrand?.chain_id)
        
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
          .select('brand_id, brand_name_en, brand_name_ko')
          .eq('chain_id', parseInt(selectedChainId))
        
        if (brandsError) throw brandsError
        if (!brands || brands.length === 0) return []
        
        const brandIds = brands.map((b: any) => b.brand_id)
        
        // 2. select_hotels에서 해당 brand_id를 가진 호텔들 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('*')
          .in('brand_id', brandIds)
          .not('image_1', 'is', null) // 이미지가 있는 호텔만
        
        if (hotelsError) throw hotelsError
        
        // 클라이언트에서 publish 필터링 (false 제외)
        const filteredHotels = (hotels || []).filter((h: any) => h.publish !== false)
        
        // 데이터 변환
        return transformSearchResultsToCardData(filteredHotels, undefined)
      } catch (error) {
        console.error('체인 브랜드 호텔 조회 오류:', error)
        return []
      }
    },
    enabled: !!selectedChainId,
    staleTime: 5 * 60 * 1000, // 5분
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
      
      // 클라이언트에서 publish 필터링 (false 제외)
      return (data || []).filter((h: any) => h.publish !== false)
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
          .select('brand_id, brand_name_en, brand_name_ko')
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
  allChains?: Array<{ chain_id: number; chain_name_en: string; chain_name_ko?: string; slug: string }>
  selectedChainBrands?: Array<{ brand_id: number; brand_name_en: string; brand_name_ko?: string }>
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
  // 아티클 섹션용 props
  showArticles?: boolean
  articlesChainId?: string
  articlesChainName?: string
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
  serverFilterOptions,
  // 아티클 섹션용 props
  showArticles = false,
  articlesChainId,
  articlesChainName
}: HotelSearchResultsProps) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ""
  const checkInParam = searchParams.get('checkIn') || ""
  const checkOutParam = searchParams.get('checkOut') || ""
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [refreshTick, setRefreshTick] = useState(0)
  const [displayCount, setDisplayCount] = useState(12) // 초기 표시 개수
  const [selectedChainId, setSelectedChainId] = useState<string | null>(currentChainId || null)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId || null)
  const [filters, setFilters] = useState({
    city: '',
    country: '',
    brand: ''
  })
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
  const { data: chainBrandHotels, isLoading: isChainBrandLoading, error: chainBrandError } = useChainBrandHotels(selectedChainId)
  const { data: brandHotels, isLoading: isBrandLoading, error: brandError } = useBrandHotels(selectedBrandId)
  const { data: chainBrands } = useChainBrands(selectedChainId)
  const { data: filterOptions, isLoading: isFilterOptionsLoading, error: filterOptionsError } = useFilterOptions()
  
  // 체인 페이지에서는 서버에서 전달받은 필터 옵션 사용
  const finalFilterOptions = serverFilterOptions || filterOptions
  
  // 전체 호텔 데이터 디버깅
  useEffect(() => {
    console.log('🏨 [ allHotels 상태 ]', {
      isLoading: isAllHotelsLoading,
      hasData: !!allHotels,
      dataLength: allHotels?.length || 0,
      error: allHotelsError?.message || 'none',
      샘플: allHotels?.slice(0, 2)
    })
  }, [allHotels, isAllHotelsLoading, allHotelsError])
  
  const isFinalFilterOptionsLoading = serverFilterOptions ? false : isFilterOptionsLoading


  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery)
    setDisplayCount(12) // 검색 시 표시 개수 초기화
    // 클릭할 때마다 강제 리프레시 트리거
    setRefreshTick((v) => v + 1)
    
    // URL 업데이트 (새로고침 시에도 검색어 유지)
    const url = new URL(window.location.href)
    url.searchParams.set('q', newQuery)
    window.history.pushState({}, '', url.toString())
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setDisplayCount(12) // 필터 변경 시 표시 개수 초기화
  }

  // 개별 필터 변경 핸들러 (부분집합 자동 연동)
  const handleSingleFilterChange = (type: keyof typeof filters, value: string) => {
    const newFilters = { ...filters }
    
    // 선택된 필터 값 설정
    newFilters[type] = value
    
    // 도시 선택 시 자동으로 국가 선택 (도시는 국가의 부분집합)
    if (type === 'city' && value && finalFilterOptions) {
      const selectedCity = finalFilterOptions.cities.find((c: any) => c.id === value)
      if (selectedCity && selectedCity.country_ko) {
        newFilters.country = selectedCity.country_ko
      }
    }
    
    // 도시 필터 해제 시 국가 필터도 해제
    if (type === 'city' && !value) {
      newFilters.country = ''
    }
    
    handleFiltersChange(newFilters)
  }

  // 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    if (!allHotels) return []
    
    return allHotels.filter(hotel => {
      // 도시 필터 (city_ko로 비교)
      if (filters.city) {
        if (hotel.city_ko !== filters.city) {
          return false
        }
      }
      
      // 국가 필터 (country_ko로 비교)
      if (filters.country) {
        if (hotel.country_ko !== filters.country) {
          return false
        }
      }
      
      // 브랜드 필터 (brand_id로 비교)
      if (filters.brand) {
        if (String(hotel.brand_id) !== filters.brand) {
          return false
        }
      }
      
      return true
    })
  }, [allHotels, filters, finalFilterOptions])
  
  // filteredData 디버깅
  useEffect(() => {
    console.log('🔎 [ filteredData 상태 ]', {
      allHotelsLength: allHotels?.length || 0,
      filteredLength: filteredData?.length || 0,
      filters,
      샘플: filteredData?.slice(0, 2)
    })
  }, [filteredData, allHotels, filters])


  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 12) // 12개씩 추가 로딩
  }

  const handleClearAllFilters = () => {
    setSelectedChainId(null)
    setSelectedBrandId(null)
  }

  const handleChainSelect = (chainId: string) => {
    setSelectedChainId(chainId)
    
    // 외부 핸들러가 있으면 호출
    if (onChainChange) {
      onChainChange(chainId)
    }
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrandId(brandId)
    // 브랜드 선택 시 체인 선택 초기화
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

  // URL 파라미터에서 필터 정보 읽어오기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const cityParam = urlParams.get('city')
    const countryParam = urlParams.get('country')
    const brandParam = urlParams.get('brand')
    const chainParam = urlParams.get('chain')
    
    // URL 파라미터가 있으면 필터 적용
    if (cityParam || countryParam || brandParam || chainParam) {
      const newFilters = {
        city: cityParam || '',
        country: countryParam || '',
        brand: brandParam || '',
        chain: chainParam || ''
      }
      
      console.log('🔍 URL 파라미터에서 필터 적용:', newFilters)
      setFilters(newFilters)
    }
  }, []) // 컴포넌트 마운트 시 한 번만 실행

  // 체인 페이지용 필터링된 데이터 (useMemo로 계산)
  const filteredChainHotels = useMemo(() => {
    if (initialHotels.length === 0) {
      return []
    }
    
    return initialHotels.filter(hotel => {
      // 도시 필터
      if (filters.city && !hotel.city?.includes(filters.city) && !hotel.location?.includes(filters.city)) {
        return false
      }
      
      // 국가 필터
      if (filters.country && !hotel.country?.includes(filters.country)) {
        return false
      }
      
      // 브랜드 필터
      if (filters.brand && hotel.brand !== filters.brand) {
        return false
      }
      
      return true
    })
  }, [initialHotels, filters, finalFilterOptions])

  // 표시할 데이터 결정 (우선순위: 검색 > 체인 선택 > 브랜드 선택 > initialHotels > 전체 호텔)
  const allData = searchQuery.trim() 
    ? searchResults 
    : selectedChainId 
      ? chainBrandHotels 
      : selectedBrandId 
        ? brandHotels 
        : (initialHotels.length > 0 
            ? filteredChainHotels  // 서버에서 전달된 initialHotels 우선 사용
            : (showAllHotels ? filteredData : []))
  
  console.log('🔍 [ allData 결정 로직 ]', {
    searchQuery: searchQuery.trim(),
    selectedChainId,
    selectedBrandId,
    initialHotelsLength: initialHotels.length,
    showAllHotels,
    allHotelsLength: allHotels?.length || 0,
    filteredDataLength: filteredData?.length || 0,
    dataSource: searchQuery.trim() 
      ? 'searchResults'
      : selectedChainId 
        ? 'chainBrandHotels'
        : selectedBrandId 
          ? 'brandHotels'
          : (initialHotels.length > 0 
              ? 'filteredChainHotels (initialHotels)'
              : (showAllHotels ? 'filteredData (전체)' : '빈 배열')),
    resultCount: allData?.length || 0,
    filters
  })
  
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
      <PromotionBanner />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {/* 호텔 광고 배너 */}
        <HotelBannerSection
          bannerHotel={bannerHotel || null}
          isBannerLoading={isBannerLoading}
          copywriter={searchQuery.trim() ? "특별한 혜택과 함께하는 프리미엄 호텔 경험을 만나보세요" : "전 세계 프리미엄 호텔과 리조트의 특별한 경험을 만나보세요"}
        />
        
        {/* 검색 영역은 전체보기에서만 노출되며, 모바일에서는 제목/서브타이틀 아래로 배치 */}


        {/* 검색 결과 */}
        <section className="py-4 sm:py-8">
          <div className="container mx-auto max-w-[1440px] px-4">
            {showAllHotels ? (
              <div className="space-y-2 lg:space-y-3">
                {/* 제목/검색/필터 정렬 래퍼 (모바일: 제목→검색→필터, PC: 제목 → 검색+필터) */}
                <div className="flex flex-col gap-2 lg:gap-3">
                  {/* 제목 영역: 모바일/PC 모두 첫 번째 */}
                  <div className="order-1">
                    <div className="text-center lg:text-left py-1 lg:py-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">
                        {title}
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                  
                  {/* 검색+필터 영역: PC에서는 4개 그리드 구조에 맞춰 배치 */}
                  <div className="order-2 lg:order-2">
                    {/* 모바일용 flex 레이아웃 */}
                    <div className="flex flex-col gap-2 xl:hidden">
                      {/* 검색 영역 */}
                      {showAllHotels && (
                        <div className="w-full order-2">
                          <SimpleHotelSearch 
                            onSearch={handleSearch}
                            initialQuery={searchQuery}
                            placeholder="호텔명, 국가, 또는 지역으로 검색하세요"
                          />
                        </div>
                      )}
                      
                    </div>
                    
                    {/* PC용 4개 그리드 레이아웃 (호텔 카드와 동일한 구조) */}
                    <div className="hidden xl:grid xl:grid-cols-4 gap-8 items-start">
                      {/* 검색 영역: 1~2번째 컬럼 (col-span-2) */}
                      {showAllHotels && (
                        <div className="col-span-2 flex items-stretch">
                          <div className="bg-white border border-gray-200 rounded-lg p-3 w-full flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                              <h3 className="text-base font-semibold text-gray-900">
                                검색
                              </h3>
                              <div className="text-xs text-gray-500 font-medium">
                                호텔 검색
                              </div>
                            </div>
                            <div className="flex-grow">
                              <SimpleHotelSearch 
                                onSearch={handleSearch}
                                initialQuery={searchQuery}
                                placeholder="호텔명, 국가, 또는 지역으로 검색하세요"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 필터 영역: 3~4번째 컬럼 (col-span-2) */}
                      {showFilters && (
                        <div className="col-span-2 flex items-stretch">
                          <div className="bg-white border border-gray-200 rounded-lg p-3 w-full flex flex-col justify-between">
                            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                              <h3 className="text-base font-semibold text-gray-900">
                                필터 ({allData?.length || 0}개 호텔)
                              </h3>
                              <button
                                onClick={() => handleFiltersChange({ city: '', country: '', brand: '', chain: '' })}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                disabled={isFinalFilterOptionsLoading}
                              >
                                초기화
                              </button>
                            </div>
                            
                            {isFinalFilterOptionsLoading ? (
                              <div className="text-center py-3 flex-1 flex items-center justify-center">
                                <div>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                                  <p className="text-gray-600 mt-1 text-xs">로딩 중...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-3 flex-grow">
                                {/* 도시 필터 */}
                                <div>
                                  <select
                                    value={filters.city}
                                    onChange={(e) => handleSingleFilterChange('city', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent h-10"
                                    disabled={isFinalFilterOptionsLoading}
                                  >
                                    <option value="">도시 전체</option>
                                    {finalFilterOptions?.cities?.map((city: any) => (
                                      <option key={city.id} value={city.id}>
                                        {city.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                {/* 국가 필터 */}
                                <div>
                                  <select
                                    value={filters.country}
                                    onChange={(e) => handleSingleFilterChange('country', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent h-10"
                                    disabled={isFinalFilterOptionsLoading}
                                  >
                                    <option value="">국가 전체</option>
                                    {finalFilterOptions?.countries?.map((country: any) => (
                                      <option key={country.id} value={country.id}>
                                        {country.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                {/* 브랜드 필터 */}
                                <div>
                                  <select
                                    value={filters.brand}
                                    onChange={(e) => handleSingleFilterChange('brand', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent h-10"
                                    disabled={isFinalFilterOptionsLoading}
                                  >
                                    <option value="">브랜드 전체</option>
                                    {finalFilterOptions?.brands?.map((brand: any) => (
                                      <option key={brand.id} value={brand.id}>
                                        {brand.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 모바일 전용 필터 영역 (아래에 별도 표시) */}
                  {showFilters && (
                    <div className="order-3 xl:hidden">
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-semibold text-gray-900">
                            필터 ({allData?.length || 0}개 호텔)
                          </h3>
                          <button
                            onClick={() => handleFiltersChange({ city: '', country: '', brand: '', chain: '' })}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            disabled={isFinalFilterOptionsLoading}
                          >
                            초기화
                          </button>
                        </div>
                        
                        {isFinalFilterOptionsLoading ? (
                          <div className="text-center py-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-600 mt-1 text-xs">로딩 중...</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* 모바일: 2x2 그리드 (브랜드 하나 더 추가되면 자동 줄바꿈) */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* 도시 필터 */}
                              <div>
                                <select
                                  value={filters.city}
                                  onChange={(e) => handleSingleFilterChange('city', e.target.value)}
                                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  disabled={isFinalFilterOptionsLoading}
                                >
                                  <option value="">도시 전체</option>
                                  {finalFilterOptions?.cities?.map((city: any) => (
                                    <option key={city.id} value={city.id}>
                                      {city.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              {/* 국가 필터 */}
                              <div>
                                <select
                                  value={filters.country}
                                  onChange={(e) => handleSingleFilterChange('country', e.target.value)}
                                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  disabled={isFinalFilterOptionsLoading}
                                >
                                  <option value="">국가 전체</option>
                                  {finalFilterOptions?.countries?.map((country: any) => (
                                    <option key={country.id} value={country.id}>
                                      {country.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              {/* 브랜드 필터 */}
                              <div className="col-span-2">
                                <select
                                  value={filters.brand}
                                  onChange={(e) => handleSingleFilterChange('brand', e.target.value)}
                                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  disabled={isFinalFilterOptionsLoading}
                                >
                                  <option value="">브랜드 전체</option>
                                  {finalFilterOptions?.brands?.map((brand: any) => (
                                    <option key={brand.id} value={brand.id}>
                                      {brand.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            
                            {/* 선택된 필터 표시 */}
                            <div>
                              {Object.entries(filters).some(([_, value]) => value) && (
                                <div className="flex flex-wrap gap-1">
                                  {filters.city && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                      도시: {finalFilterOptions?.cities.find(c => c.id === filters.city)?.label}
                                      <button
                                        onClick={() => handleSingleFilterChange('city', '')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  )}
                                  {filters.country && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                      국가: {finalFilterOptions?.countries.find(c => c.id === filters.country)?.label}
                                      <button
                                        onClick={() => handleSingleFilterChange('country', '')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  )}
                                  {filters.brand && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                      브랜드: {finalFilterOptions?.brands.find(b => b.id === filters.brand)?.label}
                                      <button
                                        onClick={() => handleSingleFilterChange('brand', '')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 호텔 목록 */}
                <div>
                  <HotelListSectionAllView
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
                  />
                </div>
              </div>
            ) : !showAllHotels && searchQuery.trim() ? (
              <>
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

      {/* 브랜드 관련 아티클 섹션 */}
      {showArticles && articlesChainId && articlesChainName && (
        <BrandArticlesSection 
          chainId={articlesChainId}
          chainName={articlesChainName}
        />
      )}

      {/* 푸터 */}
      <Footer />
    </div>
  )
}

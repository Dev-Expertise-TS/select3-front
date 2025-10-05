"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SimpleHotelSearch } from "./simple-hotel-search"
import { HotelCardGrid } from "@/components/shared/hotel-card-grid"
import { BrandArticlesSection } from "@/features/brands/brand-articles-section"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformSearchResultsToCardData, transformHotelsToAllViewCardData } from '@/lib/hotel-utils'
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
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, country_ko, country_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1, image_2, image_3, image_4, image_5')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%,city_ko.ilike.%${query}%,city_en.ilike.%${query}%,country_ko.ilike.%${query}%,country_en.ilike.%${query}%`)
      
      if (error) throw error
      if (!data) return []
      
      // 호텔 미디어 조회
      const sabreIds = data.map((hotel: any) => hotel.sabre_id)
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

// 필터 옵션 조회 훅
function useFilterOptions() {
  return useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      // 호텔 데이터 조회
      const { data: hotels, error: hotelsError } = await supabase
        .from('select_hotels')
        .select('city, city_ko, city_en, country_ko, country_en, brand_id, chain_ko, chain_en')
      
      if (hotelsError) throw hotelsError
      
      // 브랜드 데이터 조회
      const brandIds = hotels?.filter((h: any) => h.brand_id).map((h: any) => h.brand_id) || []
      let brands: any[] = []
      if (brandIds.length > 0) {
        const { data: brandData } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .in('brand_id', brandIds)
        brands = brandData || []
      }
      
      // 도시 옵션 생성 (카운트 제거)
      const citySet = new Set()
      hotels?.forEach((hotel: any) => {
        const city = hotel.city_ko || hotel.city || hotel.city_en
        if (city) {
          citySet.add(city)
        }
      })
      const cities = Array.from(citySet).map(city => ({
        id: city,
        label: city
      })).sort((a: any, b: any) => a.label.localeCompare(b.label))
      
      // 국가 옵션 생성 (카운트 제거)
      const countrySet = new Set()
      hotels?.forEach((hotel: any) => {
        const country = hotel.country_ko || hotel.country_en
        if (country) {
          countrySet.add(country)
        }
      })
      const countries = Array.from(countrySet).map(country => ({
        id: country,
        label: country
      })).sort((a: any, b: any) => a.label.localeCompare(b.label))
      
      // 브랜드 옵션 생성 (카운트 제거)
      const brandSet = new Set()
      hotels?.forEach((hotel: any) => {
        if (hotel.brand_id) {
          const brand = brands.find((b: any) => b.brand_id === hotel.brand_id)
          if (brand) {
            const brandName = brand.brand_name_en
            brandSet.add(brandName)
          }
        }
      })
      const brandOptions = Array.from(brandSet).map(brandName => ({
        id: brandName,
        label: brandName
      })).sort((a: any, b: any) => a.label.localeCompare(b.label))
      
      // 체인 옵션 생성 (hotel_chains 테이블에서 조회)
      const { data: hotelChains } = await supabase
        .from('hotel_chains')
        .select('chain_id, chain_name_en, chain_name_kr, slug')
        .order('chain_name_en')
      
      const chainMap = new Map()
      hotels?.forEach((hotel: any) => {
        const chain = hotel.chain_ko || hotel.chain_en
        if (chain) {
          chainMap.set(chain, (chainMap.get(chain) || 0) + 1)
        }
      })
      
      // hotel_chains 테이블의 체인 목록 사용 (영문 표시, 카운트 제거)
      const chains = (hotelChains || []).map((chain: any) => {
        const chainName = chain.chain_name_en || chain.chain_name_kr
        return {
          id: String(chain.chain_id),
          label: chainName
        }
      }).sort((a: any, b: any) => a.label.localeCompare(b.label))
      
      return {
        cities: cities.slice(0, 20), // 상위 20개만
        countries: countries.slice(0, 20),
        brands: brandOptions.slice(0, 20),
        chains: chains.slice(0, 20)
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
    retry: 3,
    retryDelay: 1000,
  })
}

// 모든 호텔 조회 훅 (검색어 없이)
function useAllHotels() {
  return useQuery({
    queryKey: ['all-hotels'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, country_ko, country_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1, image_2, image_3, image_4, image_5, chain_ko, chain_en, brand_id')
          .order('sabre_id')
        
        if (error) {
          console.error('호텔 목록 조회 오류:', error)
          throw error
        }
        if (!data) return []
      
      // 호텔 미디어 조회
      const sabreIds = data.map((hotel: any) => hotel.sabre_id)
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('sabre_id, media_path, sort_order')
        .in('sabre_id', sabreIds)
        .order('sort_order', { ascending: true })
      
      // 브랜드 정보 조회
      const brandIds = data.filter((hotel: any) => hotel.brand_id).map((hotel: any) => hotel.brand_id)
      let brandData = []
      if (brandIds.length > 0) {
        const { data: brandResult, error: brandError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .in('brand_id', brandIds)
        
        if (brandError) {
          console.error('브랜드 정보 조회 오류:', brandError)
        } else {
          brandData = brandResult || []
        }
      }
      
        // 데이터 변환 (전체보기용) - 브랜드 정보 포함
        return transformHotelsToAllViewCardData(data, mediaData || [], brandData)
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
        // 1. select_feature_slots에서 surface가 "상단베너"인 sabre_id 조회
        const { data: featureSlots, error: featureError } = await supabase
          .from('select_feature_slots')
          .select('sabre_id')
          .eq('surface', '상단베너')
        
        if (featureError) throw featureError
        if (!featureSlots || featureSlots.length === 0) return null
        
        const sabreIds = featureSlots.map((slot: any) => slot.sabre_id)
        
        // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6, slug, image_1, brand_id')
          .in('sabre_id', sabreIds)
          .not('image_1', 'is', null) // image_1이 있는 호텔만
        
        if (hotelsError) throw hotelsError
        if (!hotels || hotels.length === 0) return null
        
        // 3. hotel_brands에서 brand_id로 브랜드 정보 조회 (null이 아닌 것만)
        const brandIds = hotels.map((hotel: any) => hotel.brand_id).filter((id: any) => id !== null && id !== undefined)
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
          .select('brand_id, brand_name_en, brand_name_kr')
          .eq('chain_id', parseInt(selectedChainId))
        
        if (brandsError) throw brandsError
        if (!brands || brands.length === 0) return []
        
        const brandIds = brands.map((b: any) => b.brand_id)
        
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
    brand: '',
    chain: currentChainId || '' // 체인 페이지에서 자동으로 해당 체인 선택
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
  const { data: filterOptions, isLoading: isFilterOptionsLoading } = useFilterOptions()
  
  // 체인 페이지에서는 서버에서 전달받은 필터 옵션 사용
  const finalFilterOptions = serverFilterOptions || filterOptions
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

  // 개별 필터 변경 핸들러 (상호 배타적 동작)
  const handleSingleFilterChange = (type: keyof typeof filters, value: string) => {
    const newFilters = { ...filters }
    
    // 필터 간 상호 배타적 동작
    if (type === 'city' && value) {
      // 도시 선택 시 국가 필터 초기화
      newFilters.country = ''
    } else if (type === 'country' && value) {
      // 국가 선택 시 도시 필터 초기화
      newFilters.city = ''
    } else if (type === 'brand' && value) {
      // 브랜드 선택 시 체인 필터 초기화
      newFilters.chain = ''
    } else if (type === 'chain' && value) {
      // 체인 선택 시 브랜드 필터 초기화
      newFilters.brand = ''
    }
    
    // 선택된 필터 값 설정
    newFilters[type] = value
    
    handleFiltersChange(newFilters)
  }

  // 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    if (!allHotels) return []
    
    // chain_id → chain_name 매핑
    let chainNameFilter = ''
    if (filters.chain && finalFilterOptions) {
      const chainOption = finalFilterOptions.chains.find((c: any) => c.id === filters.chain)
      chainNameFilter = chainOption?.label || ''
    }
    
    return allHotels.filter(hotel => {
      // 도시 필터
      if (filters.city && !hotel.city_ko?.includes(filters.city) && !hotel.city?.includes(filters.city)) {
        return false
      }
      
      // 국가 필터
      if (filters.country && !hotel.country_ko?.includes(filters.country) && !hotel.country_en?.includes(filters.country)) {
        return false
      }
      
      // 브랜드 필터
      if (filters.brand && (hotel as any).brand_name_en !== filters.brand) {
        return false
      }
      
      // 체인 필터 (chain_id를 chain_name으로 변환하여 비교)
      if (chainNameFilter && !hotel.chain?.includes(chainNameFilter)) {
        return false
      }
      
      return true
    })
  }, [allHotels, filters, finalFilterOptions])


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
    
    // chain_id → chain_name 매핑
    let chainNameFilter = ''
    if (filters.chain && finalFilterOptions) {
      const chainOption = finalFilterOptions.chains.find((c: any) => c.id === filters.chain)
      chainNameFilter = chainOption?.label || ''
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
      
      // 체인 필터 (chain_id를 chain_name으로 변환하여 비교)
      if (chainNameFilter && hotel.chain !== chainNameFilter) {
        return false
      }
      
      return true
    })
  }, [initialHotels, filters, finalFilterOptions])

  // 표시할 데이터 결정 (우선순위: 검색 > 체인 선택 > 브랜드 선택 > 전체 호텔)
  const allData = searchQuery.trim() 
    ? searchResults 
    : selectedChainId 
      ? chainBrandHotels 
      : selectedBrandId 
        ? brandHotels 
        : (showAllHotels ? filteredData : (initialHotels.length > 0 ? filteredChainHotels : []))
  
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
        
        {/* 검색 영역 - showAllHotels가 true일 때만 표시 */}
        {showAllHotels && (
          <section className="bg-gray-50 py-8">
            <div className="container mx-auto max-w-[1440px] px-4">
              <SimpleHotelSearch 
                onSearch={handleSearch}
                initialQuery={searchQuery}
                placeholder="호텔명, 국가, 또는 지역으로 검색하세요"
              />
            </div>
          </section>
        )}


        {/* 검색 결과 */}
        <section className="py-8">
          <div className="container mx-auto max-w-[1440px] px-4">
            {showAllHotels ? (
              <div className="space-y-4">
                {/* 제목 및 필터 영역 */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-2">
                  {/* 텍스트 영역 */}
                  <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                      {title}
                    </h1>
                    <p className="text-base text-gray-600">
                      {subtitle}
                    </p>
                  </div>
                  
                  {/* 필터 영역 */}
                  {showFilters && (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 lg:w-[600px]">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* 도시 필터 */}
                      <div>
                        <select
                          value={filters.city}
                          onChange={(e) => handleSingleFilterChange('city', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          disabled={isFinalFilterOptionsLoading}
                        >
                          <option value="">도시 전체</option>
                          {finalFilterOptions?.cities.map((city: any) => (
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          disabled={isFinalFilterOptionsLoading}
                        >
                          <option value="">국가 전체</option>
                          {finalFilterOptions?.countries.map((country: any) => (
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          disabled={isFinalFilterOptionsLoading}
                        >
                          <option value="">브랜드 전체</option>
                          {finalFilterOptions?.brands.map((brand: any) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* 체인 필터 */}
                      <div>
                        <select
                          value={filters.chain}
                          onChange={(e) => handleSingleFilterChange('chain', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          disabled={isFinalFilterOptionsLoading}
                        >
                          <option value="">체인 전체</option>
                          {finalFilterOptions?.chains.map((chain: any) => (
                            <option key={chain.id} value={chain.id}>
                              {chain.label}
                            </option>
                          ))}
                        </select>
                      </div>
                        </div>
                      )}
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

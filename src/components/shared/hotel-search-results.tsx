"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { SimpleHotelSearch } from "./simple-hotel-search"
import { BrandArticlesSection } from "@/features/brands/brand-articles-section"
import { HotelBannerSection } from './hotel-banner-section'
import { HotelListSectionAllView } from './hotel-list-section-all-view'
import { 
  useSearchResults, 
  useFilterOptions, 
  useAllHotels, 
  useBannerHotel, 
  useChainBrandHotels, 
  useBrandHotels,
  useChainBrands
} from '@/hooks/use-hotel-queries'
import { 
  filterSearchResults, 
  filterInitialHotels, 
  filterAllHotels,
  type HotelFilters 
} from '@/lib/hotel-filter-utils'

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
  onBrandChange?: (brandId: string, chainId: string) => void
  serverFilterOptions?: {
    countries: Array<{ id: string; label: string; count: number }>
    cities: Array<{ id: string; label: string; count: number }>
    brands: Array<{ id: string; label: string; count: number; chain_id?: number | null; chain_name_ko?: string | null }>
    chains: Array<{ id: string; label: string; count: number }>
  }
  // 배너 호텔 (서버에서 조회)
  serverBannerHotel?: any
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
  serverBannerHotel,
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
  // initialBrandId는 필터에만 사용하고, selectedBrandId는 별도 관리 (initialHotels가 있으면 사용 안함)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId && !initialHotels.length ? initialBrandId : null)
  // 브랜드/체인 페이지에서 필터 초기화 시 전체 호텔 표시 여부
  const [showAllInsteadOfInitial, setShowAllInsteadOfInitial] = useState(false)
  const [filters, setFilters] = useState<HotelFilters>({
    city: '',
    country: '',
    brand: initialBrandId || '', // 초기 브랜드 ID 설정
    chain: currentChainId || '' // 초기 체인 ID 설정
  })
  
  // initialBrandId가 변경되면 필터도 업데이트
  useEffect(() => {
    if (initialBrandId && initialBrandId !== filters.brand) {
      setFilters(prev => ({
        ...prev,
        brand: initialBrandId
      }))
      console.log(`🔄 [브랜드 필터 업데이트] initialBrandId: ${initialBrandId}`)
    }
  }, [initialBrandId])
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
  
  // 서버 데이터 우선 사용, 없으면 클라이언트에서 fetch
  const { data: clientAllHotels, isLoading: isAllHotelsLoading, error: allHotelsError } = useAllHotels(
    { enabled: initialHotels.length === 0 } // 서버 데이터가 없을 때만 클라이언트에서 조회
  )
  const allHotels = initialHotels.length > 0 ? initialHotels : clientAllHotels
  
  // 배너 호텔: 서버 데이터 우선, 없으면 클라이언트에서 조회
  const { data: clientBannerHotel, isLoading: isBannerLoading } = useBannerHotel({ enabled: !serverBannerHotel })
  const bannerHotel = serverBannerHotel || clientBannerHotel
  const { data: chainBrandHotels, isLoading: isChainBrandLoading, error: chainBrandError } = useChainBrandHotels(selectedChainId)
  const { data: brandHotels, isLoading: isBrandLoading, error: brandError } = useBrandHotels(selectedBrandId)
  const { data: chainBrands } = useChainBrands(selectedChainId)
  
  // 필터 옵션: 서버 데이터가 있어도 브랜드/체인은 항상 클라이언트에서 fetch
  const { data: clientFilterOptions, isLoading: isFilterOptionsLoading, error: filterOptionsError } = useFilterOptions()
  
  // 서버 필터 옵션과 클라이언트 필터 옵션 병합
  const finalFilterOptions = useMemo(() => {
    if (serverFilterOptions && clientFilterOptions) {
      // 서버 데이터가 빈 배열이면 클라이언트 데이터 사용, 아니면 서버 데이터 우선
      return {
        countries: (serverFilterOptions.countries && serverFilterOptions.countries.length > 0) 
          ? serverFilterOptions.countries 
          : (clientFilterOptions.countries || []),
        cities: (serverFilterOptions.cities && serverFilterOptions.cities.length > 0) 
          ? serverFilterOptions.cities 
          : (clientFilterOptions.cities || []),
        brands: (serverFilterOptions.brands && serverFilterOptions.brands.length > 0) 
          ? serverFilterOptions.brands 
          : (clientFilterOptions.brands || []),
        chains: (serverFilterOptions.chains && serverFilterOptions.chains.length > 0) 
          ? serverFilterOptions.chains 
          : (clientFilterOptions.chains || [])
      }
    }
    // 서버 데이터만 있는 경우
    if (serverFilterOptions) {
      return serverFilterOptions
    }
    // 클라이언트 데이터만 있는 경우
    return clientFilterOptions || null
  }, [serverFilterOptions, clientFilterOptions])
  
  const isFinalFilterOptionsLoading = isFilterOptionsLoading
  
  // 필터 옵션 디버깅
  useEffect(() => {
    console.log('🔍 [ 필터 옵션 상태 ]', {
      serverFilterOptions: !!serverFilterOptions,
      clientFilterOptions: !!clientFilterOptions,
      finalFilterOptions: !!finalFilterOptions,
      countries: finalFilterOptions?.countries?.length || 0,
      cities: finalFilterOptions?.cities?.length || 0,
      brands: finalFilterOptions?.brands?.length || 0,
      chains: finalFilterOptions?.chains?.length || 0,
      샘플도시: finalFilterOptions?.cities?.slice(0, 3),
      샘플브랜드: finalFilterOptions?.brands?.slice(0, 3)
    })
  }, [serverFilterOptions, clientFilterOptions, finalFilterOptions])
  
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

  // 필터 완전 초기화 (초기화 버튼용)
  const handleFilterReset = () => {
    console.log('🔄 필터 완전 초기화')
    
    // 1. 필터 상태 초기화
    setFilters({ city: '', country: '', brand: '', chain: '' })
    
    // 2. 선택된 체인/브랜드 ID 초기화
    setSelectedChainId(null)
    setSelectedBrandId(null)
    
    // 3. 브랜드/체인 페이지에서도 전체 호텔 표시
    setShowAllInsteadOfInitial(true)
    
    // 4. 표시 개수 초기화
    setDisplayCount(12)
    
    // 5. URL 파라미터 초기화 (필터 관련)
    const url = new URL(window.location.href)
    url.searchParams.delete('city')
    url.searchParams.delete('country')
    url.searchParams.delete('brand')
    url.searchParams.delete('chain')
    window.history.pushState({}, '', url.toString())
    
    console.log('✅ 필터 초기화 완료 → 전체 호텔 리스팅', {
      showAllInsteadOfInitial: true,
      initialHotelsLength: initialHotels.length
    })
  }

  // 개별 필터 변경 핸들러 (부분집합 자동 연동)
  const handleSingleFilterChange = (type: keyof typeof filters, value: string) => {
    // 검색 조건이 있고 필터를 선택하려고 할 때
    if (searchQuery.trim() && value) {
      const confirmed = window.confirm(
        '검색 조건이 설정되어 있습니다.\n\n필터를 사용하려면 검색 조건을 초기화해야 합니다.\n계속하시겠습니까?'
      )
      
      if (confirmed) {
        // 검색 조건 초기화
        setSearchQuery('')
        const url = new URL(window.location.href)
        url.searchParams.delete('q')
        window.history.pushState({}, '', url.toString())
        console.log('🔄 검색 조건 초기화 → 필터 적용')
      } else {
        // 사용자가 취소한 경우 필터 적용하지 않음
        return
      }
    }
    
    // 필터가 다시 선택되면 "전체 호텔 표시" 모드 해제
    if (value && showAllInsteadOfInitial) {
      setShowAllInsteadOfInitial(false)
      console.log('🔄 필터 선택 → initialHotels 모드로 복귀')
    }
    
    const newFilters = { ...filters }
    
    // 선택된 필터 값 설정
    newFilters[type] = value
    
    // 도시 선택 시 자동으로 국가 선택 (도시는 국가의 부분집합)
    if (type === 'city' && value && finalFilterOptions) {
      const selectedCity = finalFilterOptions.cities.find((c: any) => c.id === value)
      if (selectedCity && selectedCity.country_code) {
        newFilters.country = selectedCity.country_code  // country_code로 자동 선택 (예: TPE 선택 시 TW로 자동 설정)
        console.log('🔄 도시 선택 → 국가 자동 선택:', { 
          cityCode: value, 
          cityLabel: selectedCity.label,
          countryCode: selectedCity.country_code 
        })
      }
    }
    
    // 도시 필터 해제 시 국가 필터도 해제
    if (type === 'city' && !value) {
      newFilters.country = ''
    }
    
    // 국가 필터 변경 시 도시 필터 초기화
    if (type === 'country') {
      newFilters.city = ''
      if (value) {
        console.log('🔄 국가 필터 선택 → 도시 필터 초기화')
      } else {
        console.log('🔄 국가 전체 선택 → 도시 필터 초기화')
      }
    }
    
    // 체인 필터 변경 시 브랜드 필터 초기화 (상위 필터 선택 시 하위 필터 해제)
    if (type === 'chain') {
      console.log('🔄 체인 필터 변경:', value)
      if (value) {
        newFilters.brand = ''
        console.log('🔄 체인 필터 선택 → 브랜드 필터 초기화')
      }
    }
    
    // 브랜드 필터 변경 시 해당 브랜드가 속한 체인을 자동 선택
    if (type === 'brand') {
      console.log('🔄 브랜드 필터 변경:', value)
      if (value) {
        // 브랜드 선택 시 해당 브랜드가 속한 체인을 자동 선택
        let chainId = null
        if (finalFilterOptions && finalFilterOptions.brands) {
          const selectedBrand = finalFilterOptions.brands.find((b: any) => b.id === value)
          if (selectedBrand && selectedBrand.chain_id) {
            chainId = String(selectedBrand.chain_id)
            newFilters.chain = chainId
            console.log('🔄 브랜드 선택 → 체인 자동 선택:', newFilters.chain)
          }
        }
        
        // onBrandChange 핸들러가 있으면(브랜드/체인 페이지) 항상 해당 체인 페이지로 이동
        if (onBrandChange && chainId) {
          console.log('🔄 브랜드 변경 → 체인 페이지 이동:', chainId)
          
          // Analytics: 브랜드 선택 추적
          if (typeof window !== 'undefined' && window.gtag) {
            const selectedBrand = finalFilterOptions?.brands?.find((b: any) => b.id === value)
            window.gtag('event', 'select_brand', {
              event_category: 'filter',
              event_label: selectedBrand?.label || value,
              brand_id: value,
              chain_id: chainId
            })
          }
          
          // 페이지 이동
          onBrandChange(value, chainId)
          return // 페이지 이동하므로 나머지 로직 실행하지 않음
        }
        
        // onBrandChange가 없으면 (전체보기 페이지) 필터만 적용
        // initialHotels가 없을 때만 selectedBrandId 설정
        if (initialHotels.length === 0) {
          setSelectedBrandId(value)
          console.log('🔄 브랜드 필터 변경 → selectedBrandId 설정:', value)
        }
        
        console.log('🔄 브랜드 필터 선택 → 필터만 적용')
      } else {
        // 브랜드 전체 선택 시 체인도 전체로 초기화
        newFilters.chain = ''
        if (initialHotels.length === 0) {
          setSelectedChainId(null)
        }
        // 브랜드 필터 해제 시 selectedBrandId 초기화
        if (initialHotels.length === 0) {
          setSelectedBrandId(null)
        }
      }
    }
    
    // 체인 필터 변경 시 selectedChainId 설정
    if (type === 'chain') {
      if (value) {
        // onChainChange 핸들러가 있으면 페이지 이동 (브랜드/체인 페이지)
        if (onChainChange) {
          console.log('🔄 체인 변경 → 페이지 이동:', value)
          onChainChange(value)
          return // 페이지 이동하므로 나머지 로직 실행하지 않음
        }
        
        if (initialHotels.length === 0) {
          setSelectedChainId(value)
          console.log('🔄 체인 필터 변경 → selectedChainId 설정:', value)
        }
      } else {
        // 체인 전체 선택 시
        if (onChainChange && initialHotels.length > 0) {
          // 브랜드/체인 페이지에서 체인 전체 선택 → 일반 호텔 검색 페이지로 이동
          console.log('🔄 체인 전체 선택 → 호텔 검색 페이지로 이동')
          // 브랜드도 전체로 초기화하여 이동
          newFilters.brand = ''
          const params = new URLSearchParams()
          if (newFilters.city) params.set('city', newFilters.city)
          if (newFilters.country) params.set('country', newFilters.country)
          const queryString = params.toString()
          window.location.href = queryString ? `/hotel?${queryString}` : '/hotel'
          return
        }
        
        if (initialHotels.length === 0) {
          setSelectedChainId(null)
        }
      }
    }
    
    handleFiltersChange(newFilters)
  }

  // 필터링된 데이터 계산
  const filteredData = useMemo(() => {
    // 브랜드 페이지에서 브랜드가 선택되었거나 필터가 설정된 경우 필터링 적용
    const hasActiveFilters = filters.city || filters.country || filters.brand || filters.chain
    const hasInitialBrandId = initialBrandId && initialBrandId !== ''
    
    // initialHotels가 있고 필터가 완전히 비어있고 initialBrandId도 없으면 필터 옵션을 기다리지 않고 바로 반환
    if (initialHotels.length > 0 && !hasActiveFilters && !hasInitialBrandId) {
      return initialHotels
    }
    
    // 브랜드 페이지에서 initialBrandId가 있으면 해당 브랜드만 필터링
    if (hasInitialBrandId && initialHotels.length > 0) {
      const brandFilteredHotels = initialHotels.filter((hotel: any) => {
        return hotel.brand_id === initialBrandId
      })
      console.log(`🔍 [브랜드 필터링] initialBrandId: ${initialBrandId}, 필터링된 호텔 수: ${brandFilteredHotels.length}`)
      return brandFilteredHotels
    }
    
    return filterAllHotels(allHotels || [], filters, finalFilterOptions)
  }, [allHotels, filters, finalFilterOptions, initialHotels, initialBrandId])
  
  // filteredData 디버깅
  useEffect(() => {
    console.log('🔎 [ filteredData 상태 ]', {
      allHotelsLength: allHotels?.length || 0,
      allHotels첫번째이미지: allHotels?.[0]?.image || 'none',
      filteredLength: filteredData?.length || 0,
      filteredData첫번째이미지: filteredData?.[0]?.image || 'none',
      filters,
      샘플: filteredData?.slice(0, 1).map(h => ({
        name: h.property_name_ko,
        image: h.image,
        brand_name_en: h.brand_name_en
      }))
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
      onBrandChange(brandId, '')
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

  // URL 파라미터 또는 initialBrandId/currentChainId에서 필터 정보 읽어오기
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const cityParam = urlParams.get('city')
    const countryParam = urlParams.get('country')
    const brandParam = urlParams.get('brand')
    const chainParam = urlParams.get('chain')
    
    // 필터 데이터가 아직 없으면 대기
    if (!finalFilterOptions || !allHotels) {
      return
    }
    
    // URL 파라미터가 있으면 우선 사용, 없으면 initialBrandId/currentChainId 사용
    const newFilters = {
      city: cityParam || '',
      country: '',
      brand: brandParam || initialBrandId || '',
      chain: chainParam || currentChainId || ''
    }
    
    // country 파라미터 정규화: 코드(id)가 아니고 이름(예: JAPAN/일본)이 들어와도 매핑
    if (countryParam) {
      // 1) 필터 옵션에서 코드 또는 라벨 일치 우선
      const optionMatch = finalFilterOptions?.countries?.find((c: any) => c.id === countryParam || c.label === countryParam)
      if (optionMatch) {
        newFilters.country = optionMatch.id
      } else {
        // 2) 전체 호텔 데이터에서 country_en 또는 country_ko로 매칭해 코드 도출
        const hotelMatch = allHotels.find((h: any) =>
          (typeof h.country_en === 'string' && h.country_en.toLowerCase() === countryParam.toLowerCase()) ||
          h.country_ko === countryParam
        )
        if (hotelMatch?.country_code) {
          newFilters.country = hotelMatch.country_code
        } else {
          // 3) 매핑 실패 시 원본값 유지 (추후 서버에서 처리 가능성)
          newFilters.country = countryParam
        }
      }
    }
    
    // 도시 선택 시 자동으로 국가 선택 (URL 파라미터로 도시가 전달된 경우)
    if (cityParam && !countryParam && finalFilterOptions?.cities) {
      const selectedCity = finalFilterOptions.cities.find((c: any) => c.id === cityParam)
      if (selectedCity && selectedCity.country_code) {
        newFilters.country = selectedCity.country_code
        console.log('🔄 URL 도시 파라미터 → 국가 자동 선택:', {
          city: cityParam,
          country: selectedCity.country_code
        })
      }
    }
    
    // 브랜드 선택 시 자동으로 체인 선택 (URL 파라미터로 브랜드가 전달된 경우)
    if (brandParam && !chainParam && finalFilterOptions?.brands) {
      const selectedBrand = finalFilterOptions.brands.find((b: any) => b.id === brandParam)
      if (selectedBrand && selectedBrand.chain_id) {
        newFilters.chain = String(selectedBrand.chain_id)
        console.log('🔄 URL 브랜드 파라미터 → 체인 자동 선택:', {
          brand: brandParam,
          chain: selectedBrand.chain_id
        })
      }
    }
    
    // 현재 필터와 새 필터를 비교하여 변경이 있을 때만 업데이트
    const filtersChanged = 
      filters.city !== newFilters.city ||
      filters.country !== newFilters.country ||
      filters.brand !== newFilters.brand ||
      filters.chain !== newFilters.chain
      
    // 필터가 있고 변경이 있는 경우에만 적용
    if ((newFilters.city || newFilters.country || newFilters.brand || newFilters.chain) && filtersChanged) {
      console.log('🔍 필터 적용 (URL 또는 initialBrandId/currentChainId):', newFilters)
      setFilters(newFilters)
    }
  }, [initialBrandId, currentChainId]) // finalFilterOptions, allHotels 제거하여 무한 루프 방지

  // 검색 결과용 필터링된 데이터
  const filteredSearchResults = useMemo(() => {
    return filterSearchResults(searchResults || [], filters, finalFilterOptions)
  }, [searchResults, filters, finalFilterOptions])

  // 체인 페이지용 필터링된 데이터
  const filteredChainHotels = useMemo(() => {
    return filterInitialHotels(initialHotels, filters, finalFilterOptions)
  }, [initialHotels, filters, finalFilterOptions])

  // 브랜드로 가져온 데이터에 도시/국가/체인 교차 필터 적용
  const filteredBrandHotels = useMemo(() => {
    return filterAllHotels(brandHotels || [], filters, finalFilterOptions)
  }, [brandHotels, filters, finalFilterOptions])

  // 체인으로 가져온 데이터에 도시/국가/브랜드 교차 필터 적용
  const filteredChainBrandHotels = useMemo(() => {
    return filterAllHotels(chainBrandHotels || [], filters, finalFilterOptions)
  }, [chainBrandHotels, filters, finalFilterOptions])

  // 브랜드/체인 필터가 초기값과 다른지 확인
  const isFilterChanged = useMemo(() => {
    if (filters.brand && initialBrandId && filters.brand !== initialBrandId) {
      return true
    }
    if (filters.chain && currentChainId && filters.chain !== currentChainId) {
      return true
    }
    // 도시나 국가 필터가 있으면 변경된 것으로 간주
    if (filters.city || filters.country) {
      return true
    }
    return false
  }, [filters, initialBrandId, currentChainId])

  // 표시할 데이터 결정 (우선순위: 검색(필터링) > 필터변경시전체호텔 > initialHotels(필터링) > 브랜드선택(필터링) > 체인선택(필터링) > 전체호텔)
  const allData = searchQuery.trim() 
    ? filteredSearchResults  // 검색 결과에 필터 적용 ✅
    : showAllHotels
      ? filteredData  // /hotel 페이지: 전체 호텔에 필터 적용 ✅
      : showAllInsteadOfInitial  // 필터 초기화 시 전체 호텔 표시
        ? filteredData  // 전체 호텔 (필터 적용)
        : initialHotels.length > 0 && isFilterChanged && allHotels && allHotels.length > 0  // 필터가 변경되고 전체 호텔 로드 완료
          ? filteredData  // 전체 호텔에서 필터링 (다른 브랜드나 도시 검색 가능) - 이미지 포함
          : initialHotels.length > 0 
            ? filteredChainHotels  // 체인 페이지: 서버에서 전달된 initialHotels에 필터 적용 (이미지 포함)
            : selectedBrandId && filteredBrandHotels && filteredBrandHotels.length > 0
              ? filteredBrandHotels  // 브랜드 필터 선택 데이터 + 교차 필터 적용
              : selectedChainId 
                ? filteredChainBrandHotels // 체인 필터 선택 데이터 + 교차 필터 적용
                : []
  
  console.log('🔍 [ allData 결정 로직 ]', {
    searchQuery: searchQuery.trim(),
    selectedChainId,
    selectedBrandId,
    initialHotelsLength: initialHotels.length,
    showAllHotels,
    showAllInsteadOfInitial,
    isFilterChanged,
    initialBrandId,
    currentChainId,
    allHotelsLength: allHotels?.length || 0,
    allHotelsLoaded: !!(allHotels && allHotels.length > 0),
    filteredDataLength: filteredData?.length || 0,
    searchResultsLength: searchResults?.length || 0,
    filteredSearchResultsLength: filteredSearchResults?.length || 0,
    chainBrandHotelsLength: chainBrandHotels?.length || 0,
    brandHotelsLength: brandHotels?.length || 0,
    filteredChainHotelsLength: filteredChainHotels?.length || 0,
    dataSource: searchQuery.trim() 
      ? 'filteredSearchResults (검색 결과 + 필터 적용) ✅'
      : showAllHotels
        ? 'filteredData (/hotel 페이지 - 전체 호텔 + 필터 적용) ✅'
        : showAllInsteadOfInitial
          ? 'filteredData (전체 호텔 - 필터 초기화) ✅'
          : initialHotels.length > 0 && isFilterChanged && allHotels && allHotels.length > 0
            ? 'filteredData (전체 호텔 - 필터 변경 + allHotels 로드 완료) ✅'
            : initialHotels.length > 0
              ? 'filteredChainHotels (initialHotels 필터 적용 - 이미지 포함) ✅'
              : selectedBrandId && filteredBrandHotels && filteredBrandHotels.length > 0
                ? 'filteredBrandHotels (브랜드 데이터 + 교차 필터 적용)'
                : selectedChainId 
                  ? 'filteredChainBrandHotels (체인 데이터 + 교차 필터 적용)'
                  : '빈 배열',
    resultCount: allData?.length || 0,
    '첫번째호텔이미지': allData?.[0]?.image || 'none',
    filters,
    isAllHotelsLoading,
    allHotelsError: allHotelsError?.message || null
  })
  
  // 동적 타이틀 계산 (브랜드 필터 선택 시 변경)
  const dynamicTitle = useMemo(() => {
    if (initialHotels.length > 0 && filters.brand && finalFilterOptions?.brands) {
      const selectedBrand = finalFilterOptions.brands.find((b: any) => b.id === filters.brand)
      if (selectedBrand) {
        return selectedBrand.label // 브랜드영문명 (체인영문명) 형식
      }
    }
    return title
  }, [filters.brand, finalFilterOptions, initialHotels.length, title])

  // 동적 서브타이틀 계산
  const dynamicSubtitle = useMemo(() => {
    if (initialHotels.length > 0 && filters.brand) {
      const filteredCount = filteredChainHotels.length
      return `${filteredCount}개의 호텔을 만나보세요`
    }
    if (initialHotels.length > 0) {
      return `${filteredChainHotels.length}개의 ${currentChainName} 체인 브랜드를 만나보세요`
    }
    return subtitle
  }, [filters.brand, filteredChainHotels.length, initialHotels.length, currentChainName, subtitle])

  // 동적 아티클 체인 정보 계산 (브랜드 필터 선택 시 변경)
  const dynamicArticlesInfo = useMemo(() => {
    // 브랜드 필터가 선택되었고 finalFilterOptions가 있으면
    if (filters.brand && finalFilterOptions?.brands) {
      const selectedBrand = finalFilterOptions.brands.find((b: any) => b.id === filters.brand)
      if (selectedBrand && selectedBrand.chain_id && selectedBrand.chain_name_ko) {
        return {
          chainId: String(selectedBrand.chain_id),
          chainName: selectedBrand.chain_name_ko
        }
      }
    }
    // 기본값: props로 전달된 값 사용
    if (articlesChainId && articlesChainName) {
      return {
        chainId: articlesChainId,
        chainName: articlesChainName
      }
    }
    return null
  }, [filters.brand, finalFilterOptions, articlesChainId, articlesChainName])
  
  const displayData = allData?.slice(0, displayCount) || []
  const hasMoreData = allData && allData.length > displayCount
  const isLoading = searchQuery.trim() 
    ? isSearchLoading 
    : showAllInsteadOfInitial  // 필터 초기화 시 전체 호텔 로딩 상태
      ? isAllHotelsLoading
      : initialHotels.length > 0 && isFilterChanged  // 필터가 변경된 경우
        ? isAllHotelsLoading  // 전체 호텔 로딩 대기
        : initialHotels.length > 0
          ? false // initialHotels는 서버에서 이미 로드됨
          : selectedBrandId && brandHotels && brandHotels.length > 0
            ? isBrandLoading  // 브랜드 필터로 새로 가져온 데이터의 로딩 상태
    : selectedChainId 
      ? isChainBrandLoading 
        : (showAllHotels ? isAllHotelsLoading : false)
  const error = searchQuery.trim() 
    ? searchError 
    : showAllInsteadOfInitial  // 필터 초기화 시 전체 호텔 에러 상태
      ? allHotelsError
      : initialHotels.length > 0 && isFilterChanged  // 필터가 변경된 경우
        ? allHotelsError  // 전체 호텔 에러
        : initialHotels.length > 0
          ? null // initialHotels는 서버에서 이미 로드됨
          : selectedBrandId && brandHotels && brandHotels.length > 0
            ? brandError  // 브랜드 필터로 새로 가져온 데이터의 에러 상태
    : selectedChainId 
      ? chainBrandError 
        : (showAllHotels ? allHotelsError : null)

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <Header />
      <PromotionBanner />
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 pt-[50px] sm:pt-[60px]"> {/* 모바일 50px, 데스크톱 60px */}
        {/* 호텔 광고 배너 */}
        <HotelBannerSection
          bannerHotel={bannerHotel || null}
          isBannerLoading={isBannerLoading}
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
                        {dynamicTitle}
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600">
                        {dynamicSubtitle}
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
                              <button
                                onClick={() => handleSearch('')}
                                className="text-xs text-red-600 hover:text-red-700 font-bold"
                                title="검색어를 초기화합니다"
                              >
                                키워드 초기화
                              </button>
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
                                onClick={handleFilterReset}
                                className="text-xs text-red-600 hover:text-red-700 font-bold"
                                disabled={isFinalFilterOptionsLoading}
                              >
                                필터 초기화
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
                              <div className="grid grid-cols-4 gap-3 flex-grow">
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
                                
                                {/* 체인 필터 */}
                                <div>
                                  <select
                                    value={filters.chain}
                                    onChange={(e) => handleSingleFilterChange('chain', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent h-10"
                                    disabled={isFinalFilterOptionsLoading}
                                  >
                                    <option value="">체인 전체</option>
                                    {finalFilterOptions?.chains?.map((chain: any) => (
                                      <option key={chain.id} value={chain.id}>
                                        {chain.label}
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
                            onClick={handleFilterReset}
                            className="text-xs text-red-600 hover:text-red-700 font-bold"
                            disabled={isFinalFilterOptionsLoading}
                          >
                            필터 초기화
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
                              <div>
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
                              
                              {/* 체인 필터 */}
                              <div>
                                <select
                                  value={filters.chain}
                                  onChange={(e) => handleSingleFilterChange('chain', e.target.value)}
                                  className="w-full px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                  disabled={isFinalFilterOptionsLoading}
                                >
                                  <option value="">체인 전체</option>
                                  {finalFilterOptions?.chains?.map((chain: any) => (
                                    <option key={chain.id} value={chain.id}>
                                      {chain.label}
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
                                      도시: {finalFilterOptions?.cities.find((c: any) => c.id === filters.city)?.label}
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
                                      국가: {finalFilterOptions?.countries.find((c: any) => c.id === filters.country)?.label}
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
                                      브랜드: {finalFilterOptions?.brands.find((b: any) => b.id === filters.brand)?.label}
                                      <button
                                        onClick={() => handleSingleFilterChange('brand', '')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  )}
                                  {filters.chain && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                      체인: {finalFilterOptions?.chains.find((c: any) => c.id === filters.chain)?.label}
                                      <button
                                        onClick={() => handleSingleFilterChange('chain', '')}
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
            ) : !showAllHotels && (searchQuery.trim() || initialHotels.length > 0) ? (
              <>
                <HotelListSectionAllView
                title={searchQuery.trim() ? `"${searchQuery}" 검색 결과` : dynamicTitle}
                subtitle={isLoading ? "검색 중..." : 
                         allData && allData.length > 0 
                           ? searchQuery.trim() 
                             ? `${allData.length}개의 호텔을 찾았습니다.` 
                             : dynamicSubtitle
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
      {showArticles && dynamicArticlesInfo && (
        <BrandArticlesSection 
          chainId={dynamicArticlesInfo.chainId}
          chainName={dynamicArticlesInfo.chainName}
        />
      )}

      {/* 푸터 */}
      <Footer />
    </div>
  )
}

/**
 * 호텔 필터링 유틸리티 함수들
 */

/**
 * 필터 타입 정의
 */
export interface HotelFilters {
  city: string
  country: string
  brand: string
  chain: string
}

/**
 * 필터 옵션 타입 정의
 */
export interface FilterOptions {
  cities?: Array<{ id: string; label: string }>
  countries?: Array<{ id: string; label: string }>
  brands?: Array<{ id: string; label: string; chain_id?: string }>
  chains?: Array<{ id: string; label: string }>
}

/**
 * 체인 필터를 위한 브랜드 ID 목록 생성
 * @param chainId 체인 ID
 * @param brands 브랜드 목록
 * @returns 해당 체인에 속한 브랜드 ID 목록
 */
export function getChainBrandIds(chainId: string, brands?: Array<{ id: string; chain_id?: string }>): string[] {
  if (!chainId || !brands) return []
  
  return brands
    .filter((b: any) => String(b.chain_id) === chainId)
    .map((b: any) => b.id)
}

/**
 * 호텔 필터링 (공통 로직)
 * @param hotel 호텔 데이터
 * @param filters 필터 조건
 * @param chainBrandIds 체인 필터용 브랜드 ID 목록
 * @returns 필터 통과 여부
 */
export function filterHotel(hotel: any, filters: HotelFilters, chainBrandIds: string[] = []): boolean {
  // 도시 필터 (city_code로 비교)
  if (filters.city) {
    if (hotel.city_code !== filters.city) {
      return false
    }
  }
  
  // 국가 필터 (country_code로 비교)
  if (filters.country) {
    if (hotel.country_code !== filters.country) {
      return false
    }
  }
  
  // 체인 필터
  if (filters.chain && chainBrandIds.length > 0) {
    if (!chainBrandIds.includes(String(hotel.brand_id))) {
      return false
    }
  }
  
  // 브랜드 필터
  if (filters.brand) {
    if (String(hotel.brand_id) !== filters.brand) {
      return false
    }
  }
  
  return true
}

/**
 * 호텔 목록 필터링
 * @param hotels 호텔 목록
 * @param filters 필터 조건
 * @param filterOptions 필터 옵션 (체인 필터용)
 * @returns 필터링된 호텔 목록
 */
export function filterHotels(
  hotels: any[],
  filters: HotelFilters,
  filterOptions?: FilterOptions
): any[] {
  if (!hotels || hotels.length === 0) return []
  
  // 체인 필터를 위한 브랜드 ID 목록 생성
  const chainBrandIds = getChainBrandIds(filters.chain, filterOptions?.brands)
  
  return hotels.filter(hotel => filterHotel(hotel, filters, chainBrandIds))
}

/**
 * 검색 결과 필터링
 * @param searchResults 검색 결과
 * @param filters 필터 조건
 * @param filterOptions 필터 옵션
 * @returns 필터링된 검색 결과
 */
export function filterSearchResults(
  searchResults: any[],
  filters: HotelFilters,
  filterOptions?: FilterOptions
): any[] {
  console.log('🔧 검색 결과 필터링:', {
    searchResultsCount: searchResults?.length || 0,
    filters: filters
  })
  
  const result = filterHotels(searchResults, filters, filterOptions)
  
  console.log('✅ 검색 결과 필터링 완료:', result.length)
  return result
}

/**
 * 체인/브랜드 페이지용 호텔 필터링
 * @param initialHotels 초기 호텔 목록 (서버에서 전달)
 * @param filters 필터 조건
 * @param filterOptions 필터 옵션
 * @returns 필터링된 호텔 목록
 */
export function filterInitialHotels(
  initialHotels: any[],
  filters: HotelFilters,
  filterOptions?: FilterOptions
): any[] {
  console.log('🔧 초기 호텔 필터링:', {
    initialHotelsCount: initialHotels.length,
    filters: filters,
    sampleHotel: initialHotels[0]
  })
  
  if (initialHotels.length === 0) return []
  
  const chainBrandIds = getChainBrandIds(filters.chain, filterOptions?.brands)
  
  if (filters.chain && chainBrandIds.length > 0) {
    console.log('⛓️ 체인 필터 활성:', {
      chainId: filters.chain,
      chainBrandIds: chainBrandIds.length
    })
  }
  
  const result = initialHotels.filter(hotel => {
    const passed = filterHotel(hotel, filters, chainBrandIds)
    
    if (!passed && filters.brand) {
      console.log('🔍 브랜드 필터 체크:', {
        호텔: hotel.property_name_ko,
        호텔brand_id: String(hotel.brand_id),
        필터brand: filters.brand,
        매칭여부: String(hotel.brand_id) === filters.brand
      })
    }
    
    return passed
  })
  
  console.log('✅ 초기 호텔 필터링 완료:', result.length)
  return result
}

/**
 * 전체 호텔 필터링
 * @param allHotels 전체 호텔 목록
 * @param filters 필터 조건
 * @param filterOptions 필터 옵션
 * @returns 필터링된 호텔 목록
 */
export function filterAllHotels(
  allHotels: any[],
  filters: HotelFilters,
  filterOptions?: FilterOptions
): any[] {
  console.log('🔧 전체 호텔 필터링:', {
    allHotelsCount: allHotels?.length || 0,
    filters: filters
  })
  
  if (!allHotels || allHotels.length === 0) {
    console.warn('⚠️ 전체 호텔 데이터가 비어있습니다')
    return []
  }
  
  const chainBrandIds = getChainBrandIds(filters.chain, filterOptions?.brands)
  
  const result = allHotels.filter(hotel => {
    // 필터가 하나라도 설정되어 있으면 필터링 적용
    if (!filters.city && !filters.country && !filters.brand && !filters.chain) {
      return true
    }
    
    return filterHotel(hotel, filters, chainBrandIds)
  })
  
  console.log('✅ 전체 호텔 필터링 완료:', result.length)
  return result
}


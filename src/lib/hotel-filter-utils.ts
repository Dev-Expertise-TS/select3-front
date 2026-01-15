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

function getHotelBrandIdStrings(hotel: any): string[] {
  return [hotel?.brand_id, hotel?.brand_id_2, hotel?.brand_id_3]
    .filter((id) => id !== null && id !== undefined && id !== '')
    .map((id) => String(id))
}

/**
 * 체인 필터를 위한 브랜드 ID 목록 생성
 * @param chainId 체인 ID
 * @param brands 브랜드 목록
 * @returns 해당 체인에 속한 브랜드 ID 목록
 */
export function getChainBrandIds(chainId: string, brands?: Array<{ id: string; chain_id?: string }>): string[] {
  if (!chainId || !brands) {
    console.log('⚠️ [체인 필터] chainId 또는 brands 없음:', { chainId, brandsCount: brands?.length || 0 })
    return []
  }
  
  const matchingBrands = brands.filter((b: any) => String(b.chain_id) === chainId)
  const brandIds = matchingBrands.map((b: any) => b.id)
  
  console.log('🔍 [체인 필터] 브랜드 ID 목록 생성:', {
    체인ID: chainId,
    전체브랜드수: brands.length,
    매칭된브랜드수: matchingBrands.length,
    브랜드ID목록: brandIds,
    매칭된브랜드샘플: matchingBrands.slice(0, 3).map((b: any) => ({ id: b.id, label: b.label, chain_id: b.chain_id }))
  })
  
  return brandIds
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
    const matched = hotel.city_code === filters.city
    
    // 디버깅: 매칭 실패 시 로그
    if (!matched && process.env.NODE_ENV === 'development') {
      console.log('🔍 [도시 필터 불일치]', {
        호텔명: hotel.property_name_ko,
        호텔city_code: hotel.city_code,
        필터city: filters.city,
        호텔city_ko: hotel.city_ko,
      })
    }
    
    if (!matched) {
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
  if (filters.chain) {
    if (chainBrandIds.length === 0) {
      console.warn('⚠️ [체인 필터] chainBrandIds가 비어있음 - chain_id가 brands 배열에 포함되어 있는지 확인 필요')
      return false
    }
    
    const hotelBrandIds = getHotelBrandIdStrings(hotel)
    const isMatch = hotelBrandIds.some((id) => chainBrandIds.includes(id))
    
    if (!isMatch && process.env.NODE_ENV === 'development') {
      console.log('🔍 [체인 필터 불일치]', {
        호텔명: hotel.property_name_ko,
        호텔brand_ids: hotelBrandIds,
        체인필터: filters.chain,
        허용된brand_ids: chainBrandIds.slice(0, 5),
        매칭여부: isMatch
      })
    }
    
    if (!isMatch) {
      return false
    }
  }
  
  // 브랜드 필터
  if (filters.brand) {
    const hotelBrandIds = getHotelBrandIdStrings(hotel)
    if (!hotelBrandIds.includes(filters.brand)) {
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
      const hotelBrandIds = getHotelBrandIdStrings(hotel)
      console.log('🔍 브랜드 필터 체크:', {
        호텔: hotel.property_name_ko,
        호텔brand_ids: hotelBrandIds,
        필터brand: filters.brand,
        매칭여부: hotelBrandIds.includes(filters.brand)
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
  
  // 도시 필터가 있을 때 호텔의 city_code 분포 확인
  if (filters.city && process.env.NODE_ENV === 'development') {
    const cityCodeDistribution = allHotels.reduce((acc: any, hotel: any) => {
      const code = hotel.city_code || 'null'
      acc[code] = (acc[code] || 0) + 1
      return acc
    }, {})
    console.log('📊 [도시 필터 디버깅] 전체 호텔의 city_code 분포:', cityCodeDistribution)
    console.log('🔍 [도시 필터 디버깅] 찾는 city_code:', filters.city)
    
    const matchingHotels = allHotels.filter((h: any) => h.city_code === filters.city)
    console.log('✅ [도시 필터 디버깅] 매칭되는 호텔 수:', matchingHotels.length)
    if (matchingHotels.length > 0) {
      console.log('📋 [도시 필터 디버깅] 매칭 호텔 샘플:', matchingHotels.slice(0, 3).map((h: any) => ({
        sabre_id: h.sabre_id,
        name: h.property_name_ko,
        city_code: h.city_code,
        city_ko: h.city_ko
      })))
    }
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


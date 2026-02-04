'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { getCompanyFromURL, isCompanyWithVccFilter } from '@/lib/company-filter'

const supabase = createClient()

interface FilterOption {
  id: string
  label: string
}

interface HotelFilterAllViewProps {
  onFiltersChange: (filters: {
    city?: string
    country?: string
    brand?: string
    chain?: string
  }) => void
  className?: string
}

export function HotelFilterAllView({ onFiltersChange, className }: HotelFilterAllViewProps) {
  const [filters, setFilters] = useState({
    city: '',
    country: '',
    brand: '',
    chain: ''
  })
  
  const [filterOptions, setFilterOptions] = useState({
    cities: [] as FilterOption[],
    countries: [] as FilterOption[],
    brands: [] as FilterOption[],
    chains: [] as FilterOption[]
  })
  
  const [isLoading, setIsLoading] = useState(true)

  // 필터 옵션 로드
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setIsLoading(true)
        
        const company = getCompanyFromURL()
        
        // 호텔 데이터 조회
        // company=sk일 때 vcc=TRUE 필터 적용
        let hotelQuery = supabase
          .from('select_hotels')
          .select('city, city_ko, city_en, country_ko, country_en, brand_id, brand_id_2, brand_id_3, chain_ko, chain_en, vcc')
          .or('publish.is.null,publish.eq.true')
        
        if (isCompanyWithVccFilter(company)) {
          hotelQuery = hotelQuery.eq('vcc', true)
        }
        
        const { data: hotels, error: hotelsError } = await hotelQuery
        
        if (hotelsError) throw hotelsError
        
        // 브랜드 데이터 조회
        const brandIds = Array.from(
          new Set(
            (hotels || []).flatMap((hotel: any) =>
              [hotel.brand_id, hotel.brand_id_2, hotel.brand_id_3].filter(
                (id: any) => id !== null && id !== undefined && id !== ''
              )
            )
          )
        )
        let brands = []
        if (brandIds.length > 0) {
          const { data: brandData } = await supabase
            .from('hotel_brands')
            .select('brand_id, brand_name_en, chain_id')
            .in('brand_id', brandIds)
          brands = brandData || []
        }
        
        // company=sk일 때 vcc=TRUE인 체인에 속한 브랜드만 필터링
        let vccChainIds: number[] = []
        if (isCompanyWithVccFilter(company) && brands.length > 0) {
          const chainIds = Array.from(new Set(brands.map((b: any) => b.chain_id).filter(Boolean)))
          if (chainIds.length > 0) {
            const { data: chainData } = await supabase
              .from('hotel_chains')
              .select('chain_id, vcc')
              .in('chain_id', chainIds)
              .eq('vcc', true)
            vccChainIds = (chainData || []).map((c: any) => c.chain_id)
            brands = brands.filter((b: any) => !b.chain_id || vccChainIds.includes(b.chain_id))
          }
        }
        
        // 도시 옵션 생성 (city_kr로 그룹핑 및 표시)
        const citySet = new Set<string>()
        hotels?.forEach((hotel: any) => {
          const cityKr = hotel.city_kr || hotel.city_ko || hotel.city || hotel.city_en
          if (cityKr) {
            citySet.add(cityKr)
          }
        })
        const cities = Array.from(citySet).map(cityKr => ({
          id: cityKr,
          label: cityKr
        })).sort((a: any, b: any) => a.label.localeCompare(b.label, 'ko'))
        
        // 국가 옵션 생성 (country_kr로 그룹핑 및 표시)
        const countrySet = new Set<string>()
        hotels?.forEach((hotel: any) => {
          const countryKr = hotel.country_kr || hotel.country_ko || hotel.country_en
          if (countryKr) {
            countrySet.add(countryKr)
          }
        })
        const countries = Array.from(countrySet).map(countryKr => ({
          id: countryKr,
          label: countryKr
        })).sort((a: any, b: any) => a.label.localeCompare(b.label, 'ko'))
        
        // 브랜드 옵션 생성
        const brandMap = new Map()
        hotels?.forEach((hotel: any) => {
          const hotelBrandIds = [hotel.brand_id, hotel.brand_id_2, hotel.brand_id_3].filter(
            (id: any) => id !== null && id !== undefined && id !== ''
          )
          hotelBrandIds.forEach((brandId: any) => {
            const brand = brands.find((b: any) => String(b.brand_id) === String(brandId))
            if (brand) {
              const brandName = brand.brand_name_en
              brandMap.set(brandName, (brandMap.get(brandName) || 0) + 1)
            }
          })
        })
        const brandOptions = Array.from(brandMap.entries()).map(([label, count]) => ({
          id: label,
          label
        })).sort((a: any, b: any) => a.label.localeCompare(b.label))
        
        // 체인 옵션 생성
        // company=sk일 때는 vcc=TRUE인 체인만 표시
        let chains: Array<{ id: string; label: string }> = []
        if (isCompanyWithVccFilter(company)) {
          // vcc=TRUE인 체인만 조회
          const chainIds = Array.from(new Set(brands.map((b: any) => b.chain_id).filter(Boolean)))
          if (chainIds.length > 0) {
            const { data: chainData } = await supabase
              .from('hotel_chains')
              .select('chain_id, chain_name_en, chain_name_ko, chain_sort_order, vcc')
              .in('chain_id', chainIds)
              .eq('vcc', true)
              .eq('status', 'active')
            
            chains = (chainData || []).map((c: any) => ({
              id: String(c.chain_id),
              label: c.chain_name_en || c.chain_name_ko || '',
              sort_order: c.chain_sort_order || 9999
            })).sort((a: any, b: any) => a.sort_order - b.sort_order)
          }
        } else {
          // 일반적인 경우: 호텔 데이터에서 체인 추출
          const chainMap = new Map()
          hotels?.forEach((hotel: any) => {
            const chain = hotel.chain_ko || hotel.chain_en
            if (chain) {
              chainMap.set(chain, (chainMap.get(chain) || 0) + 1)
            }
          })
          chains = Array.from(chainMap.entries()).map(([label, count]) => ({
            id: label,
            label
          })).sort((a: any, b: any) => a.label.localeCompare(b.label))
        }
        
        setFilterOptions({
          cities: cities.slice(0, 20), // 상위 20개만
          countries: countries.slice(0, 20),
          brands: brandOptions.slice(0, 20),
          chains: chains.slice(0, 20)
        })
        
      } catch (error) {
        console.error('필터 옵션 로드 오류:', error instanceof Error ? error.message : String(error))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadFilterOptions()
  }, [])

  // 필터 변경 핸들러
  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [type]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  // 필터 초기화
  const resetFilters = () => {
    const emptyFilters = { city: '', country: '', brand: '', chain: '' }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  if (isLoading) {
    return (
      <div className={cn("bg-white border border-gray-200 rounded-lg p-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">필터 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">필터</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          초기화
        </button>
      </div>
      
      <div className="space-y-4">
        {/* 도시 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">도시</label>
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">전체</option>
            {filterOptions.cities.map(city => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* 국가 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">국가</label>
          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">전체</option>
            {filterOptions.countries.map(country => (
              <option key={country.id} value={country.id}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* 브랜드 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
          <select
            value={filters.brand}
            onChange={(e) => {
              const value = e.target.value
              if (typeof window !== 'undefined' && (window as any).dataLayer) {
                ;(window as any).dataLayer.push({
                  event: 'select_brand',
                  event_category: 'filter',
                  event_label: (() => {
                    const b = filterOptions.brands.find((br: any) => String(br.id) === String(value))
                    return b?.label || value
                  })(),
                  brand_id: value || 'all',
                  chain_id: undefined,
                  timestamp: new Date().toISOString(),
                })
              }
              handleFilterChange('brand', value)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">전체</option>
            {filterOptions.brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* 체인 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">체인</label>
          <select
            value={filters.chain}
            onChange={(e) => handleFilterChange('chain', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">전체</option>
            {filterOptions.chains.map(chain => (
              <option key={chain.id} value={chain.id}>
                {chain.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

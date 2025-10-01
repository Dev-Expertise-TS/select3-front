"use client"

import { useState, useEffect } from 'react'
import { HotelFilter } from './hotel-filter'

interface Chain {
  chain_id: number
  chain_name_kr?: string
  chain_name_en?: string
  slug: string
}

interface FilterOptions {
  countries: Array<{ id: string; label: string; count: number }>
  cities: Array<{ id: string; label: string; count: number }>
}

interface HotelFilterSectionProps {
  // 체인 페이지용 props
  allChains?: Chain[]
  currentChainName?: string
  onChainChange?: (slug: string) => void
  
  // 브랜드 선택용 props
  selectedChainBrands?: Array<{brand_id: number, brand_name_en: string, brand_name_kr?: string}>
  selectedBrandId?: string | null
  selectedChainId?: string | null
  onBrandChange?: (brandId: string) => void
  
  // 일반 필터 props
  filterOptions?: FilterOptions
  chainFilterOptions: FilterOptions
  initialHotels: any[]
  
  // 선택된 필터 값들
  selectedCountries: string[]
  selectedCities: string[]
  
  // 필터 변경 핸들러들
  onCountryChange: (countries: string[]) => void
  onCityChange: (cities: string[]) => void
  onClearAllFilters: () => void
  
  className?: string
}

export function HotelFilterSection({
  allChains = [],
  currentChainName = "",
  onChainChange,
  selectedChainBrands = [],
  selectedBrandId = null,
  selectedChainId = null,
  onBrandChange,
  filterOptions,
  chainFilterOptions,
  initialHotels,
  selectedCountries,
  selectedCities,
  onCountryChange,
  onCityChange,
  onClearAllFilters,
  className
}: HotelFilterSectionProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])
  return (
    <div className={`lg:col-span-1 ${className || ''}`}>
      {/* 체인 페이지용 체인 선택 필터 - 체인이 있으면 항상 표시 */}
      {allChains && allChains.length > 0 && (
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
                value={selectedChainId || ""}
                onChange={(e) => {
                  if (e.target.value && onChainChange) {
                    onChainChange(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
              >
                <option value="">체인 선택</option>
                {allChains
                  .filter(chain => chain.slug !== '')
                  .sort((a, b) => (a.chain_name_en || a.chain_name_kr || '').localeCompare(b.chain_name_en || b.chain_name_kr || ''))
                  .map((chain) => (
                    <option key={chain.chain_id} value={String(chain.chain_id)}>
                      {chain.chain_name_en || chain.chain_name_kr}
                    </option>
                  ))}
              </select>
              
              {/* 브랜드 선택 드롭다운 - 클라이언트에서만 렌더링 */}
              {isClient && selectedChainBrands.length > 0 && onBrandChange && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    브랜드 선택
                  </label>
                  <select
                    value={selectedBrandId || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        onBrandChange(e.target.value)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors"
                  >
                    <option value="">브랜드 선택</option>
                    {selectedChainBrands
                      .sort((a, b) => (a.brand_name_en || a.brand_name_kr || '').localeCompare(b.brand_name_en || b.brand_name_kr || ''))
                      .map((brand) => (
                        <option key={brand.brand_id} value={String(brand.brand_id)}>
                          {brand.brand_name_en || brand.brand_name_kr}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 일반 필터 */}
      {(filterOptions || chainFilterOptions.countries.length > 0) && (
        <HotelFilter
          countries={initialHotels.length > 0 ? chainFilterOptions.countries : (filterOptions?.countries || [])}
          cities={initialHotels.length > 0 ? chainFilterOptions.cities : (filterOptions?.cities || [])}
          selectedCountries={selectedCountries}
          selectedCities={selectedCities}
          onCountryChange={onCountryChange}
          onCityChange={onCityChange}
          onClearAll={onClearAllFilters}
        />
      )}
    </div>
  )
}

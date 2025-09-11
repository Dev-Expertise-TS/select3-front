"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface HotelFilterProps {
  countries: FilterOption[]
  cities: FilterOption[]
  brands: FilterOption[]
  chains: FilterOption[]
  selectedCountries: string[]
  selectedCities: string[]
  selectedBrands: string[]
  selectedChains: string[]
  onCountryChange: (countries: string[]) => void
  onCityChange: (cities: string[]) => void
  onBrandChange: (brands: string[]) => void
  onChainChange: (chains: string[]) => void
  onClearAll: () => void
  className?: string
}

export function HotelFilter({
  countries,
  cities,
  brands,
  chains,
  selectedCountries,
  selectedCities,
  selectedBrands,
  selectedChains,
  onCountryChange,
  onCityChange,
  onBrandChange,
  onChainChange,
  onClearAll,
  className
}: HotelFilterProps) {
  const [searchCountry, setSearchCountry] = useState("")
  const [searchCity, setSearchCity] = useState("")
  const [searchBrand, setSearchBrand] = useState("")
  const [searchChain, setSearchChain] = useState("")

  const filteredCountries = countries.filter(country =>
    country.label.toLowerCase().includes(searchCountry.toLowerCase())
  )

  const filteredCities = cities.filter(city =>
    city.label.toLowerCase().includes(searchCity.toLowerCase())
  )

  const filteredBrands = brands.filter(brand =>
    brand.label.toLowerCase().includes(searchBrand.toLowerCase())
  )

  const filteredChains = chains.filter(chain =>
    chain.label.toLowerCase().includes(searchChain.toLowerCase())
  )

  const handleCountryToggle = (countryId: string) => {
    if (selectedCountries.includes(countryId)) {
      onCountryChange(selectedCountries.filter(id => id !== countryId))
    } else {
      onCountryChange([...selectedCountries, countryId])
    }
  }

  const handleCityToggle = (cityId: string) => {
    if (selectedCities.includes(cityId)) {
      onCityChange(selectedCities.filter(id => id !== cityId))
    } else {
      onCityChange([...selectedCities, cityId])
    }
  }

  const handleBrandToggle = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter(id => id !== brandId))
    } else {
      onBrandChange([...selectedBrands, brandId])
    }
  }

  const handleChainToggle = (chainId: string) => {
    if (selectedChains.includes(chainId)) {
      onChainChange(selectedChains.filter(id => id !== chainId))
    } else {
      onChainChange([...selectedChains, chainId])
    }
  }

  const hasActiveFilters = selectedCountries.length > 0 || selectedCities.length > 0 || selectedBrands.length > 0 || selectedChains.length > 0

  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">필터</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-gray-600 hover:text-gray-900"
          >
            전체 해제
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* 국가 필터 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">국가</h4>
          <div className="space-y-2">
            <Input
              placeholder="국가 검색..."
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountryToggle(country.id)}
                  className={cn(
                    "w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors",
                    selectedCountries.includes(country.id) && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{country.label}</span>
                    {country.count && (
                      <Badge variant="secondary" className="text-xs">
                        {country.count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 도시 필터 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">도시</h4>
          <div className="space-y-2">
            <Input
              placeholder="도시 검색..."
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCityToggle(city.id)}
                  className={cn(
                    "w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors",
                    selectedCities.includes(city.id) && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{city.label}</span>
                    {city.count && (
                      <Badge variant="secondary" className="text-xs">
                        {city.count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 호텔 브랜드 필터 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">호텔 브랜드</h4>
          <div className="space-y-2">
            <Input
              placeholder="브랜드 검색..."
              value={searchBrand}
              onChange={(e) => setSearchBrand(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleBrandToggle(brand.id)}
                  className={cn(
                    "w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors",
                    selectedBrands.includes(brand.id) && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{brand.label}</span>
                    {brand.count && (
                      <Badge variant="secondary" className="text-xs">
                        {brand.count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 호텔 체인 필터 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">호텔 체인</h4>
          <div className="space-y-2">
            <Input
              placeholder="체인 검색..."
              value={searchChain}
              onChange={(e) => setSearchChain(e.target.value)}
              className="h-8 text-sm"
            />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleChainToggle(chain.id)}
                  className={cn(
                    "w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors",
                    selectedChains.includes(chain.id) && "bg-blue-50 text-blue-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{chain.label}</span>
                    {chain.count && (
                      <Badge variant="secondary" className="text-xs">
                        {chain.count}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 선택된 필터 표시 */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {selectedCountries.map((countryId) => {
              const country = countries.find(c => c.id === countryId)
              return country ? (
                <Badge
                  key={countryId}
                  variant="default"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {country.label}
                  <button
                    onClick={() => handleCountryToggle(countryId)}
                    className="ml-1 hover:text-blue-600"
                  >
                    ×
                  </button>
                </Badge>
              ) : null
            })}
            {selectedCities.map((cityId) => {
              const city = cities.find(c => c.id === cityId)
              return city ? (
                <Badge
                  key={cityId}
                  variant="default"
                  className="bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {city.label}
                  <button
                    onClick={() => handleCityToggle(cityId)}
                    className="ml-1 hover:text-green-600"
                  >
                    ×
                  </button>
                </Badge>
              ) : null
            })}
            {selectedBrands.map((brandId) => {
              const brand = brands.find(b => b.id === brandId)
              return brand ? (
                <Badge
                  key={brandId}
                  variant="default"
                  className="bg-purple-100 text-purple-800 hover:bg-purple-200"
                >
                  {brand.label}
                  <button
                    onClick={() => handleBrandToggle(brandId)}
                    className="ml-1 hover:text-purple-600"
                  >
                    ×
                  </button>
                </Badge>
              ) : null
            })}
            {selectedChains.map((chainId) => {
              const chain = chains.find(c => c.id === chainId)
              return chain ? (
                <Badge
                  key={chainId}
                  variant="default"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                >
                  {chain.label}
                  <button
                    onClick={() => handleChainToggle(chainId)}
                    className="ml-1 hover:text-orange-600"
                  >
                    ×
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
    </Card>
  )
}

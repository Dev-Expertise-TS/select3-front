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
  selectedCountries: string[]
  selectedCities: string[]
  onCountryChange: (countries: string[]) => void
  onCityChange: (cities: string[]) => void
  onClearAll: () => void
  className?: string
}

export function HotelFilter({
  countries,
  cities,
  selectedCountries,
  selectedCities,
  onCountryChange,
  onCityChange,
  onClearAll,
  className
}: HotelFilterProps) {
  const [searchCountry, setSearchCountry] = useState("")
  const [searchCity, setSearchCity] = useState("")

  const filteredCountries = (countries || []).filter(country =>
    country.label.toLowerCase().includes(searchCountry.toLowerCase())
  )

  const filteredCities = (cities || []).filter(city =>
    city.label.toLowerCase().includes(searchCity.toLowerCase())
  )

  const handleCountryToggle = (countryId: string) => {
    if ((selectedCountries || []).includes(countryId)) {
      onCountryChange((selectedCountries || []).filter(id => id !== countryId))
    } else {
      onCountryChange([...(selectedCountries || []), countryId])
    }
  }

  const handleCityToggle = (cityId: string) => {
    if ((selectedCities || []).includes(cityId)) {
      onCityChange((selectedCities || []).filter(id => id !== cityId))
    } else {
      onCityChange([...(selectedCities || []), cityId])
    }
  }


  const hasActiveFilters = (selectedCountries || []).length > 0 || (selectedCities || []).length > 0

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
          </div>
        </div>
      )}
    </Card>
  )
}

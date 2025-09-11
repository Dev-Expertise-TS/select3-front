"use client"

import { useState } from "react"
import { HotelFilter } from "./hotel-filter"
import { useHotelChains } from "@/hooks/use-hotel-chains"
import { FilterOption } from "@/types/hotel-filter"

// 예시 데이터 (실제로는 API에서 가져와야 함)
const mockCountries: FilterOption[] = [
  { id: "korea", label: "대한민국", count: 15 },
  { id: "japan", label: "일본", count: 8 },
  { id: "singapore", label: "싱가포르", count: 5 }
]

const mockCities: FilterOption[] = [
  { id: "seoul", label: "서울", count: 10 },
  { id: "tokyo", label: "도쿄", count: 6 },
  { id: "singapore", label: "싱가포르", count: 5 }
]

const mockBrands: FilterOption[] = [
  { id: "marriott", label: "마리오트", count: 12 },
  { id: "hyatt", label: "하이얏", count: 8 },
  { id: "hilton", label: "힐튼", count: 6 }
]

export function HotelFilterExample() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedChains, setSelectedChains] = useState<string[]>([])

  const { data: chainsData = [], isLoading: chainsLoading } = useHotelChains()

  // API 데이터를 FilterOption 형태로 변환
  const chains: FilterOption[] = chainsData.map(chain => ({
    id: chain.chain_id.toString(),
    label: chain.chain_name_kr || chain.chain_name_en,
    count: chain.count
  }))

  const handleClearAll = () => {
    setSelectedCountries([])
    setSelectedCities([])
    setSelectedBrands([])
    setSelectedChains([])
  }

  if (chainsLoading) {
    return <div>체인 데이터를 불러오는 중...</div>
  }

  return (
    <div className="w-80">
      <HotelFilter
        countries={mockCountries}
        cities={mockCities}
        brands={mockBrands}
        chains={chains}
        selectedCountries={selectedCountries}
        selectedCities={selectedCities}
        selectedBrands={selectedBrands}
        selectedChains={selectedChains}
        onCountryChange={setSelectedCountries}
        onCityChange={setSelectedCities}
        onBrandChange={setSelectedBrands}
        onChainChange={setSelectedChains}
        onClearAll={handleClearAll}
      />
    </div>
  )
}

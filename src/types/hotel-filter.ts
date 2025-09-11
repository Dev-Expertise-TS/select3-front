export interface FilterOption {
  id: string
  label: string
  count?: number
}

export interface HotelChainFilter {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string | null
  count: number
}

export interface HotelFilterState {
  selectedCountries: string[]
  selectedCities: string[]
  selectedBrands: string[]
  selectedChains: string[]
}

export interface HotelFilterData {
  countries: FilterOption[]
  cities: FilterOption[]
  brands: FilterOption[]
  chains: FilterOption[]
}

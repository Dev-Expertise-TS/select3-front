'use client'

import { useRouter } from "next/navigation"
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

interface ChainPageClientProps {
  chainRow: {
    chain_name_en: string
    chain_name_kr?: string
  }
  transformedHotels: any[]
  allChains: Array<{ chain_id: number; chain_name_en: string; chain_name_kr?: string; slug: string }>
  selectedChainBrands: Array<{ brand_id: number; brand_name_en: string; brand_name_kr?: string }>
  serverFilterOptions: {
    countries: Array<{ id: string; label: string; count: number }>
    cities: Array<{ id: string; label: string; count: number }>
    brands: Array<{ id: string; label: string; count: number }>
  }
}

export function ChainPageClient({ 
  chainRow, 
  transformedHotels, 
  allChains, 
  selectedChainBrands,
  serverFilterOptions
}: ChainPageClientProps) {
  const router = useRouter()

  // 체인 변경 핸들러
  const handleChainChange = (chainSlug: string) => {
    router.push(`/chain/${chainSlug}`)
  }

  return (
    <HotelSearchResults
      title={chainRow.chain_name_en}
      subtitle={`${transformedHotels.length}개의 ${chainRow.chain_name_en} 체인 브랜드를 만나보세요`}
      showAllHotels={true}
      hideSearchBar={true}
      showFilters={true}
      initialHotels={transformedHotels}
      allChains={allChains}
      selectedChainBrands={selectedChainBrands}
      currentChainName={chainRow.chain_name_kr || chainRow.chain_name_en}
      onChainChange={handleChainChange}
      serverFilterOptions={serverFilterOptions}
    />
  )
}

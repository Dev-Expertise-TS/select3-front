'use client'

import { useRouter } from "next/navigation"
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

interface ChainPageClientProps {
  chainRow: {
    chain_id: number
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
    chains: Array<{ id: string; label: string; count: number }>
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

  // 체인 변경 핸들러 - 고정된 페이지로 이동
  const handleChainChange = (chainId: string) => {
    router.push(`/brand/brand?chain=${chainId}`)
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
      currentChainName={chainRow.chain_name_en || chainRow.chain_name_kr}
      currentChainId={String(chainRow.chain_id)}
      onChainChange={handleChainChange}
      serverFilterOptions={serverFilterOptions}
      // 아티클 섹션 표시
      showArticles={true}
      articlesChainId={String(chainRow.chain_id)}
      articlesChainName={chainRow.chain_name_en}
    />
  )
}

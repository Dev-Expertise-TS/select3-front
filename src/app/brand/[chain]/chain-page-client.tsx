'use client'

import { useRouter } from "next/navigation"
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

interface ChainPageClientProps {
  chainRow: {
    chain_id: number
    chain_name_en: string
    chain_name_ko?: string
  }
  transformedHotels: any[]
  allChains: Array<{ chain_id: number; chain_name_en: string; chain_name_ko?: string; slug: string }>
  selectedChainBrands: Array<{ brand_id: number; brand_name_en: string; brand_name_ko?: string }>
  initialBrandId?: string | null
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
  initialBrandId,
  serverFilterOptions
}: ChainPageClientProps) {
  const router = useRouter()

  console.log(`[ Client ] ChainPageClient 렌더링:`, {
    chainName: chainRow.chain_name_en,
    hotelsCount: transformedHotels.length,
    hotel991: transformedHotels.find(h => h.sabre_id === 991) ? 'EXISTS' : 'NOT FOUND',
    hotel99999: transformedHotels.find(h => h.sabre_id === 99999) ? 'EXISTS' : 'NOT FOUND',
    sampleHotels: transformedHotels.slice(0, 2).map(h => ({ 
      sabre_id: h.sabre_id, 
      property_name_ko: h.property_name_ko, 
      image: h.image 
    }))
  })

  // 체인 변경 핸들러 - 해당 체인 페이지로 이동
  const handleChainChange = (chainId: string) => {
    const selectedChain = allChains.find(chain => String(chain.chain_id) === chainId)
    if (selectedChain?.slug) {
      router.push(`/brand/${selectedChain.slug}`)
    } else {
      router.push(`/brand/brand?chain=${chainId}`)
    }
  }

  // 브랜드 변경 핸들러 - 해당 브랜드의 체인 페이지로 이동 (브랜드 선택 상태 유지)
  const handleBrandChange = (brandId: string, chainId: string) => {
    // 해당 체인의 slug 찾기
    const selectedChain = allChains.find(chain => String(chain.chain_id) === chainId)
    if (selectedChain?.slug) {
      router.push(`/brand/${selectedChain.slug}?brand=${brandId}`)
    } else {
      router.push(`/brand/brand?chain=${chainId}&brand=${brandId}`)
    }
  }

  // 체인의 첫 번째 브랜드를 기본 선택 (URL 파라미터가 없는 경우)
  const defaultBrandId = selectedChainBrands.length > 0 ? String(selectedChainBrands[0].brand_id) : null

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
      currentChainName={chainRow.chain_name_en || chainRow.chain_name_ko}
      currentChainId={String(chainRow.chain_id)} // 체인 필터 자동 선택을 위해 전달
      initialBrandId={initialBrandId} // URL 파라미터에서 가져온 브랜드 ID
      onChainChange={handleChainChange}
      onBrandChange={handleBrandChange}
      serverFilterOptions={serverFilterOptions}
      // 아티클 섹션 표시
      showArticles={true}
      articlesChainId={String(chainRow.chain_id)}
      articlesChainName={chainRow.chain_name_en}
    />
  )
}

'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

interface ChainBrandPageClientProps {
  allChains: Array<{ chain_id: number; chain_name_en: string; chain_name_ko?: string; chain_slug: string }>
  allBrands: Array<{ brand_id: number; brand_name_en: string; brand_name_ko?: string; chain_id: number }>
}

export function ChainBrandPageClient({ 
  allChains, 
  allBrands 
}: ChainBrandPageClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const chainParam = searchParams.get('chain')
  const brandParam = searchParams.get('brand')
  
  const [selectedChainId, setSelectedChainId] = useState<string | null>(chainParam)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(brandParam)

  // URL 파라미터 변경 시 상태 업데이트
  useEffect(() => {
    setSelectedChainId(chainParam)
    setSelectedBrandId(brandParam)
  }, [chainParam, brandParam])

  // URL 업데이트 함수
  const updateURL = (chainId: string | null, brandId: string | null) => {
    const params = new URLSearchParams()
    if (chainId) params.set('chain', chainId)
    if (brandId) params.set('brand', brandId)
    
    const newURL = params.toString() 
      ? `/brand/brand?${params.toString()}`
      : '/brand/brand'
    
    router.push(newURL)
  }

  // 체인 변경 핸들러
  const handleChainChange = (chainId: string) => {
    setSelectedChainId(chainId)
    setSelectedBrandId(null) // 체인 변경 시 브랜드 선택 초기화
    updateURL(chainId, null)
  }

  // 브랜드 변경 핸들러
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId)
    setSelectedChainId(null) // 브랜드 변경 시 체인 선택 초기화
    updateURL(null, brandId)
  }

  // 선택된 체인의 브랜드들 필터링
  const selectedChainBrands = selectedChainId 
    ? allBrands.filter(brand => brand.chain_id === parseInt(selectedChainId))
    : []

  // 현재 선택된 체인 이름 (영문)
  const currentChainName = selectedChainId 
    ? allChains.find(chain => chain.chain_id === parseInt(selectedChainId))?.chain_name_en || 
      allChains.find(chain => chain.chain_id === parseInt(selectedChainId))?.chain_name_kr || 
      ""
    : ""

  return (
    <HotelSearchResults
      title="체인 & 브랜드별 호텔 검색"
      subtitle="원하는 체인이나 브랜드를 선택하여 호텔을 찾아보세요"
      showAllHotels={true}
      hideSearchBar={true}
      showFilters={true}
      hidePromotionBanner={true}  // 브랜드 하위 페이지에서 프로모션 배너 숨김
      initialHotels={[]}
      allChains={allChains}
      selectedChainBrands={selectedChainBrands}
      currentChainName={currentChainName}
      currentChainId={selectedChainId}
      onChainChange={handleChainChange}
      initialBrandId={selectedBrandId}
      onBrandChange={handleBrandChange}
      serverFilterOptions={{
        countries: [], // API에서 전체 국가 목록을 가져오도록 빈 배열
        cities: [], // API에서 전체 도시 목록을 가져오도록 빈 배열
        brands: [], // API에서 전체 브랜드 목록을 가져오도록 빈 배열 (체인명 포함 형식)
        chains: [] // API에서 전체 체인 목록을 가져오도록 빈 배열
      }}
    />
  )
}

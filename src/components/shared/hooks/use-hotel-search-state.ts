"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"

// Hotel search state management hook
export function useHotelSearchState(initialFilters?: {
  countries?: string[]
  cities?: string[]
  brands?: string[]
  chains?: string[]
}) {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ""
  const checkInParam = searchParams.get('checkIn') || ""
  const checkOutParam = searchParams.get('checkOut') || ""
  
  const [searchQuery, setSearchQuery] = useState(query)
  const [refreshTick, setRefreshTick] = useState(0)
  const [displayCount, setDisplayCount] = useState(12)
  const [selectedChainId, setSelectedChainId] = useState<string | null>(
    initialFilters?.chains?.[0] || null
  )
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(
    initialFilters?.brands?.[0] || null
  )
  const [showAllInsteadOfInitial, setShowAllInsteadOfInitial] = useState(false)
  
  // 필터 상태 관리 (초기값 설정)
  const [filters, setFilters] = useState({
    city: initialFilters?.cities?.[0] || '',
    country: initialFilters?.countries?.[0] || '',
    brand: initialFilters?.brands?.[0] || '',
    chain: initialFilters?.chains?.[0] || ''
  })
  
  // 필터 업데이트 함수
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])
  
  // 필터 초기화 함수
  const resetFilters = useCallback(() => {
    setFilters({
      city: '',
      country: '',
      brand: '',
      chain: ''
    })
    setSelectedBrandId(null)
    setSelectedChainId(null)
    setShowAllInsteadOfInitial(false)
  }, [])
  
  // 검색 쿼리 업데이트 함수
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
    setRefreshTick(prev => prev + 1)
  }, [])
  
  // 표시 개수 증가 함수
  const loadMore = useCallback(() => {
    setDisplayCount(prev => prev + 12)
  }, [])
  
  // 표시 개수 초기화/설정 함수
  const setDisplayCountSafe = useCallback((count: number) => {
    setDisplayCount(count)
  }, [])
  
  // 체인 변경 함수
  const handleChainChange = useCallback((chainId: string) => {
    setSelectedChainId(chainId)
    setSelectedBrandId(null) // 체인 변경 시 브랜드 초기화
    updateFilters({ chain: chainId, brand: '' })
  }, [updateFilters])
  
  // 브랜드 변경 함수
  const handleBrandChange = useCallback((brandId: string, chainId: string) => {
    setSelectedBrandId(brandId)
    setSelectedChainId(chainId)
    updateFilters({ brand: brandId, chain: chainId })
  }, [updateFilters])
  
  return {
    // 상태
    searchQuery,
    refreshTick,
    displayCount,
    selectedChainId,
    selectedBrandId,
    showAllInsteadOfInitial,
    filters,
    query,
    checkInParam,
    checkOutParam,
    
    // 함수
    updateFilters,
    resetFilters,
    updateSearchQuery,
    loadMore,
    setDisplayCount: setDisplayCountSafe,
    handleChainChange,
    handleBrandChange,
    setSelectedChainId,
    setSelectedBrandId,
    setShowAllInsteadOfInitial
  }
}

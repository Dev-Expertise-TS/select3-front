"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"

// Hotel search UI state management hook
export function useHotelSearchUI() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'price'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  
  // 필터 토글 함수
  const toggleFilter = useCallback(() => {
    setIsFilterOpen(prev => !prev)
  }, [])
  
  // 정렬 토글 함수
  const toggleSort = useCallback(() => {
    setIsSortOpen(prev => !prev)
  }, [])
  
  // 정렬 변경 함수
  const changeSort = useCallback((newSortBy: typeof sortBy, newSortOrder?: typeof sortOrder) => {
    setSortBy(newSortBy)
    if (newSortOrder) {
      setSortOrder(newSortOrder)
    } else {
      // 같은 정렬 기준이면 순서만 변경
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    }
  }, [])
  
  // 뷰 모드 변경 함수
  const changeViewMode = useCallback((mode: typeof viewMode) => {
    setViewMode(mode)
  }, [])
  
  // 더보기 로딩 상태 관리
  const setLoadingMore = useCallback((loading: boolean) => {
    setIsLoadingMore(loading)
  }, [])
  
  // 정렬된 데이터 반환
  const getSortedData = useCallback((data: any[]) => {
    if (!data || data.length === 0) return data
    
    return [...data].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          const nameA = a.name_ko || a.name_en || ''
          const nameB = b.name_ko || b.name_en || ''
          comparison = nameA.localeCompare(nameB, 'ko')
          break
          
        case 'rating':
          const ratingA = a.star_rating || 0
          const ratingB = b.star_rating || 0
          comparison = ratingA - ratingB
          break
          
        case 'price':
          // 가격 정렬은 실제 가격 데이터가 있을 때 구현
          comparison = 0
          break
          
        default:
          comparison = 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [sortBy, sortOrder])
  
  // 필터링된 데이터 반환
  const getFilteredData = useCallback((data: any[], filters: any) => {
    if (!data || data.length === 0) return data
    
    return data.filter(hotel => {
      // 도시 필터
      if (filters.city && !hotel.city_ko?.includes(filters.city) && !hotel.city_en?.includes(filters.city)) {
        return false
      }
      
      // 국가 필터
      if (filters.country && !hotel.country_ko?.includes(filters.country) && !hotel.country_en?.includes(filters.country)) {
        return false
      }
      
      // 브랜드 필터
      if (filters.brand && hotel.brand_id?.toString() !== filters.brand) {
        return false
      }
      
      // 체인 필터
      if (filters.chain && hotel.chain_id?.toString() !== filters.chain) {
        return false
      }
      
      return true
    })
  }, [])
  
  return {
    // 상태
    isFilterOpen,
    isSortOpen,
    sortBy,
    sortOrder,
    viewMode,
    isLoadingMore,
    
    // 함수
    toggleFilter,
    toggleSort,
    changeSort,
    changeViewMode,
    setLoadingMore,
    getSortedData,
    getFilteredData
  }
}

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

// Hotel search data management hook
export function useHotelSearchData() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 검색 결과 데이터 조회
  const searchHotels = useCallback(async (query: string, filters: any) => {
    if (!query.trim()) return []
    
    setIsLoading(true)
    setError(null)
    
    try {
      let supabaseQuery = supabase
        .from('select_hotels')
        .select(`
          *,
          hotel_brands!inner(*),
          hotel_chains!inner(*)
        `)
        .eq('is_active', true)
      
      // 검색어 필터링 (한국어/영어 이름, 도시, 국가)
      supabaseQuery = supabaseQuery.or(`
        name_ko.ilike.%${query}%,
        name_en.ilike.%${query}%,
        city_ko.ilike.%${query}%,
        city_en.ilike.%${query}%,
        country_ko.ilike.%${query}%,
        country_en.ilike.%${query}%
      `)
      
      // 추가 필터 적용
      if (filters.city) {
        supabaseQuery = supabaseQuery.or(`city_ko.ilike.%${filters.city}%,city_en.ilike.%${filters.city}%`)
      }
      
      if (filters.country) {
        supabaseQuery = supabaseQuery.or(`country_ko.ilike.%${filters.country}%,country_en.ilike.%${filters.country}%`)
      }
      
      if (filters.brand) {
        supabaseQuery = supabaseQuery.eq('brand_id', filters.brand)
      }
      
      if (filters.chain) {
        supabaseQuery = supabaseQuery.eq('chain_id', filters.chain)
      }
      
      const { data, error: queryError } = await supabaseQuery
        .order('name_ko', { ascending: true })
        .limit(100)
      
      if (queryError) {
        throw queryError
      }
      
      return data || []
    } catch (err) {
      console.error('호텔 검색 오류:', err instanceof Error ? err.message : String(err))
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // 모든 호텔 데이터 조회
  const getAllHotels = useCallback(async (filters: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let supabaseQuery = supabase
        .from('select_hotels')
        .select(`
          *,
          hotel_brands!inner(*),
          hotel_chains!inner(*)
        `)
        .eq('is_active', true)
      
      // 필터 적용
      if (filters.city) {
        supabaseQuery = supabaseQuery.or(`city_ko.ilike.%${filters.city}%,city_en.ilike.%${filters.city}%`)
      }
      
      if (filters.country) {
        supabaseQuery = supabaseQuery.or(`country_ko.ilike.%${filters.country}%,country_en.ilike.%${filters.country}%`)
      }
      
      if (filters.brand) {
        supabaseQuery = supabaseQuery.eq('brand_id', filters.brand)
      }
      
      if (filters.chain) {
        supabaseQuery = supabaseQuery.eq('chain_id', filters.chain)
      }
      
      const { data, error: queryError } = await supabaseQuery
        .order('name_ko', { ascending: true })
        .limit(500)
      
      if (queryError) {
        throw queryError
      }
      
      return data || []
    } catch (err) {
      console.error('호텔 데이터 조회 오류:', err instanceof Error ? err.message : String(err))
      setError(err instanceof Error ? err.message : '데이터 조회 중 오류가 발생했습니다.')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // 필터 옵션 데이터 조회
  const getFilterOptions = useCallback(async () => {
    try {
      const [countriesResult, citiesResult, brandsResult, chainsResult] = await Promise.all([
        supabase
          .from('select_hotels')
          .select('country_ko, country_en, country')
          .eq('is_active', true)
          .not('country_ko', 'is', null),
        
        supabase
          .from('select_hotels')
          .select('city_ko, city_en, city')
          .eq('is_active', true)
          .not('city_ko', 'is', null),
        
        supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_ko, brand_name_en')
          .eq('is_active', true),
        
        supabase
          .from('hotel_chains')
          .select('chain_id, chain_name_ko, chain_name_en, chain_sort_order')
          .eq('is_active', true)
      ])
      
      // 국가 옵션 생성
      const countries = Array.from(
        new Set([
          ...(countriesResult.data || []).map(h => h.country_ko).filter(Boolean),
          ...(countriesResult.data || []).map(h => h.country_en).filter(Boolean),
          ...(countriesResult.data || []).map(h => h.country).filter(Boolean)
        ])
      ).map(country => ({
        id: country,
        label: country,
        count: (countriesResult.data || []).filter(h => 
          h.country_ko === country || h.country_en === country || h.country === country
        ).length
      }))
      
      // 도시 옵션 생성
      const cities = Array.from(
        new Set([
          ...(citiesResult.data || []).map(h => h.city_ko).filter(Boolean),
          ...(citiesResult.data || []).map(h => h.city_en).filter(Boolean),
          ...(citiesResult.data || []).map(h => h.city).filter(Boolean)
        ])
      ).map(city => ({
        id: city,
        label: city,
        count: (citiesResult.data || []).filter(h => 
          h.city_ko === city || h.city_en === city || h.city === city
        ).length
      }))
      
      // 브랜드 옵션 생성
      const brands = (brandsResult.data || []).map(brand => ({
        id: brand.brand_id.toString(),
        label: brand.brand_name_ko || brand.brand_name_en || '',
        count: 0 // 실제 호텔 수는 별도 계산 필요
      }))
      
      // 체인 옵션 생성
      const chains = (chainsResult.data || []).map(chain => ({
        id: chain.chain_id.toString(),
        label: chain.chain_name_ko || chain.chain_name_en || '',
        sort_order: chain.chain_sort_order || 9999,
        count: 0 // 실제 호텔 수는 별도 계산 필요
      })).sort((a, b) => a.sort_order - b.sort_order)
      
      return {
        countries,
        cities,
        brands,
        chains
      }
    } catch (err) {
      console.error('필터 옵션 조회 오류:', err instanceof Error ? err.message : String(err))
      setError(err instanceof Error ? err.message : '필터 옵션 조회 중 오류가 발생했습니다.')
      return {
        countries: [],
        cities: [],
        brands: [],
        chains: []
      }
    }
  }, [])
  
  return {
    isLoading,
    error,
    searchHotels,
    getAllHotels,
    getFilterOptions
  }
}

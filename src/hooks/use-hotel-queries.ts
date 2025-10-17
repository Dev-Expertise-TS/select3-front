"use client"

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformHotelsToAllViewCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'

const supabase = createClient()

/**
 * 검색 결과 조회 훅
 * @param query 검색어
 * @param tick 리프레시 트리거
 */
export function useSearchResults(query: string, tick: number) {
  return useQuery({
    queryKey: ['search-results', 'v4', query, tick],
    queryFn: async () => {
      if (!query.trim()) return []
      
      // 호텔 검색 (publish가 null이거나 true인 호텔만)
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%,city_ko.ilike.%${query}%,city_en.ilike.%${query}%,country_ko.ilike.%${query}%,country_en.ilike.%${query}%`)
        .or('publish.is.null,publish.eq.true')
      
      if (error) throw error
      if (!data) return []
      
      // 호텔 미디어 조회
      const sabreIds = data.map((hotel: any) => String(hotel.sabre_id))
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', sabreIds)
        .order('image_seq', { ascending: true })
      
      const firstImages = getFirstImagePerHotel(mediaData || [])
      
      // 브랜드 정보 조회
      const brandIds = data.filter((hotel: any) => hotel.brand_id).map((hotel: any) => hotel.brand_id)
      let brandData = []
      if (brandIds.length > 0) {
        const { data: brandResult, error: brandError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .in('brand_id', brandIds)
        
        if (brandError) {
          console.error('❌ 검색 결과 브랜드 정보 조회 오류:', brandError)
        } else {
          brandData = brandResult || []
          console.log('🏷️ 검색 결과 브랜드 정보 조회:', brandData.length)
        }
      }
      
      return transformHotelsToAllViewCardData(data, firstImages, brandData)
    },
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 필터 옵션 조회 훅 (서버 API 사용)
 */
export function useFilterOptions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['filter-options', 'v14'], // v14: 몬트리올 도시명 업데이트 반영
    queryFn: async () => {
      const response = await fetch('/api/filter-options')
      
      if (!response.ok) {
        throw new Error(`필터 옵션 조회 실패: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '필터 옵션 조회 실패')
      }
      
      console.log('📥 클라이언트: 필터 옵션 수신:', {
        도시개수: result.data?.cities?.length || 0,
        국가개수: result.data?.countries?.length || 0,
        브랜드개수: result.data?.brands?.length || 0,
        체인개수: result.data?.chains?.length || 0,
      })
      
      return result.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
    enabled: options?.enabled !== false, // 기본값 true, options로 제어 가능
  })
}

/**
 * 모든 호텔 조회 훅
 */
export function useAllHotels(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['all-hotels', 'v3'],
    queryFn: async () => {
      try {
        console.log('🏨 useAllHotels: 전체 호텔 조회 시작')
        
        const { data, error } = await supabase
          .from('select_hotels')
          .select('*')
          .or('publish.is.null,publish.eq.true')
          .order('sabre_id')
        
        console.log('🏨 useAllHotels: 호텔 데이터 조회 결과:', {
          총개수: data?.length || 0,
          에러: error?.message || 'none'
        })
        
        if (error) {
          console.error('❌ 호텔 목록 조회 오류:', error)
          throw error
        }
        if (!data) {
          console.warn('⚠️ 호텔 데이터가 null입니다')
          return []
        }
        
        // 호텔 미디어 조회
        const sabreIds = data.map((hotel: any) => String(hotel.sabre_id))
        const { data: mediaData } = await supabase
          .from('select_hotel_media')
          .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
          .in('sabre_id', sabreIds)
          .order('image_seq', { ascending: true })
        
        const firstImages = getFirstImagePerHotel(mediaData || [])
        
        // 브랜드 정보 조회
        const brandIds = data.filter((hotel: any) => hotel.brand_id).map((hotel: any) => hotel.brand_id)
        let brandData = []
        if (brandIds.length > 0) {
          const { data: brandResult, error: brandError } = await supabase
            .from('hotel_brands')
            .select('brand_id, brand_name_en')
            .in('brand_id', brandIds)
          
          if (brandError) {
            console.error('❌ 브랜드 정보 조회 오류:', brandError)
          } else {
            brandData = brandResult || []
            console.log('🏷️ 브랜드 정보 조회:', brandData.length)
          }
        }
        
        const result = transformHotelsToAllViewCardData(data, firstImages, brandData)
        console.log('✅ useAllHotels: 최종 반환 데이터:', result?.length || 0)
        return result
      } catch (error) {
        console.error('전체 호텔 조회 중 오류 발생:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false, // 기본값 true, options로 제어 가능
  })
}

/**
 * 배너용 호텔 데이터 조회 훅 (select_feature_slots 기반)
 */
export function useBannerHotel(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['banner-hotel'],
    queryFn: async () => {
      try {
        // 한국 시간(KST)의 오늘 날짜
        const now = new Date()
        const kstMs = now.getTime() + 9 * 60 * 60 * 1000
        const todayKst = new Date(kstMs).toISOString().slice(0, 10)

        // select_feature_slots에서 활성 슬롯 조회
        const { data: featureSlots, error: featureError } = await supabase
          .from('select_feature_slots')
          .select('sabre_id, start_date, end_date')
          .eq('surface', '상단베너')

        if (featureError) throw featureError
        if (!featureSlots || featureSlots.length === 0) return null

        // KST 오늘 날짜 기준으로 필터링
        const activeSlots = featureSlots.filter((slot: any) => {
          const start = (slot.start_date ?? '').toString().slice(0, 10)
          const end = (slot.end_date ?? '').toString().slice(0, 10)
          if (!start && !end) return true
          if (start && todayKst < start) return false
          if (end && todayKst > end) return false
          return true
        })

        if (activeSlots.length === 0) return null

        const sabreIds = activeSlots.map((slot: any) => slot.sabre_id)
        
        // select_hotels에서 호텔 정보 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('*')
          .in('sabre_id', sabreIds)
          .not('image_1', 'is', null)
        
        if (hotelsError) throw hotelsError
        if (!hotels || hotels.length === 0) return null
        
        const filteredHotels = hotels.filter((h: any) => h.publish !== false)
        if (filteredHotels.length === 0) return null
        
        // 브랜드 및 체인 정보 조회
        const brandIds = filteredHotels.map((hotel: any) => hotel.brand_id).filter(Boolean)
        let brandsData: Array<{brand_id: string, brand_name_en: string, chain_id: string}> = []
        if (brandIds.length > 0) {
          const { data, error: brandsError } = await supabase
            .from('hotel_brands')
            .select('brand_id, brand_name_en, chain_id')
            .in('brand_id', brandIds)
          
          if (brandsError) throw brandsError
          brandsData = data || []
        }
        
        const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
        const { data: chainsData, error: chainsError } = await supabase
          .from('hotel_chains')
          .select('chain_id, chain_name_en')
          .in('chain_id', chainIds)
        
        if (chainsError) throw chainsError
        
        // 랜덤 호텔 선택 및 브랜드 정보 매핑
        const randomHotel = filteredHotels[Math.floor(Math.random() * filteredHotels.length)]
        const hotelBrand = brandsData?.find((brand: any) => brand.brand_id === randomHotel.brand_id)
        const hotelChain = chainsData?.find((chain: any) => chain.chain_id === hotelBrand?.chain_id)
        
        return {
          ...randomHotel,
          media_path: randomHotel.image_1,
          brand_name_en: hotelBrand?.brand_name_en || null,
          chain_name_en: hotelChain?.chain_name_en || null
        }
      } catch (error) {
        console.error('베너 호텔 조회 오류:', error)
        return null
      }
    },
    enabled: options?.enabled !== false,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * 선택된 체인의 브랜드 호텔 조회 훅
 */
export function useChainBrandHotels(selectedChainId: string | null) {
  return useQuery({
    queryKey: ['chain-brand-hotels', 'v4', selectedChainId],
    queryFn: async () => {
      if (!selectedChainId) return []
      
      try {
        // hotel_brands에서 해당 chain_id를 가진 브랜드들 조회
        const { data: brands, error: brandsError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en, brand_name_ko')
          .eq('chain_id', parseInt(selectedChainId))
        
        if (brandsError) throw brandsError
        if (!brands || brands.length === 0) return []
        
        const brandIds = brands.map((b: any) => b.brand_id)
        
        // select_hotels에서 해당 brand_id를 가진 호텔들 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('*')
          .in('brand_id', brandIds)
          .or('publish.is.null,publish.eq.true')
        
        if (hotelsError) throw hotelsError
        if (!hotels || hotels.length === 0) return []
        
        // 호텔 미디어 조회
        const sabreIds = hotels.map((hotel: any) => String(hotel.sabre_id))
        const { data: mediaData } = await supabase
          .from('select_hotel_media')
          .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
          .in('sabre_id', sabreIds)
          .order('image_seq', { ascending: true })
        
        const firstImages = getFirstImagePerHotel(mediaData || [])
        
        return transformHotelsToAllViewCardData(hotels, firstImages, brands)
      } catch (error) {
        console.error('체인 브랜드 호텔 조회 오류:', error)
        return []
      }
    },
    enabled: !!selectedChainId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 브랜드별 호텔 조회 훅
 */
export function useBrandHotels(brandId: string | null) {
  return useQuery({
    queryKey: ['brand-hotels', 'v4', brandId],
    queryFn: async () => {
      if (!brandId) return []
      
      try {
        // 호텔 조회
        const { data: hotels, error } = await supabase
          .from('select_hotels')
          .select('*')
          .eq('brand_id', parseInt(brandId))
          .or('publish.is.null,publish.eq.true')
          .order('property_name_ko')
        
        if (error) throw error
        if (!hotels || hotels.length === 0) return []
        
        // 호텔 미디어 조회
        const sabreIds = hotels.map((hotel: any) => String(hotel.sabre_id))
        const { data: mediaData } = await supabase
          .from('select_hotel_media')
          .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
          .in('sabre_id', sabreIds)
          .order('image_seq', { ascending: true })
        
        const firstImages = getFirstImagePerHotel(mediaData || [])
        
        // 브랜드 정보 조회
        const { data: brandData } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en')
          .eq('brand_id', parseInt(brandId))
        
        return transformHotelsToAllViewCardData(hotels, firstImages, brandData || [])
      } catch (error) {
        console.error('브랜드 호텔 조회 오류:', error)
        throw error
      }
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 체인별 브랜드 조회 훅
 */
export function useChainBrands(chainId: string | null) {
  return useQuery({
    queryKey: ['chain-brands', chainId],
    queryFn: async () => {
      if (!chainId) return []
      
      try {
        // hotel_brands에서 해당 chain_id를 가진 브랜드들 조회
        const { data: brands, error: brandsError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en, brand_name_ko')
          .eq('chain_id', parseInt(chainId))
        
        if (brandsError) throw brandsError
        return brands || []
      } catch (error) {
        console.error('체인 브랜드 조회 오류:', error)
        return []
      }
    },
    enabled: !!chainId,
    staleTime: 5 * 60 * 1000,
  })
}


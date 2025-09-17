import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 호텔 목록 조회
export function useHotels() {
  return useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .limit(50)
        .order('property_name_ko')
      
      if (error) {
        console.error('호텔 목록 조회 오류:', error)
        throw error
      }
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 1000,
  })
}

// 특정 호텔 조회 (sabre_id 기준)
export function useHotel(sabreId: number) {
  return useQuery({
    queryKey: ['hotel', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .eq('sabre_id', sabreId)
        .single()
      
      if (error) {
        console.error('호텔 조회 오류:', error)
        throw error
      }
      return data
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 1000,
  })
}

// slug로 호텔 조회
export function useHotelBySlug(slug: string) {
  return useQuery({
    queryKey: ['hotel-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) {
        console.error('호텔 slug 조회 오류:', error)
        throw error
      }
      return data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 1000,
  })
}

// 호텔 미디어 이미지 조회
export function useHotelMedia(sabreId: number) {
  return useQuery({
    queryKey: ['hotel-media', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotel_media')
        .select('*')
        .eq('sabre_id', sabreId)
        .order('id', { ascending: true })
      
      if (error) throw error
      return data || []
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 호텔 검색
export function useHotelSearch(query: string) {
  return useQuery({
    queryKey: ['hotel-search', query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%`)
        .order('property_name_ko')
      
      if (error) {
        console.error('호텔 검색 오류:', error)
        throw error
      }
      return data || []
    },
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
    retry: 3,
    retryDelay: 1000,
  })
}

// 브랜드별 호텔 조회
export function useBrandHotels(brandId: string | null) {
  return useQuery({
    queryKey: ['brand-hotels', brandId],
    queryFn: async () => {
      if (!brandId) return []
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .eq('brand_id', parseInt(brandId))
        .order('property_name_ko')
      
      if (error) {
        console.error('브랜드 호텔 조회 오류:', error)
        throw error
      }
      return data || []
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 1000,
  })
}

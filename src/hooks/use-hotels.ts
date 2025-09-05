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
        .select('*, image_1, image_2, image_3, image_4, image_5')
        .limit(50)
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 특정 호텔 조회 (sabre_id 기준)
export function useHotel(sabreId: number) {
  return useQuery({
    queryKey: ['hotel', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*, image_1, image_2, image_3, image_4, image_5')
        .eq('sabre_id', sabreId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// slug로 호텔 조회
export function useHotelBySlug(slug: string) {
  return useQuery({
    queryKey: ['hotel-by-slug', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*, image_1, image_2, image_3, image_4, image_5')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5분
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
        .select('*, image_1, image_2, image_3, image_4, image_5')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%`)
      
      if (error) throw error
      return data
    },
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

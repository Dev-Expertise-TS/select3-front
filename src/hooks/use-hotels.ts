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
      
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 특정 호텔 조회
export function useHotel(sabreId: number) {
  return useQuery({
    queryKey: ['hotel', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .eq('sabre_id', sabreId)
        .single()
      
      if (error) throw error
      return data
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
        .or(`property_name_kor.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%`)
        .limit(20)
      
      if (error) throw error
      return data
    },
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

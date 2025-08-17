import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 호텔 미디어 조회
export function useHotelMedia(sabreId: string | null) {
  return useQuery({
    queryKey: ['hotel-media', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotel_media')
        .select('*')
        .eq('sabre_id', sabreId)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return data
    },
    enabled: !!sabreId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

// 호텔 메인 이미지 조회
export function useHotelMainImage(sabreId: string | null) {
  return useQuery({
    queryKey: ['hotel-main-image', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotel_media')
        .select('*')
        .eq('sabre_id', sabreId)
        .eq('is_primary', true)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!sabreId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

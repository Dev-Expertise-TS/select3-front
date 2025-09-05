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

// 호텔 메인 이미지 조회 (image_1 사용)
export function useHotelMainImage(sabreId: string | null) {
  return useQuery({
    queryKey: ['hotel-main-image', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, image_1')
        .eq('sabre_id', sabreId)
        .single()
      
      if (error) throw error
      return data ? { media_path: data.image_1 } : null
    },
    enabled: !!sabreId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

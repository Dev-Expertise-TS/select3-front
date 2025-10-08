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
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .eq('sabre_id', sabreId)
        .order('image_seq', { ascending: true })
      
      if (error) {
        console.error('select_hotel_media 조회 오류:', error)
        throw error
      }
      
      console.log('📸 select_hotel_media 조회 결과:', {
        sabreId,
        count: data?.length || 0
      })
      
      return data || []
    },
    enabled: !!sabreId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

// 호텔 메인 이미지 조회 (select_hotel_media 사용)
export function useHotelMainImage(sabreId: string | null) {
  return useQuery({
    queryKey: ['hotel-main-image', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .eq('sabre_id', sabreId)
        .eq('image_seq', 1)  // 첫 번째 이미지만
        .maybeSingle()
      
      if (error) {
        console.error('select_hotel_media 메인 이미지 조회 오류:', error)
        throw error
      }
      
      return data || null
    },
    enabled: !!sabreId,
    staleTime: 10 * 60 * 1000, // 10분
  })
}

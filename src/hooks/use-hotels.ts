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
        .limit(100) // 필터링 고려하여 더 많이 가져오기
        .order('property_name_ko')
      
      if (error) {
        console.error('호텔 목록 조회 오류:', error)
        throw error
      }
      
      // 클라이언트에서 publish 필터링 (false 제외)
      return (data || []).filter((h: any) => h.publish !== false).slice(0, 50)
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
        .maybeSingle()
      
      if (error) {
        console.error('호텔 조회 오류:', error)
        throw error
      }
      
      // publish가 false면 null 반환
      if (data && data.publish === false) {
        return null
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
      // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
      const decodedSlug = decodeURIComponent(slug)
      
      console.log('🔍 클라이언트 호텔 검색:', {
        originalSlug: slug,
        decodedSlug: decodedSlug,
        hasSpecialChars: slug !== decodedSlug
      })
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .eq('slug', decodedSlug)
        .maybeSingle()
      
      if (error) {
        console.error('호텔 slug 조회 오류:', {
          originalSlug: slug,
          decodedSlug: decodedSlug,
          error: error.message || error,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }
      
      // publish가 false면 null 반환
      if (data && data.publish === false) {
        return null
      }
      
      return data
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 1000,
  })
}

// 호텔 미디어 이미지 조회 (select_hotel_media 테이블 사용)
export function useHotelMedia(sabreId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['hotel-media', sabreId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .eq('sabre_id', String(sabreId))
        .order('image_seq', { ascending: true })
      
      if (error) {
        console.error('select_hotel_media 조회 오류:', error)
        throw error
      }
      
      console.log('📸 select_hotel_media 조회 결과:', {
        sabreId,
        count: data?.length || 0,
        images: data?.map(d => ({ image_seq: d.image_seq, public_url: d.public_url }))
      })
      
      return data || []
    },
    enabled: options?.enabled !== false && !!sabreId, // enabled 옵션 추가
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
      
      // 클라이언트에서 publish 필터링 (false 제외)
      return (data || []).filter((h: any) => h.publish !== false)
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
        .or(`brand_id.eq.${brandId},brand_id_2.eq.${brandId},brand_id_3.eq.${brandId}`)
        .order('property_name_ko')
      
      if (error) {
        console.error('브랜드 호텔 조회 오류:', error)
        throw error
      }
      
      // 클라이언트에서 publish 필터링 (false 제외)
      return (data || []).filter((h: any) => h.publish !== false)
    },
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 1000,
  })
}

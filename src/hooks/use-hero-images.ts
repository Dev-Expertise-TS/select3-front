import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 히어로 이미지 데이터 타입
export interface HeroImageData {
  sabre_id: number
  property_name_ko: string
  property_name_en: string
  slug: string
  media_path: string
}

// 히어로 이미지 조회 훅
export function useHeroImages() {
  return useQuery({
    queryKey: ['hero-images'],
    queryFn: async (): Promise<HeroImageData[]> => {
      try {
        // 1. select_feature_slots에서 surface가 "히어로"인 sabre_id 조회
        const { data: featureSlots, error: featureError } = await supabase
          .from('select_feature_slots')
          .select('sabre_id')
          .eq('surface', '히어로')
        
        if (featureError) throw featureError
        if (!featureSlots || featureSlots.length === 0) return []
        
        const sabreIds = featureSlots.map(slot => slot.sabre_id)
        
        // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, slug')
          .in('sabre_id', sabreIds)
        
        if (hotelsError) throw hotelsError
        if (!hotels) return []
        
        // 3. select_hotel_media에서 해당 sabre_id의 이미지 조회 (sort_order 기준)
        const { data: mediaData, error: mediaError } = await supabase
          .from('select_hotel_media')
          .select('sabre_id, media_path, sort_order')
          .in('sabre_id', sabreIds)
          .order('sort_order', { ascending: true })
        
        if (mediaError) throw mediaError
        
        // 4. 데이터 조합
        const heroImages: HeroImageData[] = hotels.map(hotel => {
          const media = mediaData?.find(m => m.sabre_id === hotel.sabre_id)
          return {
            sabre_id: hotel.sabre_id,
            property_name_ko: hotel.property_name_ko || `호텔 ${hotel.sabre_id}`,
            property_name_en: hotel.property_name_en || 'Luxury Destination',
            slug: hotel.slug || '',
            media_path: media?.media_path || '/placeholder.svg'
          }
        })
        
        return heroImages
      } catch (error) {
        console.error('❌ 히어로 이미지 조회 실패:', error)
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
    cacheTime: 20 * 60 * 1000, // 20분
  })
}

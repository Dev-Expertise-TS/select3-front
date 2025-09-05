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
  city: string
  chain_name_en: string
  brand_name_en: string
}

// 배열에서 랜덤하게 하나의 요소를 선택하는 함수
function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
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
        
        // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회 (image_1 포함)
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, slug, city, brand_id, image_1')
          .in('sabre_id', sabreIds)
        
        if (hotelsError) throw hotelsError
        if (!hotels) return []
        
        // 3. hotel_brands에서 brand_id로 브랜드 정보 조회
        const brandIds = hotels.map(hotel => hotel.brand_id).filter(Boolean)
        const { data: brandsData, error: brandsError } = await supabase
          .from('hotel_brands')
          .select('brand_id, brand_name_en, chain_id')
          .in('brand_id', brandIds)
        
        if (brandsError) throw brandsError
        
        // 4. hotel_chains에서 chain_id로 체인 정보 조회
        const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
        const { data: chainsData, error: chainsError } = await supabase
          .from('hotel_chains')
          .select('chain_id, chain_name_en')
          .in('chain_id', chainIds)
        
        if (chainsError) throw chainsError
        
        // 5. 데이터 조합 - 각 호텔마다 image_1 사용
        const heroImages: HeroImageData[] = hotels.map(hotel => {
          
          // 브랜드 정보 찾기
          const brand = brandsData?.find(b => b.brand_id === hotel.brand_id)
          
          // 체인 정보 찾기
          const chain = chainsData?.find(c => c.chain_id === brand?.chain_id)
          
          return {
            sabre_id: hotel.sabre_id,
            property_name_ko: hotel.property_name_ko || `호텔 ${hotel.sabre_id}`,
            property_name_en: hotel.property_name_en || 'Luxury Destination',
            slug: hotel.slug || '',
            media_path: hotel.image_1 || '/placeholder.svg',
            city: hotel.city || 'Unknown',
            chain_name_en: chain?.chain_name_en || 'LUXURY',
            brand_name_en: brand?.brand_name_en || 'PREMIUM',
          }
        })
        
        return heroImages
      } catch (error) {
        console.error('❌ 히어로 이미지 조회 실패:', error)
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 20 * 60 * 1000, // 20분
  })
}

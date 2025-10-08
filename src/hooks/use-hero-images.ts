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
        // 1. select_feature_slots에서 surface가 "히어로"인 sabre_id, slot_key 조회 (slot_key 오름차순 정렬)
        const { data: featureSlots, error: featureError } = await supabase
          .from('select_feature_slots')
          .select('sabre_id, slot_key')
          .eq('surface', '히어로')
          .order('slot_key', { ascending: true })
        
        if (featureError) {
          console.error('❌ 히어로 feature slots 조회 실패:', featureError)
          throw featureError
        }
        if (!featureSlots || featureSlots.length === 0) {
          console.log('⚠️ 히어로 feature slots 데이터 없음')
          return []
        }
        
        const sabreIds = featureSlots.map(slot => slot.sabre_id)
        
        // 2. select_hotels에서 해당 sabre_id의 호텔 정보 조회 (image_1 포함)
        const { data: hotels, error: hotelsError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko, property_name_en, slug, city, brand_id, image_1')
          .neq('publish', false)
          .in('sabre_id', sabreIds)
        
        if (hotelsError) {
          console.error('❌ 히어로 호텔 데이터 조회 실패:', hotelsError)
          throw hotelsError
        }
        if (!hotels) {
          console.log('⚠️ 히어로 호텔 데이터 없음')
          return []
        }
        
        // 3. hotel_brands에서 brand_id로 브랜드 정보 조회 (null이 아닌 것만)
        const brandIds = hotels.map(hotel => hotel.brand_id).filter(id => id !== null && id !== undefined)
        let brandsData: Array<{brand_id: string, brand_name_en: string, chain_id: string}> = []
        if (brandIds.length > 0) {
          const { data, error: brandsError } = await supabase
            .from('hotel_brands')
            .select('brand_id, brand_name_en, chain_id')
            .in('brand_id', brandIds)
          
          if (brandsError) {
            console.error('❌ 히어로 브랜드 데이터 조회 실패:', brandsError)
            throw brandsError
          }
          brandsData = data || []
        }
        
        // 4. hotel_chains에서 chain_id로 체인 정보 조회
        const chainIds = brandsData?.map(brand => brand.chain_id).filter(Boolean) || []
        const { data: chainsData, error: chainsError } = await supabase
          .from('hotel_chains')
          .select('chain_id, chain_name_en')
          .in('chain_id', chainIds)
        
        if (chainsError) {
          console.error('❌ 히어로 체인 데이터 조회 실패:', chainsError)
          throw chainsError
        }
        
        // slot_key 기준으로 정렬된 순서를 유지하기 위해 맵 구성
        const orderMap = new Map<number, number>()
        featureSlots.forEach((slot: any, idx: number) => orderMap.set(slot.sabre_id, idx))

        // 5. 데이터 조합 - 각 호텔마다 image_1 사용 (유효성 검증 포함)
        const heroImages: HeroImageData[] = hotels.map(hotel => {
          
          // 브랜드 정보 찾기
          const brand = brandsData?.find(b => b.brand_id === hotel.brand_id)
          
          // 체인 정보 찾기
          const chain = chainsData?.find(c => c.chain_id === brand?.chain_id)
          
          // 브랜드명 결정 (우선순위: brand_name_en > chain_name_en > 기본값)
          const getBrandDisplayName = () => {
            if (brand?.brand_name_en) return brand.brand_name_en
            if (chain?.chain_name_en) return chain.chain_name_en
            // 호텔명에서 체인 정보 추출 시도
            const hotelName = hotel.property_name_ko || hotel.property_name_en || ''
            if (hotelName.includes('포시즌스') || hotelName.includes('Four Seasons')) return 'FOUR SEASONS'
            if (hotelName.includes('만다린') || hotelName.includes('Mandarin')) return 'MANDARIN ORIENTAL'
            if (hotelName.includes('인터컨티넨탈') || hotelName.includes('InterContinental')) return 'INTERCONTINENTAL'
            return 'LUXURY'
          }
          
          // 이미지 경로 유효성 검증
          const isValidImagePath = (path: string | null | undefined): boolean => {
            if (!path) return false
            // 존재하지 않는 이미지 경로들 필터링
            const invalidPaths = [
              '/park-hyatt-tokyo-city-view.png',
              '/ritz-carlton-laguna-niguel-ocean-view.png',
              '/four-seasons-new-york-luxury-suite.png',
              '/mandarin-oriental-bangkok-riverside-view.png'
            ]
            return !invalidPaths.includes(path)
          }
          
          // 유효한 이미지 경로 선택 또는 fallback
          let mediaPath = '/placeholder.svg'
          if (isValidImagePath(hotel.image_1)) {
            mediaPath = hotel.image_1
          } else {
            // 도시별 fallback 이미지 매핑
            const cityFallbacks: Record<string, string> = {
              'Tokyo': '/destination-image/tokyo.jpg',
              'London': '/destination-image/london.jpg',
              'Bali': '/destination-image/bali.webp',
              'Singapore': '/destination-image/singapore.jpg',
              'Hong Kong': '/destination-image/hongkong.webp',
              'Osaka': '/destination-image/osaka.avif',
              'Roma': '/destination-image/roma.jpg',
              'Danang': '/destination-image/danang.jpg'
            }
            mediaPath = cityFallbacks[hotel.city] || '/destination-image/tokyo.jpg'
          }
          
          return {
            sabre_id: hotel.sabre_id,
            property_name_ko: hotel.property_name_ko || `호텔 ${hotel.sabre_id}`,
            property_name_en: hotel.property_name_en || 'Luxury Destination',
            slug: hotel.slug || '',
            media_path: mediaPath,
            city: hotel.city || 'Unknown',
            chain_name_en: chain?.chain_name_en || 'LUXURY',
            brand_name_en: getBrandDisplayName(),
          }
        })

        // 6. slot_key 순서대로 최종 정렬
        heroImages.sort((a, b) => (orderMap.get(a.sabre_id) ?? 0) - (orderMap.get(b.sabre_id) ?? 0))

        return heroImages
      } catch (error) {
        console.error('❌ 히어로 이미지 조회 실패:', error instanceof Error ? error.message : String(error))
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 20 * 60 * 1000, // 20분
  })
}

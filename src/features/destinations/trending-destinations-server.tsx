import { createClient } from '@/lib/supabase/server'
import { TrendingDestinationsClient } from './trending-destinations-client'

/**
 * 트렌딩 지역 데이터 조회 (Server-side)
 */
async function getTrendingDestinations() {
  const supabase = await createClient()

  // 1. select_regions에서 트렌딩 도시 조회 (상위 8개)
  const { data: destinations, error } = await supabase
    .from('select_regions')
    .select('city_code, city_ko, city_en, city_slug, country_ko, country_en, city_sort_order')
    .eq('region_type', 'city')
    .eq('status', 'active')
    .order('city_sort_order', { ascending: true })
    .limit(8)

  if (error) {
    console.error('❌ 트렌딩 지역 조회 오류:', error)
    return null
  }

  console.log('✅ 트렌딩 지역 조회 성공:', destinations?.length || 0)

  // 2. 모든 트렌딩 도시의 이미지를 한 번에 조회 (성능 최적화!)
  const cityCodes = destinations?.map(d => d.city_code) || []
  const cityImages: Record<string, string> = {}

  if (cityCodes.length > 0) {
    const { data: imageData, error: imageError } = await supabase
      .from('select_city_media')
      .select('city_code, file_name, file_path, public_url, image_seq')
      .in('city_code', cityCodes)
      .order('image_seq', { ascending: true })

    if (imageError) {
      console.error('❌ 트렌딩 도시 이미지 조회 오류:', imageError)
    } else if (imageData) {
      // 각 도시별 첫 번째 이미지만 추출
      const imageMap = new Map<string, any>()
      
      imageData.forEach(img => {
        if (!imageMap.has(img.city_code)) {
          imageMap.set(img.city_code, img)
        }
      })

      // 이미지 URL 생성
      imageMap.forEach((img, cityCode) => {
        const imageUrl = img.public_url || 
          (img.file_path ? `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/${img.file_path}` : null)
        
        if (imageUrl) {
          cityImages[cityCode] = imageUrl
        }
      })

      console.log('📸 트렌딩 도시 이미지 일괄 조회 성공:', Object.keys(cityImages).length)
    }
  }

  return { destinations: destinations || [], cityImages }
}

/**
 * 트렌딩 지역 섹션 (서버 컴포넌트 - 성능 최적화)
 * 
 * 성능 최적화:
 * - 서버에서 모든 도시와 이미지를 한 번에 조회
 * - 클라이언트에서 개별 API 호출 불필요
 * - 즉시 이미지 표시 (빠른 로딩!)
 * - Next.js 캐시로 1시간 동안 재사용
 */
export async function TrendingDestinationsSection() {
  const { destinations, cityImages } = await getTrendingDestinations()
  return <TrendingDestinationsClient destinations={destinations} cityImages={cityImages} />
}


import { Metadata } from 'next'
import { RegionListClient } from './region-list-client'
import { createClient } from '@/lib/supabase/server'
import { getCompanyFromServer } from '@/lib/company-filter'

export const metadata: Metadata = {
  title: '지역별 호텔 & 리조트 | 투어비스 셀렉트',
  description: '전 세계 주요 도시별 프리미엄 호텔 & 리조트를 찾아보세요',
}

// 지역 페이지 캐시: 1시간마다 재검증
export const revalidate = 3600

export default async function RegionListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const company = await getCompanyFromServer(searchParams)
  const supabase = await createClient()

  // 1. select_regions에서 활성 도시 목록 조회 (국가 정보 포함)
  const { data: regions, error } = await supabase
    .from('select_regions')
    .select('city_code, city_ko, city_en, city_slug, country_code, country_ko, country_en, continent_ko, continent_en, city_sort_order, country_sort_order')
    .eq('region_type', 'city')
    .eq('status', 'active')
    .order('country_sort_order', { ascending: true })
    .order('city_sort_order', { ascending: true })

  if (error) {
    console.error('❌ 지역 목록 조회 오류:', error)
  }

  console.log('📍 지역 목록 조회 성공:', regions?.length || 0)

  const cityCodes = regions?.map(r => r.city_code) || []
  
  // 2. 각 도시별 호텔 개수 조회 (병렬 처리)
  const hotelCounts: Record<string, number> = {}
  
  if (cityCodes.length > 0) {
    let hotelQuery = supabase
      .from('select_hotels')
      .select('city_code')
      .in('city_code', cityCodes)
      .or('publish.is.null,publish.eq.true')
    
    // company=sk일 때 vcc=true 필터 적용
    if (company === 'sk') {
      hotelQuery = hotelQuery.eq('vcc', true)
    }

    const { data: hotels } = await hotelQuery
    
    if (hotels) {
      hotels.forEach((h: any) => {
        const code = h.city_code
        hotelCounts[code] = (hotelCounts[code] || 0) + 1
      })
      console.log(`🏨 도시별 호텔 개수 집계 완료 ${company === 'sk' ? '(vcc=TRUE 필터 적용)' : ''}`)
    }
  }

  // 3. company=sk일 경우, vcc=TRUE 호텔이 없는 지역 제외
  const filteredRegions = company === 'sk' 
    ? (regions || []).filter(region => (hotelCounts[region.city_code] || 0) > 0)
    : (regions || [])

  // 4. 모든 도시의 이미지를 한 번에 조회 (성능 최적화)
  const cityImages: Record<string, string> = {}
  const filteredCityCodes = filteredRegions.map(r => r.city_code)

  if (filteredCityCodes.length > 0) {
    const { data: imageData, error: imageError } = await supabase
      .from('select_city_media')
      .select('city_code, file_name, file_path, public_url, image_seq')
      .in('city_code', filteredCityCodes)
      .order('image_seq', { ascending: true })

    if (imageError) {
      console.error('❌ 도시 이미지 조회 오류:', imageError)
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

      console.log('📸 도시 이미지 일괄 조회 성공:', Object.keys(cityImages).length)
    }
  }

  return <RegionListClient 
    regions={filteredRegions} 
    cityImages={cityImages}
    hotelCounts={hotelCounts}
  />
}


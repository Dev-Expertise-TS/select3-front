import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'

/**
 * 호텔 상세 페이지 서버 데이터 조회
 * 호텔 기본 정보 + 이미지 + 혜택 + 프로모션을 한번에 조회
 */
export async function getHotelDetailData(slug: string) {
  const supabase = await createClient()
  
  // URL 디코딩 처리
  const decodedSlug = decodeURIComponent(slug)
  
  // 1. 호텔 기본 정보 조회
  const { data: hotel, error: hotelError } = await supabase
    .from('select_hotels')
    .select('*')
    .eq('slug', decodedSlug)
    .maybeSingle()
  
  if (hotelError || !hotel) {
    return null
  }
  
  // publish가 false면 null 반환
  if (hotel.publish === false) {
    return null
  }
  
  const sabreId = String(hotel.sabre_id)
  
  // 2-5. 병렬로 데이터 조회
  const [imagesResult, benefitsResult, promotionsResult, blogsResult] = await Promise.all([
    // 2. 호텔 이미지 조회
    supabase
      .from('select_hotel_media')
      .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
      .eq('sabre_id', sabreId)
      .order('image_seq', { ascending: true }),
    
    // 3. 호텔 혜택 조회
    supabase
      .from('select_hotel_benefits_map')
      .select(`
        benefit_id,
        sort,
        select_hotel_benefits (
          benefit_id,
          benefit_name,
          benefit_description
        )
      `)
      .eq('sabre_id', sabreId)
      .order('sort', { ascending: true }),
    
    // 4. 호텔 프로모션 조회
    supabase
      .from('select_feature_slots')
      .select('surface, promotion_title, promotion_description, start_date, end_date')
      .eq('sabre_id', sabreId),
    
    // 5. 호텔 블로그 조회
    supabase
      .from('select_hotel_blogs')
      .select('id, slug, main_image, main_title, sub_title, created_at')
      .contains('related_sabre_ids', [sabreId])
      .eq('publish', true)
      .order('created_at', { ascending: false })
      .limit(3)
  ])
  
  // 이미지 데이터 처리
  const images = imagesResult.data || []
  
  // 혜택 데이터 처리
  const benefits = (benefitsResult.data || []).map((item: any) => {
    const benefitData = item.select_hotel_benefits
    return {
      benefit_id: item.benefit_id,
      benefit_name: benefitData?.benefit_name || '',
      benefit_description: benefitData?.benefit_description || '',
      sort: item.sort
    }
  })
  
  // 프로모션 데이터 처리 (현재 활성화된 것만)
  const now = new Date()
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000
  const todayKst = new Date(kstMs).toISOString().slice(0, 10)
  
  const promotions = (promotionsResult.data || []).filter((promo: any) => {
    const start = (promo.start_date ?? '').toString().slice(0, 10)
    const end = (promo.end_date ?? '').toString().slice(0, 10)
    if (!start && !end) return true
    if (start && todayKst < start) return false
    if (end && todayKst > end) return false
    return true
  })
  
  // 블로그 데이터 처리
  const blogs = blogsResult.data || []
  
  return {
    hotel,
    images,
    benefits,
    promotions,
    blogs
  }
}


import { createClient } from '@/lib/supabase/server'
import { getFirstImagePerHotel } from '@/lib/media-utils'

/**
 * 호텔 상세 페이지 서버 데이터 조회
 * 호텔 기본 정보 + 이미지 + 혜택 + 프로모션을 한번에 조회
 */
export async function getHotelDetailData(slug: string, company?: string | null) {
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

  // company=sk일 때 vcc가 true가 아니면 null 반환
  if (company === 'sk' && hotel.vcc !== true) {
    return null
  }
  
  // 지역 뱃지: DB 컬럼 `area_ko`를 우선 사용하고, 기존 `hotel_area`는 fallback
  const areaKo =
    typeof (hotel as { area_ko?: unknown }).area_ko === 'string'
      ? (hotel as { area_ko?: string }).area_ko
      : undefined
  const normalizedHotel = {
    ...hotel,
    hotel_area: areaKo || (hotel as { hotel_area?: unknown }).hotel_area || undefined,
  }

  const brandIds = [hotel.brand_id, hotel.brand_id_2, hotel.brand_id_3]
    .filter((id) => id !== null && id !== undefined && id !== '')
    .map((id) => Number(id))
    .filter((id) => !Number.isNaN(id))
  let brandNamesEn: string[] = []
  if (brandIds.length > 0) {
    const { data: brandData } = await supabase
      .from('hotel_brands')
      .select('brand_id, brand_name_en, brand_name_ko')
      .in('brand_id', brandIds)
    const mappedNames = (brandData || [])
      .map((brand) => brand.brand_name_en || brand.brand_name_ko)
      .filter(Boolean) as string[]
    brandNamesEn = Array.from(new Set(mappedNames))
  }
  
  const sabreId = String(hotel.sabre_id)
  
  // 2-6. 병렬로 데이터 조회
  const [imagesResult, benefitsResult, promotionsResult, blogsResult, reviewsResult] = await Promise.all([
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
    
    // 5. 호텔 블로그 조회 (s1~s12_sabre_id 중 하나라도 일치하는 블로그 찾기)
    supabase
      .from('select_hotel_blogs')
      .select(`
        id,
        slug,
        main_image,
        main_title,
        sub_title,
        created_at,
        updated_at,
        s1_contents,
        s1_sabre_id,
        s2_contents,
        s2_sabre_id,
        s3_contents,
        s3_sabre_id,
        s4_contents,
        s4_sabre_id,
        s5_contents,
        s5_sabre_id,
        s6_contents,
        s6_sabre_id,
        s7_contents,
        s7_sabre_id,
        s8_contents,
        s8_sabre_id,
        s9_contents,
        s9_sabre_id,
        s10_contents,
        s10_sabre_id,
        s11_contents,
        s11_sabre_id,
        s12_contents,
        s12_sabre_id
      `)
      .or(`s1_sabre_id.eq.${sabreId},s2_sabre_id.eq.${sabreId},s3_sabre_id.eq.${sabreId},s4_sabre_id.eq.${sabreId},s5_sabre_id.eq.${sabreId},s6_sabre_id.eq.${sabreId},s7_sabre_id.eq.${sabreId},s8_sabre_id.eq.${sabreId},s9_sabre_id.eq.${sabreId},s10_sabre_id.eq.${sabreId},s11_sabre_id.eq.${sabreId},s12_sabre_id.eq.${sabreId}`)
      .eq('publish', true)
      .order('created_at', { ascending: false })
      .limit(3),
    
    // 6. 호텔 후기 조회 (AggregateRating용)
    supabase
      .from('select_satisfaction_survey')
      .select('id, review_text, sabre_id, created_at')
      .eq('sabre_id', Number(sabreId))
      .not('review_text', 'is', null)
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
  let blogs = blogsResult.data || []

  // company=sk일 때 블로그 필터링 (vcc=TRUE인 호텔만 포함된 블로그만 표시)
  if (company === 'sk' && blogs.length > 0) {
    const allMentionedSabreIds = new Set<number>()
    blogs.forEach((blog: any) => {
      for (let i = 1; i <= 12; i++) {
        const id = blog[`s${i}_sabre_id`]
        if (id) allMentionedSabreIds.add(id)
      }
    })

    if (allMentionedSabreIds.size > 0) {
      const { data: vccData, error: vccError } = await supabase
        .from('select_hotels')
        .select('sabre_id, vcc')
        .in('sabre_id', Array.from(allMentionedSabreIds))

      if (!vccError && vccData) {
        const vccMap = new Map(vccData.map((h: any) => [h.sabre_id, h.vcc]))
        
        blogs = blogs.filter((blog: any) => {
          for (let i = 1; i <= 12; i++) {
            const id = blog[`s${i}_sabre_id`]
            if (id && vccMap.get(id) !== true) {
              return false
            }
          }
          return true
        })
      }
    }
  }

  // sabre_id 필드 제거
  const resultBlogs = blogs.map((blog: any) => {
    const { 
      s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
      s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
      s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id,
      ...rest 
    } = blog
    return rest
  })
  
  // 후기 데이터 처리 (AggregateRating용)
  const reviews = reviewsResult.data || []
  const reviewCount = reviews.length
  // 모든 후기가 만족도가 높다고 가정 (실제로는 satisfaction 컬럼이 있으면 활용)
  const averageRating = reviewCount > 0 ? 5 : 0
  
  return {
    hotel: {
      ...normalizedHotel,
      brand_name_en: brandNamesEn[0],
      brand_names_en: brandNamesEn.length > 0 ? brandNamesEn : undefined
    },
    images,
    benefits,
    promotions,
    blogs: resultBlogs,
    reviews: {
      count: reviewCount,
      averageRating,
      reviews: reviews.slice(0, 10) // 최신 10개만
    }
  }
}


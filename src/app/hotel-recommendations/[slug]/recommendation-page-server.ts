import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export interface RecommendationPage {
  id: string
  slug: string
  title_ko: string
  where_countries: string[] | null
  where_cities: string[] | null
  companions: string[] | null
  styles: string[] | null
  hero_image_url: string | null
  intro_rich_ko: string | null
  hashtags: string[] | null
  status: string | null
  publish_at: string | null
  publish: boolean | null
  // SEO fields
  seo_title_ko: string | null
  seo_description_ko: string | null
  seo_canonical_url: string | null
  meta_robots: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  twitter_title: string | null
  twitter_description: string | null
  twitter_image_url: string | null
  seo_hreflang: any | null
  seo_schema_json: any | null
  sitemap_priority: number | null
  sitemap_changefreq: string | null
  created_at: string
  updated_at: string
}

export interface RecommendationPageHotel {
  id: number
  page_id: string
  sabre_id: number
  pin_to_top: boolean
  rank_manual: number | null
  badge_text_ko: string | null
  card_title_ko: string | null
  card_blurb_ko: string | null
  card_image_url: string | null
  gallery_image_urls: string[] | null
  match_where_note_ko: string | null
  match_companion_note_ko: string | null
  match_style_note_ko: string | null
  // 조인된 호텔 정보
  hotel: any
}

export async function getRecommendationPageData(slug: string) {
  const supabase = await createClient()
  
  console.log(`[ RecommendationPage ] "${slug}" 페이지 조회 시작`)
  
  // 1. recommendation page 기본 정보 조회
  const { data: recommendationPage, error: pageError } = await supabase
    .from('select_recommendation_pages')
    .select('*')
    .eq('slug', slug)
    .eq('publish', true)
    .single()
  
  if (pageError || !recommendationPage) {
    console.error('[ RecommendationPage ] 페이지 조회 실패:', pageError)
    return null
  }
  
  console.log(`[ RecommendationPage ] 페이지 정보 조회 완료:`, recommendationPage.title_ko)
  
  // 2. 해당 페이지에 연결된 호텔들 조회
  const { data: pageHotels, error: hotelsError } = await supabase
    .from('select_recommendation_page_hotels')
    .select('*')
    .eq('page_id', recommendationPage.id)
    .order('pin_to_top', { ascending: false })
    .order('rank_manual', { ascending: true, nullsFirst: false })
  
  if (hotelsError) {
    console.error('[ RecommendationPage ] 호텔 목록 조회 실패:', hotelsError)
    return { recommendationPage, hotels: [] }
  }
  
  if (!pageHotels || pageHotels.length === 0) {
    console.log('[ RecommendationPage ] 연결된 호텔이 없음')
    return { recommendationPage, hotels: [] }
  }
  
  console.log(`[ RecommendationPage ] 연결된 호텔 ${pageHotels.length}개 발견`)
  
  // 3. 호텔 상세 정보 조회
  const sabreIds = pageHotels.map(h => h.sabre_id)
  
  const { data: hotels, error: hotelDetailsError } = await supabase
    .from('select_hotels')
    .select('*')
    .in('sabre_id', sabreIds)
    .or('publish.is.null,publish.eq.true')
  
  if (hotelDetailsError) {
    console.error('[ RecommendationPage ] 호텔 상세 정보 조회 실패:', hotelDetailsError)
    return { recommendationPage, hotels: [] }
  }
  
  // 4. 호텔 이미지 조회
  const { data: mediaData } = await supabase
    .from('select_hotel_media')
    .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
    .in('sabre_id', sabreIds.map(id => String(id)))
    .order('image_seq', { ascending: true })
  
  // 각 호텔의 첫 번째 이미지 추출
  const hotelMediaMap = new Map<number, any>()
  if (mediaData) {
    mediaData.forEach(media => {
      const sabreId = parseInt(String(media.sabre_id))
      if (!hotelMediaMap.has(sabreId)) {
        hotelMediaMap.set(sabreId, media)
      }
    })
  }
  
  // 5. 호텔 정보 결합
  const enrichedHotels = pageHotels.map(pageHotel => {
    const hotelDetail = hotels?.find(h => h.sabre_id === pageHotel.sabre_id)
    const hotelMedia = hotelMediaMap.get(pageHotel.sabre_id)
    
    return {
      ...pageHotel,
      hotel: hotelDetail,
      hotelMedia: hotelMedia
    }
  }).filter(h => h.hotel) // 호텔 정보가 없는 경우 제외
  
  console.log(`[ RecommendationPage ] 최종 호텔 ${enrichedHotels.length}개 반환`)
  
  return {
    recommendationPage,
    hotels: enrichedHotels
  }
}


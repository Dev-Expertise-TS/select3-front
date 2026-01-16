import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    console.log('🔍 Accor 브랜드 배너 디버깅 시작...')
    
    // 1. select_feature_slots에서 '브랜드베너' + 'accor' 조회
    const { data: featureSlots, error: featureError } = await supabase
      .from('select_feature_slots')
      .select('*')
      .eq('surface', '브랜드베너')
      .eq('chain_slug', 'accor')
    
    console.log('📊 accor 브랜드베너 슬롯:', featureSlots)
    console.log('❌ accor 브랜드베너 에러:', featureError)
    
    if (featureError) {
      return NextResponse.json({ error: 'Feature slots 조회 오류', details: featureError }, { status: 500 })
    }
    
    const result: any = {
      accorBrandBanner: featureSlots,
      hasAccorBrandBanner: featureSlots && featureSlots.length > 0
    }
    
    if (!featureSlots || featureSlots.length === 0) {
      console.log('📭 accor 브랜드베너 데이터 없음, 상단베너 확인...')
      
      // 2. 일반 상단베너 데이터 확인
      const { data: topBannerSlots, error: topBannerError } = await supabase
        .from('select_feature_slots')
        .select('*')
        .eq('surface', '상단베너')
      
      console.log('📊 상단베너 슬롯:', topBannerSlots)
      console.log('❌ 상단베너 에러:', topBannerError)
      
      result.topBanner = topBannerSlots
      result.topBannerError = topBannerError
      
      if (topBannerSlots && topBannerSlots.length > 0) {
        const sabreId = topBannerSlots[0].sabre_id
        console.log(`🔄 Fallback으로 사용할 호텔 ID: ${sabreId}`)
        
        // 3. 해당 호텔의 정보 확인
        const { data: hotelData, error: hotelError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko')
          .eq('sabre_id', sabreId)
          .single()
        
        console.log('🏨 호텔 데이터:', hotelData)
        console.log('❌ 호텔 에러:', hotelError)
        
        result.hotelData = hotelData
        result.hotelError = hotelError
        
        // 4. select_hotel_media에서 이미지 확인
        const { data: mediaData, error: mediaError } = await supabase
          .from('select_hotel_media')
          .select('storage_path, public_url, file_name')
          .eq('sabre_id', String(sabreId))
          .order('image_seq', { ascending: true })
          .limit(1)
          .single()
        
        console.log('🖼️ 이미지 데이터:', mediaData)
        console.log('❌ 이미지 에러:', mediaError)
        
        result.mediaData = mediaData
        result.mediaError = mediaError
      }
    } else {
      // accor 브랜드베너 데이터가 있는 경우
      const sabreId = featureSlots[0].sabre_id
      console.log(`✅ accor 브랜드베너 호텔 ID: ${sabreId}`)
      
      // 호텔 정보 조회
      const { data: hotelData, error: hotelError } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_ko')
        .eq('sabre_id', sabreId)
        .single()
      
      console.log('🏨 호텔 데이터:', hotelData)
      console.log('❌ 호텔 에러:', hotelError)
      
      result.hotelData = hotelData
      result.hotelError = hotelError
      
      // 이미지 조회
      const { data: mediaData, error: mediaError } = await supabase
        .from('select_hotel_media')
        .select('storage_path, public_url, file_name')
        .eq('sabre_id', String(sabreId))
        .order('image_seq', { ascending: true })
        .limit(1)
        .single()
      
      console.log('🖼️ 이미지 데이터:', mediaData)
      console.log('❌ 이미지 에러:', mediaError)
      
      result.mediaData = mediaData
      result.mediaError = mediaError
    }
    
    // 5. 다른 브랜드와 비교 (예: marriott)
    const { data: marriottSlots, error: marriottError } = await supabase
      .from('select_feature_slots')
      .select('*')
      .eq('surface', '브랜드베너')
      .eq('chain_slug', 'marriott')
    
    console.log('📊 marriott 브랜드베너 슬롯:', marriottSlots)
    
    result.comparison = {
      marriott: marriottSlots,
      marriottError: marriottError
    }
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('💥 디버깅 중 오류:', error)
    return NextResponse.json({ error: '서버 오류', details: error }, { status: 500 })
  }
}

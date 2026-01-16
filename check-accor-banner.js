const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAccorBanner() {
  console.log('🔍 Accor 브랜드 배너 데이터 확인 중...')
  
  try {
    // 1. select_feature_slots에서 '브랜드베너' + 'accor' 조회
    const { data: featureSlots, error: featureError } = await supabase
      .from('select_feature_slots')
      .select('*')
      .eq('surface', '브랜드베너')
      .eq('chain_slug', 'accor')
    
    if (featureError) {
      console.error('❌ select_feature_slots 조회 오류:', featureError)
      return
    }
    
    console.log('📊 select_feature_slots 결과:', featureSlots)
    
    if (!featureSlots || featureSlots.length === 0) {
      console.log('📭 accor 브랜드베너 데이터가 없습니다.')
      
      // 2. 일반 상단베너 데이터 확인
      const { data: topBannerSlots, error: topBannerError } = await supabase
        .from('select_feature_slots')
        .select('*')
        .eq('surface', '상단베너')
      
      if (topBannerError) {
        console.error('❌ 상단베너 조회 오류:', topBannerError)
        return
      }
      
      console.log('📊 상단베너 데이터:', topBannerSlots)
      
      if (topBannerSlots && topBannerSlots.length > 0) {
        const sabreId = topBannerSlots[0].sabre_id
        console.log(`🔄 Fallback으로 사용할 호텔 ID: ${sabreId}`)
        
        // 3. 해당 호텔의 이미지 확인
        const { data: hotelData, error: hotelError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_ko')
          .eq('sabre_id', sabreId)
          .single()
        
        if (hotelError) {
          console.error('❌ 호텔 조회 오류:', hotelError)
          return
        }
        
        console.log('🏨 호텔 데이터:', hotelData)
        
        // 4. select_hotel_media에서 이미지 확인
        const { data: mediaData, error: mediaError } = await supabase
          .from('select_hotel_media')
          .select('storage_path, public_url, file_name')
          .eq('sabre_id', String(sabreId))
          .order('image_seq', { ascending: true })
          .limit(1)
          .single()
        
        if (mediaError) {
          console.warn('⚠️ 이미지 조회 실패:', mediaError.message)
        } else {
          console.log('🖼️ 이미지 데이터:', mediaData)
        }
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
      
      if (hotelError) {
        console.error('❌ 호텔 조회 오류:', hotelError)
        return
      }
      
      console.log('🏨 호텔 데이터:', hotelData)
      
      // 이미지 조회
      const { data: mediaData, error: mediaError } = await supabase
        .from('select_hotel_media')
        .select('storage_path, public_url, file_name')
        .eq('sabre_id', String(sabreId))
        .order('image_seq', { ascending: true })
        .limit(1)
        .single()
      
      if (mediaError) {
        console.warn('⚠️ 이미지 조회 실패:', mediaError.message)
      } else {
        console.log('🖼️ 이미지 데이터:', mediaData)
      }
    }
    
  } catch (error) {
    console.error('💥 오류 발생:', error)
  }
}

checkAccorBanner()

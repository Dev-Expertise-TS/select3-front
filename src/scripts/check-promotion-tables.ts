import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '설정됨' : '설정되지 않음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPromotionTables() {
  console.log('🔍 프로모션 관련 테이블 구조 확인 중...\n')

  try {
    // 1. select_hotel_promotions_map 테이블 확인
    console.log('📋 select_hotel_promotions_map 테이블:')
    const { data: mapData, error: mapError } = await supabase
      .from('select_hotel_promotions_map')
      .select('*')
      .limit(5)
    
    if (mapError) {
      console.error('❌ select_hotel_promotions_map 조회 실패:', mapError)
    } else {
      console.log('✅ 데이터 조회 성공')
      console.log('📊 샘플 데이터:', mapData)
      console.log('📊 총 레코드 수:', mapData?.length || 0)
    }

    // 2. select_hotel_promotions 테이블 확인
    console.log('\n📋 select_hotel_promotions 테이블:')
    const { data: promotionData, error: promotionError } = await supabase
      .from('select_hotel_promotions')
      .select('*')
      .limit(5)
    
    if (promotionError) {
      console.error('❌ select_hotel_promotions 조회 실패:', promotionError)
    } else {
      console.log('✅ 데이터 조회 성공')
      console.log('📊 샘플 데이터:', promotionData)
      console.log('📊 총 레코드 수:', promotionData?.length || 0)
    }

    // 3. select_feature_slots 테이블 확인 (프로모션 호텔 목록)
    console.log('\n📋 select_feature_slots 테이블:')
    const { data: featureData, error: featureError } = await supabase
      .from('select_feature_slots')
      .select('*')
      .eq('surface', '프로모션')
      .limit(5)
    
    if (featureError) {
      console.error('❌ select_feature_slots 조회 실패:', featureError)
    } else {
      console.log('✅ 데이터 조회 성공')
      console.log('📊 프로모션 surface 데이터:', featureData)
      console.log('📊 총 레코드 수:', featureData?.length || 0)
    }

    // 4. 실제 연결 테스트
    if (mapData && mapData.length > 0 && promotionData && promotionData.length > 0) {
      console.log('\n🔗 테이블 연결 테스트:')
      const sampleMap = mapData[0]
      console.log('📊 샘플 map 데이터:', sampleMap)
      
      if (sampleMap.promotion_id) {
        const { data: connectedPromotion, error: connectError } = await supabase
          .from('select_hotel_promotions')
          .select('*')
          .eq('id', sampleMap.promotion_id)
          .single()
        
        if (connectError) {
          console.error('❌ 연결 테스트 실패:', connectError)
        } else {
          console.log('✅ 연결 테스트 성공')
          console.log('📊 연결된 프로모션 데이터:', connectedPromotion)
        }
      }
    }

  } catch (error) {
    console.error('❌ 전체 확인 과정에서 오류 발생:', error)
  }
}

checkPromotionTables()
  .then(() => {
    console.log('\n✅ 프로모션 테이블 확인 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error)
    process.exit(1)
  })

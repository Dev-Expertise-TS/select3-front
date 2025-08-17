import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🧪 프로모션 훅 테스트 시작...')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPromotionHook() {
  const testSabreId = 52 // 실제 데이터에 있는 sabre_id

  console.log(`\n🔍 sabre_id ${testSabreId}의 프로모션 정보 테스트`)
  console.log('='.repeat(50))

  try {
    // 1. select_hotel_promotions_map에서 해당 호텔의 promotion_id 조회
    console.log('1️⃣ select_hotel_promotions_map 조회...')
    const { data: promotionMaps, error: mapError } = await supabase
      .from('select_hotel_promotions_map')
      .select('promotion_id')
      .eq('sabre_id', testSabreId)

    if (mapError) {
      console.error('❌ 프로모션 매핑 조회 실패:', mapError)
      return
    }

    if (!promotionMaps || promotionMaps.length === 0) {
      console.log('⚠️ 해당 호텔의 프로모션 매핑이 없습니다.')
      return
    }

    console.log('✅ 프로모션 매핑 조회 성공:', promotionMaps.length, '개')
    console.log('매핑 데이터:', promotionMaps)

    // 2. promotion_id들을 추출
    const promotionIds = promotionMaps.map(map => map.promotion_id)
    console.log('\n2️⃣ 추출된 promotion_id들:', promotionIds)

    // 3. select_hotel_promotions에서 프로모션 정보 조회
    console.log('\n3️⃣ select_hotel_promotions 조회...')
    const { data: promotions, error: promotionError } = await supabase
      .from('select_hotel_promotions')
      .select('promotion_id, promotion, booking_date, check_in_date')
      .in('promotion_id', promotionIds)

    if (promotionError) {
      console.error('❌ 프로모션 정보 조회 실패:', promotionError)
      return
    }

    console.log('✅ 프로모션 정보 조회 성공:', promotions?.length || 0, '개')
    if (promotions && promotions.length > 0) {
      console.log('프로모션 데이터:')
      promotions.forEach((promo, index) => {
        console.log(`  ${index + 1}. ${promo.promotion}`)
        console.log(`     예약: ${promo.booking_date || 'N/A'}`)
        console.log(`     체크인: ${promo.check_in_date || 'N/A'}`)
      })
    }

  } catch (error) {
    console.error('❌ 테스트 중 예외 발생:', error)
  }
}

// 실행
testPromotionHook()
  .then(() => {
    console.log('\n✅ 프로모션 훅 테스트 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 프로모션 훅 테스트 실패:', error)
    process.exit(1)
  })

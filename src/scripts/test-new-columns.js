require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testNewColumns() {
  console.log('=== select_hotels 테이블 새로운 컬럼명 테스트 ===')
  
  try {
    // 1. 새로운 컬럼명으로 select_hotels 조회
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, brand_id, slug')
      .limit(5)
    
    if (hotelsError) {
      console.log('❌ select_hotels 조회 실패:', hotelsError.message)
      return
    }
    
    console.log('✅ 새로운 컬럼명으로 조회 성공!')
    console.log(`📊 조회된 호텔 수: ${hotels.length}`)
    
    // 2. 각 호텔의 컬럼값 확인
    hotels.forEach((hotel, index) => {
      console.log(`\n🏨 호텔 ${index + 1}:`)
      console.log(`  - sabre_id: ${hotel.sabre_id}`)
      console.log(`  - property_name_ko: ${hotel.property_name_ko}`)
      console.log(`  - property_name_en: ${hotel.property_name_en}`)
      console.log(`  - city: ${hotel.city}`)
      console.log(`  - city_ko: ${hotel.city_ko}`)
      console.log(`  - city_en: ${hotel.city_en}`)
      console.log(`  - property_address: ${hotel.property_address}`)
      console.log(`  - brand_id: ${hotel.brand_id}`)
      console.log(`  - slug: ${hotel.slug}`)
    })
    
    // 3. city_ko, city_en 컬럼이 null이 아닌 값들 확인
    const { data: hotelsWithCity, error: cityError } = await supabase
      .from('select_hotels')
      .select('sabre_id, property_name_ko, city_ko, city_en')
      .not('city_ko', 'is', null)
      .limit(3)
    
    if (cityError) {
      console.log('❌ city_ko 컬럼 조회 실패:', cityError.message)
    } else {
      console.log('\n🌍 city_ko 컬럼이 있는 호텔들:')
      hotelsWithCity.forEach(hotel => {
        console.log(`  - ${hotel.property_name_ko}: city_ko=${hotel.city_ko}, city_en=${hotel.city_en}`)
      })
    }
    
  } catch (error) {
    console.log('❌ 오류 발생:', error)
  }
}

testNewColumns().catch(console.error)

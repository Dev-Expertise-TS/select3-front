import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔍 프로모션 테이블 구조 확인 시작...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseAnonKey ? '설정됨' : '설정되지 않음')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPromotionTables() {
  const tables = [
    'select_hotel_promotions',
    'select_hotel_promotions_map'
  ]

  for (const tableName of tables) {
    console.log(`\n📋 테이블: ${tableName}`)
    console.log('='.repeat(50))
    
    try {
      // 테이블 존재 여부 확인
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (error) {
        console.error(`❌ ${tableName} 테이블 오류:`, error)
        console.error('오류 코드:', error.code)
        console.error('오류 메시지:', error.message)
        console.error('오류 상세:', error.details)
        console.error('오류 힌트:', error.hint)
        continue
      }

      if (data && data.length > 0) {
        console.log(`✅ ${tableName} 테이블 데이터 조회 성공`)
        console.log('첫 번째 레코드:')
        console.log(JSON.stringify(data[0], null, 2))
        
        // 컬럼 정보 추출
        const columns = Object.keys(data[0])
        console.log(`\n📊 컬럼 목록 (${columns.length}개):`)
        columns.forEach((col, index) => {
          console.log(`${index + 1}. ${col}: ${typeof data[0][col as keyof typeof data[0]]}`)
        })
      } else {
        console.log(`⚠️ ${tableName} 테이블은 존재하지만 데이터가 없습니다.`)
        
        // 테이블 스키마 정보 확인 시도
        try {
          const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_table_schema', { table_name: tableName })
          
          if (!schemaError && schemaData) {
            console.log('테이블 스키마:', schemaData)
          }
        } catch (schemaErr) {
          console.log('스키마 정보 조회 실패 (정상)')
        }
      }
    } catch (err) {
      console.error(`❌ ${tableName} 테이블 확인 중 예외 발생:`, err)
    }
  }

  // 실제 데이터가 있는지 확인
  console.log('\n🔍 실제 프로모션 데이터 확인...')
  
  try {
    // select_hotel_promotions_map에서 실제 데이터 확인
    const { data: mapData, error: mapError } = await supabase
      .from('select_hotel_promotions_map')
      .select('*')
      .limit(5)

    if (mapError) {
      console.error('❌ select_hotel_promotions_map 조회 실패:', mapError)
    } else if (mapData && mapData.length > 0) {
      console.log('✅ select_hotel_promotions_map 데이터:', mapData.length, '개')
      console.log('샘플 데이터:', mapData[0])
    } else {
      console.log('⚠️ select_hotel_promotions_map에 데이터가 없습니다.')
    }

    // select_hotel_promotions에서 실제 데이터 확인
    const { data: promoData, error: promoError } = await supabase
      .from('select_hotel_promotions')
      .select('*')
      .limit(5)

    if (promoError) {
      console.error('❌ select_hotel_promotions 조회 실패:', promoError)
    } else if (promoData && promoData.length > 0) {
      console.log('✅ select_hotel_promotions 데이터:', promoData.length, '개')
      console.log('샘플 데이터:', promoData[0])
    } else {
      console.log('⚠️ select_hotel_promotions에 데이터가 없습니다.')
    }

  } catch (err) {
    console.error('❌ 프로모션 데이터 확인 중 예외 발생:', err)
  }
}

// 실행
checkPromotionTables()
  .then(() => {
    console.log('\n✅ 프로모션 테이블 확인 완료')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 프로모션 테이블 확인 실패:', error)
    process.exit(1)
  })

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSlugColumn() {
  try {
    console.log('🔍 select_hotels 테이블의 slug 컬럼 확인 중...')
    
    // 1. 테이블 스키마 확인
    const { data: schemaData, error: schemaError } = await supabase
      .from('select_hotels')
      .select('*')
      .limit(1)
    
    if (schemaError) {
      console.error('❌ 스키마 조회 실패:', schemaError)
      return
    }
    
    if (schemaData && schemaData.length > 0) {
      const firstRecord = schemaData[0]
      console.log('📋 첫 번째 레코드의 모든 컬럼:')
      console.log(Object.keys(firstRecord))
      
      // slug 컬럼 존재 여부 확인
      if ('slug' in firstRecord) {
        console.log('✅ slug 컬럼이 존재합니다!')
        console.log('📝 slug 값 예시:', firstRecord.slug)
        
        // slug가 있는 호텔들 조회
        const { data: slugHotels, error: slugError } = await supabase
          .from('select_hotels')
          .select('sabre_id, property_name_kor, slug')
          .not('slug', 'is', null)
          .limit(5)
        
        if (slugError) {
          console.error('❌ slug가 있는 호텔 조회 실패:', slugError)
        } else {
          console.log('📋 slug가 있는 호텔들:')
          slugHotels?.forEach(hotel => {
            console.log(`  - ${hotel.property_name_kor} (ID: ${hotel.sabre_id}, Slug: ${hotel.slug})`)
          })
        }
      } else {
        console.log('❌ slug 컬럼이 존재하지 않습니다!')
        console.log('💡 대안: property_name_kor을 기반으로 slug 생성이 필요할 수 있습니다.')
      }
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

checkSlugColumn()

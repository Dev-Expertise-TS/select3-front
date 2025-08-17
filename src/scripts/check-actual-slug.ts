import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkActualSlug() {
  try {
    console.log('🔍 select_hotels 테이블의 실제 slug 값 확인 중...')
    
    // slug 컬럼이 있는지 확인하고 실제 데이터 조회
    const { data: hotels, error } = await supabase
      .from('select_hotels')
      .select('sabre_id, property_name_kor, property_name_eng, slug')
      .limit(10)
    
    if (error) {
      console.error('❌ 데이터 조회 실패:', error)
      return
    }
    
    if (hotels && hotels.length > 0) {
      console.log('📋 호텔 데이터 (상위 10개):')
      hotels.forEach((hotel, index) => {
        console.log(`${index + 1}. ID: ${hotel.sabre_id}`)
        console.log(`   한글명: ${hotel.property_name_kor}`)
        console.log(`   영문명: ${hotel.property_name_eng}`)
        console.log(`   Slug: ${hotel.slug || 'NULL'}`)
        console.log('---')
      })
      
      // slug가 있는 호텔들만 필터링
      const hotelsWithSlug = hotels.filter(hotel => hotel.slug)
      console.log(`\n✅ slug가 있는 호텔: ${hotelsWithSlug.length}개`)
      
      if (hotelsWithSlug.length > 0) {
        console.log('\n📝 slug 값 예시:')
        hotelsWithSlug.slice(0, 5).forEach(hotel => {
          console.log(`  - ${hotel.property_name_kor}: ${hotel.slug}`)
        })
      }
    } else {
      console.log('❌ 데이터가 없습니다.')
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  }
}

checkActualSlug()

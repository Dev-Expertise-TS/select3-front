require('dotenv').config({ path: '.env.local' })

// select_hotels 테이블의 새로운 컬럼명 사용
// city_kor -> city_ko, city_eng -> city_en

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkHotelChainsSlug() {
  console.log('=== hotel_chains 테이블 slug 컬럼 확인 ===')
  
  try {
    // 1. hotel_chains 테이블에서 slug 컬럼 포함하여 데이터 조회 시도
    const { data: chains, error: chainError } = await supabase
      .from('hotel_chains')
      .select('chain_id, chain_name_en, chain_name_kr, slug')
      .order('chain_id')
    
    if (chainError) {
      console.log('❌ slug 컬럼이 포함된 조회 실패:', chainError.message)
      
      // 2. slug 컬럼 없이 다시 시도
      const { data: chainsWithoutSlug, error: chainError2 } = await supabase
        .from('hotel_chains')
        .select('chain_id, chain_name_en, chain_name_kr')
        .order('chain_id')
      
      if (chainError2) {
        console.log('❌ 기본 조회도 실패:', chainError2.message)
        return
      }
      
      console.log('📊 hotel_chains 기본 데이터 (slug 컬럼 없음):')
      chainsWithoutSlug.forEach(chain => {
        console.log(`  - chain_id: ${chain.chain_id}, name: ${chain.chain_name_en || chain.chain_name_kr}`)
      })
      
      console.log('\n🔍 slug 컬럼이 존재하지 않습니다.')
      console.log('💡 slug 컬럼을 추가하거나 기존 방식(chain_name_en 기반)을 사용해야 합니다.')
      
    } else {
      console.log('✅ slug 컬럼이 존재합니다!')
      console.log('\n📊 hotel_chains slug 데이터:')
      chains.forEach(chain => {
        console.log(`  - chain_id: ${chain.chain_id}, name: ${chain.chain_name_en || chain.chain_name_kr}, slug: ${chain.slug || 'NULL'}`)
      })
    }
    
  } catch (error) {
    console.log('❌ 오류 발생:', error)
  }
}

checkHotelChainsSlug().catch(console.error)

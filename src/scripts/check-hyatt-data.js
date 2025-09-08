require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경 변수가 설정되지 않았습니다.')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음')
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '설정됨' : '설정되지 않음')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkHyattData() {
  console.log('=== Hyatt Hotels Corporation 체인 데이터 확인 ===')
  
  // 1. hotel_chains에서 Hyatt 체인 찾기
  const { data: chains, error: chainError } = await supabase
    .from('hotel_chains')
    .select('*')
    .ilike('chain_name_en', '%Hyatt%')
  
  if (chainError) {
    console.log('❌ 체인 조회 실패:', chainError)
    return
  }
  
  console.log('✅ 체인 조회 결과:', chains)
  
  if (chains && chains.length > 0) {
    const chainId = chains[0].chain_id
    
    // 2. hotel_brands에서 해당 체인의 브랜드 찾기
    const { data: brands, error: brandError } = await supabase
      .from('hotel_brands')
      .select('*')
      .eq('chain_id', chainId)
    
    if (brandError) {
      console.log('❌ 브랜드 조회 실패:', brandError)
      return
    }
    
    console.log('✅ 브랜드 조회 결과:', brands)
    
    if (brands && brands.length > 0) {
      const brandIds = brands.map(b => b.brand_id)
      
      // 3. select_hotels에서 해당 브랜드의 호텔 찾기
      const { data: hotels, error: hotelError } = await supabase
        .from('select_hotels')
        .select('*')
        .in('brand_id', brandIds)
      
      if (hotelError) {
        console.log('❌ 호텔 조회 실패:', hotelError)
        return
      }
      
      console.log('✅ 호텔 조회 결과:', hotels)
    } else {
      console.log('⚠️ 해당 체인에 속한 브랜드가 없습니다.')
    }
  } else {
    console.log('⚠️ Hyatt 관련 체인을 찾을 수 없습니다.')
  }
}

checkHyattData().catch(console.error)

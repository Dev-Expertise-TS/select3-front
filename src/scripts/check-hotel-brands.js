require('dotenv').config({ path: '../.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkHotelBrands() {
  console.log('=== hotel_brands 테이블 전체 구조 확인 ===')
  
  // 1. hotel_brands 전체 데이터 조회
  const { data: brands, error: brandError } = await supabase
    .from('hotel_brands')
    .select('*')
    .order('brand_id')
  
  if (brandError) {
    console.log('❌ 브랜드 조회 실패:', brandError)
    return
  }
  
  console.log(`✅ 브랜드 총 개수: ${brands.length}`)
  console.log('📋 브랜드 데이터:')
  brands.forEach(brand => {
    console.log(`  - brand_id: ${brand.brand_id}, chain_id: ${brand.chain_id}, name: ${brand.brand_name_en || brand.brand_name_kr}`)
  })
  
  // 2. hotel_chains 전체 데이터 조회
  console.log('\n=== hotel_chains 테이블 전체 구조 확인 ===')
  const { data: chains, error: chainError } = await supabase
    .from('hotel_chains')
    .select('*')
    .order('chain_id')
  
  if (chainError) {
    console.log('❌ 체인 조회 실패:', chainError)
    return
  }
  
  console.log(`✅ 체인 총 개수: ${chains.length}`)
  console.log('📋 체인 데이터:')
  chains.forEach(chain => {
    console.log(`  - chain_id: ${chain.chain_id}, name: ${chain.chain_name_en || chain.chain_name_kr}`)
  })
  
  // 3. 연결 관계 분석
  console.log('\n=== 체인별 브랜드 연결 관계 분석 ===')
  chains.forEach(chain => {
    const chainBrands = brands.filter(b => b.chain_id === chain.chain_id)
    console.log(`  ${chain.chain_name_en || chain.chain_name_kr} (chain_id: ${chain.chain_id}): ${chainBrands.length}개 브랜드`)
    if (chainBrands.length === 0) {
      console.log(`    ⚠️ 브랜드가 없음 - 호텔을 찾을 수 없음`)
    }
  })
}

checkHotelBrands().catch(console.error)

import { createClient } from "@/lib/supabase/server"
import { ChainBrandPageClient } from "./chain-brand-page-client"

async function getAllChainsAndBrands() {
  const supabase = await createClient()
  
  console.log(`[ Server ] 모든 체인과 브랜드 조회 시작`)
  
  // 1. 모든 체인 조회
  const { data: allChains, error: chainsError } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr, slug')
    .order('chain_name_en')
  
  console.log(`[ Server ] 모든 체인 조회 결과:`, { data: allChains, error: chainsError })
  
  if (chainsError) {
    console.error('[ Server ] 모든 체인 조회 에러:', chainsError)
    return { allChains: [], allBrands: [] }
  }
  
  // 2. 모든 브랜드 조회
  const { data: allBrands, error: brandsError } = await supabase
    .from('hotel_brands')
    .select('brand_id, brand_name_en, brand_name_kr, chain_id')
    .order('brand_name_en')
  
  console.log(`[ Server ] 모든 브랜드 조회 결과:`, { data: allBrands, error: brandsError })
  
  if (brandsError) {
    console.error('[ Server ] 모든 브랜드 조회 에러:', brandsError)
    return { allChains: allChains || [], allBrands: [] }
  }
  
  console.log(`[ Server ] 체인 ${allChains?.length || 0}개, 브랜드 ${allBrands?.length || 0}개 조회 성공`)
  return { 
    allChains: allChains || [], 
    allBrands: allBrands || [] 
  }
}

export default async function ChainBrandPage() {
  const { allChains, allBrands } = await getAllChainsAndBrands()
  
  return (
    <ChainBrandPageClient
      allChains={allChains}
      allBrands={allBrands}
    />
  )
}

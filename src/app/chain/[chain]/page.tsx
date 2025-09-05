import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrandHotelsClient } from "@/features/brands"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface HotelRow {
  sabre_id: number
  property_name_ko: string
  property_name_en: string
  city: string
  city_ko?: string
  city_en?: string
  property_address: string
  brand_id?: string
  slug?: string
}

interface HotelChain {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string
}

// slug를 chain_name_en으로 역변환하는 함수 (toSlug의 역함수)
function fromSlug(slug: string): string {
  // 하이픈을 공백으로 변환하고 각 단어의 첫 글자를 대문자로
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// slug 컬럼을 사용하므로 alias 매핑이 필요 없음
// const slugAliasToName: Record<string, string> = {}

async function getChainHotels(chainSlug: string) {
  const supabase = await createClient()
  
  console.log(`[ Server ] 체인 slug '${chainSlug}'로 호텔 검색 시작`)
  
  // 1. hotel_chains에서 slug로 체인 찾기
  const { data: chains, error: chainsError } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr, slug')
    .eq('slug', chainSlug)
  
  console.log(`[ Server ] hotel_chains slug 조회 결과:`, { data: chains, error: chainsError })
  
  if (chainsError) {
    console.error('[ Server ] 호텔 체인 조회 에러:', chainsError)
    return { chain: null, hotels: [], allChains: [], selectedChainBrands: [] }
  }
  
  if (!chains || chains.length === 0) {
    console.warn(`[ Server ] slug '${chainSlug}'와 매칭되는 체인을 찾을 수 없습니다.`)
    return { chain: null, hotels: [], allChains: [], selectedChainBrands: [] }
  }
  
  const matchedChain = chains[0] // slug는 unique하므로 첫 번째 결과 사용
  console.log(`[ Server ] 체인 매칭 성공: ${matchedChain.chain_name_en} (chain_id: ${matchedChain.chain_id})`)
  
  // 3. hotel_brands에서 해당 chain_id를 가진 브랜드들 조회
  const { data: brands, error: brandsError } = await supabase
    .from('hotel_brands')
    .select('brand_id, brand_name_en, brand_name_kr')
    .eq('chain_id', matchedChain.chain_id)
  
  console.log(`[ Server ] hotel_brands 조회 결과:`, { data: brands, error: brandsError })
  
  if (brandsError) {
    console.error('[ Server ] 호텔 브랜드 조회 에러:', brandsError)
    return { chain: matchedChain, hotels: [], allChains: [], selectedChainBrands: [] }
  }
  
  if (!brands || brands.length === 0) {
    console.warn('[ Server ] 해당 체인에 속한 브랜드가 없습니다.')
    return { chain: matchedChain, hotels: [], allChains: [], selectedChainBrands: [] }
  }
  
  const brandIds = brands.map(b => b.brand_id)
  const brandIdStrings = brandIds.map(id => String(id))
  console.log(`[ Server ] 브랜드 ID들: ${brandIds.join(', ')}`)
  
  // 4. select_hotels에서 해당 brand_id를 가진 호텔들 조회 (image_1 포함)
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, brand_id, slug, image_1')
    .in('brand_id', brandIdStrings)
  
  console.log(`[ Server ] select_hotels 조회 결과:`, { data: hotels, error: hotelsError })
  
  if (hotelsError) {
    console.error('[ Server ] 호텔 조회 에러:', hotelsError)
    return { chain: matchedChain, hotels: [], allChains: [], selectedChainBrands: [] }
  }
  
  // 5. 모든 체인 조회 (필터용)
  const { data: allChains, error: allChainsError } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr, slug')
    .order('chain_name_en')
  
  if (allChainsError) {
    console.error('[ Server ] 모든 체인 조회 에러:', allChainsError)
    return { chain: matchedChain, hotels: hotels || [], allChains: [], selectedChainBrands: brands || [] }
  }
  
  console.log(`[ Server ] 호텔 ${hotels?.length || 0}개 조회 성공`)
  return { 
    chain: matchedChain, 
    hotels: hotels || [], 
    allChains: allChains || [], 
    selectedChainBrands: brands || [] 
  }
}

interface ChainPageProps { 
  params: Promise<{ chain: string }> 
}

export default async function ChainPage({ params }: ChainPageProps) {
  const { chain } = await params
  
  const { chain: chainRow, hotels, allChains, selectedChainBrands } = await getChainHotels(chain)
  
  if (!chainRow) {
    notFound()
  }
  
  // 호텔 데이터를 BrandHotelsClient에서 사용할 수 있는 형태로 변환
  const transformedHotels = hotels.map(hotel => ({
    id: hotel.sabre_id,
    name: hotel.property_name_en || hotel.property_name_ko,
    nameKo: hotel.property_name_ko,
    location: hotel.city_ko || hotel.city_en || hotel.city,
    address: hotel.property_address,
    image: hotel.image_1 || "/placeholder.svg", // image_1 사용
    brand: chainRow.chain_name_en,
    chain: chainRow.chain_name_en, // 체인 정보 추가
    rating: 0,
    price: "₩0",
    benefits: [],
    promotion: {
      title: chainRow.chain_name_en,
      bookingDeadline: "",
      stayPeriod: "",
      highlight: "",
    }
  }))

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <BrandHotelsClient 
        hotels={transformedHotels} 
        displayName={chainRow.chain_name_en}
        allChains={allChains}
        selectedChainBrands={selectedChainBrands}

      />
      <Footer />
    </div>
  )
}

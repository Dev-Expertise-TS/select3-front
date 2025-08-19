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
  city_kor?: string
  city_eng?: string
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

// 슬러그 → 체인 영문명 매핑(오버라이드)
const slugAliasToName: Record<string, string> = {
  'aman-resorts-international': 'Aman Resorts',
}

async function getChainHotels(chainSlug: string) {
  const supabase = await createClient()
  
  console.log(`[ Server ] 체인 slug '${chainSlug}'로 호텔 검색 시작`)
  
  // 1. 모든 hotel_chains를 가져와서 slug와 매칭
  const { data: allChains, error: chainsError } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr')
  
  console.log(`[ Server ] hotel_chains 조회 결과:`, { data: allChains, error: chainsError })
  
  if (chainsError) {
    console.error('[ Server ] 호텔 체인 조회 에러:', chainsError)
    return { chain: null, hotels: [] }
  }
  
  if (!allChains || allChains.length === 0) {
    console.warn('[ Server ] hotel_chains 테이블에 데이터가 없습니다.')
    return { chain: null, hotels: [] }
  }
  
  console.log(`[ Server ] 총 ${allChains.length}개의 체인 발견:`, allChains.map(c => `${c.chain_name_en} (${c.chain_id})`))
  
  // 2. slug와 매칭되는 체인 찾기 (오버라이드 우선 적용)
  let matchedChain = null as typeof allChains[number] | null

  const aliasName = slugAliasToName[chainSlug]
  if (aliasName) {
    matchedChain = allChains.find(c => c.chain_name_en === aliasName) || null
  }

  if (!matchedChain) {
    matchedChain = allChains.find(chain => {
      const chainSlugGenerated = chain.chain_name_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      console.log(`[ Server ] 체인 '${chain.chain_name_en}' -> slug: '${chainSlugGenerated}' vs 입력: '${chainSlug}'`)
      return chainSlugGenerated === chainSlug
    }) || null
  }
  
  if (!matchedChain) {
    console.warn(`[ Server ] 체인 slug '${chainSlug}'와 매칭되는 체인을 찾을 수 없습니다.`)
    console.log(`[ Server ] 사용 가능한 slug들:`, allChains.map(c => {
      const slug = c.chain_name_en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      return `${c.chain_name_en} -> ${slug}`
    }))
    return { chain: null, hotels: [] }
  }
  
  console.log(`[ Server ] 체인 매칭 성공: ${matchedChain.chain_name_en} (chain_id: ${matchedChain.chain_id})`)
  
  // 3. hotel_brands에서 해당 chain_id를 가진 brand_id들 조회
  const { data: brands, error: brandsError } = await supabase
    .from('hotel_brands')
    .select('brand_id')
    .eq('chain_id', matchedChain.chain_id)
  
  console.log(`[ Server ] hotel_brands 조회 결과:`, { data: brands, error: brandsError })
  
  if (brandsError) {
    console.error('[ Server ] 호텔 브랜드 조회 에러:', brandsError)
    return { chain: matchedChain, hotels: [] }
  }
  
  if (!brands || brands.length === 0) {
    console.warn('[ Server ] 해당 체인에 속한 브랜드가 없습니다.')
    return { chain: matchedChain, hotels: [] }
  }
  
  const brandIds = brands.map(b => b.brand_id)
  const brandIdStrings = brandIds.map(id => String(id))
  console.log(`[ Server ] 브랜드 ID들: ${brandIds.join(', ')}`)
  
  // 4. select_hotels에서 해당 brand_id를 가진 호텔들 조회
  const { data: hotels, error: hotelsError } = await supabase
    .from('select_hotels')
    .select('sabre_id, property_name_ko, property_name_en, city, city_kor, city_eng, property_address, brand_id, slug')
    .in('brand_id', brandIdStrings)
  
  console.log(`[ Server ] select_hotels 조회 결과:`, { data: hotels, error: hotelsError })
  
  if (hotelsError) {
    console.error('[ Server ] 호텔 조회 에러:', hotelsError)
    return { chain: matchedChain, hotels: [] }
  }
  
  console.log(`[ Server ] 호텔 ${hotels?.length || 0}개 조회 성공`)
  return { chain: matchedChain, hotels: hotels || [] }
}

interface ChainPageProps { 
  params: Promise<{ chain: string }> 
}

export default async function ChainPage({ params }: ChainPageProps) {
  const { chain } = await params
  
  const { chain: chainRow, hotels } = await getChainHotels(chain)
  
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
    image: "/placeholder.svg", // 기본 이미지 사용
    brand: chainRow.chain_name_en,
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
      <BrandHotelsClient hotels={transformedHotels} displayName={chainRow.chain_name_en} />
      <Footer />
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ChainPageClient } from "./chain-page-client"

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
  }
  
  // 4. select_hotels에서 호텔 조회
  let hotels: any[] = []
  
  // 4-1. brand_id로 조회 (brands가 있는 경우)
  if (brands && brands.length > 0) {
    const brandIds = brands.map(b => b.brand_id)
    const brandIdStrings = brandIds.map(id => String(id))
    console.log(`[ Server ] 브랜드 ID들: ${brandIds.join(', ')}`)
    
    const { data: hotelData, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, brand_id, slug, image_1')
      .eq('publish', true)
      .in('brand_id', brandIdStrings)
    
    console.log(`[ Server ] select_hotels (brand_id) 조회 결과:`, { data: hotelData, error: hotelsError })
    
    if (!hotelsError && hotelData) {
      hotels = hotelData
    }
  }
  
  // 4-2. brand_id로 호텔을 찾지 못한 경우 chain_en/chain_ko로 직접 조회
  if (hotels.length === 0) {
    console.log(`[ Server ] brand_id로 호텔을 찾을 수 없음. chain_en/chain_ko로 조회 시도...`)
    
    const { data: chainHotels, error: chainHotelsError } = await supabase
      .from('select_hotels')
      .select('sabre_id, property_name_ko, property_name_en, city, city_ko, city_en, property_address, brand_id, slug, image_1')
      .eq('publish', true)
      .or(`chain_en.ilike.%${matchedChain.chain_name_en}%,chain_ko.ilike.%${matchedChain.chain_name_kr || matchedChain.chain_name_en}%`)
    
    console.log(`[ Server ] select_hotels (chain_en/ko) 조회 결과:`, { data: chainHotels, error: chainHotelsError })
    
    if (!chainHotelsError && chainHotels) {
      hotels = chainHotels
    }
  }
  
  // 6. 모든 체인 조회 (필터용)
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
  
  // 브랜드 정보를 매핑하기 위한 Map 생성
  const brandMap = new Map(selectedChainBrands.map(brand => [String(brand.brand_id), brand]))

  // 호텔 데이터를 HotelSearchResults에서 사용할 수 있는 형태로 변환
  const transformedHotels = hotels.map(hotel => {
    const brandInfo = brandMap.get(String(hotel.brand_id))
    return {
      id: hotel.sabre_id,
      name: hotel.property_name_en || hotel.property_name_ko,
      nameKo: hotel.property_name_ko,
      location: hotel.city_ko || hotel.city_en || hotel.city,
      city: hotel.city_ko || hotel.city_en || hotel.city,
      address: hotel.property_address,
      image: hotel.image_1 || "/placeholder.svg",
      brand: brandInfo?.brand_name_kr || brandInfo?.brand_name_en || 'Unknown Brand',
      chain: chainRow.chain_name_kr || chainRow.chain_name_en,
      slug: hotel.slug,
      country: 'Unknown', // 국가 정보가 필요하면 추가
      rating: 0,
      price: "₩0",
      benefits: [],
      promotion: {
        title: brandInfo?.brand_name_kr || brandInfo?.brand_name_en || chainRow.chain_name_en,
        bookingDeadline: "",
        stayPeriod: "",
        highlight: "",
      }
    }
  })

  // 서버에서 필터 옵션 미리 계산 (영문 표시, 카운트 제거)
  const serverFilterOptions = {
    countries: [],
    cities: Array.from(new Set(transformedHotels.map(hotel => hotel.location))).map(city => ({
      id: city,
      label: city
    })).sort((a, b) => a.label.localeCompare(b.label)),
    brands: selectedChainBrands.map(brand => ({
      id: String(brand.brand_id),
      label: brand.brand_name_en || brand.brand_name_kr
    })).sort((a, b) => a.label.localeCompare(b.label)),
    chains: allChains.map(chain => ({
      id: String(chain.chain_id),
      label: chain.chain_name_en || chain.chain_name_kr
    })).sort((a, b) => a.label.localeCompare(b.label))
  }

  return (
    <ChainPageClient
      chainRow={chainRow}
      transformedHotels={transformedHotels}
      allChains={allChains}
      selectedChainBrands={selectedChainBrands}
      serverFilterOptions={serverFilterOptions}
    />
  )
}

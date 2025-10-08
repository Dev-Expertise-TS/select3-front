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
    .select('chain_id, chain_name_en, chain_name_ko, slug')
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
      .select('brand_id, brand_name_en, brand_name_ko')
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
    console.log(`[ Server ] 브랜드 ID들:`, {
      brandIds,
      brandIdStrings,
      types: brandIds.map(id => typeof id),
      includes65: brandIds.includes(65) || brandIdStrings.includes('65')
    })
    
    // 숫자형과 문자열형 모두 시도
    const { data: hotelData, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('*')
      .in('brand_id', brandIds) // 문자열이 아닌 원본 사용
    
    console.log(`[ Server ] select_hotels (brand_id) 조회 결과:`, { 
      count: hotelData?.length, 
      error: hotelsError,
      sampleHotels: hotelData?.slice(0, 3).map((h: any) => ({
        sabre_id: h.sabre_id,
        brand_id: h.brand_id,
        brand_id_type: typeof h.brand_id,
        property_name_ko: h.property_name_ko,
        publish: h.publish
      }))
    })
    
    if (!hotelsError && hotelData) {
      console.log(`[ Server ] publish 필터링 전 호텔 수: ${hotelData.length}`)
      console.log(`[ Server ] publish 값 분포:`, {
        total: hotelData.length,
        publishTrue: hotelData.filter((h: any) => h.publish === true).length,
        publishFalse: hotelData.filter((h: any) => h.publish === false).length,
        publishNull: hotelData.filter((h: any) => h.publish === null).length,
        publishUndefined: hotelData.filter((h: any) => h.publish === undefined).length,
      })
      
      // 클라이언트에서 publish 필터링 (false 제외)
      hotels = hotelData.filter((h: any) => h.publish !== false)
      console.log(`[ Server ] publish 필터링 후 호텔 수: ${hotels.length}`)
      
      // sabre_id 991과 99999가 있는지 확인
      const hotel991 = hotels.find((h: any) => h.sabre_id === 991)
      const hotel99999 = hotels.find((h: any) => h.sabre_id === 99999)
      console.log(`[ Server ] 특정 호텔 확인:`, {
        hotel991: hotel991 ? { sabre_id: 991, brand_id: hotel991.brand_id, publish: hotel991.publish } : 'NOT FOUND',
        hotel99999: hotel99999 ? { sabre_id: 99999, brand_id: hotel99999.brand_id, publish: hotel99999.publish } : 'NOT FOUND'
      })
    }
  }
  
  // 4-2. brand_id로 호텔을 찾지 못한 경우 chain_en/chain_ko로 직접 조회
  if (hotels.length === 0) {
    console.log(`[ Server ] brand_id로 호텔을 찾을 수 없음. chain_en/chain_ko로 조회 시도...`)
    
    const { data: chainHotels, error: chainHotelsError } = await supabase
      .from('select_hotels')
      .select('*')
      .or(`chain_en.ilike.%${matchedChain.chain_name_en}%,chain_ko.ilike.%${matchedChain.chain_name_ko || matchedChain.chain_name_en}%`)
    
    console.log(`[ Server ] select_hotels (chain_en/ko) 조회 결과:`, { data: chainHotels, error: chainHotelsError })
    
    if (!chainHotelsError && chainHotels) {
      // 클라이언트에서 publish 필터링 (false 제외)
      hotels = chainHotels.filter((h: any) => h.publish !== false)
    }
  }
  
  // 5. select_hotel_media에서 호텔 이미지 조회
  let hotelMediaData: any[] = []
  if (hotels.length > 0) {
    const hotelSabreIds = hotels.map(h => h.sabre_id)
    const { data: mediaData, error: mediaError } = await supabase
      .from('select_hotel_media')
      .select('*')
      .in('sabre_id', hotelSabreIds)
      .order('sort_order', { ascending: true })
    
    if (mediaError) {
      console.error('[ Server ] 호텔 미디어 조회 에러:', mediaError)
    } else {
      hotelMediaData = mediaData || []
      console.log(`[ Server ] 호텔 미디어 ${hotelMediaData.length}개 조회`)
    }
  }
  
  // 6. 모든 체인 조회 (필터용)
  const { data: allChains, error: allChainsError } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_ko, slug')
    .order('chain_name_en')
  
  if (allChainsError) {
    console.error('[ Server ] 모든 체인 조회 에러:', allChainsError)
    return { chain: matchedChain, hotels: hotels || [], allChains: [], selectedChainBrands: brands || [] }
  }
  
  console.log(`[ Server ] 호텔 ${hotels?.length || 0}개 조회 성공`)
  return { 
    chain: matchedChain, 
    hotels: hotels || [], 
    hotelMediaData: hotelMediaData || [],
    allChains: allChains || [], 
    selectedChainBrands: brands || [] 
  }
}

interface ChainPageProps { 
  params: Promise<{ chain: string }> 
}

export default async function ChainPage({ params }: ChainPageProps) {
  const { chain } = await params
  
  const { chain: chainRow, hotels, hotelMediaData, allChains, selectedChainBrands } = await getChainHotels(chain)
  
  if (!chainRow) {
    notFound()
  }
  
  // transformHotelsToAllViewCardData 함수 사용 (다른 페이지와 동일)
  const { transformHotelsToAllViewCardData } = await import('@/lib/hotel-utils')
  const transformedHotels = transformHotelsToAllViewCardData(hotels, hotelMediaData, selectedChainBrands)
  
  console.log(`[ Server ] 변환된 호텔 수: ${transformedHotels.length}`)
  console.log(`[ Server ] 변환된 호텔들:`, transformedHotels.map(h => ({ 
    sabre_id: h.sabre_id, 
    name: h.property_name_ko, 
    image: h.image, 
    slug: h.slug 
  })))

  // 서버에서 필터 옵션 미리 계산 (영문 표시, 카운트 제거)
  const serverFilterOptions = {
    countries: [],
    cities: Array.from(new Set(transformedHotels.map(hotel => hotel.city || hotel.city_ko))).map(city => ({
      id: city,
      label: city
    })).sort((a, b) => a.label.localeCompare(b.label)),
    brands: selectedChainBrands.map(brand => ({
      id: String(brand.brand_id),
      label: brand.brand_name_en || brand.brand_name_ko
    })).sort((a, b) => a.label.localeCompare(b.label)),
    chains: allChains.map(chain => ({
      id: String(chain.chain_id),
      label: chain.chain_name_en || chain.chain_name_ko
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

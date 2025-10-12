import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ChainPageClient } from "./chain-page-client"
import { getFirstImagePerHotel } from "@/lib/media-utils"

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
  
  // 여러 체인이 매칭될 수 있으므로, 브랜드가 있는 체인을 찾음
  let matchedChain = null
  let brands = null

  for (const chain of chains) {
    console.log(`[ Server ] chain_id ${chain.chain_id} (${chain.chain_name_en}) 확인 중...`)
    
    // 3. hotel_brands에서 해당 chain_id를 가진 브랜드들 조회
    const { data: chainBrands, error: brandsError } = await supabase
      .from('hotel_brands')
      .select('brand_id, brand_name_en, brand_name_ko')
      .eq('chain_id', chain.chain_id)
      .eq('status', 'active') // status='active'만 조회
    
    console.log(`[ Server ] chain_id ${chain.chain_id}의 hotel_brands 조회 결과:`, { 
      chainName: chain.chain_name_en,
      brandCount: chainBrands?.length || 0,
      error: brandsError 
    })

    if (brandsError) {
      console.error(`[ Server ] chain_id ${chain.chain_id}의 브랜드 조회 에러:`, brandsError)
      continue
    }

    // 브랜드가 있는 체인을 찾으면 선택
    if (chainBrands && chainBrands.length > 0) {
      matchedChain = chain
      brands = chainBrands
      console.log(`[ Server ] ✅ 브랜드가 있는 체인 선택: ${chain.chain_name_en} (chain_id: ${chain.chain_id}, 브랜드 수: ${chainBrands.length})`)
      break
    }
  }

  // 브랜드가 있는 체인을 찾지 못한 경우
  if (!matchedChain || !brands) {
    console.warn(`[ Server ] slug '${chainSlug}'에 브랜드가 있는 체인이 없습니다.`)
    return { chain: null, hotels: [], allChains: [], selectedChainBrands: [] }
  }
  
  // 4. select_hotels에서 호텔 조회 (brand_id로만 조회)
  let hotels: any[] = []
  
  if (brands && brands.length > 0) {
    const brandIds = brands.map(b => b.brand_id)
    
    console.log(`[ Server ] 브랜드 ID들로 호텔 조회:`, {
      chainId: matchedChain.chain_id,
      chainName: matchedChain.chain_name_en,
      brandIds,
      brandCount: brandIds.length
    })
    
    // brand_id로 호텔 조회 + publish 필터링 (DB 레벨에서)
    const { data: hotelData, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('*')
      .in('brand_id', brandIds)
      .or('publish.is.null,publish.eq.true') // DB 레벨에서 publish 필터링
    
    console.log(`[ Server ] select_hotels 조회 결과:`, { 
      count: hotelData?.length || 0, 
      error: hotelsError,
      sampleHotels: hotelData?.slice(0, 3).map((h: any) => ({
        sabre_id: h.sabre_id,
        brand_id: h.brand_id,
        property_name_ko: h.property_name_ko,
        publish: h.publish
      }))
    })
    
    if (!hotelsError && hotelData) {
      hotels = hotelData
      console.log(`[ Server ] 최종 호텔 수: ${hotels.length}`)
    }
  } else {
    console.warn(`[ Server ] 해당 체인(${matchedChain.chain_name_en})에 속한 브랜드가 없습니다.`)
  }
  
  // 5. select_hotel_media에서 호텔 이미지 조회 (각 호텔의 첫 번째 이미지)
  let hotelMediaData: any[] = []
  if (hotels.length > 0) {
    const hotelSabreIds = hotels.map(h => String(h.sabre_id))
    
    // 모든 이미지를 가져온 후 각 호텔별로 image_seq가 가장 작은 것 선택
    const { data: mediaData, error: mediaError } = await supabase
      .from('select_hotel_media')
      .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
      .in('sabre_id', hotelSabreIds)
      .order('image_seq', { ascending: true })
    
    if (mediaError) {
      console.error('[ Server ] 호텔 미디어 조회 에러:', mediaError)
    } else {
      // 각 호텔별로 첫 번째 이미지만 선택 (image_seq가 가장 작은 것)
      hotelMediaData = getFirstImagePerHotel(mediaData || [])
      console.log(`[ Server ] 호텔 미디어 ${hotelMediaData.length}개 조회 (각 호텔의 가장 작은 image_seq)`)
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
  searchParams: Promise<{ brand?: string }>
}

export default async function ChainPage({ params, searchParams }: ChainPageProps) {
  const { chain } = await params
  const { brand: brandParam } = await searchParams
  
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

  // 서버에서 필터 옵션 미리 계산 (모두 API에서 가져오도록 빈 배열로 설정)
  const serverFilterOptions = {
    countries: [], // API에서 전체 국가 목록을 가져오도록 빈 배열
    cities: [], // API에서 전체 도시 목록을 가져오도록 빈 배열
    brands: [], // API에서 전체 브랜드 목록을 가져오도록 빈 배열 (체인명 포함 형식)
    chains: [] // API에서 전체 체인 목록을 가져오도록 빈 배열
  }

  return (
    <ChainPageClient
      chainRow={chainRow}
      transformedHotels={transformedHotels}
      allChains={allChains}
      selectedChainBrands={selectedChainBrands}
      initialBrandId={brandParam || null}
      serverFilterOptions={serverFilterOptions}
    />
  )
}

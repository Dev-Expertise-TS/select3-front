import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyFromServer } from '@/lib/company-filter'
import { getErrorMessage } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // company 파라미터 추출 (쿠키 우선, 없으면 URL 파라미터)
    const company = await getCompanyFromServer(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    )
    
    console.log('🔄 필터 옵션 API 호출 시작', { company })
    
    // 호텔 데이터 조회 (필터 옵션 생성을 위해 모든 호텔 조회)
    // company=sk일 때 vcc=TRUE 필터 적용
    let hotelQuery = supabase
      .from('select_hotels')
      .select('city_code, city_ko, city_en, country_code, country_ko, country_en, brand_id, brand_id_2, brand_id_3, chain_ko, chain_en, publish, vcc')
      .or('publish.is.null,publish.eq.true')
    
    // company=sk일 때 vcc=TRUE 필터 적용
    if (company === 'sk') {
      hotelQuery = hotelQuery.eq('vcc', true)
    }
    
    const { data: hotels, error: hotelsError } = await hotelQuery
    
    console.log('📊 호텔 데이터 조회 결과:', {
      총호텔수: hotels?.length || 0,
      에러: hotelsError?.message || 'none',
      샘플데이터: hotels?.[0] ? {
        city_code: hotels[0].city_code,
        city_ko: hotels[0].city_ko,
        country_code: hotels[0].country_code,
        country_ko: hotels[0].country_ko,
        brand_id: hotels[0].brand_id
      } : null
    })
    
    if (hotelsError) {
      console.error('❌ 호텔 데이터 조회 오류:', getErrorMessage(hotelsError))
      throw hotelsError
    }
    
    // 필터 옵션 생성은 모든 호텔 기반 (publish 상관없이)
    const filteredHotels = hotels || []
    
    // 브랜드 데이터 조회
    const brandIds = Array.from(
      new Set(
        filteredHotels.flatMap((hotel: any) =>
          [hotel.brand_id, hotel.brand_id_2, hotel.brand_id_3].filter(
            (id: any) => id !== null && id !== undefined && id !== ''
          )
        )
      )
    )
    console.log('🔍 [브랜드] 호텔에서 추출한 고유 brand_id:', brandIds.length, brandIds.slice(0, 10))
    
    let brands: any[] = []
    if (brandIds.length > 0) {
      const { data: brandData, error: brandError } = await supabase
        .from('hotel_brands')
        .select('brand_id, brand_name_ko, brand_name_en, chain_id, status, brand_sort_order')
        .in('brand_id', brandIds)
        .eq('status', 'active')
        .order('brand_sort_order', { ascending: true })
      
      if (brandError) {
        console.error('❌ 브랜드 데이터 조회 오류:', getErrorMessage(brandError))
      } else {
        brands = brandData || []
        
        // company=sk일 때 vcc=TRUE인 체인에 속한 브랜드만 필터링
        if (company === 'sk' && brands.length > 0) {
          const chainIds = Array.from(new Set(brands.map((b: any) => b.chain_id).filter(Boolean)))
          if (chainIds.length > 0) {
            const { data: vccChainData } = await supabase
              .from('hotel_chains')
              .select('chain_id, vcc')
              .in('chain_id', chainIds)
              .eq('vcc', true)
            
            const vccChainIds = (vccChainData || []).map((c: any) => c.chain_id)
            brands = brands.filter((b: any) => !b.chain_id || vccChainIds.includes(b.chain_id))
            console.log('🏷️ 브랜드 데이터 (vcc=TRUE 체인만):', brands.length, '/', brandIds.length)
          }
        } else {
          console.log('🏷️ 브랜드 데이터 (status=active):', brands.length, '/', brandIds.length)
        }
        console.log('📋 조회된 브랜드 샘플:', brands.slice(0, 3).map((b: any) => ({
          id: b.brand_id,
          ko: b.brand_name_ko,
          en: b.brand_name_en,
          status: b.status
        })))
      }
    }
    
    // 도시 옵션 생성 (select_regions 테이블만 사용 - fallback 없음)
    console.log('🔍 [단계 1] select_regions 테이블 쿼리 시작...')
    
    const { data: cityRegions, error: cityError } = await supabase
      .from('select_regions')
      .select('city_code, city_ko, country_code, country_ko, city_sort_order')
      .eq('status', 'active')
      .eq('region_type', 'city')
      .order('city_sort_order', { ascending: true })
    
    console.log('🏙️ [단계 2] select_regions 쿼리 결과:', {
      성공여부: !cityError,
      조회결과개수: cityRegions?.length || 0,
      에러상세: cityError ? {
        message: cityError.message,
        code: cityError.code,
        details: cityError.details,
        hint: cityError.hint
      } : null,
      원본데이터샘플: cityRegions?.slice(0, 5)
    })
    
    if (cityError) {
      console.error('❌ [에러] 도시 데이터 조회 실패:', getErrorMessage(cityError))
      throw new Error(`도시 데이터 조회 실패: ${cityError.message}`)
    }
    
    if (!cityRegions || cityRegions.length === 0) {
      console.error('❌ [에러] select_regions 테이블이 비어있거나 조건에 맞는 데이터가 없습니다')
      console.error('확인사항:', {
        테이블존재여부: 'select_regions 테이블이 존재하는지 확인',
        데이터존재여부: 'status=active, region_type=city 데이터가 있는지 확인',
        권한확인: 'Supabase 서비스 롤에 select_regions 테이블 읽기 권한이 있는지 확인'
      })
      throw new Error('select_regions 테이블에서 도시 데이터를 찾을 수 없습니다')
    }
    
    console.log('✅ [단계 3] select_regions 데이터 검증 통과')
    
    const cityMap = new Map<string, { code: string; ko: string; country_code: string; country_ko: string }>()
    
    cityRegions.forEach((region: any) => {
      const cityCode = region.city_code
      const cityKo = region.city_ko
      const countryCode = region.country_code
      const countryKo = region.country_ko
      
      if (!cityCode || !cityKo) {
        console.warn('⚠️ city_code 또는 city_ko가 없는 레코드:', region)
        return
      }
      
      // city_code를 키로 사용
      cityMap.set(cityCode, { code: cityCode, ko: cityKo, country_code: countryCode, country_ko: countryKo })
    })
    
    const cities = Array.from(cityMap.values()).map(city => ({
      id: city.code,              // city_code를 ID로 사용 (예: TPE) - select_hotels.city_code와 매칭
      label: city.ko,             // city_ko를 표시 (예: 타이베이)
      country_code: city.country_code,  // 도시 선택 시 국가 자동 선택용
      country_ko: city.country_ko
    }))
    // city_sort_order로 이미 정렬되어 있으므로 추가 정렬 불필요
    
    console.log('✅ [단계 4] 최종 도시 옵션 생성 완료:', {
      개수: cities.length,
      처음5개: cities.slice(0, 5).map(c => c.label),
      마지막5개: cities.slice(-5).map(c => c.label),
      country_ko없는도시개수: cities.filter(c => !c.country_ko).length
    })
    
    // 국가 옵션 (select_regions 테이블에서 country_sort_order로 정렬)
    console.log('🔍 [국가] select_regions 테이블 쿼리 시작...')
    
    const { data: countryRegions, error: countryError } = await supabase
      .from('select_regions')
      .select('country_code, country_ko, country_sort_order')
      .eq('status', 'active')
      .eq('region_type', 'country')
      .order('country_sort_order', { ascending: true })
    
    console.log('🌍 [국가] select_regions 쿼리 결과:', {
      성공여부: !countryError,
      조회결과개수: countryRegions?.length || 0,
      에러상세: countryError?.message || 'none'
    })
    
    let countries: any[] = []
    
    if (countryError) {
      console.warn('⚠️ [국가] select_regions 조회 실패, select_hotels 데이터 사용:', getErrorMessage(countryError))
      // Fallback: select_hotels에서 국가 목록 추출
      const countryMap = new Map<string, { code: string; ko: string }>()
      filteredHotels.forEach((hotel: any) => {
        const countryCode = hotel.country_code
        const countryKo = hotel.country_ko
        if (countryCode && countryKo) {
          countryMap.set(countryCode, { code: countryCode, ko: countryKo })
        }
      })
      countries = Array.from(countryMap.values()).map(country => ({
        id: country.code,   // country_code를 ID로 사용 (예: TW) - select_hotels.country_code와 매칭
        label: country.ko   // country_ko를 표시 (예: 대만)
      })).sort((a: any, b: any) => a.label.localeCompare(b.label, 'ko'))
    } else if (countryRegions && countryRegions.length > 0) {
      // select_regions에서 정상 조회
      const countryMap = new Map<string, { code: string; ko: string }>()
      countryRegions.forEach((region: any) => {
        const countryCode = region.country_code
        const countryKo = region.country_ko
        if (countryCode && countryKo) {
          countryMap.set(countryCode, { code: countryCode, ko: countryKo })
        }
      })
      countries = Array.from(countryMap.values()).map(country => ({
        id: country.code,   // country_code를 ID로 사용 (예: TW) - select_hotels.country_code와 매칭
        label: country.ko   // country_ko를 표시 (예: 대만)
      }))
      // 이미 country_sort_order로 정렬되어 왔으므로 추가 정렬 불필요
    } else {
      console.warn('⚠️ [국가] select_regions가 비어있음, select_hotels 데이터 사용')
      // Fallback: select_hotels에서 국가 목록 추출
      const countryMap = new Map<string, string>()
      filteredHotels.forEach((hotel: any) => {
        const countryKo = hotel.country_ko
        if (countryKo) {
          countryMap.set(countryKo, countryKo)
        }
      })
      countries = Array.from(countryMap.values()).map(countryKo => ({
        id: countryKo,
        label: countryKo
      })).sort((a: any, b: any) => a.label.localeCompare(b.label, 'ko'))
    }
    
    console.log('🌍 최종 국가 옵션:', countries.length)
    
    // 체인 데이터 조회 (브랜드 표시용)
    const chainIds = Array.from(new Set(
      brands
        .filter(b => b.chain_id)
        .map(b => b.chain_id)
    ))
    
    console.log('🔗 체인 ID 목록:', chainIds.length, chainIds.slice(0, 5))
    
    let hotelChains: any[] = []
    if (chainIds.length > 0) {
      let chainQuery = supabase
        .from('hotel_chains')
        .select('chain_id, chain_name_en, chain_name_ko, chain_slug, status, chain_sort_order, vcc')
        .in('chain_id', chainIds)
        .eq('status', 'active')
      
      // company=sk일 때 vcc=TRUE인 체인만 필터링
      if (company === 'sk') {
        chainQuery = chainQuery.eq('vcc', true)
      }
      
      const { data: chainData, error: chainError } = await chainQuery
      
      if (chainError) {
        console.error('❌ 체인 데이터 조회 오류:', getErrorMessage(chainError))
      } else {
        hotelChains = chainData || []
        console.log('⛓️ hotel_chains 테이블에서 조회:', hotelChains.length, company === 'sk' ? '(vcc=TRUE만)' : '(전체)')
      }
    }
    
    // 브랜드 옵션 (브랜드영문명 (체인영문명) 형식)
    // company=sk일 때는 vcc=TRUE인 체인에 속한 브랜드만 포함
    const brandMap = new Map<string, { 
      id: number; 
      brand_name: string; 
      brand_en: string; 
      chain_id: number | null;
      chain_en: string | null; 
      chain_name_ko: string | null;
      sort_order: number 
    }>()
    filteredHotels.forEach((hotel: any) => {
      const hotelBrandIds = [hotel.brand_id, hotel.brand_id_2, hotel.brand_id_3].filter(
        (id: any) => id !== null && id !== undefined && id !== ''
      )
      hotelBrandIds.forEach((brandId: any) => {
        const brand = brands.find((b: any) => String(b.brand_id) === String(brandId))
        if (brand) {
          const chain = brand.chain_id 
            ? hotelChains.find((c: any) => c.chain_id === brand.chain_id)
            : null
          
          // company=sk일 때는 vcc=TRUE인 체인에 속한 브랜드만 포함
          if (company === 'sk' && brand.chain_id && !chain) {
            return // vcc=TRUE인 체인이 아니면 제외
          }
          
          const brandNameEn = brand.brand_name_en || brand.brand_name_ko || ''
          const chainNameEn = chain?.chain_name_en || ''
          const chainNameKo = chain?.chain_name_ko || ''
          
          brandMap.set(String(brandId), {
            id: brandId,
            brand_name: brand.brand_name_ko || brand.brand_name_en || '',
            brand_en: brandNameEn,
            chain_id: brand.chain_id || null,
            chain_en: chainNameEn || null,
            chain_name_ko: chainNameKo || null,
            sort_order: brand.brand_sort_order || 9999 // sort_order가 없으면 뒤로
          })
        }
      })
    })
    
    const brandOptions = Array.from(brandMap.values())
      .filter(brand => brand.brand_en && brand.brand_name) // 브랜드명이 있는 것만
      .map(brand => {
        // 표시: 브랜드영문명 (체인영문명)
        const displayLabel = brand.chain_en 
          ? `${brand.brand_en} (${brand.chain_en})`
          : brand.brand_en
        
        return {
          id: String(brand.id),
          label: displayLabel,
          brand_name: brand.brand_name,
          chain_id: brand.chain_id,
          chain_name_ko: brand.chain_name_ko,
          sort_order: brand.sort_order
        }
      })
      .sort((a: any, b: any) => {
        // brand_sort_order 기준으로 정렬 (낮은 순서부터)
        return a.sort_order - b.sort_order
      })
    
    console.log('🏷️ 브랜드 옵션:', {
      총개수: brandOptions.length,
      샘플: brandOptions.slice(0, 5),
      원본브랜드데이터: brands.length,
      브랜드Map크기: brandMap.size,
      체인데이터: hotelChains.length
    })
    
    // 체인 옵션 생성
    const chainMap = new Map<number, { id: number; name_ko: string; name_en: string; sort_order: number }>()
    hotelChains.forEach((chain: any) => {
      chainMap.set(chain.chain_id, {
        id: chain.chain_id,
        name_ko: chain.chain_name_ko || chain.chain_name_en || '',
        name_en: chain.chain_name_en || chain.chain_name_ko || '', // 영문명 우선
        sort_order: chain.chain_sort_order || 9999
      })
    })
    
    const chainOptions = Array.from(chainMap.values())
      .map(chain => ({
        id: String(chain.id),
        label: chain.name_en,
        name_en: chain.name_en,
        sort_order: chain.sort_order
      }))
      .sort((a, b) => a.sort_order - b.sort_order)
    
    console.log('⛓️ 체인 옵션:', {
      총개수: chainOptions.length,
      샘플: chainOptions.slice(0, 5)
    })
    
    const result = {
      cities,
      countries,
      brands: brandOptions,
      chains: chainOptions
    }
    
    console.log('✅ 필터 옵션 API 반환:', {
      도시: result.cities.length,
      국가: result.countries.length,
      브랜드: result.brands.length,
      체인: result.chains.length
    })
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('💥 필터 옵션 API 오류:', getErrorMessage(error))
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error)
      },
      { status: 500 }
    )
  }
}


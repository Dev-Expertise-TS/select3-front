import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    console.log('🔄 필터 옵션 API 호출 시작')
    
    // 호텔 데이터 조회 (필터 옵션 생성을 위해 모든 호텔 조회)
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('city_code, city_ko, city_en, country_code, country_ko, country_en, brand_id, chain_ko, chain_en, publish')
    
    console.log('📊 호텔 데이터 조회 결과:', {
      총호텔수: hotels?.length || 0,
      에러: hotelsError?.message || 'none'
    })
    
    if (hotelsError) {
      console.error('❌ 호텔 데이터 조회 오류:', hotelsError)
      throw hotelsError
    }
    
    // 필터 옵션 생성은 모든 호텔 기반 (publish 상관없이)
    const filteredHotels = hotels || []
    
    // 브랜드 데이터 조회
    const brandIds = [...new Set(filteredHotels.filter((h: any) => h.brand_id).map((h: any) => h.brand_id))]
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
        console.error('❌ 브랜드 데이터 조회 오류:', brandError)
      } else {
        brands = brandData || []
        console.log('🏷️ 브랜드 데이터 (status=active):', brands.length, '/', brandIds.length)
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
      .select('city_ko, country_ko, city_sort_order')
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
      console.error('❌ [에러] 도시 데이터 조회 실패:', cityError)
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
    
    const cityMap = new Map<string, { ko: string; country_ko: string }>()
    
    cityRegions.forEach((region: any) => {
      const cityKo = region.city_ko
      const countryKo = region.country_ko
      
      if (!cityKo) {
        console.warn('⚠️ city_ko가 없는 레코드:', region)
        return
      }
      
      cityMap.set(cityKo, { ko: cityKo, country_ko: countryKo })
    })
    
    const cities = Array.from(cityMap.values()).map(city => ({
      id: city.ko,
      label: city.ko,
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
      .select('country_ko, country_sort_order')
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
      console.warn('⚠️ [국가] select_regions 조회 실패, select_hotels 데이터 사용:', countryError.message)
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
    } else if (countryRegions && countryRegions.length > 0) {
      // select_regions에서 정상 조회
      const countryMap = new Map<string, string>()
      countryRegions.forEach((region: any) => {
        const countryKo = region.country_ko
        if (countryKo) {
          countryMap.set(countryKo, countryKo)
        }
      })
      countries = Array.from(countryMap.values()).map(countryKo => ({
        id: countryKo,
        label: countryKo
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
      const { data: chainData, error: chainError } = await supabase
        .from('hotel_chains')
        .select('chain_id, chain_name_en, chain_name_ko, slug, status')
        .in('chain_id', chainIds)
        .eq('status', 'active')
      
      if (chainError) {
        console.error('❌ 체인 데이터 조회 오류:', chainError)
      } else {
        hotelChains = chainData || []
        console.log('⛓️ hotel_chains 테이블에서 조회:', hotelChains.length)
      }
    }
    
    // 브랜드 옵션 (브랜드영문명 (체인영문명) 형식)
    const brandMap = new Map<string, { id: number; brand_name: string; brand_en: string; chain_en: string | null; sort_order: number }>()
    filteredHotels.forEach((hotel: any) => {
      if (hotel.brand_id) {
        const brand = brands.find((b: any) => b.brand_id === hotel.brand_id)
        if (brand) {
          const chain = brand.chain_id 
            ? hotelChains.find((c: any) => c.chain_id === brand.chain_id)
            : null
          
          const brandNameEn = brand.brand_name_en || brand.brand_name_ko || ''
          const chainNameEn = chain?.chain_name_en || ''
          
          brandMap.set(String(hotel.brand_id), {
            id: hotel.brand_id,
            brand_name: brand.brand_name_ko || brand.brand_name_en || '',
            brand_en: brandNameEn,
            chain_en: chainNameEn || null,
            sort_order: brand.brand_sort_order || 9999 // sort_order가 없으면 뒤로
          })
        }
      }
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
    
    const result = {
      cities,
      countries,
      brands: brandOptions
    }
    
    console.log('✅ 필터 옵션 API 반환:', {
      도시: result.cities.length,
      국가: result.countries.length,
      브랜드: result.brands.length
    })
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('💥 필터 옵션 API 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


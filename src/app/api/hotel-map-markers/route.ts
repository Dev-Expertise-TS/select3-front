import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveDestination } from '@/lib/regions/resolve-destination'
import { getErrorMessage } from '@/lib/logger'

type LatLng = { lat: number; lng: number }

type HotelMarker = {
  sabre_id: number | string
  slug?: string | null
  name: string
  property_name_ko?: string | null
  property_name_en?: string | null
  property_address: string
  location: LatLng
  benefits?: string[]
  badges?: string[]
  star_rating?: number | null
  image?: string | null
  area_ko?: string | null
  area_en?: string | null
  city_ko?: string | null
  city_en?: string | null
  country_ko?: string | null
  country_en?: string | null
  promotions?: Array<{ title: string; description?: string }>
}

function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init })
}

function jsonErr(message: string, status = 400, code?: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    { success: false, error: message, code, details },
    { status }
  )
}

function parseNumber(v: string | null): number | null {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

async function fetchJson(url: string) {
  const res = await fetch(url, { cache: 'no-store' })
  const text = await res.text()
  let data: unknown = null
  try {
    data = JSON.parse(text)
  } catch {
    // ignore
  }
  return { ok: res.ok, status: res.status, data, raw: text }
}

function toLatLng(x: unknown): LatLng | null {
  if (!x || typeof x !== 'object') return null
  const lat = (x as any).lat
  const lng = (x as any).lng
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  return { lat, lng }
}

function isMissingColumnError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const message = (err as { message?: unknown }).message
  return typeof message === 'string' && message.toLowerCase().includes('column') && message.toLowerCase().includes('does not exist')
}

async function runWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  let idx = 0
  const n = Math.max(1, concurrency)

  const runners = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (idx < items.length) {
      const cur = idx++
      results[cur] = await worker(items[cur])
    }
  })

  await Promise.all(runners)
  return results
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const destinationRaw = sp.get('destination')?.trim() || 'all'
    const limit = Math.min(Math.max(parseNumber(sp.get('limit')) ?? 200, 1), 500)

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return jsonErr('GOOGLE_MAPS_API_KEY is missing', 500, 'missing_env')
    }

    const supabase = await createClient()

    // destination 종류에 따라 호텔 목록을 최대한 잘 좁힌다 (컬럼 없을 수 있어 방어)
    // 실제 테이블 구조에 맞게 컬럼 선택
    // latitude, longitude, benefit, badge_1~3, star_rating 등은 테이블에 없으므로 제외
    // area_ko, area_en 추가 (지역 필터링용)
    const baseSelect =
      'sabre_id, slug, property_name_ko, property_name_en, property_address, city_code, country_code, city_ko, city_en, country_ko, country_en, area_ko, area_en, publish, badge, image'

    const merged: any[] = []
    const errors: any[] = []

    const addResult = (r: any) => {
      if (r?.error) {
        if (isMissingColumnError(r.error)) return
        errors.push(r.error)
        return
      }
      if (r?.data) merged.push(...r.data)
    }

    let resolved: Awaited<ReturnType<typeof resolveDestination>>
    let center: LatLng = { lat: 37.5665, lng: 126.9780 } // 기본값 (서울)

    // destination이 "all"이거나 비어있으면 전체 호텔 조회
    if (destinationRaw === 'all' || !destinationRaw) {
      // 전체 호텔 조회 (리스팅된 호텔만)
      addResult(
        await supabase
          .from('select_hotels')
          .select(baseSelect)
          .eq('publish', true)
          .order('property_name_en')
          .limit(limit)
      )

      resolved = {
        kind: 'unknown',
        label: '전체',
        queryText: '전체',
        country_code: null,
        country_label: null,
      }
      // 전체 호텔의 경우 중심을 기본값(서울)으로 설정
    } else {
      // destination 기반 필터링
      resolved = await resolveDestination(destinationRaw)

      console.log(`[hotel-map-markers] destination="${destinationRaw}", resolved.kind="${resolved.kind}", resolved.label="${resolved.label}"`)

      // destination이 "bali"인 경우: city_ko = "발리"이고 publish != false인 모든 호텔 조회
      if (destinationRaw.toLowerCase() === 'bali') {
        console.log(`[hotel-map-markers] 발리 호텔 조회: city_ko="발리", publish != false`)
        const baliHotelsResult = await supabase
          .from('select_hotels')
          .select(baseSelect)
          .eq('city_ko', '발리')
          .neq('publish', false) // publish가 FALSE가 아닌 값들
          .order('property_name_en')
          .limit(limit)
        
        console.log(`[hotel-map-markers] 발리 호텔 조회 결과 (city_ko=발리):`, {
          count: baliHotelsResult.data?.length || 0,
          error: baliHotelsResult.error,
          sample: baliHotelsResult.data?.slice(0, 3).map((h: any) => ({ 
            sabre_id: h.sabre_id, 
            name: h.property_name_ko, 
            city_ko: h.city_ko,
            publish: h.publish,
            area_ko: h.area_ko
          }))
        })
        addResult(baliHotelsResult)
        
        // resolved도 'city'로 설정하여 하단 지역 목록 조회 로직이 실행되도록 함
        if (resolved.kind === 'unknown') {
          resolved = {
            kind: 'city',
            label: '발리',
            queryText: '발리',
            city_code: 'BALI'
          }
        }
      } else if (resolved.kind === 'city') {
        const cityQuery = supabase
          .from('select_hotels')
          .select(baseSelect)
          .neq('publish', false) // publish가 FALSE가 아닌 값들
          .limit(limit)
        
        if (resolved.city_code) {
          addResult(await cityQuery.eq('city_code', resolved.city_code).order('property_name_en'))
        } else {
          addResult(await cityQuery.eq('city_ko', resolved.label).order('property_name_en'))
        }
      } else if (resolved.kind === 'country' && resolved.country_code) {
        addResult(
          await supabase
            .from('select_hotels')
            .select(baseSelect)
            .eq('country_code', resolved.country_code)
            .neq('publish', false) // publish가 FALSE가 아닌 값들
            .order('property_name_en')
            .limit(limit)
        )
      } else {
        // fallback: city_ko/city_en/city_slug/area_ko/area_en/country_en 정확 일치 및 부분 일치로 시도
        const region = resolved.label
        const regionLower = region.toLowerCase() // city_slug는 보통 소문자로 저장됨
        console.log(`[hotel-map-markers] Fallback 필터링 시도: region="${region}", regionLower="${regionLower}", kind="${resolved.kind}"`)
        
        // 정확 일치 시도
        const exactFields = ['city_ko', 'city_slug', 'area_ko', 'area_en', 'country_en'] as const
        const exactResults = await Promise.all(
          exactFields.map((field) => {
            // city_slug는 소문자로 검색
            const searchValue = field === 'city_slug' ? regionLower : region
            return supabase
              .from('select_hotels')
              .select(baseSelect)
              .eq(field, searchValue)
              .neq('publish', false) // publish가 FALSE가 아닌 값들
              .order('property_name_en')
              .limit(limit)
          })
        )
        
        // city_en은 대소문자 변형 모두 시도 (Bali, bali 등)
        const cityEnVariants = [
          region, // 원본 (예: "Bali")
          regionLower, // 소문자 (예: "bali")
          region.charAt(0).toUpperCase() + region.slice(1).toLowerCase(), // 첫 글자만 대문자 (예: "Bali")
        ]
        const cityEnResults = await Promise.all(
          [...new Set(cityEnVariants)].map((variant) =>
            supabase
              .from('select_hotels')
              .select(baseSelect)
              .eq('city_en', variant)
              .neq('publish', false) // publish가 FALSE가 아닌 값들
              .order('property_name_en')
              .limit(limit)
          )
        )
        
        // 모든 결과 병합
        for (const r of [...exactResults, ...cityEnResults]) {
          if (r.data && r.data.length > 0) {
            console.log(`[hotel-map-markers] 정확 일치 결과: ${r.data.length}개 호텔 발견`)
          }
          addResult(r)
        }
        
        // 부분 일치 시도 (ilike 사용, 대소문자 구분 없음)
        const ilikeFields = ['city_ko', 'city_en', 'city_slug', 'area_ko', 'area_en', 'country_en'] as const
        const ilikeResults = await Promise.all(
          ilikeFields.map((field) =>
            supabase
              .from('select_hotels')
              .select(baseSelect)
              .ilike(field, `%${region}%`)
              .neq('publish', false) // publish가 FALSE가 아닌 값들
              .order('property_name_en')
              .limit(limit)
          )
        )
        for (const r of ilikeResults) {
          if (r.data && r.data.length > 0) {
            console.log(`[hotel-map-markers] 부분 일치 결과: ${r.data.length}개 호텔 발견`)
          }
          addResult(r)
        }
      }

      // destination 중심 좌표
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        resolved.queryText
      )}&key=${encodeURIComponent(apiKey)}`
      const geo = await fetchJson(geoUrl)
      const geoCenter = toLatLng((geo.data as any)?.results?.[0]?.geometry?.location)
      if (geoCenter) {
        center = geoCenter
      }
    }

    const hotels = merged
      .filter((h) => h?.publish !== false) // publish가 FALSE가 아닌 값들만
      .filter((h, idx, self) => idx === self.findIndex((x) => String(x.sabre_id) === String(h.sabre_id)))
      .slice(0, limit)

    console.log(`[hotel-map-markers] 최종 필터링 결과: ${hotels.length}개 호텔 (destination="${destinationRaw}", resolved.kind="${resolved.kind}", resolved.label="${resolved.label}")`)

    if (hotels.length === 0 && errors.length > 0) {
      console.error(`[hotel-map-markers] 호텔 조회 실패:`, errors.map(e => getErrorMessage(e)))
      return jsonErr('호텔 목록을 가져올 수 없습니다', 500, 'hotels_query_failed')
    }

    // select_hotel_media에서 호텔 이미지 조회
    const sabreIds = hotels.map((h: any) => String(h.sabre_id))
    const { data: mediaData } = await supabase
      .from('select_hotel_media')
      .select('sabre_id, public_url, storage_path, image_seq')
      .in('sabre_id', sabreIds)
      .order('image_seq', { ascending: true })
    
    // 각 호텔별로 첫 번째 이미지 매핑
    const hotelImageMap = new Map<string, string>()
    if (mediaData) {
      for (const media of mediaData) {
        const sabreId = String(media.sabre_id)
        if (!hotelImageMap.has(sabreId)) {
          const imageUrl = media.public_url || media.storage_path
          if (imageUrl) {
            hotelImageMap.set(sabreId, imageUrl)
          }
        }
      }
    }
    
    console.log(`[hotel-map-markers] 호텔 이미지 매핑: ${hotelImageMap.size}개 호텔에 이미지 있음`)

    // select_hotels 테이블에 latitude, longitude 컬럼이 없으므로
    // 전체 호텔 중심점 계산은 Geocoding으로 얻은 좌표를 사용하거나 기본값 사용

    // 각 호텔 주소 지오코딩 (캐시 우선, 없으면 Geocoding API 호출 후 저장)
    const concurrency = 5
    const updatesToSave: Array<{ sabre_id: number; lat: number; lng: number }> = []
    let cacheHits = 0
    let cacheMisses = 0
    
    const geocoded = await runWithConcurrency(hotels, concurrency, async (h) => {
      const name = (h.property_name_ko || h.property_name_en || `Hotel ${h.sabre_id}`) as string
      const address = (h.property_address || '').toString().trim()
      if (!address) return null

      // select_hotels 테이블에 latitude, longitude 컬럼이 없으므로 항상 Geocoding API 호출
      cacheMisses++
      const country = (h.country_en || h.country_ko || resolved.country_label || '').toString().trim()
      const query = [address, country].filter(Boolean).join(', ')
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`
      const rGeo = await fetchJson(url)
      const loc = toLatLng((rGeo.data as any)?.results?.[0]?.geometry?.location)
      
      // Geocoding 성공 시 DB에 저장 (비동기로 나중에 일괄 업데이트)
      // 주의: select_hotels 테이블에 latitude, longitude 컬럼이 없으면 저장하지 않음
      if (loc && h.sabre_id) {
        updatesToSave.push({
          sabre_id: typeof h.sabre_id === 'number' ? h.sabre_id : Number(h.sabre_id),
          lat: loc.lat,
          lng: loc.lng,
        })
      }
      
      if (!loc) return null

      // 배지 정보 수집 (badge 컬럼만 존재)
      const badges: string[] = []
      if (h.badge && typeof h.badge === 'string' && h.badge.trim()) {
        badges.push(h.badge.trim())
      }

      // 이미지 URL 처리: select_hotel_media 우선, 없으면 select_hotels.image 사용
      const sabreIdStr = String(h.sabre_id)
      let imageUrl: string | null = hotelImageMap.get(sabreIdStr) || null
      
      // select_hotel_media에 없으면 select_hotels.image 컬럼 확인
      if (!imageUrl && typeof h.image === 'string' && h.image.trim()) {
        const imageValue = h.image.trim()
        // 이미 전체 URL인 경우 그대로 사용
        if (imageValue.startsWith('http') || imageValue.startsWith('https')) {
          imageUrl = imageValue
        } else if (h.slug) {
          // 파일명만 있는 경우 Supabase Storage URL 생성
          const baseUrl = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/${encodeURIComponent(h.slug)}/${encodeURIComponent(imageValue)}`
          imageUrl = baseUrl
        } else {
          imageUrl = imageValue
        }
      }

      const marker: HotelMarker = {
        sabre_id: h.sabre_id,
        slug: h.slug ?? null,
        name,
        property_name_ko: typeof h.property_name_ko === 'string' ? h.property_name_ko : null,
        property_name_en: typeof h.property_name_en === 'string' ? h.property_name_en : null,
        property_address: address,
        location: loc,
        benefits: undefined, // select_hotels 테이블에 benefit 컬럼이 없음 (select_hotel_benefits_map에서 조회 필요)
        badges: badges.length > 0 ? badges : undefined,
        star_rating: null, // select_hotels 테이블에 star_rating 컬럼이 없음
        image: imageUrl,
        area_ko: typeof h.area_ko === 'string' ? h.area_ko : null,
        area_en: typeof h.area_en === 'string' ? h.area_en : null,
        city_ko: typeof h.city_ko === 'string' ? h.city_ko : null,
        city_en: typeof h.city_en === 'string' ? h.city_en : null,
        country_ko: typeof h.country_ko === 'string' ? h.country_ko : null,
        country_en: typeof h.country_en === 'string' ? h.country_en : null,
        promotions: undefined, // select_feature_slots에서 조회 필요
      }
      return marker
    })

    // 4. 지오코딩 결과 캐싱 시도 (선택 사항 - 테이블 구조에 따라 실패할 수 있음)
    // 현재 select_hotels 테이블에 latitude, longitude 컬럼이 없는 것으로 파악됨
    // 불필요한 에러 로그 방지를 위해 캐싱 로직 생략 또는 안전하게 처리
    /* 
    if (updatesToSave.length > 0) {
      // ... 
    }
    */

    const markers = geocoded.filter((m): m is HotelMarker => Boolean(m))

    // 디버깅: area_ko 값 확인
    console.log(`[API] 마커 area_ko 값 샘플 (처음 10개):`, markers.slice(0, 10).map(m => ({ 
      name: m.name, 
      area_ko: m.area_ko,
      city_ko: m.city_ko 
    })))
    const areaKoValues = new Set(markers.filter(m => m.area_ko).map(m => m.area_ko))
    console.log(`[API] 마커에 포함된 모든 area_ko 값:`, Array.from(areaKoValues).sort())

    // 5. 해당 도시의 모든 지역(area) 정보 구성 (공식 지역 + 호텔 실제 지역 병합)
    const areaMap = new Map<string, { id: string; area_ko: string; area_en: string | null }>()

    // 5-1. 공식 지역 목록 (select_regions)
    // resolved.kind가 'city'이거나 destination이 'bali'인 경우 지역 목록 조회
    const shouldFetchAreas = resolved.kind === 'city' || destinationRaw.toLowerCase() === 'bali'
    if (shouldFetchAreas) {
      let query = supabase
        .from('select_regions')
        .select('id, area_ko, area_en, region_type, status, city_ko, city_code')
        .eq('region_type', 'area')
        .eq('status', 'active')
      
      // city_code로 조회 (BALI인 경우)
      const cityCode = resolved.kind === 'city' && resolved.city_code ? resolved.city_code : (destinationRaw.toLowerCase() === 'bali' ? 'BALI' : null)
      if (cityCode) {
        query = query.eq('city_code', cityCode)
        console.log(`[API] 지역 목록 조회: city_code="${cityCode}"`)
      } else if (resolved.kind === 'city') {
        query = query.eq('city_ko', resolved.label === '발리' ? '발리' : resolved.label)
        console.log(`[API] 지역 목록 조회: city_ko="${resolved.label === '발리' ? '발리' : resolved.label}"`)
      }

      const { data: officialAreas } = await query
      
      console.log(`[API] 공식 지역(select_regions) 조회 결과: ${officialAreas?.length || 0}개`)
      if (officialAreas && officialAreas.length > 0) {
        console.log(`[API] 공식 지역 목록:`, officialAreas.map(a => ({ id: a.id, area_ko: a.area_ko, area_en: a.area_en })))
      }
      
      if (officialAreas) {
        officialAreas.forEach(a => {
          if (a.area_ko) {
            areaMap.set(a.area_ko, {
              id: String(a.id),
              area_ko: a.area_ko,
              area_en: a.area_en
            })
          }
        })
      }
    }

    // 5-2. 실제 호텔 데이터 전체에서 추출한 지역 목록 (누락 방지)
    if (shouldFetchAreas) {
      let query = supabase
        .from('select_hotels')
        .select('area_ko, area_en')
        .neq('publish', false) // publish가 FALSE가 아닌 값들
      
      // destination이 "bali"인 경우 city_ko = "발리"로 조회
      if (destinationRaw.toLowerCase() === 'bali') {
        query = query.eq('city_ko', '발리')
        console.log(`[API] 지역 목록 조회: city_ko="발리"`)
      } else {
        const cityCode = resolved.kind === 'city' && resolved.city_code ? resolved.city_code : null
        if (cityCode) {
          query = query.eq('city_code', cityCode)
        } else if (resolved.kind === 'city') {
          query = query.eq('city_ko', resolved.label)
        }
      }

      const { data: allHotelAreas } = await query
      console.log(`[API] 해당 도시 모든 호텔의 area_ko 추출 결과: ${allHotelAreas?.length || 0}개`)
      
      if (allHotelAreas) {
        // area_ko 값 분포 확인
        const areaKoDistribution = new Map<string, number>()
        allHotelAreas.forEach(h => {
          if (h.area_ko) {
            areaKoDistribution.set(h.area_ko, (areaKoDistribution.get(h.area_ko) || 0) + 1)
          }
        })
        console.log(`[API] 호텔 area_ko 값 분포:`, Array.from(areaKoDistribution.entries()).sort((a, b) => b[1] - a[1]))
        
        const newAreas: string[] = []
        allHotelAreas.forEach(h => {
          if (h.area_ko && !areaMap.has(h.area_ko)) {
            newAreas.push(h.area_ko)
            areaMap.set(h.area_ko, {
              id: `ext-${h.area_ko}`,
              area_ko: h.area_ko,
              area_en: h.area_en || null
            })
          }
        })
        if (newAreas.length > 0) {
          console.log(`[API] 호텔 데이터에서 새로 추가된 지역:`, newAreas)
        }
      }
    }

    const cityAreas = Array.from(areaMap.values()).sort((a, b) => 
      a.area_ko.localeCompare(b.area_ko, 'ko')
    )
    console.log(`[API] 최종 병합된 지역 리스트 (${cityAreas.length}개):`, cityAreas.map(a => a.area_ko))

    return jsonOk(
      {
        destination: destinationRaw,
        resolved,
        center,
        count: markers.length,
        requested: hotels.length,
        markers,
        areas: cityAreas,
        cache: {
          hits: cacheHits,
          misses: cacheMisses,
          hitRate: markers.length > 0 ? (cacheHits / markers.length) * 100 : 0,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('hotel-map-markers api error:', getErrorMessage(err))
    return jsonErr('서버 오류가 발생했습니다', 500)
  }
}



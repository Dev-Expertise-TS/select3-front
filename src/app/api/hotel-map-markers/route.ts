import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveDestination } from '@/lib/regions/resolve-destination'

type LatLng = { lat: number; lng: number }

type HotelMarker = {
  sabre_id: number | string
  slug?: string | null
  name: string
  property_address: string
  location: LatLng
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
    // latitude, longitude 컬럼도 포함 (없으면 에러 무시됨)
    const baseSelect =
      'sabre_id, slug, property_name_ko, property_name_en, property_address, city_code, country_code, city_ko, city_en, country_ko, country_en, publish, latitude, longitude'

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
      // 전체 호텔 조회
      addResult(
        await supabase
          .from('select_hotels')
          .select(baseSelect)
          .or('publish.is.null,publish.eq.true')
          .order('property_name_en')
          .limit(limit)
      )

      resolved = {
        kind: 'unknown',
        label: '전체',
        queryText: '전체',
        city_code: null,
        country_code: null,
        country_label: null,
      }
      // 전체 호텔의 경우 중심을 기본값(서울)으로 설정
    } else {
      // destination 기반 필터링
      resolved = await resolveDestination(destinationRaw)

      if (resolved.kind === 'city' && resolved.city_code) {
        addResult(
          await supabase
            .from('select_hotels')
            .select(baseSelect)
            .eq('city_code', resolved.city_code)
            .or('publish.is.null,publish.eq.true')
            .order('property_name_en')
            .limit(limit)
        )
      } else if (resolved.kind === 'country' && resolved.country_code) {
        addResult(
          await supabase
            .from('select_hotels')
            .select(baseSelect)
            .eq('country_code', resolved.country_code)
            .or('publish.is.null,publish.eq.true')
            .order('property_name_en')
            .limit(limit)
        )
      } else {
        // fallback: city_ko/city_en/area_ko/area_en 정확 일치로 시도
        const region = resolved.label
        const fields = ['city_ko', 'city_en', 'area_ko', 'area_en'] as const
        const results = await Promise.all(
          fields.map((field) =>
            supabase
              .from('select_hotels')
              .select(baseSelect)
              .eq(field, region)
              .or('publish.is.null,publish.eq.true')
              .order('property_name_en')
              .limit(limit)
          )
        )
        for (const r of results) addResult(r)
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
      .filter((h) => h?.publish !== false)
      .filter((h, idx, self) => idx === self.findIndex((x) => String(x.sabre_id) === String(h.sabre_id)))
      .slice(0, limit)

    if (hotels.length === 0 && errors.length > 0) {
      return jsonErr('호텔 목록을 가져올 수 없습니다', 500, 'hotels_query_failed')
    }

    // 호텔이 있으면 모든 호텔의 중심점 계산 (전체 호텔인 경우)
    if (hotels.length > 0 && destinationRaw === 'all') {
      const validLocs = hotels
        .map((h) => {
          const lat = typeof h.latitude === 'number' ? h.latitude : parseNumber(String(h.latitude))
          const lng = typeof h.longitude === 'number' ? h.longitude : parseNumber(String(h.longitude))
          if (lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)) {
            return { lat, lng }
          }
          return null
        })
        .filter((loc): loc is LatLng => loc !== null)

      if (validLocs.length > 0) {
        const avgLat = validLocs.reduce((sum, loc) => sum + loc.lat, 0) / validLocs.length
        const avgLng = validLocs.reduce((sum, loc) => sum + loc.lng, 0) / validLocs.length
        center = { lat: avgLat, lng: avgLng }
      }
    }

    // 각 호텔 주소 지오코딩 (캐시 우선, 없으면 Geocoding API 호출 후 저장)
    const concurrency = 5
    const updatesToSave: Array<{ sabre_id: number; lat: number; lng: number }> = []
    let cacheHits = 0
    let cacheMisses = 0
    
    const geocoded = await runWithConcurrency(hotels, concurrency, async (h) => {
      const name = (h.property_name_ko || h.property_name_en || `Hotel ${h.sabre_id}`) as string
      const address = (h.property_address || '').toString().trim()
      if (!address) return null

      // 1. DB에서 캐시된 좌표 확인
      const cachedLat = typeof h.latitude === 'number' ? h.latitude : parseNumber(String(h.latitude))
      const cachedLng = typeof h.longitude === 'number' ? h.longitude : parseNumber(String(h.longitude))
      
      let loc: LatLng | null = null
      
      if (cachedLat !== null && cachedLng !== null && Number.isFinite(cachedLat) && Number.isFinite(cachedLng)) {
        // 캐시된 좌표 사용
        loc = { lat: cachedLat, lng: cachedLng }
        cacheHits++
      } else {
        cacheMisses++
        // 2. 캐시 없으면 Geocoding API 호출
        const country = (h.country_en || h.country_ko || resolved.country_label || '').toString().trim()
        const query = [address, country].filter(Boolean).join(', ')
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}`
        const rGeo = await fetchJson(url)
        loc = toLatLng((rGeo.data as any)?.results?.[0]?.geometry?.location)
        
        // 3. Geocoding 성공 시 DB에 저장 (비동기로 나중에 일괄 업데이트)
        if (loc && h.sabre_id) {
          updatesToSave.push({
            sabre_id: typeof h.sabre_id === 'number' ? h.sabre_id : Number(h.sabre_id),
            lat: loc.lat,
            lng: loc.lng,
          })
        }
      }
      
      if (!loc) return null

      const marker: HotelMarker = {
        sabre_id: h.sabre_id,
        slug: h.slug ?? null,
        name,
        property_address: address,
        location: loc,
      }
      return marker
    })

    // 4. 일괄 업데이트 (컬럼이 없으면 에러 무시)
    if (updatesToSave.length > 0) {
      const updatePromises = updatesToSave.map(async (update) => {
        try {
          const { error } = await supabase
            .from('select_hotels')
            .update({ latitude: update.lat, longitude: update.lng })
            .eq('sabre_id', update.sabre_id)
          
          // 컬럼이 없으면 에러 무시 (isMissingColumnError 체크)
          if (error && !isMissingColumnError(error)) {
            console.warn(`Failed to cache geocode for sabre_id ${update.sabre_id}:`, error.message)
          }
        } catch (err) {
          // update 실패해도 응답은 반환 (비동기 백그라운드 처리)
          console.warn(`Exception caching geocode for sabre_id ${update.sabre_id}:`, err)
        }
      })
      
      // 응답을 블로킹하지 않도록 Promise.all은 기다리지 않음 (fire-and-forget)
      Promise.all(updatePromises).catch(() => {
        // 무시 (이미 각각 에러 처리함)
      })
    }

    const markers = geocoded.filter((m): m is HotelMarker => Boolean(m))

    return jsonOk(
      {
        destination: destinationRaw,
        resolved,
        center,
        count: markers.length,
        requested: hotels.length,
        markers,
        cache: {
          hits: cacheHits,
          misses: cacheMisses,
          hitRate: markers.length > 0 ? (cacheHits / markers.length) * 100 : 0,
        },
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err) {
    console.error('hotel-map-markers api error:', err)
    return jsonErr('서버 오류가 발생했습니다', 500)
  }
}



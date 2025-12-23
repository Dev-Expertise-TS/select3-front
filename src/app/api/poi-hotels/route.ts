import { NextRequest, NextResponse } from 'next/server'

type LatLng = { lat: number; lng: number }

type PoiHotel = {
  place_id: string
  name: string
  formatted_address?: string
  rating?: number
  user_ratings_total?: number
  location: LatLng
  photo_reference?: string
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

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const destination = sp.get('destination')?.trim()
    const keyword = sp.get('q')?.trim() || 'hotel'
    const radius = Math.min(Math.max(parseNumber(sp.get('radius')) ?? 6000, 500), 30000)
    const pageToken = sp.get('pageToken')?.trim() || null

    if (!destination) {
      return jsonErr('destination is required', 400)
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return jsonErr('GOOGLE_MAPS_API_KEY is missing', 500, 'missing_env')
    }

    // 1) Geocoding: destination -> center
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${encodeURIComponent(apiKey)}`
    const geo = await fetchJson(geoUrl)

    if (!geo.ok || !geo.data || typeof geo.data !== 'object') {
      return jsonErr('지오코딩에 실패했습니다', 502, 'geocode_failed')
    }

    const geoStatus = (geo.data as any).status
    if (geoStatus !== 'OK') {
      return jsonErr('지오코딩 결과가 없습니다', 404, 'geocode_zero', { status: geoStatus })
    }

    const center = toLatLng((geo.data as any)?.results?.[0]?.geometry?.location)
    if (!center) {
      return jsonErr('지오코딩 좌표를 파싱할 수 없습니다', 502, 'geocode_parse_failed')
    }

    // 2) Places Nearby Search: center + radius + keyword
    const basePlaces = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.lat},${center.lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&type=lodging&key=${encodeURIComponent(apiKey)}`
    const placesUrl = pageToken
      ? `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${encodeURIComponent(pageToken)}&key=${encodeURIComponent(apiKey)}`
      : basePlaces

    const places = await fetchJson(placesUrl)
    if (!places.ok || !places.data || typeof places.data !== 'object') {
      return jsonErr('장소 검색에 실패했습니다', 502, 'places_failed')
    }

    const placesStatus = (places.data as any).status
    if (placesStatus !== 'OK' && placesStatus !== 'ZERO_RESULTS') {
      return jsonErr('장소 검색 결과를 가져올 수 없습니다', 502, 'places_status', { status: placesStatus })
    }

    const resultsRaw = ((places.data as any).results || []) as any[]
    const results: PoiHotel[] = resultsRaw
      .map((r) => {
        const loc = toLatLng(r?.geometry?.location)
        if (!loc) return null
        const photoRef = r?.photos?.[0]?.photo_reference
        return {
          place_id: String(r.place_id || ''),
          name: String(r.name || ''),
          formatted_address: typeof r.vicinity === 'string' ? r.vicinity : (typeof r.formatted_address === 'string' ? r.formatted_address : undefined),
          rating: typeof r.rating === 'number' ? r.rating : undefined,
          user_ratings_total: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : undefined,
          location: loc,
          photo_reference: typeof photoRef === 'string' ? photoRef : undefined,
        } satisfies PoiHotel
      })
      .filter((x): x is PoiHotel => Boolean(x && x.place_id && x.name))

    const nextPageToken = typeof (places.data as any).next_page_token === 'string'
      ? (places.data as any).next_page_token
      : null

    return jsonOk({
      destination,
      keyword,
      radius,
      center,
      results,
      nextPageToken,
    })
  } catch (err) {
    console.error('poi-hotels api error:', err)
    return jsonErr('서버 오류가 발생했습니다', 500)
  }
}



"use client"

import Script from "next/script"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { HotelMapMarkersResponse, PoiHotelsResponse } from "@/features/poi-hotels/types"

type PoiHotelsMapClientProps = {
  destinationRaw: string
  destinationLabel: string
  destinationQueryText: string
}

declare global {
  interface Window {
    google?: any
  }
}

export function PoiHotelsMapClient({ destinationRaw, destinationLabel, destinationQueryText }: PoiHotelsMapClientProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const selectedMarkerRef = useRef<any | null>(null)

  const [scriptReady, setScriptReady] = useState(false)
  const [keyword, setKeyword] = useState("hotel")
  const [radius, setRadius] = useState(6000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"select" | "poi">("select")
  const [poiData, setPoiData] = useState<PoiHotelsResponse | null>(null)
  const [selectData, setSelectData] = useState<HotelMapMarkersResponse | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)

  const canRenderMap = Boolean(apiKey) && scriptReady

  const center = useMemo(() => {
    return (mode === "poi" ? poiData?.center : selectData?.center) ?? null
  }, [mode, poiData, selectData])

  useEffect(() => {
    if (!canRenderMap) return
    if (!mapRef.current) return
    if (!window.google?.maps) return
    if (mapInstanceRef.current) return

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37.5665, lng: 126.9780 }, // fallback (Seoul)
      zoom: 12,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    })
  }, [canRenderMap])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!center) return

    map.setCenter(center)
    map.setZoom(13)
  }, [center])

  const clearMarkers = () => {
    // 기존 선택된 마커 애니메이션 정리
    if (selectedMarkerRef.current) {
      try {
        selectedMarkerRef.current.setAnimation(null)
      } catch {
        // ignore
      }
    }
    
    for (const m of markersRef.current.values()) {
      try {
        m.setMap(null)
      } catch {
        // ignore
      }
    }
    markersRef.current.clear()
    selectedMarkerRef.current = null
  }

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    const current = mode === "poi" ? poiData : selectData
    if (!current) return

    clearMarkers()
    const bounds = new window.google.maps.LatLngBounds()

    const items = mode === "poi" ? (poiData?.results ?? []) : (selectData?.markers ?? [])
    
    console.log('[Map] Creating markers for items:', items.length)
    
    for (const h of items) {
      const id = mode === "poi" ? h.place_id : String(h.sabre_id)
      
      // location 유효성 검사
      if (!h.location || typeof h.location.lat !== 'number' || typeof h.location.lng !== 'number') {
        console.warn('[Map] Invalid location for item:', id, h.location)
        continue
      }
      
      // 호텔 이름 라벨 (최대 20자로 제한)
      const labelText = h.name && h.name.length > 0 
        ? (h.name.length > 20 ? h.name.substring(0, 20) + '...' : h.name)
        : undefined
      
      // 마커 생성
      const markerOptions: any = {
        map,
        position: h.location,
        title: h.name || undefined,
      }
      
      // label은 텍스트가 있을 때만 추가
      if (labelText) {
        markerOptions.label = {
          text: labelText,
          color: "#1f2937",
          fontSize: "12px",
          fontWeight: "bold",
        }
      }
      
      const marker = new window.google.maps.Marker(markerOptions)
      
      marker.addListener("click", () => {
        setSelectedPlaceId(id)
      })
      
      markersRef.current.set(id, marker)
      bounds.extend(h.location)
    }
    
    console.log('[Map] Created markers:', markersRef.current.size)

    if (items.length > 0) {
      map.fitBounds(bounds, 48)
    }

    return () => {
      clearMarkers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, poiData, selectData])

  // 선택된 마커 처리: 지도 중심 이동 및 애니메이션
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!selectedPlaceId) {
      // 선택 해제 시 애니메이션 제거
      if (selectedMarkerRef.current) {
        try {
          selectedMarkerRef.current.setAnimation(null)
        } catch {
          // ignore
        }
      }
      selectedMarkerRef.current = null
      return
    }

    const marker = markersRef.current.get(selectedPlaceId)
    if (!marker) return

    // 이전 선택된 마커 애니메이션 제거
    if (selectedMarkerRef.current && selectedMarkerRef.current !== marker) {
      try {
        selectedMarkerRef.current.setAnimation(null)
      } catch {
        // ignore
      }
    }

    // 지도 중심을 해당 마커로 이동
    map.panTo(marker.getPosition())
    
    // 선택된 마커에 bounce 애니메이션 적용
    marker.setAnimation(window.google.maps.Animation.BOUNCE)
    selectedMarkerRef.current = marker

    // 2초 후 애니메이션 중지 (선택 표시는 유지)
    const timer = setTimeout(() => {
      if (marker === selectedMarkerRef.current) {
        try {
          marker.setAnimation(null)
        } catch {
          // ignore
        }
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [selectedPlaceId])

  const runPoiSearch = async () => {
    setLoading(true)
    setError(null)
    setSelectedPlaceId(null)
    try {
      const sp = new URLSearchParams()
      sp.set("destination", destinationQueryText)
      sp.set("q", keyword.trim() || "hotel")
      sp.set("radius", String(radius))
      const res = await fetch(`/api/poi-hotels?${sp.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `요청 실패: ${res.status}`)
      }
      setPoiData(json.data as PoiHotelsResponse)
    } catch (e) {
      setPoiData(null)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const runSelectHotels = async (useAll: boolean = false) => {
    setLoading(true)
    setError(null)
    setSelectedPlaceId(null)
    try {
      const sp = new URLSearchParams()
      // 전체 호텔을 로드하려면 "all" 전달, 아니면 destinationRaw 사용
      sp.set("destination", useAll ? "all" : destinationRaw)
      sp.set("limit", "500") // 전체 호텔을 위해 limit 증가
      const res = await fetch(`/api/hotel-map-markers?${sp.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `요청 실패: ${res.status}`)
      }
      console.log('[Map] Select hotels data loaded:', json.data?.markers?.length || 0, 'markers')
      setSelectData(json.data as HotelMapMarkersResponse)
    } catch (e) {
      console.error('[Map] Error loading select hotels:', e instanceof Error ? e.message : String(e))
      setSelectData(null)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 첫 진입 시: 전체 셀렉트 호텔 주소 기반 마커 먼저 로드
    runSelectHotels(true) // 전체 호텔 로드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <div className="font-semibold text-gray-900 mb-1">Google Maps API Key가 필요합니다</div>
        <div className="text-gray-600">
          <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> (지도 렌더링용)와{" "}
          <code className="font-mono">GOOGLE_MAPS_API_KEY</code> (서버 Places/Geocoding 호출용)를 설정해주세요.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-bold text-gray-900">{destinationLabel} 호텔 지도 검색</div>
            <div className="text-sm text-gray-600">POI(Places) 기반으로 주변 호텔을 찾아보세요.</div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <Button
                variant={mode === "select" ? "default" : "outline"}
                onClick={() => {
                  setMode("select")
                  if (!selectData) void runSelectHotels(true) // 전체 호텔 로드
                }}
                disabled={loading}
              >
                셀렉트 호텔
              </Button>
              <Button
                variant={mode === "poi" ? "default" : "outline"}
                onClick={() => {
                  setMode("poi")
                  if (!poiData) void runPoiSearch()
                }}
                disabled={loading}
              >
                주변 호텔(POI)
              </Button>
            </div>
            {mode === "poi" && (
              <div className="flex items-center gap-2">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-[180px]"
                  placeholder="검색어 (예: hotel, resort)"
                />
                <Input
                  value={String(radius)}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (Number.isFinite(v)) setRadius(Math.max(500, Math.min(30000, v)))
                  }}
                  className="w-[120px]"
                  inputMode="numeric"
                  placeholder="반경(m)"
                />
                <Button onClick={runPoiSearch} disabled={loading}>
                  {loading ? "검색 중..." : "검색"}
                </Button>
              </div>
            )}
            {mode === "select" && (
              <Button onClick={() => runSelectHotels(true)} disabled={loading} variant="outline">
                {loading ? "불러오는 중..." : "전체 호텔 마커 새로고침"}
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div
            ref={mapRef}
            className={cn(
              "h-[520px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50",
              !scriptReady && "animate-pulse"
            )}
          />
        </div>
        <div className="lg:col-span-2">
          <div className="h-[520px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-4 py-3">
              <div className="text-sm font-semibold text-gray-900">
                결과 {mode === "poi" ? (poiData?.results.length ?? 0) : (selectData?.markers.length ?? 0)}개
              </div>
              <div className="text-xs text-gray-500">클릭하면 지도에서 강조됩니다.</div>
            </div>
            <div className="divide-y divide-gray-100">
              {(mode === "poi" ? (poiData?.results ?? []) : (selectData?.markers ?? [])).map((h: any) => {
                const id = mode === "poi" ? h.place_id : String(h.sabre_id)
                const selected = selectedPlaceId === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedPlaceId(id)
                      // 스크롤하여 선택된 항목이 보이도록 (부드러운 스크롤)
                      setTimeout(() => {
                        const element = document.querySelector(`[data-hotel-id="${id}"]`)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        }
                      }, 100)
                    }}
                    data-hotel-id={id}
                    className={cn(
                      "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                      selected && "bg-blue-50 border-l-4 border-l-blue-600"
                    )}
                  >
                    <div className="font-medium text-gray-900">{h.name}</div>
                    {(h.formatted_address || h.property_address) && (
                      <div className="mt-0.5 text-xs text-gray-600">{h.formatted_address || h.property_address}</div>
                    )}
                    {(typeof h.rating === "number" || typeof h.user_ratings_total === "number") && (
                      <div className="mt-1 text-xs text-gray-500">
                        {typeof h.rating === "number" ? `평점 ${h.rating}` : ""}
                        {typeof h.user_ratings_total === "number" ? ` · 리뷰 ${h.user_ratings_total}` : ""}
                      </div>
                    )}
                  </button>
                )
              })}
              {!loading &&
                (mode === "poi" ? (poiData?.results?.length ?? 0) === 0 : (selectData?.markers?.length ?? 0) === 0) &&
                !error && (
                <div className="px-4 py-6 text-sm text-gray-500">결과가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



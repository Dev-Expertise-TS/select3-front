"use client"

import Script from "next/script"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { HotelMapMarkersResponse } from "@/features/poi-hotels/types"
import { MapPin, Star, Coffee, Filter, ArrowUpDown, X } from "lucide-react"
import Link from "next/link"
import { getSafeImageUrl } from "@/lib/image-utils"
import { OptimizedImage } from "@/components/ui/optimized-image"

type HotelComparisonMapProps = {
  destinationRaw: string
  destinationLabel: string
  destinationQueryText: string
}

declare global {
  interface Window {
    google: typeof google
  }
}

export function HotelComparisonMap({ destinationRaw, destinationLabel }: HotelComparisonMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const [scriptReady, setScriptReady] = useState(false)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const overlaysRef = useRef<Map<string, google.maps.OverlayView>>(new Map())
  const selectedMarkerRef = useRef<google.maps.Marker | null>(null)
  
  const [selectData, setSelectData] = useState<HotelMapMarkersResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'star_rating' | 'benefits'>('name')

  // 지도 초기화
  useEffect(() => {
    if (!scriptReady || !mapContainerRef.current || mapInstanceRef.current) return

    const map = new window.google.maps.Map(mapContainerRef.current, {
      zoom: 13,
      center: { lat: -8.4095, lng: 115.1889 }, // 발리 기본 위치
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    mapInstanceRef.current = map
  }, [scriptReady])

  // 커스텀 오버레이 클래스 (호텔명 표시용)
  class HotelLabelOverlay extends google.maps.OverlayView {
    private div: HTMLDivElement | null = null
    private position: google.maps.LatLng

    constructor(
      position: google.maps.LatLng,
      private hotelNameKo: string,
      private hotelNameEn: string | null
    ) {
      super()
      this.position = position
    }

    onAdd() {
      const div = document.createElement('div')
      div.style.position = 'absolute'
      div.style.pointerEvents = 'none'
      div.style.whiteSpace = 'nowrap'
      div.style.fontFamily = 'system-ui, -apple-system, sans-serif'
      div.style.userSelect = 'none'
      
      // 한글 호텔명 (위)
      const nameKo = document.createElement('div')
      nameKo.textContent = this.hotelNameKo
      nameKo.style.fontSize = '13px'
      nameKo.style.fontWeight = '600'
      nameKo.style.color = '#1f2937'
      nameKo.style.lineHeight = '1.2'
      nameKo.style.marginBottom = '2px'
      div.appendChild(nameKo)
      
      // 영문 호텔명 (아래, 작은 폰트)
      if (this.hotelNameEn) {
        const nameEn = document.createElement('div')
        nameEn.textContent = this.hotelNameEn
        nameEn.style.fontSize = '11px'
        nameEn.style.fontWeight = '400'
        nameEn.style.color = '#6b7280'
        nameEn.style.lineHeight = '1.2'
        div.appendChild(nameEn)
      }
      
      const panes = this.getPanes()
      if (panes) {
        panes.overlayMouseTarget.appendChild(div)
      }
      
      this.div = div
    }

    draw() {
      if (!this.div) return
      
      const overlayProjection = this.getProjection()
      if (!overlayProjection) return
      
      const position = overlayProjection.fromLatLngToDivPixel(this.position)
      if (!position) return
      
      // 마커 오른쪽에 배치 (마커 너비 약 20px, 오프셋 25px)
      this.div.style.left = `${position.x + 25}px`
      this.div.style.top = `${position.y - 10}px`
    }

    onRemove() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div)
      }
      this.div = null
    }
  }

  // 마커 정리
  const clearMarkers = () => {
    if (selectedMarkerRef.current) {
      try {
        selectedMarkerRef.current.setAnimation(null)
      } catch {
        // ignore
      }
    }

    // 오버레이 정리
    for (const overlay of overlaysRef.current.values()) {
      try {
        overlay.setMap(null)
      } catch {
        // ignore
      }
    }
    overlaysRef.current.clear()

    // 마커 정리
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

  // 마커 생성
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!selectData) return

    clearMarkers()
    const bounds = new window.google.maps.LatLngBounds()

    const items = selectData?.markers ?? []
    console.log('[Map] Creating markers for items:', items.length)

    for (const h of items) {
      const id = String(h.sabre_id)

      if (!h.location || typeof h.location.lat !== 'number' || typeof h.location.lng !== 'number') {
        console.warn('[Map] Invalid location for item:', id, h.location)
        continue
      }

      // 호텔명 준비 (한글명과 영문명 분리)
      const hotelNameKo = h.property_name_ko || h.name || '호텔'
      const hotelNameEn = h.property_name_en || null

      // Google Maps 공식 마커 사용 (label 제거, 오버레이로 표시)
      const markerOptions: any = {
        map,
        position: h.location,
        title: h.name || undefined,
      }

      const marker = new window.google.maps.Marker(markerOptions)
      
      // 마커에 호텔 정보 저장
      ;(marker as any).hotelId = id
      ;(marker as any).hotelName = hotelNameKo
      
      marker.addListener("click", () => {
        setSelectedPlaceId(id)
      })

      // 커스텀 오버레이 생성 (마커 오른쪽에 호텔명 표시)
      const overlay = new HotelLabelOverlay(
        new window.google.maps.LatLng(h.location.lat, h.location.lng),
        hotelNameKo,
        hotelNameEn
      )
      overlay.setMap(map)

      markersRef.current.set(id, marker)
      overlaysRef.current.set(id, overlay)
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
  }, [selectData])

  // 선택된 마커 처리
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!selectedPlaceId) {
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

    if (selectedMarkerRef.current && selectedMarkerRef.current !== marker) {
      try {
        selectedMarkerRef.current.setAnimation(null)
      } catch {
        // ignore
      }
    }

    // 선택된 마커는 애니메이션으로 강조 (구글 공식 마커 유지)
    map.panTo(marker.getPosition()!)
    marker.setAnimation(window.google.maps.Animation.BOUNCE)
    selectedMarkerRef.current = marker

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

  // 호텔 데이터 로드
  const runSelectHotels = async () => {
    setLoading(true)
    setError(null)
    setSelectedPlaceId(null)
    try {
      const sp = new URLSearchParams()
      sp.set("destination", destinationRaw)
      sp.set("limit", "500")
      const res = await fetch(`/api/hotel-map-markers?${sp.toString()}`, { cache: "no-store" })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || `요청 실패: ${res.status}`)
      }
      console.log('[Map] Select hotels data loaded:', json.data?.markers?.length || 0, 'markers')
      setSelectData(json.data as HotelMapMarkersResponse)
      
      // 지도 중심 설정
      if (json.data?.center && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(json.data.center)
        mapInstanceRef.current.setZoom(13)
      }
    } catch (e) {
      console.error('[Map] Error loading select hotels:', e)
      setSelectData(null)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 첫 진입 시: select_hotels 주소 기반 마커 먼저 로드
    runSelectHotels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationRaw])

  // 필터링 및 정렬 (선택된 호텔이 첫 번째로 오도록)
  const filteredAndSortedHotels = useMemo(() => {
    if (!selectData?.markers) return []

    let filtered = selectData.markers.filter((h) => {
      if (!filterText) return true
      const searchText = filterText.toLowerCase()
      return (
        h.name.toLowerCase().includes(searchText) ||
        h.property_address.toLowerCase().includes(searchText) ||
        h.benefits?.some((b) => b.toLowerCase().includes(searchText)) ||
        h.badges?.some((b) => b.toLowerCase().includes(searchText))
      )
    })

    // 선택된 호텔을 먼저 분리
    const selectedHotel = selectedPlaceId 
      ? filtered.find((h) => String(h.sabre_id) === selectedPlaceId)
      : null
    const otherHotels = filtered.filter((h) => String(h.sabre_id) !== selectedPlaceId)

    // 정렬
    const sortedOthers = [...otherHotels].sort((a, b) => {
      switch (sortBy) {
        case "star_rating":
          const aRating = a.star_rating ?? 0
          const bRating = b.star_rating ?? 0
          return bRating - aRating
        case "benefits":
          const aBenefits = a.benefits?.length ?? 0
          const bBenefits = b.benefits?.length ?? 0
          return bBenefits - aBenefits
        case "name":
        default:
          return a.name.localeCompare(b.name, 'ko')
      }
    })

    // 선택된 호텔이 있으면 첫 번째로, 없으면 정렬된 리스트 반환
    return selectedHotel ? [selectedHotel, ...sortedOthers] : sortedOthers
  }, [selectData, filterText, sortBy, selectedPlaceId])

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
        <div className="font-semibold text-gray-900 mb-1">Google Maps API Key가 필요합니다</div>
        <div className="text-gray-600">
          <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>를 설정해주세요.
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

      {/* 헤더 */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{destinationLabel} 호텔 비교</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={runSelectHotels}
            disabled={loading}
          >
            {loading ? '로딩 중...' : '셀렉트 호텔'}
          </Button>
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="호텔명, 주소, 특징으로 검색..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pr-8"
            />
            {filterText && (
              <button
                onClick={() => setFilterText('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy('name')}
              className={sortBy === 'name' ? 'bg-blue-50' : ''}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              이름
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy('star_rating')}
              className={sortBy === 'star_rating' ? 'bg-blue-50' : ''}
            >
              <Star className="h-4 w-4 mr-1" />
              별점
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy('benefits')}
              className={sortBy === 'benefits' ? 'bg-blue-50' : ''}
            >
              <Coffee className="h-4 w-4 mr-1" />
              특징
            </Button>
          </div>
        </div>
      </div>

      {/* 지도 및 호텔 리스트 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* 지도 */}
        <div className="lg:col-span-3">
          <div ref={mapContainerRef} className="h-[600px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50" />
        </div>

        {/* 호텔 리스트 */}
        <div className="lg:col-span-2">
          <div className="h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
            {loading && (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">로딩 중...</div>
            )}
            {error && (
              <div className="px-4 py-6 text-sm text-red-600 text-center">오류: {error}</div>
            )}
            {!loading && !error && (
              <>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 text-xs text-gray-600 z-10">
                  호텔 {filteredAndSortedHotels.length}개 {selectedPlaceId && '(클릭하면 지도에서 강조됩니다)'}
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredAndSortedHotels.map((h) => {
                    const id = String(h.sabre_id)
                    const selected = selectedPlaceId === id
                    return (
                      <div
                        key={id}
                        data-hotel-id={id}
                        className={cn(
                          "px-4 py-4",
                          selected && "bg-blue-50 border-l-4 border-l-blue-600"
                        )}
                      >
                        {/* 호텔 이미지 및 기본 정보 - 클릭 시 지도 중심 이동 */}
                        <div 
                          className="flex gap-3 cursor-pointer hover:bg-gray-50 -mx-4 -my-4 px-4 py-4 rounded transition-colors"
                          onClick={() => {
                            setSelectedPlaceId(id)
                          }}
                        >
                          {h.image ? (
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                              <OptimizedImage
                                src={getSafeImageUrl(h.image)}
                                alt={h.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  console.warn(`[HotelComparisonMap] 이미지 로드 실패: sabre_id=${h.sabre_id}, image="${h.image}"`)
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-400">이미지 없음</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{h.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {h.star_rating && (
                                    <div className="flex items-center gap-0.5">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="text-xs text-gray-600">{h.star_rating}</span>
                                    </div>
                                  )}
                                  {h.badges && h.badges.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {h.badges.slice(0, 2).map((badge, idx) => (
                                        <span
                                          key={idx}
                                          className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded"
                                        >
                                          {badge}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 주소 */}
                            {h.property_address && (
                              <div className="flex items-start gap-1 mt-2">
                                <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-gray-600 line-clamp-2">{h.property_address}</p>
                              </div>
                            )}

                            {/* 특징/편의시설 */}
                            {h.benefits && h.benefits.length > 0 && (
                              <div className="flex items-start gap-1 mt-2">
                                <Coffee className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1">
                                  {h.benefits.slice(0, 3).map((benefit, idx) => (
                                    <span
                                      key={idx}
                                      className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                                    >
                                      {benefit}
                                    </span>
                                  ))}
                                  {h.benefits.length > 3 && (
                                    <span className="px-1.5 py-0.5 text-gray-500 text-xs">
                                      +{h.benefits.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* 상세보기 링크 - 별도 클릭 영역 */}
                        {h.slug && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <Link
                              href={`/hotel/${h.slug}`}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-block"
                              onClick={(e) => {
                                // 링크 클릭 시에만 상세 페이지로 이동
                                e.stopPropagation()
                              }}
                            >
                              상세보기 →
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                {!loading && filteredAndSortedHotels.length === 0 && !error && (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">
                    호텔이 없습니다
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


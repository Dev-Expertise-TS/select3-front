"use client"

import Script from "next/script"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { HotelMapMarkersResponse } from "@/features/poi-hotels/types"
import { MapPin, Star, Coffee, Filter, ArrowUpDown, X, Waves, Mountain, UtensilsCrossed, ShoppingBag, Car, Wifi, Home, Eye, Tag, Info } from "lucide-react"
import Link from "next/link"
import { getSafeImageUrl } from "@/lib/image-utils"
import { OptimizedImage } from "@/components/ui/optimized-image"

type BaliHotelComparisonProps = {
  destinationRaw: string
  destinationLabel: string
  destinationQueryText: string
}

// 지역별 아이콘 및 색상 매핑 (area_ko 값에 따라 자동 할당)
const REGION_COLORS = [
  { color: 'bg-green-50 border-green-200 text-green-700', colorSelected: 'bg-green-100 border-green-400', icon: Mountain },
  { color: 'bg-pink-50 border-pink-200 text-pink-700', colorSelected: 'bg-pink-100 border-pink-400', icon: UtensilsCrossed },
  { color: 'bg-blue-50 border-blue-200 text-blue-700', colorSelected: 'bg-blue-100 border-blue-400', icon: Waves },
  { color: 'bg-purple-50 border-purple-200 text-purple-700', colorSelected: 'bg-purple-100 border-purple-400', icon: Eye },
  { color: 'bg-orange-50 border-orange-200 text-orange-700', colorSelected: 'bg-orange-100 border-orange-400', icon: Wifi },
  { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', colorSelected: 'bg-yellow-100 border-yellow-400', icon: ShoppingBag },
  { color: 'bg-indigo-50 border-indigo-200 text-indigo-700', colorSelected: 'bg-indigo-100 border-indigo-400', icon: Car },
] as const

// 지역별 상세 정보 매핑
const REGION_INFO: Record<string, { description: string; target: string }> = {
  '우붓': { description: '정글 뷰, 요가, 예술, 논뷰(Rice Field)', target: '힐링, 명상, 커플 여행' },
  '스미냑': { description: '세련된 비치클럽, 쇼핑, 미식', target: '트렌디한 분위기 선호자' },
  '누사두아': { description: '대규모 고급 리조트 단지, 잔잔한 바다', target: '가족 단위, 태교 여행' },
  '울루와투': { description: '절벽 위 오션뷰, 서핑, 프라이빗', target: '허니문, 서퍼' },
  '울루와뚜': { description: '절벽 위 오션뷰, 서핑, 프라이빗', target: '허니문, 서퍼' },
  '짱구': { description: '디지털 노마드, 힙한 카페, 서핑', target: '장기 여행자, 젊은 층' },
  '짐바란': { description: '석양과 함께 즐기는 씨푸드, 조용한 휴식', target: '커플 여행, 미식가' },
  '사누르': { description: '일출 포인트, 조용하고 여유로운 산책', target: '시니어 여행자, 가족 단위' },
  '망기스': { description: '때묻지 않은 자연 속 럭셔리 리조트', target: '조용한 휴식, 자연 애호가' },
  '웅가산': { description: '조용한 절벽 위 오션뷰와 프라이빗 리조트', target: '커플 여행, 허니문' },
}

// area_ko 값에서 지역 정보 생성 헬퍼 함수
function createRegionFromAreaKo(areaKo: string, areaEn: string | null, index: number) {
  const colorSet = REGION_COLORS[index % REGION_COLORS.length]
  const info = REGION_INFO[areaKo] || { description: '', target: '' }
  
  // id 생성 시 인덱스를 포함하여 고유성 보장
  const baseId = areaKo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const id = baseId || `region-${index}`
  
  return {
    id: `${id}-${index}`,
    name: areaKo,
    nameEn: areaEn || areaKo,
    areaKo,
    areaEn: areaEn || '',
    description: info.description,
    target: info.target,
    icon: colorSet.icon,
    color: colorSet.color,
    colorSelected: colorSet.colorSelected,
  }
}

// 발리 특화 테마 필터
const BALI_THEMES = [
  { id: 'pool-villa', label: '풀빌라', icon: Waves },
  { id: 'floating-breakfast', label: '플로팅 조식', icon: Coffee },
  { id: 'jungle-view', label: '정글 뷰', icon: Mountain },
  { id: 'ocean-view', label: '오션 뷰', icon: Eye },
  { id: 'long-stay', label: '한 달 살기', icon: Home },
] as const

declare global {
  interface Window {
    google: typeof google
  }
}

export function BaliHotelComparison({ destinationRaw, destinationLabel }: BaliHotelComparisonProps) {
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
  
  // 발리 특화 필터 상태
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  
  // 초기 로드 여부 추적 (초기 로드 시에만 fitBounds 실행)
  const isInitialLoadRef = useRef(true)
  
  // area_ko 값으로부터 동적으로 지역 목록 생성 (API에서 받은 areas 우선 사용)
  const dynamicRegions = useMemo(() => {
    console.log('[Component] API로부터 받은 원본 데이터 (selectData):', {
      hasMarkers: !!selectData?.markers,
      markerCount: selectData?.markers?.length || 0,
      hasAreas: !!selectData?.areas,
      areaCount: selectData?.areas?.length || 0,
      areas: selectData?.areas
    })

    // 1. API에서 명시적으로 지역 목록을 준 경우 (추천 방식)
    if (selectData?.areas && selectData.areas.length > 0) {
      const result = selectData.areas
        .filter(a => a.area_ko)
        .map((area, index) => 
          createRegionFromAreaKo(area.area_ko!, area.area_en, index)
        )
      console.log('[Component] API area 데이터 기반 dynamicRegions 생성 완료:', result.length, '개')
      return result
    }

    // 2. API에서 목록을 주지 않은 경우 호텔 데이터에서 추출 (Fallback)
    if (!selectData?.markers) return []
    
    // area_ko 값 추출 및 중복 제거
    const areaMap = new Map<string, { areaKo: string; areaEn: string | null }>()
    
    for (const marker of selectData.markers) {
      if (marker.area_ko && marker.area_ko.trim()) {
        const areaKo = marker.area_ko.trim()
        if (!areaMap.has(areaKo)) {
          areaMap.set(areaKo, {
            areaKo,
            areaEn: marker.area_en?.trim() || null,
          })
        }
      }
    }
    
    // area_ko 값으로 정렬하여 지역 목록 생성
    const areas = Array.from(areaMap.values()).sort((a, b) => 
      a.areaKo.localeCompare(b.areaKo, 'ko')
    )
    
    const result = areas.map((area, index) => 
      createRegionFromAreaKo(area.areaKo, area.areaEn, index)
    )
    console.log('[Component] Fallback 호텔 데이터 기반 dynamicRegions 생성 완료:', result.length, '개')
    return result
  }, [selectData])

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

  // 커스텀 오버레이 클래스 (호텔명 표시용) - google이 로드된 후에만 사용
  const createHotelLabelOverlay = (
    position: { lat: number; lng: number },
    hotelNameKo: string,
    hotelNameEn: string | null
  ) => {
    if (!window.google || !window.google.maps) {
      return null
    }

    class HotelLabelOverlay extends window.google.maps.OverlayView {
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
      nameKo.style.fontSize = '12px'
      nameKo.style.fontWeight = '600'
      nameKo.style.color = '#1f2937'
      nameKo.style.lineHeight = '1.2'
      nameKo.style.marginBottom = '2px'
      div.appendChild(nameKo)
      
      // 영문 호텔명 (아래, 작은 폰트)
      if (this.hotelNameEn) {
        const nameEn = document.createElement('div')
        nameEn.textContent = this.hotelNameEn
        nameEn.style.fontSize = '10px'
        nameEn.style.fontWeight = '400'
        nameEn.style.color = '#1f2937'
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
      
      // 마커 오른쪽에 배치 (오프셋 조정: 요청하신 +15px 적용)
      this.div.style.left = `${position.x + 15}px`
      
      // 텍스트 위치 조정 (요청하신 -32px 적용)
      this.div.style.top = `${position.y - 32}px`
    }

    onRemove() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div)
      }
      this.div = null
    }
    }

    return new HotelLabelOverlay(
      new window.google.maps.LatLng(position.lat, position.lng),
      hotelNameKo,
      hotelNameEn
    )
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

  // 마커 생성 (필터링된 호텔만 표시)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    if (!selectData) return

    clearMarkers()
    const bounds = new window.google.maps.LatLngBounds()

    // 필터링된 호텔만 마커로 표시
    const items = filteredAndSortedHotels
    console.log('[Map] Creating markers for filtered items:', items.length)

    for (const h of items) {
      const id = String(h.sabre_id)

      if (!h.location || typeof h.location.lat !== 'number' || typeof h.location.lng !== 'number') {
        console.warn('[Map] Invalid location for item:', id, h.location)
        continue
      }

      // 호텔명 준비 (한글명과 영문명 분리)
      const hotelNameKo = h.property_name_ko || h.name || '호텔'
      const hotelNameEn = h.property_name_en || null

      // 더 얄쌍하고 날렵한 구글 공식 마커 스타일의 SVG 디자인
      const bluePinSvg = `
        <svg width="26" height="38" viewBox="0 0 26 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 38 13 38C13 38 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#4285F4"/>
          <circle cx="13" cy="13" r="5" fill="#FFFFFF"/>
          <circle cx="13" cy="13" r="3" fill="#1A73E8"/>
        </svg>
      `

      const markerOptions: any = {
        map,
        position: h.location,
        title: h.name || undefined,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(bluePinSvg),
          scaledSize: new window.google.maps.Size(22, 32),
          anchor: new window.google.maps.Point(11, 32),
        },
      }

      const marker = new window.google.maps.Marker(markerOptions)
      
      // 마커에 호텔 정보 저장
      ;(marker as any).hotelId = id
      ;(marker as any).hotelName = hotelNameKo
      
      marker.addListener("click", () => {
        setSelectedPlaceId(id)
      })

      // 커스텀 오버레이 생성 (마커 오른쪽에 호텔명 표시)
      const overlay = createHotelLabelOverlay(
        h.location,
        hotelNameKo,
        hotelNameEn
      )
      if (overlay) {
        overlay.setMap(map)
        overlaysRef.current.set(id, overlay)
      }

      markersRef.current.set(id, marker)
      bounds.extend(h.location)
    }

    console.log('[Map] Created markers:', markersRef.current.size)

    // 초기 로드 시에만 fitBounds 실행, 필터링 시에는 자동으로 확대/축소하지 않음
    if (items.length > 0 && isInitialLoadRef.current) {
      map.fitBounds(bounds, 48)
      isInitialLoadRef.current = false
    }

    return () => {
      clearMarkers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectData, selectedRegions, selectedThemes, filterText, selectedPlaceId])

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
      
      if (json.data?.center && mapInstanceRef.current) {
        mapInstanceRef.current.setCenter(json.data.center)
        mapInstanceRef.current.setZoom(13)
      }
    } catch (e) {
      console.error('[Map] Error loading select hotels:', e instanceof Error ? e.message : String(e))
      setSelectData(null)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runSelectHotels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationRaw])

  // 지역 필터링 로직 (area_ko 값과 직접 매칭)
  const matchesRegion = (hotel: any, regionId: string) => {
    const region = dynamicRegions.find(r => r.id === regionId)
    if (!region) {
      console.log(`[Filter] 지역을 찾을 수 없음: regionId="${regionId}"`)
      return true
    }
    
    // area_ko 값과 직접 비교 (null/undefined 체크 및 trim 처리)
    const hotelAreaKo = hotel.area_ko ? String(hotel.area_ko).trim() : ''
    const regionAreaKo = region.areaKo ? String(region.areaKo).trim() : ''
    
    // 빈 문자열인 경우 매칭하지 않음
    if (!hotelAreaKo || !regionAreaKo) {
      console.log(`[Filter] area_ko 값이 비어있음: 호텔="${hotel.name}", 호텔 area_ko="${hotelAreaKo}", 지역 areaKo="${regionAreaKo}"`)
      return false
    }
    
    const matches = hotelAreaKo === regionAreaKo
    
    // 디버깅: 매칭 시도 로그 (짱구, 웅가산 등 특정 지역에 대해서만 상세 로그)
    if (regionAreaKo === '짱구' || regionAreaKo === '웅가산') {
      if (matches) {
        console.log(`[Filter] ✅ 매칭 성공: 호텔="${hotel.name}", 호텔 area_ko="${hotelAreaKo}", 지역 areaKo="${regionAreaKo}"`)
      } else {
        console.log(`[Filter] ❌ 매칭 실패: 호텔="${hotel.name}", 호텔 area_ko="${hotelAreaKo}", 지역 areaKo="${regionAreaKo}", regionId="${regionId}"`)
      }
    }
    
    return matches
  }

  // 필터링 및 정렬
  const filteredAndSortedHotels = useMemo(() => {
    if (!selectData?.markers) return []

    // 디버깅: 필터링 시작 시 전체 데이터 출력
    if (selectedRegions.length > 0) {
      console.log(`[Filter] 필터링 시작: 선택된 지역 ID=${selectedRegions.join(', ')}`)
      console.log(`[Filter] 전체 지역 목록:`, dynamicRegions.map(r => ({ id: r.id, areaKo: r.areaKo, name: r.name })))
      console.log(`[Filter] 전체 호텔 area_ko 목록:`, selectData.markers.map(h => ({ name: h.name, area_ko: h.area_ko })))
    }

    let filtered = selectData.markers.filter((h) => {
      // 지역 필터
      if (selectedRegions.length > 0) {
        const matchesAnyRegion = selectedRegions.some(regionId => matchesRegion(h, regionId))
        if (!matchesAnyRegion) return false
      }

      // 테마 필터 (현재는 데이터 구조상 benefits나 badges로 매칭)
      if (selectedThemes.length > 0) {
        // TODO: 실제 테마 필터링 로직 구현 필요 (benefits, badges 등 기반)
        // 현재는 일단 모든 테마 선택 시 필터링하지 않음
      }

      // 텍스트 검색
      if (filterText) {
        const searchText = filterText.toLowerCase()
        const matchesText = (
          h.name.toLowerCase().includes(searchText) ||
          h.property_address.toLowerCase().includes(searchText) ||
          h.benefits?.some((b) => b.toLowerCase().includes(searchText)) ||
          h.badges?.some((b) => b.toLowerCase().includes(searchText))
        )
        if (!matchesText) return false
      }

      return true
    })

    // 디버깅: 필터링 결과 출력
    if (selectedRegions.length > 0) {
      console.log(`[Filter] 필터링 결과: 전체 ${selectData.markers.length}개 -> 필터링 후 ${filtered.length}개`)
      console.log(`[Filter] 필터링된 호텔 목록:`, filtered.map(h => ({ name: h.name, area_ko: h.area_ko })))
    }

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

    return selectedHotel ? [selectedHotel, ...sortedOthers] : sortedOthers
  }, [selectData, filterText, sortBy, selectedPlaceId, selectedRegions, selectedThemes, dynamicRegions])

  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev => {
      const isCurrentlySelected = prev.includes(regionId)
      const newValue = isCurrentlySelected
        ? prev.filter(id => id !== regionId)
        : [...prev, regionId]
      console.log('[Toggle] Region changed:', { regionId, isCurrentlySelected, newValue })
      return newValue
    })
  }

  const toggleTheme = (themeId: string) => {
    setSelectedThemes(prev => {
      const newValue = prev.includes(themeId) 
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
      console.log('[Toggle] Theme changed:', { themeId, newValue })
      return newValue
    })
  }

  // 전체 선택/해제 함수
  const toggleAllRegions = () => {
    if (selectedRegions.length === dynamicRegions.length) {
      // 모두 선택된 경우 모두 해제
      setSelectedRegions([])
    } else {
      // 일부만 선택되거나 모두 해제된 경우 모두 선택
      setSelectedRegions(dynamicRegions.map(r => r.id))
    }
  }

  const allRegionsSelected = dynamicRegions.length > 0 && selectedRegions.length === dynamicRegions.length
  const someRegionsSelected = selectedRegions.length > 0 && selectedRegions.length < dynamicRegions.length

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
    <div className="space-y-6">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      {/* 헤더 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{destinationLabel} 호텔 비교</h1>
        <p className="text-gray-600 text-sm mb-4">발리 지역별 특성과 숙소 타입을 비교하여 나에게 맞는 호텔을 찾아보세요</p>
        
        {/* 지역 관계 안내 문구 */}
        <div className="flex items-start gap-3 bg-blue-50/50 border border-blue-100 rounded-lg p-4">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 leading-relaxed">
            인도네시아 <span className="font-semibold text-blue-900">발리(Bali)</span>의 <span className="font-semibold text-blue-900">망기스/사누르/울루와뚜/우붓/누사두아/짐바란/짱구/스미냑/웅가산</span>은 
            모두 발리(Bali) 안에 포함되는 하위 지역/권역입니다. 
            <br className="hidden sm:block" />
            즉 <span className="font-semibold text-blue-900">발리(Bali)</span>와 별개 지역이 아니라 <span className="font-medium underline decoration-blue-200 underline-offset-4 text-blue-900">포괄(상위-하위) 관계의 지역명</span>이라고 이해하시면 됩니다.
          </div>
        </div>
      </div>

      {/* 필터 영역 - 상단 헤더 바로 아래 가로 배치 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">지역별 특성 선택</h2>
          {dynamicRegions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleAllRegions()
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              {allRegionsSelected ? '전체 해제' : '전체 선택'}
            </button>
          )}
        </div>
        {dynamicRegions.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center">지역 정보를 불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {dynamicRegions.map((region) => {
              const Icon = region.icon
              const isSelected = selectedRegions.includes(region.id)
              return (
                <div
                  key={region.id}
                  onClick={(e) => {
                    // 체크박스나 그 자식 요소를 클릭한 경우는 무시 (체크박스의 onClick에서 처리)
                    const target = e.target as HTMLElement
                    if (target.tagName === 'INPUT' || target.closest('input')) {
                      return
                    }
                    e.preventDefault()
                    e.stopPropagation()
                    toggleRegion(region.id)
                  }}
                  className={cn(
                    "flex items-start gap-3 w-full p-3 rounded-lg border-2 text-left transition-all cursor-pointer",
                    isSelected ? region.colorSelected : region.color,
                    "hover:shadow-md"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation()
                      toggleRegion(region.id)
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 flex-shrink-0 cursor-pointer"
                  />
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">
                      {region.name}
                      {region.nameEn && region.nameEn !== region.name && (
                        <span className="text-xs font-normal opacity-70 ml-1">({region.nameEn})</span>
                      )}
                    </div>
                    {region.description && (
                      <div className="text-xs opacity-80 mb-1">{region.description}</div>
                    )}
                    {region.target && (
                      <div className="text-xs opacity-60">{region.target}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 호텔 리스트 및 지도 영역 - 전체 폭 사용 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
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
                        {/* 호텔 이미지 및 기본 정보 */}
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
                                  console.warn(`[BaliHotelComparison] 이미지 로드 실패: sabre_id=${h.sabre_id}, image="${h.image}"`)
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                              <span className="text-xs text-gray-400">이미지 없음</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex-1">
                              {/* 호텔 한글명 */}
                              {h.property_name_ko && (
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{h.property_name_ko}</h3>
                              )}
                              
                              {/* 호텔 영문명 */}
                              {h.property_name_en && (
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{h.property_name_en}</p>
                              )}
                              
                              {/* 호텔 지역, 도시, 국가 */}
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                {h.area_ko && (
                                  <span className="text-xs text-gray-700 font-medium">{h.area_ko}</span>
                                )}
                                {h.city_ko && (
                                  <>
                                    {h.area_ko && <span className="text-xs text-gray-400">·</span>}
                                    <span className="text-xs text-gray-600">{h.city_ko}</span>
                                  </>
                                )}
                                {h.country_ko && (
                                  <>
                                    {(h.area_ko || h.city_ko) && <span className="text-xs text-gray-400">·</span>}
                                    <span className="text-xs text-gray-600">{h.country_ko}</span>
                                  </>
                                )}
                              </div>

                              {/* 호텔 혜택 */}
                              {h.benefits && h.benefits.length > 0 && (
                                <div className="flex items-start gap-1 mt-2">
                                  <Coffee className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex flex-wrap gap-1 flex-1">
                                    {h.benefits.slice(0, 3).map((benefit, idx) => (
                                      <span
                                        key={idx}
                                        className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium"
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

                              {/* 프로모션 정보 */}
                              {h.promotions && h.promotions.length > 0 && (
                                <div className="flex items-start gap-1 mt-2">
                                  <Tag className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex flex-col gap-1 flex-1">
                                    {h.promotions.slice(0, 2).map((promo, idx) => (
                                      <div key={idx} className="text-xs">
                                        <span className="font-semibold text-orange-600">{promo.title}</span>
                                        {promo.description && (
                                          <span className="text-gray-600 ml-1">{promo.description}</span>
                                        )}
                                      </div>
                                    ))}
                                    {h.promotions.length > 2 && (
                                      <span className="text-xs text-gray-500">
                                        +{h.promotions.length - 2}개 프로모션 더보기
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* 상세보기 링크 - 오른쪽 아래 */}
                            {h.slug && (
                              <div className="mt-auto flex justify-end pt-2">
                                <Link
                                  href={`/hotel/${h.slug}`}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-block"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                >
                                  상세보기 →
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
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

        {/* 지도 */}
        <div className="lg:col-span-3">
          <div ref={mapContainerRef} className="h-[600px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50" />
        </div>
      </div>
    </div>
  )
}


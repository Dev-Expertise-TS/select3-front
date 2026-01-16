"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useIsMobile } from "@/hooks/use-is-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { generateSlug } from "@/lib/hotel-utils"
import { getCompanyFromURL, applyVccFilter } from "@/lib/company-filter"

interface SimpleHotelSearchProps {
  onSearch?: (query: string) => void | Promise<void>
  className?: string
  initialQuery?: string
  placeholder?: string
  mobilePlaceholder?: string
  isBusy?: boolean
}

export function SimpleHotelSearch({
  onSearch,
  className = "",
  initialQuery = "",
  placeholder = "호텔명, 국가, 또는 지역으로 검색하세요",
  mobilePlaceholder = "호텔명 또는 지역 검색",
  isBusy
}: SimpleHotelSearchProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [internalSearching, setInternalSearching] = useState(false)
  const isSearching = typeof isBusy === 'boolean' ? isBusy : internalSearching
  const [searchQuery, setSearchQuery] = useState(initialQuery || "")
  const isMobile = useIsMobile()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [hotelSuggestions, setHotelSuggestions] = useState<Array<{
    slug: string
    sabre_id: number
    property_name_ko: string | null
    property_name_en: string | null
    city?: string | null
    city_ko?: string | null
    city_en?: string | null
    country_ko?: string | null
    country_en?: string | null
  }>>([])
  const [regionSuggestions, setRegionSuggestions] = useState<Array<{
    kind: 'city' | 'area'
    value: string
    secondary?: string
  }>>([])
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const [selectedHotel, setSelectedHotel] = useState<{
    slug?: string | null
    sabre_id: number
    name: string
  } | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<{
    kind: 'city' | 'area'
    value: string
  } | null>(null)
  const [suggestionError, setSuggestionError] = useState<string | null>(null)

  // Mobile full-screen search overlay
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  useEffect(() => {
    if (typeof document === 'undefined') return
    const original = document.body.style.overflow
    if (isMobileSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = original || ''
    }
    return () => {
      document.body.style.overflow = original || ''
    }
  }, [isMobileSearchOpen])

  // 입력어 하이라이트 유틸
  const highlightText = (text: string, q: string) => {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + q.length)
    const after = text.slice(idx + q.length)
    return (
      <>
        {before}
        <span className="font-semibold text-blue-700">{match}</span>
        {after}
      </>
    )
  }

  // initialQuery 변경 시 searchQuery 업데이트
  useEffect(() => {
    setSearchQuery(initialQuery || "")
  }, [initialQuery])

  // 입력어 기반 호텔 자동완성 (Supabase)
  useEffect(() => {
    const q = searchQuery.trim()
    if (!q) {
      setHotelSuggestions([])
      setRegionSuggestions([])
      setSuggestionError(null)
      return
    }
    let cancelled = false
    const timer = setTimeout(async () => {
      try {
        setIsSuggesting(true)
        setSuggestionError(null)
        
        // ✅ 콤마 입력 등에서 or(...) 이슈를 피하기 위해 개별 쿼리로 분리
        const selectFields =
          'slug,sabre_id,property_name_ko,property_name_en,city,city_ko,city_en,country_ko,country_en,publish'
        const company = getCompanyFromURL()
        
        const hotelQueries = [
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('property_name_ko', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('property_name_en', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('city', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('city_ko', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('city_en', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('country_ko', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('country_en', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          // 지역(Area)
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('area_ko', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select(selectFields).ilike('area_en', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
        ]

        const regionCityPromise = supabase
          .from('select_regions')
          .select('city_ko, city_en, country_ko, country_en, city_code')
          .eq('status', 'active')
          .eq('region_type', 'city')
          .or(`city_ko.ilike.%${q}%,city_en.ilike.%${q}%,country_ko.ilike.%${q}%,country_en.ilike.%${q}%`)
          .order('city_code', { ascending: true })
          .limit(10)

        const regionFieldQueries = [
          (() => {
            let query = supabase.from('select_hotels').select('city_ko, publish').ilike('city_ko', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select('city_en, publish').ilike('city_en', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select('area_ko, publish').ilike('area_ko', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
          (() => {
            let query = supabase.from('select_hotels').select('area_en, publish').ilike('area_en', `%${q}%`).limit(20)
            return applyVccFilter(query, company)
          })(),
        ]

        const [hotelResults, regionCityResult, ...regionFieldResults] = await Promise.all([
          Promise.all(hotelQueries),
          regionCityPromise,
          ...regionFieldQueries,
        ])

        const mergedHotels: any[] = []
        for (const r of hotelResults) {
          if (r.error) continue
          if (r.data) mergedHotels.push(...r.data)
        }

        const uniqueHotels = mergedHotels
          .filter((h) => (h as any)?.publish !== false)
          .filter((h, idx, self) => idx === self.findIndex(x => String((x as any).sabre_id) === String((h as any).sabre_id)))
          .slice(0, 20)

        // 지역 제안 구성
        const regionItems: Array<{ kind: 'city' | 'area'; value: string; secondary?: string }> = []
        const seen = new Set<string>()
        
        if (!regionCityResult.error && regionCityResult.data) {
          for (const r of regionCityResult.data as any[]) {
            const cityKo = (r.city_ko ?? '').toString().trim()
            const cityEn = (r.city_en ?? '').toString().trim()
            const country = (r.country_ko ?? r.country_en ?? '').toString().trim()

            if (cityKo && !seen.has(`city:${cityKo}`)) {
              seen.add(`city:${cityKo}`)
              regionItems.push({ kind: 'city', value: cityKo, secondary: country ? `도시 · ${country}` : '도시' })
            }
            if (cityEn && !seen.has(`city:${cityEn}`)) {
              seen.add(`city:${cityEn}`)
              regionItems.push({ kind: 'city', value: cityEn, secondary: country ? `City · ${country}` : 'City' })
            }
          }
        }

        const addValues = (kind: 'city' | 'area', values: Array<string | null | undefined>, secondary?: string) => {
          for (const v of values) {
            const value = (v ?? '').toString().trim()
            if (!value) continue
            const key = `${kind}:${value}`
            if (seen.has(key)) continue
            seen.add(key)
            regionItems.push({ kind, value, secondary })
          }
        }

        const cityKoRows = ((regionFieldResults[0]?.error ? [] : (regionFieldResults[0]?.data || [])) as any[]).filter(r => r.publish !== false)
        const cityEnRows = ((regionFieldResults[1]?.error ? [] : (regionFieldResults[1]?.data || [])) as any[]).filter(r => r.publish !== false)
        const areaKoRows = ((regionFieldResults[2]?.error ? [] : (regionFieldResults[2]?.data || [])) as any[]).filter(r => r.publish !== false)
        const areaEnRows = ((regionFieldResults[3]?.error ? [] : (regionFieldResults[3]?.data || [])) as any[]).filter(r => r.publish !== false)

        addValues('city', cityKoRows.map(r => r.city_ko), '도시')
        addValues('city', cityEnRows.map(r => r.city_en), 'City')
        addValues('area', areaKoRows.map(r => r.area_ko), '지역')
        addValues('area', areaEnRows.map(r => r.area_en), 'Area')
        
        if (!cancelled) {
          setHotelSuggestions(uniqueHotels as any)
          setRegionSuggestions(regionItems.slice(0, 12))
        }
      } catch (e) {
        // 상세한 오류 정보 로깅
        const errorMessage = e instanceof Error ? e.message : String(e)
        const errorStack = e instanceof Error ? e.stack : undefined
        const errorName = e instanceof Error ? e.name : 'Unknown'
        
        console.error('자동완성 조회 오류 상세:', {
          name: errorName,
          message: errorMessage,
          stack: errorStack,
          query: q,
          timestamp: new Date().toISOString(),
          errorString: String(e),
          errorType: typeof e,
        })
        
        // 에러 객체는 문자열로만 로깅 (콘솔 [object Object] 방지)
        console.error('에러 객체:', e instanceof Error ? e.message : String(e))
        
        if (!cancelled) {
          setHotelSuggestions([])
          setRegionSuggestions([])
          setSuggestionError(`자동완성 기능에 일시적인 문제가 발생했습니다. (${errorMessage})`)
        }
      } finally {
        if (!cancelled) setIsSuggesting(false)
      }
    }, 300) // 디바운스 시간을 300ms로 증가
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [searchQuery, supabase])

  // 키보드 네비게이션
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => {
        const next = prev + 1
        return next >= hotelSuggestions.length ? 0 : next
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => {
        const next = prev - 1
        return next < 0 ? Math.max(hotelSuggestions.length - 1, 0) : next
      })
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < hotelSuggestions.length) {
        const h = hotelSuggestions[highlightIndex]
        const primary = h.property_name_ko || h.property_name_en || '-'
        setSearchQuery(primary)
        setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
        setShowSuggestions(false)
        setHighlightIndex(-1)
      } else {
        // 하이라이트가 없으면 일반 검색 실행
        handleSearch()
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // 검색 핸들러
  const handleSearch = async () => {
    if (isSearching) return
    
    setSuggestionError(null)
    if (typeof isBusy !== 'boolean') {
      setInternalSearching(true)
    }
    
    try {
      const query = searchQuery.trim()
      
      if (!query) {
        // 검색어가 없으면 전체 호텔 목록 표시
        if (onSearch) {
          onSearch("")
        }
        return
      }
      
      // 선택된 호텔이 있으면 상세 페이지로 이동, 없으면 검색 결과로
      if (selectedRegion) {
        const params = new URLSearchParams()
        params.set('region', selectedRegion.value)
        router.push(`/hotel?${params.toString()}`)
        setIsMobileSearchOpen(false)
      } else if (selectedHotel) {
        const slug = selectedHotel.slug || generateSlug(selectedHotel.name)
        router.push(`/hotel/${slug}`)
      } else if (onSearch) {
        const result = onSearch(query) as unknown
        if (typeof (result as any)?.then === 'function') {
          await (result as Promise<any>)
        }
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error instanceof Error ? error.message : String(error))
    } finally {
      if (typeof isBusy !== 'boolean') {
        setInternalSearching(false)
      }
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-1.5 sm:p-4 w-full h-full flex items-center xl:bg-transparent xl:shadow-none xl:border-none xl:px-0 xl:py-0 ${className}`}>
      <div className="flex items-center gap-1.5 sm:gap-3 w-full h-full">
        {/* 검색 입력 영역 */}
        <div className="flex-1 relative">
          <div className="flex items-center gap-1.5 sm:gap-2 relative">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            <Input
              type="text"
              placeholder={isMobile ? mobilePlaceholder : placeholder}
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value
                setSearchQuery(value)
                setSelectedHotel(null)
                setSelectedRegion(null)
                setShowSuggestions(value.length > 0)
              }}
              onFocus={() => {
                if (isMobile) setIsMobileSearchOpen(true)
                setShowSuggestions(searchQuery.length > 0)
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={onKeyDown}
              className="border-0 bg-transparent p-0 text-gray-900 font-medium text-sm sm:text-base placeholder:text-gray-400 placeholder:text-xs sm:placeholder:text-base focus:ring-0 focus:outline-none shadow-none h-full"
              disabled={isSearching}
            />
            
            {searchQuery && (
              <button 
                className={cn(
                  "text-gray-400 hover:text-gray-600 transition-colors",
                  isSearching && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => {
                  setSearchQuery("")
                  setSelectedHotel(null)
                  setSelectedRegion(null)
                  setShowSuggestions(false)
                  if (onSearch) {
                    onSearch("")
                  }
                }}
                disabled={isSearching}
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
          
          {/* 자동완성 제안 목록 */}
          {showSuggestions && !isMobileSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-72 overflow-y-auto">
              {isSuggesting && hotelSuggestions.length === 0 && regionSuggestions.length === 0 && (
                <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-gray-500">불러오는 중...</div>
              )}
              {!isSuggesting && hotelSuggestions.length === 0 && regionSuggestions.length === 0 && !suggestionError && (
                <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-gray-500">검색 결과가 없습니다</div>
              )}
              {suggestionError && (
                <div className="p-2.5 sm:p-3 text-xs sm:text-sm text-red-500 bg-red-50 border border-red-200 rounded">
                  <div className="flex items-center justify-between">
                    <span>⚠️ {suggestionError}</span>
                    <button
                      onClick={() => {
                        setSuggestionError(null)
                        if (searchQuery.trim()) {
                          setSearchQuery(searchQuery)
                        }
                      }}
                      className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      재시도
                    </button>
                  </div>
                </div>
              )}
              {regionSuggestions.map((r) => (
                <div
                  key={`r-${r.kind}-${r.value}`}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                  onClick={() => {
                    setSearchQuery(r.value)
                    setSelectedHotel(null)
                    setSelectedRegion({ kind: r.kind, value: r.value })
                    setShowSuggestions(false)
                    setHighlightIndex(-1)
                  }}
                >
                  <span className="text-base sm:text-lg">📍</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{highlightText(r.value, searchQuery)}</div>
                    {!!r.secondary && <div className="text-xs sm:text-sm text-gray-500 truncate">{r.secondary}</div>}
                  </div>
                </div>
              ))}
              {hotelSuggestions.map((h, idx) => {
                const primary = h.property_name_ko || h.property_name_en || '-'
                const country = h.country_ko || h.country_en || ''
                const city = h.city_ko || h.city || ''
                const location = country && city ? `${city}, ${country}` : country || city || ''
                
                return (
                  <div
                    key={`${h.slug || h.sabre_id}`}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0",
                      highlightIndex === idx && "bg-gray-50"
                    )}
                    onClick={() => {
                      setSearchQuery(primary)
                      setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
                      setSelectedRegion(null)
                      setShowSuggestions(false)
                      setHighlightIndex(-1)
                    }}
                  >
                    <span className="text-base sm:text-lg">🏨</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">{highlightText(primary, searchQuery)}</div>
                      {location && (
                        <div className="text-xs sm:text-sm text-gray-500 truncate">{highlightText(location, searchQuery)}</div>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-400">#{h.sabre_id}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 검색 버튼 */}
        <Button 
          variant="default"
          size="sm"
          className="font-medium px-3 sm:px-6 text-xs sm:text-base flex items-center justify-center shrink-0 h-7 sm:h-10"
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">검색 중...</span>
              <span className="sm:hidden">검색중</span>
            </>
          ) : (
            "검색"
          )}
        </Button>
      </div>

      {/* Mobile full-screen search overlay */}
      {isMobile && isMobileSearchOpen && (
        <div className="fixed inset-0 z-[100000] bg-white sm:hidden">
          <div className="flex items-center gap-2 p-3 border-b">
            <button
              aria-label="닫기"
              onClick={() => { setIsMobileSearchOpen(false); setShowSuggestions(false) }}
              className="p-2"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder={mobilePlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setSearchQuery(value)
                  setSelectedHotel(null)
                  setSelectedRegion(null)
                  setShowSuggestions(value.length > 0)
                }}
                className="border-0 bg-transparent p-0 text-gray-900 font-medium text-base placeholder:text-gray-400 focus:ring-0 focus:outline-none shadow-none flex-1"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedHotel(null); setSelectedRegion(null); setShowSuggestions(false) }}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="지우기"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ height: 'calc(100vh - 56px)' }}>
            {isSuggesting && hotelSuggestions.length === 0 && regionSuggestions.length === 0 && (
              <div className="p-4 text-sm text-gray-500">불러오는 중...</div>
            )}
            {!isSuggesting && hotelSuggestions.length === 0 && regionSuggestions.length === 0 && !suggestionError && (
              <div className="p-4 text-sm text-gray-500">검색 결과가 없습니다</div>
            )}
            {suggestionError && (
              <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 m-3 rounded">
                <div className="flex items-center justify-between">
                  <span>⚠️ {suggestionError}</span>
                  <button
                    onClick={() => { setSuggestionError(null); if (searchQuery.trim()) setSearchQuery(searchQuery) }}
                    className="text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                  >
                    재시도
                  </button>
                </div>
              </div>
            )}
            {regionSuggestions.map((r) => (
              <div
                key={`r-fs-${r.kind}-${r.value}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                onClick={() => {
                  setSearchQuery(r.value)
                  setSelectedHotel(null)
                  setSelectedRegion({ kind: r.kind, value: r.value })
                  setShowSuggestions(false)
                  setHighlightIndex(-1)
                  setIsMobileSearchOpen(false)
                }}
              >
                <span className="text-lg">📍</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{highlightText(r.value, searchQuery)}</div>
                  {!!r.secondary && <div className="text-sm text-gray-500 truncate">{r.secondary}</div>}
                </div>
              </div>
            ))}
            {hotelSuggestions.map((h, idx) => {
              const primary = h.property_name_ko || h.property_name_en || '-'
              const country = h.country_ko || h.country_en || ''
              const city = h.city_ko || h.city || ''
              const location = country && city ? `${city}, ${country}` : country || city || ''
              return (
                <div
                  key={`${h.slug || h.sabre_id}`}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100",
                    highlightIndex === idx && "bg-gray-50"
                  )}
                  onClick={() => {
                    setSearchQuery(primary)
                    setSelectedHotel({ slug: h.slug, sabre_id: h.sabre_id, name: primary })
                    setSelectedRegion(null)
                    setShowSuggestions(false)
                    setHighlightIndex(-1)
                    setIsMobileSearchOpen(false)
                  }}
                >
                  <span className="text-lg">🏨</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{highlightText(primary, searchQuery)}</div>
                    {location && (
                      <div className="text-sm text-gray-500 truncate">{highlightText(location, searchQuery)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

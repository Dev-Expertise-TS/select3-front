"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, MapPin, Hotel, FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useUnifiedSearch } from '@/hooks/use-unified-search'

interface UnifiedSearchBarProps {
  className?: string
  placeholder?: string
  submitTo?: string
  initialQuery?: string
}

export function UnifiedSearchBar({ className = '', placeholder = '호텔/아티클 통합 검색', submitTo = '/search', initialQuery = '' }: UnifiedSearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const { data, isLoading } = useUnifiedSearch(query)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRef = useRef<HTMLDivElement>(null)
  const [isSearching, setIsSearching] = useState(false)

  const suggestions = useMemo(() => data ?? [], [data])
  const regionSuggestions = useMemo(() => suggestions.filter((s: any) => s.type === 'region').slice(0, 5), [suggestions])
  const hotelSuggestions = useMemo(() => suggestions.filter((s: any) => s.type === 'hotel').slice(0, 5), [suggestions])
  const blogSuggestions = useMemo(() => suggestions.filter((s: any) => s.type === 'blog').slice(0, 5), [suggestions])

  const [activeTab, setActiveTab] = useState<'all' | 'region' | 'hotel' | 'blog'>('all')
  const [isFocused, setIsFocused] = useState(false)

  const onSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      const q = query.trim()
      if (!q) return
      // 입력 제출 시 추천 레이어 닫기
      setIsFocused(false)
      setIsSearching(true)
      const params = new URLSearchParams()
      params.set('q', q)
      router.push(`${submitTo}?${params.toString()}`)
      // 페이지 이동 후 로딩 상태 해제 (실제로는 페이지 언마운트되므로 타이머는 백업용)
      setTimeout(() => setIsSearching(false), 3000)
    },
    [query, router, submitTo]
  )

  // 초기 검색어가 URL 변경 등으로 갱신될 때만 동기화 (입력 중에는 간섭하지 않음)
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false)
      }
    }

    if (isFocused) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFocused])

  return (
    <div className={cn('w-full', isFocused && 'md:static fixed top-0 left-0 right-0 z-[60] md:z-auto bg-white md:bg-transparent shadow-md md:shadow-none px-4 md:px-0 pt-4 md:pt-0 pb-2 md:pb-0')}>
      <form onSubmit={onSubmit} className={cn('w-full', className)} role="search" aria-label="통합 검색">
        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            const v = e.target.value
            setQuery(v)
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="border-0 p-0 shadow-none focus-visible:ring-0"
        />
        {!!query && !isLoading && (
          <button
            type="button"
            aria-label="clear"
            onClick={() => {
              setQuery('')
              setIsFocused(true)
              inputRef.current?.focus()
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className={cn(
            'rounded-md px-4 md:px-5 py-1.5 text-sm font-medium text-white whitespace-nowrap min-w-[72px] flex-shrink-0 flex items-center justify-center gap-1.5',
            isSearching ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-black'
          )}
          disabled={isSearching}
          aria-busy={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>검색중</span>
            </>
          ) : (
            '검색'
          )}
        </button>
      </div>

      {isFocused && query.trim() && (
        <div className="relative">
          {/* Overlay layer */}
          <div 
            ref={suggestionRef}
            className="absolute left-0 right-0 z-[70] mt-3 rounded-xl border-2 border-gray-200 bg-white shadow-2xl" 
            role="dialog" 
            aria-label="검색 추천"
          >
            {/* Tabs */}
            <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b-2 border-gray-100 bg-gray-50/50">
              {([
                { key: 'all', label: '전체', show: true },
                { key: 'region', label: '지역', show: regionSuggestions.length > 0 },
                { key: 'hotel', label: '호텔', show: hotelSuggestions.length > 0 },
                { key: 'blog', label: '아티클', show: blogSuggestions.length > 0 },
              ] as const).filter(tab => tab.show).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveTab(tab.key)
                  }}
                  className={cn(
                    'px-5 py-2.5 text-base font-semibold rounded-lg border-2 transition-all duration-200',
                    activeTab === tab.key 
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  )}
                  aria-selected={activeTab === tab.key}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-auto" role="listbox">
              {isLoading && (
                <div className="px-3 py-2 text-xs text-gray-500">불러오는 중...</div>
              )}
              {!isLoading && suggestions.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">결과가 없습니다</div>
              )}
              {(activeTab === 'all' || activeTab === 'region') && regionSuggestions.length > 0 && (
                <div className="divide-y">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>지역</span>
                    </div>
                  </div>
                  {regionSuggestions.map((item: any) => {
                    const city = item.city_ko || item.city_en || item.city_code
                    const country = item.country_ko || item.country_en || ''
                    const params = new URLSearchParams()
                    if (item.city_code) params.set('city', String(item.city_code))
                    if (item.country_code) params.set('country', String(item.country_code))
                    const href = `/hotel?${params.toString()}`
                    return (
                      <a 
                        key={`r-${item.id}`} 
                        href={href} 
                        className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors duration-150 border-l-2 border-transparent hover:border-blue-500" 
                        role="option"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{city}</div>
                          {!!country && <div className="text-xs text-gray-500 mt-0.5">{country}</div>}
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'hotel') && hotelSuggestions.length > 0 && (
                <div className="divide-y border-t">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0">
                    <div className="flex items-center gap-1.5">
                      <Hotel className="w-3.5 h-3.5" />
                      <span>호텔</span>
                    </div>
                  </div>
                  {hotelSuggestions.map((item: any) => {
                    const name = item.property_name_ko || item.property_name_en || `Hotel ${item.sabre_id}`
                    const subtitle = item.city_ko || item.city_en || item.country_ko || item.country_en || item.city || ''
                    const href = item.slug ? `/hotel/${item.slug}` : `/hotel?sabreId=${item.sabre_id}`
                    return (
                      <a 
                        key={`h-${item.id}`} 
                        href={href} 
                        className="flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors duration-150 border-l-2 border-transparent hover:border-orange-500" 
                        role="option"
                      >
                        <Hotel className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{name}</div>
                          {!!subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'blog') && blogSuggestions.length > 0 && (
                <div className="divide-y border-t">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>아티클</span>
                    </div>
                  </div>
                  {blogSuggestions.map((item: any) => {
                    const title = item.main_title || item.slug
                    const subtitle = item.sub_title || ''
                    return (
                      <a 
                        key={`b-${item.id}`} 
                        href={`/blog/${item.slug}`} 
                        className="flex items-start gap-3 px-4 py-3 hover:bg-green-50 transition-colors duration-150 border-l-2 border-transparent hover:border-green-500" 
                        role="option"
                      >
                        <FileText className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">{title}</div>
                          {!!subtitle && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{subtitle}</div>}
                        </div>
                      </a>
                    )
                  })}
                </div>
              )}
              {!isLoading && regionSuggestions.length === 0 && hotelSuggestions.length === 0 && blogSuggestions.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">결과가 없습니다</div>
              )}
            </div>
          </div>
        </div>
      )}
      </form>
    </div>
  )
}



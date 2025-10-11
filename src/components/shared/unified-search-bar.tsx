"use client"

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
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
      const params = new URLSearchParams()
      params.set('q', q)
      router.push(`${submitTo}?${params.toString()}`)
    },
    [query, router, submitTo]
  )

  // 초기 검색어가 URL 변경 등으로 갱신될 때만 동기화 (입력 중에는 간섭하지 않음)
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)} role="search" aria-label="통합 검색">
      <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            const v = e.target.value
            setQuery(v)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 120)}
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
            'rounded-md px-4 md:px-5 py-1.5 text-sm font-medium text-white whitespace-nowrap min-w-[72px] flex-shrink-0',
            isLoading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'
          )}
          aria-busy={isLoading}
        >
          검색
        </button>
      </div>

      {isFocused && query.trim() && (
        <div className="relative">
          {/* Overlay layer */}
          <div className="absolute left-0 right-0 z-50 mt-2 rounded-md border bg-white shadow-lg" role="dialog" aria-label="검색 추천">
            {/* Tabs */}
            <div className="flex items-center gap-4 px-3 pt-2 border-b">
              {([
                { key: 'all', label: '전체' },
                { key: 'region', label: '지역' },
                { key: 'hotel', label: '호텔' },
                { key: 'blog', label: '아티클' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'py-2 text-sm font-medium border-b-2 -mb-px',
                    activeTab === tab.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                  aria-selected={activeTab === tab.key}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-auto" role="listbox">
              {isLoading && (
                <div className="px-3 py-2 text-xs text-gray-500">불러오는 중...</div>
              )}
              {!isLoading && suggestions.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">결과가 없습니다</div>
              )}
              {(activeTab === 'all' || activeTab === 'region') && regionSuggestions.length > 0 && (
                <div className="divide-y">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">지역</div>
                  {regionSuggestions.map((item: any) => {
                    const city = item.city_ko || item.city_en || item.city_code
                    const country = item.country_ko || item.country_en || ''
                    const params = new URLSearchParams()
                    if (item.city_code) params.set('city', String(item.city_code))
                    if (item.country_code) params.set('country', String(item.country_code))
                    const href = `/hotel?${params.toString()}`
                    return (
                      <a key={`r-${item.id}`} href={href} className="block px-3 py-2 hover:bg-gray-50" role="option">
                        <div className="text-sm font-medium text-gray-900">{city}</div>
                        {!!country && <div className="text-xs text-gray-500">{country}</div>}
                      </a>
                    )
                  })}
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'hotel') && hotelSuggestions.length > 0 && (
                <div className="divide-y border-t">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">호텔</div>
                  {hotelSuggestions.map((item: any) => {
                    const name = item.property_name_ko || item.property_name_en || `Hotel ${item.sabre_id}`
                    const subtitle = item.city_ko || item.city_en || item.country_ko || item.country_en || item.city || ''
                    const href = item.slug ? `/hotel/${item.slug}` : `/hotel?sabreId=${item.sabre_id}`
                    return (
                      <a key={`h-${item.id}`} href={href} className="block px-3 py-2 hover:bg-gray-50" role="option">
                        <div className="text-sm font-medium text-gray-900">{name}</div>
                        {!!subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
                      </a>
                    )
                  })}
                </div>
              )}

              {(activeTab === 'all' || activeTab === 'blog') && blogSuggestions.length > 0 && (
                <div className="divide-y border-t">
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-500">아티클</div>
                  {blogSuggestions.map((item: any) => {
                    const title = item.main_title || item.slug
                    const subtitle = item.sub_title || ''
                    return (
                      <a key={`b-${item.id}`} href={`/blog/${item.slug}`} className="block px-3 py-2 hover:bg-gray-50" role="option">
                        <div className="text-sm font-medium text-gray-900">{title}</div>
                        {!!subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
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
  )
}



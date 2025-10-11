"use client"

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useUnifiedSearch } from '@/hooks/use-unified-search'

interface UnifiedSearchBarProps {
  className?: string
  placeholder?: string
}

export function UnifiedSearchBar({ className = '', placeholder = '호텔/아티클 통합 검색' }: UnifiedSearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { data, isLoading } = useUnifiedSearch(query)

  const suggestions = useMemo(() => data ?? [], [data])
  const regionSuggestions = useMemo(() => suggestions.filter((s: any) => s.type === 'region').slice(0, 5), [suggestions])
  const hotelSuggestions = useMemo(() => suggestions.filter((s: any) => s.type === 'hotel').slice(0, 5), [suggestions])
  const blogSuggestions = useMemo(() => suggestions.filter((s: any) => s.type === 'blog').slice(0, 5), [suggestions])

  const [activeTab, setActiveTab] = useState<'all' | 'region' | 'hotel' | 'blog'>('all')

  const onSubmit = useCallback(
    (e?: React.FormEvent) => {
      if (e) e.preventDefault()
      const q = query.trim()
      if (!q) return
      // 우선 동작: 블로그 페이지에 부착되므로, 블로그 검색 결과는 현재 페이지 스크롤/목록 필터링과 별개로
      // 일단 호텔/블로그 상관 없이 검색 결과 페이지로 이동하지 않고, 블로그 페이지에서는 쿼리 파라미터만 반영
      // 추후 /search-results 통합 페이지로 연결 가능
      const params = new URLSearchParams()
      params.set('q', q)
      router.push(`/blog?${params.toString()}`)
    },
    [query, router]
  )

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)} role="search" aria-label="통합 검색">
      <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
        <Search className="w-4 h-4 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="border-0 p-0 shadow-none focus-visible:ring-0"
        />
        <button
          type="submit"
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium text-white',
            isLoading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black'
          )}
          aria-busy={isLoading}
        >
          검색
        </button>
      </div>

      {query.trim() && (regionSuggestions.length > 0 || hotelSuggestions.length > 0 || blogSuggestions.length > 0) && (
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
            </div>
          </div>
        </div>
      )}
    </form>
  )
}



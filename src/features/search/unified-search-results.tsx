"use client"

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { UnifiedSearchBar } from '@/components/shared/unified-search-bar'
import { useUnifiedSearch } from '@/hooks/use-unified-search'
import { buildLuxurySearchMessages } from '@/config/ai-search'

async function streamAISummary(q: string, onChunk: (t: string) => void, onDone: () => void) {
  const res = await fetch('/api/openai/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      ...buildLuxurySearchMessages(q),
      temperature: 0.4,
    })
  })
  if (!res.ok || !res.body) {
    onDone()
    return
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    // SSE 이벤트 파싱
    const events = buffer.split('\n\n')
    buffer = events.pop() || ''
    for (const evt of events) {
      const line = evt.trim()
      if (!line.startsWith('data:')) continue
      const data = line.replace(/^data:\s*/, '')
      if (data === '[DONE]') {
        onDone()
        return
      }
      try {
        const json = JSON.parse(data)
        const delta = json.choices?.[0]?.delta?.content
        if (delta) onChunk(delta)
      } catch {
        // ignore non-json heartbeats
      }
    }
  }
  onDone()
}

export function UnifiedSearchResults() {
  const searchParams = useSearchParams()
  const q = (searchParams.get('q') || '').trim()
  const { data, isLoading } = useUnifiedSearch(q)
  const [aiSummary, setAiSummary] = useState<string>('')
  const [aiStreaming, setAiStreaming] = useState<boolean>(false)
  const [aiLoading, setAiLoading] = useState<boolean>(false)
  const [isPriming, setIsPriming] = useState<boolean>(false)
  const [isAiExpanded, setIsAiExpanded] = useState<boolean>(false)

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!q) return setAiSummary('')
      // 초기화: 기존 내용 즉시 비우고 로딩 상태 진입
      setIsPriming(true)
      setAiSummary('')
      setAiStreaming(false)
      setAiLoading(true)
      setAiStreaming(true)
      let acc = ''
      await streamAISummary(q, (chunk) => {
        if (cancelled) return
        acc += chunk
        setAiSummary(acc)
      }, () => {
        if (cancelled) return
        setAiStreaming(false)
        setAiLoading(false)
        setIsPriming(false)
      })
    }
    run()
    return () => { cancelled = true }
  }, [q])

  const regions = useMemo(() => (data || []).filter((i: any) => i.type === 'region'), [data])
  const hotels = useMemo(() => (data || []).filter((i: any) => i.type === 'hotel'), [data])
  const blogs = useMemo(() => (data || []).filter((i: any) => i.type === 'blog'), [data])

  // 지식 패널 데이터 선택: 지역 우선, 없으면 호텔에서 도시/국가 정보 추출
  const knowledge = useMemo(() => {
    if (regions.length > 0) {
      const r: any = regions[0]
      return {
        title: r.city_ko || r.city_en || r.city_code,
        country: r.country_ko || r.country_en || '',
        city_code: r.city_code,
        country_code: r.country_code,
      }
    }
    if (hotels.length > 0) {
      const h: any = hotels[0]
      return {
        title: h.city_ko || h.city_en || h.city || '도시',
        country: h.country_ko || h.country_en || '',
        city_code: h.city_code,
        country_code: h.country_code,
      }
    }
    return null
  }, [regions, hotels])

  // 썸네일 컴포넌트: 단순하고 안정적인 이미지 로딩
  function Thumb({ candidates, alt }: { candidates: string[]; alt: string }) {
    const [hasError, setHasError] = useState(false)
    
    // 첫 번째 유효한 이미지 URL을 메모이제이션
    const imageSrc = useMemo(() => {
      const validSrc = candidates.find(src => src && src.trim() && src !== '/placeholder.svg')
      return validSrc || '/placeholder.svg'
    }, [candidates])
    
    const handleError = () => {
      if (!hasError) {
        setHasError(true)
      }
    }
    
    return (
      <div className="relative w-full h-full">
        <Image
          src={hasError ? '/placeholder.svg' : imageSrc}
          alt={alt}
          fill
          sizes="96px"
          className="object-cover"
          onError={handleError}
        />
      </div>
    )
  }

  return (
    <>
      <style jsx>{`
        @keyframes typing {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
      <section className="py-6">
        <div className="container mx-auto max-w-[1200px] px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - AI 요약 + 결과 리스트 */}
          <div className="lg:col-span-8 space-y-8">
            {/* 상단 검색 바 - 좌측 영역에 맞춤 */}
            <div className="mb-4">
              <UnifiedSearchBar submitTo="/search" initialQuery={q} />
            </div>
            {/* AI 요약 */}
            {q && (
              <div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                  호텔 전문 AI 답변
                  {aiStreaming && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs">생성 중...</span>
                    </div>
                  )}
                </div>
                <div className={cn('rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200', aiLoading && 'opacity-70')} aria-busy={aiLoading}>
                  {aiSummary ? (
                    <div className="prose prose-sm max-w-none">
                      <div className={cn('whitespace-pre-wrap', !isAiExpanded && 'line-clamp-4')}>
                        {aiSummary}
                        {aiStreaming && (
                          <span className="inline-block w-2 h-4 bg-blue-600 ml-1 animate-pulse font-bold">▊</span>
                        )}
                        {aiSummary.endsWith('...') && aiStreaming && (
                          <span 
                            className="inline-block ml-1 text-blue-600 font-bold"
                            style={{
                              animation: 'typing 1.5s infinite',
                              animationTimingFunction: 'ease-in-out'
                            }}
                          >
                            ...
                          </span>
                        )}
                      </div>
                      {aiSummary.length > 200 && (
                        <div className="flex justify-center mt-3">
                          <button
                            onClick={() => setIsAiExpanded(!isAiExpanded)}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            {isAiExpanded ? '접기' : '더보기'}
                            <svg 
                              className={cn('w-4 h-4 transition-transform', isAiExpanded && 'rotate-180')} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span>AI가 럭셔리 호텔 추천을 생각 중입니다...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 지역 섹션 */}
            {regions.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">지역</div>
                <div className="space-y-3">
                  {regions.slice(0, 8).map((r: any) => {
                    const params = new URLSearchParams()
                    if (r.city_code) params.set('city', r.city_code)
                    if (r.country_code) params.set('country', r.country_code)
                    const href = `/hotel?${params.toString()}`
                    const city = r.city_ko || r.city_en || r.city_code
                    const country = r.country_ko || r.country_en || ''
                    
                    return (
                      <a key={`r-${r.id}`} href={href} className="flex gap-3 pb-3 border-b border-gray-200 last:border-0 group">
                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <Thumb
                            candidates={[r.image_url].filter(Boolean)}
                            alt={city}
                          />
                        </div>
                        <div>
                          <div className="text-[15px] text-blue-700 group-hover:underline font-medium">{city}</div>
                          {!!country && <div className="text-xs text-gray-500 mt-0.5">{country}</div>}
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 호텔 섹션 */}
            {hotels.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">호텔</div>
                <div className="space-y-3">
                  {hotels.slice(0, 8).map((h: any) => {
                    const name = h.property_name_ko || h.property_name_en || `Hotel ${h.sabre_id}`
                    const subtitle = h.city_ko || h.city_en || h.country_ko || h.country_en || h.city || ''
                    const href = h.slug ? `/hotel/${h.slug}` : `/hotel?sabreId=${h.sabre_id}`
                    return (
                      <a key={`h-${h.id}`} href={href} className="flex gap-3 pb-3 border-b border-gray-200 last:border-0 group">
                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <Image 
                            src={h.image_url || '/placeholder.svg'} 
                            alt={name} 
                            fill
                            sizes="96px"
                            className="object-cover" 
                          />
                        </div>
                        <div>
                          <div className="text-[15px] text-blue-700 group-hover:underline font-medium">{name}</div>
                          {!!subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
                          {!!h.snippet && (
                            <div className="text-xs text-gray-600 mt-1 line-clamp-2">{h.snippet}</div>
                          )}
                          {!!(h.promotions && h.promotions.length > 0) && (
                            <div className="mt-1">
                              <div className="text-[11px] text-gray-500">프로모션</div>
                              <ul className="list-disc ml-4 text-xs text-gray-700 space-y-0.5">
                                {h.promotions.slice(0, 2).map((p: string, i: number) => (
                                  <li key={`hp-${h.id}-${i}`} className="truncate">{p}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 아티클 섹션 */}
            {blogs.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3">아티클</div>
                <div className="space-y-3">
                  {blogs.slice(0, 8).map((b: any) => {
                    const title = b.main_title || b.slug
                    const subtitle = b.sub_title || ''
                    return (
                      <a key={`b-${b.id}`} href={`/blog/${b.slug}`} className="flex gap-3 pb-3 border-b border-gray-200 last:border-0 group">
                        <div className="relative w-24 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                          <Image 
                            src={b.image_url || '/placeholder.svg'} 
                            alt={title} 
                            fill
                            sizes="96px"
                            className="object-cover" 
                          />
                        </div>
                        <div>
                          <div className="text-[15px] text-blue-700 group-hover:underline font-medium">{title}</div>
                          {!!subtitle && <div className="text-xs text-gray-500 mt-0.5">{subtitle}</div>}
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 프라이밍 시 스켈레톤 */}
            {isPriming && (
              <div className="space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`sk-${i}`} className="space-y-2">
                    <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Knowledge Panel */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-gray-500 mb-1">정보 패널</div>
                {knowledge ? (
                  <div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">{knowledge.title}</div>
                    {knowledge.country && (
                      <div className="text-sm text-gray-600 mb-2">{knowledge.country}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="font-medium text-gray-800">호텔 결과</div>
                        <div>{hotels.length}개</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="font-medium text-gray-800">아티클</div>
                        <div>{blogs.length}개</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(knowledge.city_code || knowledge.country_code) && (
                        <a
                          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 w-full"
                          href={`/hotel?${(() => {
                            const p = new URLSearchParams()
                            if (knowledge.city_code) p.set('city', knowledge.city_code)
                            if (knowledge.country_code) p.set('country', knowledge.country_code)
                            return p.toString()
                          })()}`}
                        >
                          호텔 전체 보기
                        </a>
                      )}
                      {q && (
                        <a className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50 w-full" href={`/blog?q=${encodeURIComponent(q)}`}>
                          관련 아티클 보기
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">키워드와 연결된 지역 또는 호텔 정보를 찾는 중...</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
    </>
  )
}



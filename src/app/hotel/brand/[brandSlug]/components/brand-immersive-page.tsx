'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface BrandImmersivePageProps {
  brand: {
    brand_id: number
    brand_name_en: string
    brand_name_ko?: string | null
    brand_slug: string
    brand_description?: string | null
    brand_description_ko?: string | null
  }
  hotels: any[]
  allHotelImages: Array<{ sabre_id: string; url: string; slug: string }>
  aiDescription: string
}

export function BrandImmersivePage({ brand, hotels, allHotelImages, aiDescription }: BrandImmersivePageProps) {
  const [mounted, setMounted] = useState(false)
  const [shuffledImages, setShuffledImages] = useState<Array<{url: string, alt: string, slug: string}>>([])
  const [displayedDescription, setDisplayedDescription] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [gridConfig, setGridConfig] = useState({ cols: 'grid-cols-6', rows: 'auto-rows-[minmax(120px,1fr)]' })
  const hasLoadedRef = useRef(false) // 이미 로드되었는지 추적
  
  // 캐시 키 생성
  const cacheKey = `brand-ai-${brand.brand_slug}`
  
  // AI 설명 스트리밍 (한 번만 실행)
  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (hasLoadedRef.current) {
      console.log('[Brand AI] 이미 로드됨, 스킵')
      return
    }
    
    let cancelled = false
    let timeoutId: NodeJS.Timeout
    
    async function streamDescription() {
      const brandName = brand.brand_name_ko || brand.brand_name_en
      
      // 로컬 스토리지에서 캐시 확인
      try {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
          console.log('[Brand AI] 캐시된 설명 사용:', brandName)
          setDisplayedDescription(cached)
          setIsLoading(false)
          setIsStreaming(false)
          hasLoadedRef.current = true
          return
        }
      } catch (e) {
        console.warn('[Brand AI] 로컬 스토리지 읽기 실패:', e)
      }
      
      // 로딩 메시지 표시
      setIsLoading(true)
      setDisplayedDescription(`${brandName} 소개 준비 중...`)
      
      // 잠깐 대기 (로딩 메시지가 보이도록)
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (cancelled) return
      
      setIsLoading(false)
      setIsStreaming(true)
      
      try {
        const res = await fetch('/api/brand/description-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brand })
        })

        if (!res.ok || !res.body) {
          // API 실패 시 폴백 설명 표시
          setDisplayedDescription(aiDescription)
          setIsStreaming(false)
          hasLoadedRef.current = true
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''
        let fullText = ''

        // 스트리밍 시작 - 초기화
        setDisplayedDescription('')

        while (true) {
          const { value, done } = await reader.read()
          if (done || cancelled) break

          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() || ''

          for (const evt of events) {
            const line = evt.trim()
            if (!line.startsWith('data:')) continue
            
            const data = line.replace(/^data:\s*/, '')
            if (data === '[DONE]') {
              setIsStreaming(false)
              // 완성된 텍스트를 로컬 스토리지에 캐시
              if (fullText) {
                try {
                  localStorage.setItem(cacheKey, fullText)
                  console.log('[Brand AI] 설명 캐시 저장 완료:', brandName)
                } catch (e) {
                  console.warn('[Brand AI] 로컬 스토리지 저장 실패:', e)
                }
              }
              hasLoadedRef.current = true
              return
            }

            try {
              const json = JSON.parse(data)
              // OpenAI 원본 형식: choices[0].delta.content
              const content = json.choices?.[0]?.delta?.content
              if (content && !cancelled) {
                fullText += content
                setDisplayedDescription(fullText)
                
                // 각 청크마다 딜레이 추가 (느린 타이핑 효과 - 100ms)
                await new Promise(resolve => {
                  timeoutId = setTimeout(resolve, 100)
                })
              }
            } catch {
              // JSON 파싱 오류 무시
            }
          }
        }
        
        setIsStreaming(false)
        hasLoadedRef.current = true
      } catch (error) {
        console.error('AI 설명 스트리밍 오류:', error)
        // 에러 발생 시 폴백 설명 표시
        setDisplayedDescription(aiDescription)
        setIsStreaming(false)
        setIsLoading(false)
        hasLoadedRef.current = true
      }
    }

    streamDescription()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [brand.brand_slug, cacheKey]) // brand 객체 대신 brand_slug만 의존성으로 사용

  // 이미지 셔플 및 그리드 채우기
  useEffect(() => {
    // allHotelImages를 사용하여 모든 호텔의 모든 이미지 수집 (중복 제거)
    const uniqueImages = new Map<string, { url: string; alt: string; slug: string }>()
    
    // allHotelImages에서 모든 이미지 가져오기
    allHotelImages
      .filter(img => img.url && img.url.trim() !== '') // 빈 URL 필터링
      .forEach(img => {
        if (!uniqueImages.has(img.url)) {
          // 호텔 정보에서 이름 찾기
          const hotel = hotels.find(h => h.sabre_id === img.sabre_id)
          uniqueImages.set(img.url, {
            url: img.url,
            alt: hotel?.property_name_ko || hotel?.property_name_en || 'Hotel',
            slug: img.slug || hotel?.slug
          })
        }
      })

    const hotelImages = Array.from(uniqueImages.values())

    if (hotelImages.length === 0) {
      setMounted(true)
      return
    }

    // 이미지 개수에 따라 그리드 설정 및 필요한 타일 수 계산
    const imageCount = hotelImages.length
    let cols = 'grid-cols-6'
    let mdCols = 'md:grid-cols-5'
    let lgCols = 'lg:grid-cols-6'
    let rows = 'auto-rows-[minmax(120px,1fr)]'
    let baseCols = 6 // 기본 열 수 (lg 기준)
    
    if (imageCount <= 6) {
      cols = 'grid-cols-2'
      mdCols = 'md:grid-cols-2'
      lgCols = 'lg:grid-cols-3'
      rows = 'auto-rows-[minmax(250px,1fr)]'
      baseCols = 3
    } else if (imageCount <= 12) {
      cols = 'grid-cols-3'
      mdCols = 'md:grid-cols-3'
      lgCols = 'lg:grid-cols-4'
      rows = 'auto-rows-[minmax(200px,1fr)]'
      baseCols = 4
    } else if (imageCount <= 30) {
      cols = 'grid-cols-4'
      mdCols = 'md:grid-cols-4'
      lgCols = 'lg:grid-cols-5'
      rows = 'auto-rows-[minmax(150px,1fr)]'
      baseCols = 5
    } else {
      cols = 'grid-cols-4'
      mdCols = 'md:grid-cols-5'
      lgCols = 'lg:grid-cols-6'
      rows = 'auto-rows-[minmax(120px,1fr)]'
      baseCols = 6
    }

    setGridConfig({ 
      cols: `${cols} ${mdCols} ${lgCols}`,
      rows 
    })

    // 화면을 완전히 채우기 위한 계산
    // 대략 15행 정도 채우기 (viewport height 고려)
    const estimatedRows = 15
    const minRequiredTiles = baseCols * estimatedRows

    // 필요한 만큼 이미지 준비 (중복 최소화)
    let finalImages = [...hotelImages]
    
    if (finalImages.length < minRequiredTiles) {
      // 부족하면 반복하되, 최대한 분산 배치
      const repetitions = Math.ceil(minRequiredTiles / hotelImages.length)
      const batches: typeof hotelImages[] = []
      
      for (let i = 0; i < repetitions; i++) {
        const shuffled = [...hotelImages].sort(() => Math.random() - 0.5)
        batches.push(shuffled)
      }
      
      // 인터리빙으로 병합 (같은 이미지가 멀리 떨어지도록)
      finalImages = []
      for (let i = 0; i < hotelImages.length && finalImages.length < minRequiredTiles; i++) {
        for (let j = 0; j < batches.length && finalImages.length < minRequiredTiles; j++) {
          if (batches[j][i]) {
            finalImages.push(batches[j][i])
          }
        }
      }
    }

    // 최종 셔플
    const shuffled = finalImages
      .slice(0, minRequiredTiles)
      .sort(() => Math.random() - 0.5)
    
    setShuffledImages(shuffled)
    setMounted(true)
  }, [hotels, allHotelImages])

  const brandName = brand.brand_name_ko || brand.brand_name_en
  
  // 브랜드명 길이에 따른 폰트 크기 결정
  const getBrandFontSize = () => {
    const displayName = brand.brand_name_ko || brand.brand_name_en
    const nameLength = displayName?.length || 0
    
    if (nameLength > 15) {
      return 'text-xs md:text-sm' // 매우 긴 이름
    } else if (nameLength > 10) {
      return 'text-sm md:text-base' // 긴 이름
    } else {
      return 'text-sm md:text-base' // 짧은 이름
    }
  }

  return (
    <article className="relative min-h-screen bg-black overflow-hidden">
      {/* 모자이크 배경 그리드 - 클릭 불가 */}
      {mounted && shuffledImages.length > 0 && (
        <div className={`absolute inset-0 grid ${gridConfig.cols} ${gridConfig.rows} gap-0.5 p-0.5 pointer-events-none overflow-hidden`}>
          {shuffledImages.map((img, idx) => {
            // 타일 크기 패턴 생성 (빈 공간 최소화)
            let spanClass = ''
            
            if (shuffledImages.length > 20) {
              // 다양한 크기로 빈 공간 최소화
              if (idx % 11 === 0) {
                spanClass = 'col-span-2 row-span-2' // 큰 타일
              } else if (idx % 7 === 0) {
                spanClass = 'col-span-2' // 가로로 긴 타일
              } else if (idx % 5 === 0) {
                spanClass = 'row-span-2' // 세로로 긴 타일
              }
              // 나머지는 1x1 타일
            }
            
            return (
              <div
                key={`${img.slug}-${idx}`}
                className={`relative overflow-hidden ${spanClass} ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{
              animationDelay: `${idx * 50}ms`,
              animationFillMode: 'forwards'
            }}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 25vw, (max-width: 1024px) 20vw, 16vw"
              className="object-cover hover:scale-110 transition-transform duration-700 brightness-125"
              quality={85}
              priority={idx < 6}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzE1MTUxNSIvPjwvc3ZnPg=="
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300"></div>
            </div>
            )
          })}
        </div>
      )}

      {/* 전체 오버레이 - 매우 밝게 조정 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/5 pointer-events-none"></div>
      
      {/* 중앙 텍스트 영역만 어둡게 - radial gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.1) 55%, transparent 65%)'
        }}
      ></div>

      {/* 중앙 콘텐츠 - 최상위 레이어 */}
      <section className="relative z-50 min-h-screen flex items-center justify-center px-6 pointer-events-none">
        <div className="max-w-4xl text-center">
          {/* 브랜드명 */}
          <header 
            className={`mb-8 ${mounted ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            {brand.brand_name_ko && (
              <h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-none"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9)' }}
              >
                {brand.brand_name_ko}
              </h1>
            )}
            <p 
              className="text-2xl md:text-4xl lg:text-5xl font-light text-white tracking-[0.2em] uppercase"
              style={{ textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.8)' }}
            >
              {brand.brand_name_en}
            </p>
          </header>

          {/* 구분선 */}
          <div 
            className={`flex justify-center mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}
          >
            <div className="w-32 h-px bg-white/60 shadow-lg"></div>
          </div>

          {/* 브랜드 설명 */}
          <div 
            className={`text-base md:text-xl text-white leading-relaxed font-medium mb-12 max-w-2xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ 
              animationDelay: '900ms', 
              animationFillMode: 'forwards',
              textShadow: '0 3px 12px rgba(0,0,0,0.95), 0 1px 4px rgba(0,0,0,0.9)'
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>{displayedDescription}</span>
              </div>
            ) : (
              <>
                {displayedDescription || aiDescription}
                {isStreaming && <span className="inline-block w-1 h-5 bg-white ml-1 animate-pulse"></span>}
              </>
            )}
          </div>

          {/* 컨시어지 안내 */}
          <div 
            className={`text-sm md:text-base text-white mb-12 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ 
              animationDelay: '1200ms', 
              animationFillMode: 'forwards',
              textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)'
            }}
          >
            <div className="mb-1 font-bold">고객님의 {brand.brand_name_en.toUpperCase()} 호텔 예약을 도와드릴</div>
            <div className="text-white font-bold">한국 최고의 호텔 전문 컨시어지 상담이 준비되어 있습니다.</div>
          </div>

          {/* CTA 버튼 */}
          <nav 
            className={`flex flex-col gap-4 items-center pointer-events-auto ${mounted ? 'animate-slide-up' : 'opacity-0 translate-y-10'}`}
            style={{ animationDelay: '1500ms', animationFillMode: 'forwards' }}
            aria-label="브랜드 호텔 탐색"
          >
            <a
              href={`/hotel?brand_id=${brand.brand_id}`}
              className="group inline-flex items-center justify-center gap-2 w-48 md:w-56 h-14 px-6 bg-white/20 backdrop-blur-xl hover:bg-white/30 border-2 border-white/40 hover:border-white/60 transition-all duration-300 rounded-full cursor-pointer pointer-events-auto relative z-[100] no-underline shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              <span 
                className={`text-white ${getBrandFontSize()} font-semibold tracking-wide pointer-events-none flex items-center gap-1 min-w-0`}
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,1)'
                }}
              >
                <span className="truncate">{brand.brand_name_ko || brand.brand_name_en}</span>
                <span className="whitespace-nowrap flex-shrink-0">보기</span>
              </span>
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1 pointer-events-none drop-shadow-lg flex-shrink-0" />
            </a>
            
            <a
              href="/hotel/brand"
              className="group inline-flex items-center justify-center gap-2 w-48 md:w-56 h-14 px-6 bg-white/15 backdrop-blur-xl hover:bg-white/25 border-2 border-white/30 hover:border-white/50 transition-all duration-300 rounded-full cursor-pointer pointer-events-auto relative z-[100] no-underline shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              style={{
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
              }}
            >
              <ArrowLeft className="w-5 h-5 text-white transition-transform group-hover:-translate-x-1 pointer-events-none drop-shadow-lg flex-shrink-0" />
              <span 
                className="text-white text-sm md:text-base font-semibold tracking-wide pointer-events-none whitespace-nowrap"
                style={{
                  textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 1px rgba(0,0,0,1)'
                }}
              >
                브랜드 목록 보기
              </span>
            </a>
          </nav>
        </div>
      </section>

      {/* CSS 애니메이션 */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
      `}</style>
    </article>
  )
}


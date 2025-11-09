'use client'

import { useState } from 'react'
import { RecommendationFilters } from '@/components/shared/recommendation-filters'
import { CollectionCard } from '@/features/recommendation-pages/components'

interface RecommendationPage {
  id: string
  slug: string
  title_ko: string
  intro_rich_ko: string | null
  hero_image_url: string | null
  hashtags: string[] | null
}

interface RecommendationsClientProps {
  initialPages: RecommendationPage[]
}

export function RecommendationsClient({ initialPages }: RecommendationsClientProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  // 필터링된 페이지 (현재는 클라이언트 사이드, 나중에 서버 사이드로 최적화 가능)
  const filteredPages = selectedTags.length === 0 
    ? initialPages
    : initialPages.filter(page => {
        // 해시태그가 선택된 태그와 매칭되는지 확인
        if (!page.hashtags || page.hashtags.length === 0) return false
        return selectedTags.some(tag => 
          page.hashtags?.some(hashtag => 
            hashtag.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(hashtag.toLowerCase())
          )
        )
      })

  const handleFilterChange = (tags: string[]) => {
    setSelectedTags(tags)
  }

  return (
    <>
      {/* Filter Section */}
      <div className="bg-gradient-to-b from-slate-900 to-gray-900 py-8">
        <div className="container mx-auto max-w-[1440px] px-4">
          <RecommendationFilters onFilterChange={handleFilterChange} />
        </div>
      </div>

      {/* Recommendation Pages Grid - Enhanced v0 Style */}
      <div className="py-20 sm:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              추천 컬렉션
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {filteredPages.length > 0 
                ? `${filteredPages.length}개의 컬렉션이 있습니다`
                : '선택한 필터에 맞는 컬렉션이 없습니다'}
            </p>
          </div>
          
          {filteredPages.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 text-4xl mb-6">
                📚
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedTags.length > 0 ? '조건에 맞는 컬렉션이 없습니다' : '준비 중입니다'}
              </h3>
              <p className="text-gray-600">
                {selectedTags.length > 0 ? '다른 필터를 선택해보세요' : '곧 멋진 호텔 컬렉션을 선보일 예정입니다'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredPages.map((page, index) => (
                <CollectionCard key={page.id} page={page} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Filter, X, ChevronDown } from 'lucide-react'

interface Tag {
  id: string
  category_id: string
  name_ko: string
  name_en: string
  slug: string
  sort_order: number
  active: boolean
}

interface TagCategory {
  id: string
  name_ko: string
  name_en: string
  slug: string
  sort_order: number
  tags: Tag[]
}

interface RecommendationFiltersProps {
  onFilterChange?: (selectedTags: string[]) => void
}

export function RecommendationFilters({ onFilterChange }: RecommendationFiltersProps) {
  const [categories, setCategories] = useState<TagCategory[]>([])
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFilters() {
      try {
        const response = await fetch('/api/recommendation-filters')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setCategories(data.categories || [])
          }
        }
      } catch (error) {
        console.error('필터 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFilters()
  }, [])

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleTag = (tagSlug: string) => {
    const newSelected = new Set(selectedTags)
    if (newSelected.has(tagSlug)) {
      newSelected.delete(tagSlug)
    } else {
      newSelected.add(tagSlug)
    }
    setSelectedTags(newSelected)
    onFilterChange?.(Array.from(newSelected))
  }

  const clearFilters = () => {
    setSelectedTags(new Set())
    setExpandedCategories(new Set())
    onFilterChange?.([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-white/60">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-sm">필터 로딩 중...</span>
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-white" />
          <span className="text-base font-bold text-white">컬렉션 필터</span>
          {selectedTags.size > 0 && (
            <span className="px-3 py-1 bg-blue-500 rounded-full text-xs font-bold text-white shadow-lg">
              {selectedTags.size}개 선택
            </span>
          )}
        </div>
        
        {selectedTags.size > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium text-white transition-all duration-200 hover:scale-105"
          >
            <X className="w-4 h-4" />
            <span>모두 지우기</span>
          </button>
        )}
      </div>

      {/* Category Pills (Expandable) */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id)
          const categoryTagCount = category.tags.filter(tag => selectedTags.has(tag.slug)).length
          
          return (
            <div key={category.id} className="relative">
              {/* Category Button */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all duration-300 border-2",
                  isExpanded || categoryTagCount > 0
                    ? "bg-white text-blue-600 border-white shadow-xl scale-105"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:scale-105"
                )}
              >
                <span>{category.name_ko}</span>
                {categoryTagCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {categoryTagCount}
                  </span>
                )}
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )} 
                />
              </button>
              
              {/* Expanded Tag List */}
              {isExpanded && (
                <div className="absolute top-full left-0 mt-2 min-w-[300px] bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-4 z-50 animate-fadeInUp">
                  <div className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                      {category.name_ko} 선택
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag) => {
                        const isSelected = selectedTags.has(tag.slug)
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.slug)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                              isSelected
                                ? "bg-blue-600 text-white shadow-md scale-105"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                            )}
                          >
                            {tag.name_ko}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      {/* Selected Tags Display */}
      {selectedTags.size > 0 && (
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-white">선택된 필터:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedTags).map((tagSlug) => {
              // 태그 이름 찾기
              const tag = categories
                .flatMap(c => c.tags)
                .find(t => t.slug === tagSlug)
              
              if (!tag) return null
              
              return (
                <button
                  key={tagSlug}
                  onClick={() => toggleTag(tagSlug)}
                  className="group flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-full text-sm font-bold shadow-lg hover:bg-blue-50 transition-all duration-200"
                >
                  <span>{tag.name_ko}</span>
                  <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


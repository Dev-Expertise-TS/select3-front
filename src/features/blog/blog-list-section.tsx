"use client"

import { useState, useEffect } from "react"
import { UnifiedSearchBar } from "@/components/shared/unified-search-bar"
import { useSearchParams } from "next/navigation"
import { BlogCard } from "@/components/shared/blog-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Blog {
  id: string
  slug: string
  main_image: string | null
  main_title: string
  sub_title: string | null
  created_at: string
  updated_at: string | null
}

interface BlogResponse {
  success: boolean
  data: Blog[]
  meta: {
    count: number
  }
}

interface BlogListSectionProps {
  initialBlogs?: Blog[]
}

export function BlogListSection({ initialBlogs = [] }: BlogListSectionProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs)
  const [loading, setLoading] = useState(initialBlogs.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(9) // 3행 × 3열 = 9개
  const searchParams = useSearchParams()
  const q = (searchParams?.get('q') || '').trim().toLowerCase()

  // 서버 데이터가 없을 때만 클라이언트에서 fetch
  useEffect(() => {
    if (initialBlogs.length > 0) {
      return // 서버 데이터가 있으면 fetch 안함
    }

    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const company = searchParams?.get('company')
        const url = company ? `/api/blogs?company=${company}` : "/api/blogs"
        const response = await fetch(url)
        const data: BlogResponse = await response.json()

        if (data.success) {
          setBlogs(data.data)
        } else {
          setError(data.error || "블로그를 불러오는데 실패했습니다.")
        }
      } catch (err) {
        setError("네트워크 오류가 발생했습니다.")
        console.error("Blog fetch error:", err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [initialBlogs.length])

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9) // 3행씩 추가
  }

  const filtered = q
    ? blogs.filter((b) => {
        const title = (b.main_title || '').toLowerCase()
        const sub = (b.sub_title || '').toLowerCase()
        const slug = (b.slug || '').toLowerCase()
        return title.includes(q) || sub.includes(q) || slug.includes(q)
      })
    : blogs

  const visibleBlogs = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-16"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`blog-skeleton-${i}`} className="animate-pulse">
                  <div className="bg-gray-300 aspect-[16/9] rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 sm:mb-16">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
            투어비스 셀렉트 호텔 전문 매거진
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            전 세계 유명 호텔 브랜드들과 함께 소개하는 <br />
            프리미엄 호텔들의 소개글을 만나보세요.
          </p>
        </div>

        {/* 통합 검색 바 */}
        <div className="max-w-3xl mx-auto mb-8">
          <UnifiedSearchBar placeholder="호텔/아티클을 검색하세요" submitTo="/search" />
        </div>

        {/* 블로그 리스트 */}
        {blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleBlogs.map((blog, index) => (
                <BlogCard
                  key={`blog-${blog.id}-${index}`}
                  id={blog.id}
                  slug={blog.slug}
                  mainImage={blog.main_image}
                  mainTitle={blog.main_title}
                  subTitle={blog.sub_title}
                  createdAt={blog.created_at}
                  updatedAt={blog.updated_at}
                />
              ))}
            </div>
            
            {/* 더보기 버튼 */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  더보기 ({filtered.length - visibleCount}개 더)
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                아직 게시된 아티클이 없습니다
              </h3>
              <p className="text-gray-500">
                곧 다양한 아티클을 만나보실 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 통계 정보 */}
        {filtered.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-gray-500">
              총 <span className="font-semibold text-gray-700">{filtered.length}</span>개의 아티클
              {visibleCount < filtered.length && (
                <span className="ml-2">
                  (현재 <span className="font-semibold text-gray-700">{visibleCount}</span>개 표시)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

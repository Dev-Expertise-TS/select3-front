"use client"

import { useState, useEffect } from "react"
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

export function BlogListSection() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(9) // 3행 × 3열 = 9개

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/blogs")
        const data: BlogResponse = await response.json()

        if (data.success) {
          setBlogs(data.data)
        } else {
          setError(data.error || "블로그를 불러오는데 실패했습니다.")
        }
      } catch (err) {
        setError("네트워크 오류가 발생했습니다.")
        console.error("Blog fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 9) // 3행씩 추가
  }

  const visibleBlogs = blogs.slice(0, visibleCount)
  const hasMore = visibleCount < blogs.length

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
                  더보기 ({blogs.length - visibleCount}개 더)
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
        {blogs.length > 0 && (
          <div className="mt-16 text-center">
            <p className="text-gray-500">
              총 <span className="font-semibold text-gray-700">{blogs.length}</span>개의 아티클
              {visibleCount < blogs.length && (
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

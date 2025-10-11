"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { BlogContentRenderer } from "@/components/shared"

interface BlogDetail {
  slug: string
  main_title: string
  main_image: string | null
  sub_title: string | null
  s1_contents: string | null
  s2_contents: string | null
  s3_contents: string | null
  s4_contents: string | null
  s5_contents: string | null
  s6_contents: string | null
  s7_contents: string | null
  s8_contents: string | null
  s9_contents: string | null
  s10_contents: string | null
  s11_contents: string | null
  s12_contents: string | null
  created_at: string
}

interface BlogDetailResponse {
  success: boolean
  data?: BlogDetail
  error?: string
}

interface BlogDetailSectionProps {
  slug: string
}

export function BlogDetailSection({ slug }: BlogDetailSectionProps) {
  const [blog, setBlog] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlogDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/blogs/${slug}`)
        const data: BlogDetailResponse = await response.json()

        if (data.success && data.data) {
          setBlog(data.data)
        } else {
          setError(data.error || "블로그를 불러오는데 실패했습니다.")
        }
      } catch (err) {
        setError("네트워크 오류가 발생했습니다.")
        console.error("Blog detail fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogDetail()
  }, [slug])


  if (loading) {
    return (
      <section className="bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse">
            {/* 뒤로가기 버튼 */}
            <div className="px-4 pt-8 pb-4">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
            
            <div className="px-4">
              {/* 이미지 */}
              <div className="mb-8 -mx-4 sm:mx-0">
                <div className="aspect-[21/9] sm:aspect-[16/9] bg-gray-200 sm:rounded-xl"></div>
              </div>
              
              {/* 헤더 */}
              <div className="mb-8 pt-2">
                <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              
              {/* 본문 */}
              <div className="space-y-4 pb-16">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`content-skeleton-${i}`}>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="px-4 text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-red-800 mb-2">오류가 발생했습니다</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/blog">
                <Button variant="outline">블로그 목록으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!blog) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="px-4 text-center">
            <div className="bg-gray-100 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">블로그를 찾을 수 없습니다</h2>
              <p className="text-gray-500 mb-4">요청하신 아티클이 존재하지 않습니다.</p>
              <Link href="/blog">
                <Button variant="outline">블로그 목록으로 돌아가기</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <div className="px-4 pt-8 pb-4">
          <Link href="/blog">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              블로그 목록으로 돌아가기
            </Button>
          </Link>
        </div>

        {/* 공통 컴포넌트 사용 */}
        <div className="px-4">
          <BlogContentRenderer 
            blog={blog}
            showHeader={true}
            showImage={true}
            showDate={true}
            className="mb-8"
            imageClassName="mb-8"
            contentClassName="prose prose-lg max-w-none"
          />
        </div>

        {/* 하단 네비게이션 */}
        <div className="px-4 pb-16 mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-center">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="px-8">
                블로그 목록으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

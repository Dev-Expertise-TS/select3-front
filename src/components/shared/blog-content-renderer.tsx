"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSafeImageUrl, handleImageError } from "@/lib/image-utils"

interface BlogContent {
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

interface BlogContentRendererProps {
  blog: BlogContent
  showHeader?: boolean
  showImage?: boolean
  showDate?: boolean
  className?: string
  imageClassName?: string
  contentClassName?: string
}

export function BlogContentRenderer({ 
  blog, 
  showHeader = true, 
  showImage = true, 
  showDate = true,
  className = "",
  imageClassName = "",
  contentClassName = ""
}: BlogContentRendererProps) {
  const [imageError, setImageError] = useState(false)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const getContentSections = () => {
    if (!blog) return []
    
    const sections = [
      blog.s1_contents,
      blog.s2_contents,
      blog.s3_contents,
      blog.s4_contents,
      blog.s5_contents,
      blog.s6_contents,
      blog.s7_contents,
      blog.s8_contents,
      blog.s9_contents,
      blog.s10_contents,
      blog.s11_contents,
      blog.s12_contents
    ].filter(content => content && content.trim() !== "")
    
    return sections
  }

  const contentSections = getContentSections()

  return (
    <div className={cn("space-y-6", className)}>
      {/* 헤더 */}
      {showHeader && (
        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {blog.main_title}
          </h1>
          {blog.sub_title && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {blog.sub_title}
            </p>
          )}
          {showDate && (
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(blog.created_at)}</span>
            </div>
          )}
        </header>
      )}

      {/* 메인 이미지 */}
      {showImage && blog.main_image && !imageError && (
        <div className={cn("", imageClassName)}>
          <div className="aspect-[16/9] relative overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={getSafeImageUrl(blog.main_image)}
              alt={blog.main_title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              priority
              onError={(e) => {
                console.error('이미지 로드 실패:', e.currentTarget.src)
                setImageError(true)
              }}
            />
          </div>
        </div>
      )}

      {/* 이미지 오류 시 플레이스홀더 */}
      {showImage && blog.main_image && imageError && (
        <div className={cn("", imageClassName)}>
          <div className="aspect-[16/9] relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">이미지를 불러올 수 없습니다</p>
            </div>
          </div>
        </div>
      )}

      {/* 본문 내용 */}
      <article className={cn("prose prose-lg max-w-none", contentClassName)}>
        {contentSections.map((content, index) => (
          <div key={`content-${index}`} className="mb-6">
            <div 
              className="text-gray-800 leading-relaxed whitespace-pre-wrap prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        ))}
      </article>
    </div>
  )
}

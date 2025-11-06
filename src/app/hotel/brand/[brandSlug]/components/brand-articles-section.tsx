'use client'

import Link from 'next/link'
import { BlogCard } from '@/components/shared/blog-card'
import { ArrowRight } from 'lucide-react'

interface BrandArticlesSectionProps {
  articles: any[]
  brandName: string
}

export function BrandArticlesSection({ articles, brandName }: BrandArticlesSectionProps) {
  if (articles.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 py-16 md:py-20 border-t border-gray-100">
      <div className="container mx-auto max-w-[1200px] px-6">
        {/* 섹션 헤더 - The Edit 스타일 */}
        <div className="mb-12 pb-8 border-b border-gray-200">
          <h2 className="text-3xl md:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
            관련 아티클
          </h2>
          <p className="text-base text-gray-500">
            {articles.length}개 아티클
          </p>
        </div>
        
        {/* 아티클 그리드 - The Edit 카드 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 mb-12">
          {articles.map((article) => (
            <BlogCard
              key={article.slug}
              id={article.slug}
              slug={article.slug}
              mainImage={article.main_image}
              mainTitle={article.main_title}
              subTitle={article.sub_title}
              createdAt={article.created_at}
              updatedAt={article.updated_at}
              className="h-full"
            />
          ))}
        </div>
        
        {articles.length >= 6 && (
          <div className="flex justify-center pt-8 border-t border-gray-200">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors"
            >
              <span>더 많은 아티클 보기</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}


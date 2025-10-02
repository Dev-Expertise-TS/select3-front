'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BlogCard } from '@/components/shared/blog-card'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, FileText } from 'lucide-react'

interface BrandArticle {
  slug: string
  main_title: string
  main_image: string | null
  sub_title: string | null
  created_at: string
  updated_at: string | null
}

interface BrandArticlesSectionProps {
  chainId: string
  chainName: string
  className?: string
}

export function BrandArticlesSection({ 
  chainId, 
  chainName, 
  className = "" 
}: BrandArticlesSectionProps) {
  const [articles, setArticles] = useState<BrandArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrandArticles = async () => {
      if (!chainId) return

      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`[ BrandArticles ] ${chainName} (${chainId}) 아티클 조회 시작`)
        
        const response = await fetch(`/api/brands/${chainId}/articles`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setArticles(data.data)
          console.log(`[ BrandArticles ] ${chainName} 아티클 ${data.data.length}개 로드 완료:`, data.meta)
        } else {
          setError(data.error || "아티클을 불러오는데 실패했습니다.")
          console.warn(`[ BrandArticles ] ${chainName} 아티클 로드 실패:`, data.error)
        }
      } catch (error) {
        setError("네트워크 오류가 발생했습니다.")
        console.error(`[ BrandArticles ] ${chainName} 아티클 조회 중 오류:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBrandArticles()
  }, [chainId, chainName])

  // 로딩 상태
  if (isLoading) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-[16/9] w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              아티클을 불러올 수 없습니다
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      </section>
    )
  }

  // 아티클이 없는 경우 - 아무것도 렌더링하지 않음
  if (articles.length === 0) {
    return null
  }

  // 아티클 목록 표시
  return (
    <section className={`py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {chainName} 관련 아티클
          </h2>
          <p className="text-base text-gray-600">
            {chainName} 브랜드의 특별한 경험과 이야기를 만나보세요
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        
        {articles.length >= 12 && (
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              더 많은 아티클을 보려면 블로그 페이지를 확인해보세요
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

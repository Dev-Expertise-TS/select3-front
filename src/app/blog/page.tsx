import { Metadata } from 'next'
import { Suspense } from 'react'
import { Header } from "@/components/header"
import { PromotionBannerWrapper } from "@/components/promotion-banner-wrapper"
import { Footer } from "@/components/footer"
import { BlogListSection } from '@/features/blog/blog-list-section'
import { getBlogPageData } from './blog-page-server'

// 블로그 페이지 캐시: 10분마다 재검증
export const revalidate = 600

export const metadata: Metadata = {
  title: '아티클 | 투어비스 셀렉트',
  description: '럭셔리 호텔과 여행지에 대한 심도 있는 아티클을 만나보세요. 전문가의 호텔 리뷰, 여행 가이드, 호텔 브랜드 소개 등 프리미엄 여행 정보를 제공합니다.',
  keywords: [
    '호텔 매거진',
    '럭셔리 호텔 리뷰',
    '여행 가이드',
    '호텔 아티클',
    '프리미엄 호텔',
    '호텔 브랜드',
    '투어비스 셀렉트 블로그',
    '여행 정보'
  ],
  openGraph: {
    title: '아티클 | 투어비스 셀렉트',
    description: '럭셔리 호텔과 여행지에 대한 심도 있는 아티클을 만나보세요.',
    url: 'https://luxury-select.co.kr/blog',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://luxury-select.co.kr/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 아티클'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '아티클 | 투어비스 셀렉트',
    description: '럭셔리 호텔과 여행지에 대한 심도 있는 아티클을 만나보세요.',
    images: ['https://luxury-select.co.kr/select_logo.avif']
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/blog'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default async function BlogPage() {
  // 서버에서 초기 데이터 조회
  const { blogs } = await getBlogPageData()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // Blog CollectionPage Structured Data
  const blogPageData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '아티클',
    description: '럭셔리 호텔과 여행지에 대한 심도 있는 아티클을 만나보세요.',
    url: `${baseUrl}/blog`,
    mainEntity: {
      '@type': 'Blog',
      name: '투어비스 셀렉트 아티클',
      description: '럭셔리 호텔과 여행 정보를 제공하는 전문 매거진'
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '아티클',
          item: `${baseUrl}/blog`
        }
      ]
    },
    publisher: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      url: baseUrl,
      logo: `${baseUrl}/select_logo.avif`
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPageData) }}
      />
      
      <Header />
      <PromotionBannerWrapper>
        <main>
          <Suspense fallback={
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto max-w-7xl px-4">
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-16"></div>
                  </div>
                </div>
              </div>
            </section>
          }>
            <BlogListSection initialBlogs={blogs} />
          </Suspense>
        </main>
      </PromotionBannerWrapper>
      <Footer />
    </div>
  )
}

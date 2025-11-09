import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PromotionBannerWrapper } from '@/components/promotion-banner-wrapper'
import { createClient } from '@/lib/supabase/server'
import { Sparkles } from 'lucide-react'
import { RecommendationsClient } from './recommendations-client'

export const metadata: Metadata = {
  title: '호텔 추천 | 투어비스 셀렉트',
  description: '테마별, 여행 스타일별로 엄선한 프리미엄 호텔 추천. 투어비스 셀렉트가 제안하는 특별한 호텔 컬렉션을 만나보세요.',
  openGraph: {
    title: '호텔 추천 | 투어비스 셀렉트',
    description: '테마별, 여행 스타일별로 엄선한 프리미엄 호텔 추천. 투어비스 셀렉트가 제안하는 특별한 호텔 컬렉션을 만나보세요.',
  },
}

export const revalidate = 3600 // 1시간마다 재검증

async function getRecommendationPages() {
  const supabase = await createClient()
  
  const { data: recommendationPages, error } = await supabase
    .from('select_recommendation_pages')
    .select('id, slug, title_ko, intro_rich_ko, hero_image_url, hashtags')
    .eq('publish', true)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) {
    console.error('추천 페이지 목록 조회 실패:', error)
    return []
  }
  
  return recommendationPages || []
}

export default async function HotelRecommendationsPage() {
  const recommendationPages = await getRecommendationPages()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <PromotionBannerWrapper>
        <main>
        {/* Hero Section - Simple & Clean v0 Style */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          
          {/* Simple Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
          
          {/* Content */}
          <div className="relative container mx-auto max-w-[1440px] px-4 py-12 sm:py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              {/* Simple Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>전문가 선정 컬렉션</span>
              </div>
              
              {/* Clean Typography */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                호텔 추천
              </h1>
              
              {/* Simple Description */}
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
                테마별, 여행 스타일별로 엄선한 프리미엄 호텔을 만나보세요
              </p>
              
              {/* Minimal Stats */}
              <div className="flex justify-center gap-6 pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>인기 추천</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span>전문가 선정</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full" />
                  <span>특별 혜택</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Clean Bottom Border */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        </div>
        
        {/* Client Component with Filtering */}
        <RecommendationsClient initialPages={recommendationPages} />
        </main>
      </PromotionBannerWrapper>
      
      <Footer />
    </div>
  )
}


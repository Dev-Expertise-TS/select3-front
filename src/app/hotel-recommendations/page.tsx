import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: '호텔 추천 | 투어비스 셀렉트',
  description: '테마별, 여행 스타일별로 엄선한 프리미엄 호텔 추천. 투어비스 셀렉트가 제안하는 특별한 호텔 컬렉션을 만나보세요.',
  openGraph: {
    title: '호텔 추천 | 투어비스 셀렉트',
    description: '테마별, 여행 스타일별로 엄선한 프리미엄 호텔 추천. 투어비스 셀렉트가 제안하는 특별한 호텔 컬렉션을 만나보세요.',
  },
}

export const revalidate = 3600 // 1시간마다 재검증

async function getTopicPages() {
  const supabase = await createClient()
  
  const { data: topicPages, error } = await supabase
    .from('select_topic_pages')
    .select('id, slug, title_ko, intro_rich_ko, hero_image_url, hashtags')
    .eq('publish', true)
    .order('created_at', { ascending: false })
    .limit(50)
  
  if (error) {
    console.error('토픽 페이지 목록 조회 실패:', error)
    return []
  }
  
  return topicPages || []
}

export default async function HotelRecommendationsPage() {
  const topicPages = await getTopicPages()
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16 sm:py-24">
          <div className="container mx-auto max-w-[1440px] px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              호텔 추천
            </h1>
            <p className="text-lg sm:text-xl text-blue-50 max-w-2xl mx-auto">
              테마별, 여행 스타일별로 엄선한 프리미엄 호텔을 만나보세요
            </p>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto max-w-[1440px] px-4 py-3">
            <nav className="flex items-center text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">호텔 추천</span>
            </nav>
          </div>
        </div>
        
        {/* Topic Pages Grid */}
        <div className="py-12 sm:py-16">
          <div className="container mx-auto max-w-[1440px] px-4">
            {topicPages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <p className="text-gray-600">준비 중인 콘텐츠입니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topicPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/hotel-recommendations/${page.slug}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Image */}
                    {page.hero_image_url ? (
                      <div 
                        className="h-48 bg-cover bg-center"
                        style={{ backgroundImage: `url(${page.hero_image_url})` }}
                      >
                        <div className="h-full bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                          <h2 className="text-xl font-bold text-white">
                            {page.title_ko}
                          </h2>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <h2 className="text-xl font-bold text-white px-6 text-center">
                          {page.title_ko}
                        </h2>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6">
                      {page.intro_rich_ko && (
                        <div 
                          className="text-sm text-gray-600 line-clamp-3 mb-4"
                          dangerouslySetInnerHTML={{ 
                            __html: page.intro_rich_ko.replace(/<[^>]*>/g, ' ').slice(0, 150) + '...'
                          }}
                        />
                      )}
                      
                      {/* Hashtags */}
                      {page.hashtags && page.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {page.hashtags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* View More */}
                      <div className="pt-4 border-t border-gray-100">
                        <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700 inline-flex items-center gap-1">
                          자세히 보기
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}


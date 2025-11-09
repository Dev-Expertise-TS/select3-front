'use client'

import Link from 'next/link'
import { RecommendationPage } from '@/app/hotel-recommendations/[slug]/recommendation-page-server'
import { HeroMosaic, HotelCard, FilterTags } from './components'

interface RecommendationPageContentProps {
  recommendationPage: RecommendationPage
  hotels: any[]
  slug: string
}

export function RecommendationPageContent({ recommendationPage, hotels, slug }: RecommendationPageContentProps) {
  const hotelImageUrls = hotels
    .map(item => item.card_image_url || item.hotelMedia?.public_url || item.hotelMedia?.storage_path || item.hotel?.image_1)
    .filter(Boolean)
    .slice(0, 9)
  
  return (
    <div className="min-h-screen">
      {/* Hero Mosaic */}
      <HeroMosaic
        title={recommendationPage.title_ko}
        hashtags={recommendationPage.hashtags}
        hotelCount={hotels.length}
        hotelImages={hotelImageUrls}
      />
      
      {/* Intro Section - Enhanced */}
      {recommendationPage.intro_rich_ko && (
        <div className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16 border-b border-gray-100">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumbs - Moved Here */}
              <nav className="flex items-center text-sm text-gray-500 mb-8">
                <Link href="/" className="hover:text-blue-600 transition-colors font-medium">
                  Home
                </Link>
                <span className="mx-2">→</span>
                <Link href="/hotel-recommendations" className="hover:text-blue-600 transition-colors font-medium">
                  호텔 추천
                </Link>
                <span className="mx-2">→</span>
                <span className="text-gray-900 font-bold">{recommendationPage.title_ko}</span>
              </nav>
              
              {/* Rich Content */}
              <div 
                className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-p:text-gray-700"
                dangerouslySetInnerHTML={{ __html: recommendationPage.intro_rich_ko }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Hotels Grid */}
      <div className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4">
              추천 호텔 {hotels.length > 0 && (
                <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-2xl ml-3">
                  {hotels.length}
                </span>
              )}
            </h2>
            <p className="text-lg text-gray-600">전문가가 선택한 특별한 호텔들을 만나보세요</p>
          </div>
          
          {hotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🏨</div>
              <p className="text-gray-600">등록된 호텔이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((item, index) => (
                <HotelCard key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Filter Tags */}
      <FilterTags
        countries={recommendationPage.where_countries}
        cities={recommendationPage.where_cities}
        companions={recommendationPage.companions}
        styles={recommendationPage.styles}
      />
    </div>
  )
}


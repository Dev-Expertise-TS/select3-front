'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TopicPage } from '@/app/hotel-recommendations/[slug]/topic-page-server'

interface TopicPageContentProps {
  topicPage: TopicPage
  hotels: any[]
  slug: string
}

export function TopicPageContent({ topicPage, hotels, slug }: TopicPageContentProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {topicPage.hero_image_url && (
        <div className="relative h-[400px] sm:h-[500px] w-full">
          <Image
            src={topicPage.hero_image_url}
            alt={topicPage.title_ko}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto max-w-[1440px] px-4 text-center text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {topicPage.title_ko}
              </h1>
              {topicPage.hashtags && topicPage.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {topicPage.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto max-w-[1440px] px-4 py-3">
          <nav className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/hotel-recommendations" className="hover:text-blue-600 transition-colors">
              호텔 추천
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{topicPage.title_ko}</span>
          </nav>
        </div>
      </div>
      
      {/* Intro Section */}
      {topicPage.intro_rich_ko && (
        <div className="bg-white py-8 sm:py-12">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: topicPage.intro_rich_ko }}
            />
          </div>
        </div>
      )}
      
      {/* Hotels Grid */}
      <div className="bg-gray-50 py-8 sm:py-12">
        <div className="container mx-auto max-w-[1440px] px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            추천 호텔 {hotels.length > 0 && `(${hotels.length})`}
          </h2>
          
          {hotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">🏨</div>
              <p className="text-gray-600">등록된 호텔이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((item) => {
                const hotel = item.hotel
                const imageUrl = item.card_image_url || 
                               item.hotelMedia?.public_url || 
                               item.hotelMedia?.storage_path ||
                               hotel.image_1
                
                return (
                  <Link
                    key={item.id}
                    href={`/hotel/${hotel.slug}`}
                    className="group bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.card_title_ko || hotel.property_name_ko || hotel.property_name_en}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={85}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-4xl">🏨</span>
                        </div>
                      )}
                      
                      {/* Badge */}
                      {item.badge_text_ko && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
                            {item.badge_text_ko}
                          </span>
                        </div>
                      )}
                      
                      {/* Pin to Top Badge */}
                      {item.pin_to_top && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                            ⭐ 추천
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {item.card_title_ko || hotel.property_name_ko || hotel.property_name_en}
                      </h3>
                      
                      {/* Location */}
                      <p className="text-sm text-gray-500 mb-3">
                        {hotel.city_ko || hotel.city}, {hotel.country_ko}
                      </p>
                      
                      {/* Description */}
                      {item.card_blurb_ko && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {item.card_blurb_ko}
                        </p>
                      )}
                      
                      {/* Matching Notes */}
                      <div className="space-y-2">
                        {item.match_where_note_ko && (
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-blue-500">📍</span>
                            <span>{item.match_where_note_ko}</span>
                          </div>
                        )}
                        {item.match_companion_note_ko && (
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-pink-500">👥</span>
                            <span>{item.match_companion_note_ko}</span>
                          </div>
                        )}
                        {item.match_style_note_ko && (
                          <div className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-purple-500">✨</span>
                            <span>{item.match_style_note_ko}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* View More */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700 inline-flex items-center gap-1">
                          자세히 보기
                          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Filter Tags Section */}
      {(topicPage.where_countries?.length || topicPage.where_cities?.length || 
        topicPage.companions?.length || topicPage.styles?.length) && (
        <div className="bg-white py-8 border-t border-gray-200">
          <div className="container mx-auto max-w-[1440px] px-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">이런 분들께 추천합니다</h3>
            
            <div className="space-y-3">
              {topicPage.where_countries && topicPage.where_countries.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">지역:</span>
                  {topicPage.where_countries.map((country, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {country}
                    </span>
                  ))}
                </div>
              )}
              
              {topicPage.companions && topicPage.companions.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">동반:</span>
                  {topicPage.companions.map((companion, index) => (
                    <span key={index} className="px-3 py-1 bg-pink-50 text-pink-700 text-sm rounded-full">
                      {companion}
                    </span>
                  ))}
                </div>
              )}
              
              {topicPage.styles && topicPage.styles.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">스타일:</span>
                  {topicPage.styles.map((style, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full">
                      {style}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Building2, MapPin, Star } from 'lucide-react'
import { BlogCard } from '@/components/shared/blog-card'
import { HotelCard } from '@/components/shared/hotel-card'
import { PromotionBannerWrapper } from '@/components/promotion-banner-wrapper'

interface BrandDetailClientProps {
  brand: {
    brand_id: number
    brand_name_en: string
    brand_name_ko?: string | null
    brand_slug: string
    chain_id?: number | null
    brand_description?: string | null
    brand_description_ko?: string | null
  }
  hotels: any[]
  articles: any[]
}

export function BrandDetailClient({ brand, hotels, articles }: BrandDetailClientProps) {
  const brandName = brand.brand_name_ko || brand.brand_name_en
  const brandDescription = brand.brand_description_ko || brand.brand_description || 
    `${brandName}는 전 세계에서 가장 럭셔리한 호텔 브랜드 중 하나로, 최고급 서비스와 독특한 경험을 제공합니다.`

  return (
    <PromotionBannerWrapper>
      {/* Hero Section - 브랜드 소개 */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* 브랜드 로고 영역 (선택사항) */}
            <div className="mb-6">
              <Building2 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            </div>
            
            {/* 브랜드명 */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {brand.brand_name_ko && (
                <span className="block mb-2">{brand.brand_name_ko}</span>
              )}
              <span className="text-gray-700">{brand.brand_name_en}</span>
            </h1>
            
            {/* 브랜드 설명 */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              {brandDescription}
            </p>
            
            {/* 통계 */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{hotels.length}</div>
                <div className="text-sm text-gray-600 mt-1">호텔</div>
              </div>
              {articles.length > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{articles.length}</div>
                  <div className="text-sm text-gray-600 mt-1">아티클</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hotels Section - 브랜드 호텔 목록 */}
      {hotels.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {brandName} 호텔
              </h2>
              <p className="text-gray-600">
                전 세계 {hotels.length}개 도시에서 {brandName}의 특별한 경험을 만나보세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.sabre_id}
                  sabreId={hotel.sabre_id}
                  slug={hotel.slug}
                  propertyNameKo={hotel.property_name_ko}
                  propertyNameEn={hotel.property_name_en}
                  city={hotel.city}
                  cityKo={hotel.city_ko}
                  country={hotel.country_ko}
                  image={hotel.image}
                  brandNameEn={hotel.brand_name_en}
                  chainNameEn={hotel.chain_name_en}
                  rating={hotel.rating}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles Section - 브랜드 관련 아티클 */}
      {articles.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {brandName} 아티클
              </h2>
              <p className="text-gray-600">
                {brandName}의 특별한 경험과 이야기를 확인해보세요
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
            
            {articles.length >= 6 && (
              <div className="text-center mt-8">
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  더 많은 아티클 보기
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {hotels.length === 0 && articles.length === 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {brandName} 호텔 정보 준비 중
              </h3>
              <p className="text-gray-500">
                곧 더 많은 호텔과 아티클을 만나보실 수 있습니다.
              </p>
            </div>
          </div>
        </section>
      )}
    </PromotionBannerWrapper>
  )
}


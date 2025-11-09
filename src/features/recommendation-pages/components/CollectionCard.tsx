'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

interface CollectionCardProps {
  page: {
    id: string
    slug: string
    title_ko: string
    intro_rich_ko: string | null
    hero_image_url: string | null
    hashtags: string[] | null
  }
  index: number
}

export function CollectionCard({ page, index }: CollectionCardProps) {
  return (
    <Link
      href={`/hotel-recommendations/${page.slug}`}
      className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-blue-300 hover:-translate-y-2 hover:scale-[1.02]"
      style={{
        animationDelay: `${index * 75}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        {page.hero_image_url && page.hero_image_url.startsWith('http') && !page.hero_image_url.includes('/media/hotels/') ? (
          <>
            <Image 
              src={page.hero_image_url}
              alt={page.title_ko}
              fill
              className="object-cover group-hover:scale-125 group-hover:rotate-2 transition-all duration-1000"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90" />
            <div className="absolute top-4 right-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/40 text-white text-xs font-semibold shadow-lg">
              ✨ Featured
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h2 className="text-3xl font-black text-white drop-shadow-2xl group-hover:text-yellow-300 transition-colors">
                {page.title_ko}
              </h2>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
            <h2 className="relative text-3xl font-black text-white px-6 text-center drop-shadow-2xl">
              {page.title_ko}
            </h2>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/20 group-hover:via-purple-600/20 group-hover:to-pink-600/20 transition-all duration-500" />
      </div>
      
      {/* Content */}
      <div className="p-7 space-y-5 bg-gradient-to-b from-white to-gray-50">
        {page.intro_rich_ko && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed font-medium">
            {page.intro_rich_ko.replace(/<[^>]*>/g, ' ').trim().slice(0, 140)}
            {page.intro_rich_ko.length > 140 && '...'}
          </p>
        )}
        
        {page.hashtags && page.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {page.hashtags.slice(0, 3).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                #{tag}
              </span>
            ))}
            {page.hashtags.length > 3 && (
              <span className="inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-xs font-bold rounded-full shadow-md">
                +{page.hashtags.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* CTA */}
        <div className="pt-5 border-t-2 border-gray-100 group-hover:border-blue-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
            <span className="text-sm font-bold text-blue-700 group-hover:text-blue-800">컬렉션 둘러보기</span>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white group-hover:bg-blue-700 group-hover:scale-110 transition-all duration-300 shadow-lg">
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -left-full group-hover:left-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-1000 pointer-events-none skew-x-12" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </Link>
  )
}


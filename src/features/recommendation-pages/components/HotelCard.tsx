'use client'

import Image from 'next/image'
import Link from 'next/link'

interface HotelCardProps {
  item: any
  index: number
}

export function HotelCard({ item, index }: HotelCardProps) {
  const hotel = item.hotel
  const imageUrl = item.card_image_url || 
                   item.hotelMedia?.public_url || 
                   item.hotelMedia?.storage_path ||
                   hotel.image_1

  return (
    <Link
      href={`/hotel/${hotel.slug}`}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-blue-300 hover:-translate-y-2"
      style={{
        animationDelay: `${index * 50}ms`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        opacity: 0,
      }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.card_title_ko || hotel.property_name_ko || hotel.property_name_en}
            fill
            className="object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={85}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white text-5xl">🏨</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-2">
          {item.badge_text_ko && (
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full shadow-xl backdrop-blur-sm">
              {item.badge_text_ko}
            </span>
          )}
          {item.pin_to_top && (
            <span className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-xs font-black rounded-full shadow-xl">
              ⭐ 추천
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-7 space-y-4 bg-gradient-to-b from-white to-gray-50">
        <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
          {item.card_title_ko || hotel.property_name_ko || hotel.property_name_en}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="text-blue-500">📍</span>
          <span className="font-medium">{hotel.city_ko || hotel.city}, {hotel.country_ko}</span>
        </div>
        
        {item.card_blurb_ko && (
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {item.card_blurb_ko}
          </p>
        )}
        
        {/* Notes */}
        {(item.match_where_note_ko || item.match_companion_note_ko || item.match_style_note_ko) && (
          <div className="space-y-2 pt-3 border-t border-gray-100">
            {item.match_where_note_ko && (
              <div className="flex items-start gap-2 text-xs bg-blue-50 rounded-lg p-2.5">
                <span className="text-blue-600 text-sm">📍</span>
                <span className="text-gray-700 font-medium">{item.match_where_note_ko}</span>
              </div>
            )}
            {item.match_companion_note_ko && (
              <div className="flex items-start gap-2 text-xs bg-pink-50 rounded-lg p-2.5">
                <span className="text-pink-600 text-sm">👥</span>
                <span className="text-gray-700 font-medium">{item.match_companion_note_ko}</span>
              </div>
            )}
            {item.match_style_note_ko && (
              <div className="flex items-start gap-2 text-xs bg-purple-50 rounded-lg p-2.5">
                <span className="text-purple-600 text-sm">✨</span>
                <span className="text-gray-700 font-medium">{item.match_style_note_ko}</span>
              </div>
            )}
          </div>
        )}
        
        {/* CTA */}
        <div className="mt-5 pt-5 border-t-2 border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300">
            <span className="text-sm font-bold text-blue-700">호텔 상세보기</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 group-hover:scale-110 transition-all duration-300">
              <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -left-full group-hover:left-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000 pointer-events-none" />
    </Link>
  )
}


'use client'

import { HotelCard } from '@/components/shared/hotel-card'

interface BrandHotelsSectionProps {
  hotels: any[]
  brandName: string
}

export function BrandHotelsSection({ hotels, brandName }: BrandHotelsSectionProps) {
  if (!hotels || hotels.length === 0) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-[1200px] px-6">
          <div className="text-center py-20">
            <p className="text-gray-400 text-base">
              {brandName} 호텔 정보를 준비 중입니다
            </p>
          </div>
        </div>
      </section>
    )
  }

  const validHotels = hotels.filter(hotel => hotel && hotel.sabre_id)

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container mx-auto max-w-[1200px] px-6">
        {/* 섹션 헤더 - The Edit 스타일 */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <h2 className="text-3xl md:text-4xl font-normal text-gray-900 mb-3 tracking-tight">
            전체 호텔
          </h2>
          <p className="text-base text-gray-500">
            {validHotels.length}개 호텔
          </p>
        </div>
        
        {/* 호텔 그리드 - The Edit 카드 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {validHotels.map((hotel) => (
            <HotelCard
              key={hotel.sabre_id}
              hotel={{
                sabre_id: hotel.sabre_id,
                property_name_ko: hotel.property_name_ko,
                property_name_en: hotel.property_name_en,
                city: hotel.city,
                property_address: hotel.property_address || '',
                image: hotel.image || '',
                benefits: hotel.benefits || [],
                slug: hotel.slug,
                rating: hotel.rating
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}


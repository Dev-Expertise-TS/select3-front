"use client"

import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { CommonSearchBar } from "./common-search-bar"
import { HotelCardGrid } from "./shared/hotel-card-grid"
import { transformSearchResultsToCardData } from '@/lib/hotel-utils'

const supabase = createClient()

// 호텔 검색 훅
function useHotelSearch(query: string) {
  return useQuery({
    queryKey: ['hotel-search', query],
    queryFn: async () => {
      if (!query.trim()) return []
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('sabre_id, property_name_kor, property_name_eng, city, city_kor, city_eng, property_address, benefit, benefit_1, benefit_2, benefit_3, benefit_4, benefit_5, benefit_6')
        .or(`property_name_kor.ilike.%${query}%,property_name_eng.ilike.%${query}%,city.ilike.%${query}%,city_kor.ilike.%${query}%,city_eng.ilike.%${query}%`)
        .limit(8)
      
      if (error) throw error
      if (!data) return []
      
      // 호텔 미디어 조회
      const sabreIds = data.map(hotel => hotel.sabre_id)
      const { data: mediaData } = await supabase
        .from('select_hotel_media')
        .select('sabre_id, media_path, sort_order')
        .in('sabre_id', sabreIds)
        .order('sort_order', { ascending: true })
      
      // 데이터 변환
      return transformSearchResultsToCardData(data, mediaData || [])
    },
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2분
  })
}

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const { data: searchResults, isLoading, error } = useHotelSearch(searchQuery)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <section className="bg-gray-50 py-6">
      <div className="container mx-auto max-w-[1200px] px-4">
        <CommonSearchBar variant="landing" onSearch={handleSearch} />
        
        {/* 검색 결과 표시 */}
        {searchQuery.trim() && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              "{searchQuery}" 검색 결과
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">검색 중...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                검색 중 오류가 발생했습니다.
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <HotelCardGrid
                hotels={searchResults}
                variant="default"
                columns={4}
                gap="md"
                showBenefits={true}
                showRating={false}
                showPrice={false}
                showBadge={false}
                showPromotionBadge={false}
                emptyMessage={`"${searchQuery}"에 대한 검색 결과가 없습니다.`}
              />
            ) : searchQuery.trim() && (
              <div className="text-center py-8 text-gray-600">
                "{searchQuery}"에 대한 검색 결과가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

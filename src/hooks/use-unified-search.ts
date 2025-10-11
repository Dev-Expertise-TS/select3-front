"use client"

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

type UnifiedHotel = {
  type: 'hotel'
  id: string
  sabre_id: number
  slug?: string | null
  property_name_ko: string | null
  property_name_en: string | null
  city?: string | null
  city_ko?: string | null
  city_en?: string | null
  country_ko?: string | null
  country_en?: string | null
  image_url?: string | null
  snippet?: string | null
  promotions?: string[]
}

type UnifiedBlog = {
  type: 'blog'
  id: string | number
  slug: string
  main_title: string | null
  sub_title: string | null
  created_at?: string | null
  image_url?: string | null
}

export type UnifiedSearchItem = UnifiedHotel | UnifiedBlog

const supabase = createClient()

type RegionRow = {
  city_code: string
  city_ko: string | null
  city_en: string | null
  city_slug?: string | null
  country_code?: string | null
  country_ko?: string | null
  country_en?: string | null
  status?: string | null
  region_type?: string | null
}

export type UnifiedRegion = {
  type: 'region'
  id: string
  city_code: string
  city_ko: string | null
  city_en: string | null
  city_slug?: string | null
  country_code?: string | null
  country_ko?: string | null
  country_en?: string | null
  image_url?: string | null
}

export type UnifiedSearchItemWithRegion = UnifiedRegion | UnifiedHotel | UnifiedBlog

type HotelRow = {
  sabre_id: number | string
  slug?: string | null
  property_name_ko: string | null
  property_name_en: string | null
  city?: string | null
  city_ko?: string | null
  city_en?: string | null
  country_ko?: string | null
  country_en?: string | null
  publish?: boolean | null
  property_details?: string | null
}

type BlogRow = {
  id: number
  slug: string
  main_title: string | null
  sub_title: string | null
  created_at?: string | null
}

/**
 * 통합 검색 훅: select_hotels + select_hotel_blogs
 * - 입력 q가 비어 있으면 빈 배열 반환
 * - 호텔은 publish가 null이거나 true인 것만 포함
 */
export function useUnifiedSearch(q: string, opts?: { includePromotions?: boolean }) {
  const includePromotions = Boolean(opts?.includePromotions)
  return useQuery({
    queryKey: ['unified-search', 'v2', q, includePromotions],
    queryFn: async (): Promise<UnifiedSearchItemWithRegion[]> => {
      const query = q.trim()
      if (!query) return []

      // 지역 검색 (도시 위주)
      console.log('🌍 Starting region search for query:', query)
      let regions: RegionRow[] = []
      
      try {
        const { data: regionData, error: regionError } = await supabase
          .from('select_regions')
          .select('city_code, city_ko, city_en, city_slug, country_code, country_ko, country_en, status, region_type')
          .eq('status', 'active')
          .eq('region_type', 'city')
          .or(`city_ko.ilike.%${query}%,city_en.ilike.%${query}%,country_ko.ilike.%${query}%,country_en.ilike.%${query}%`)
          .order('city_code', { ascending: true })
          .limit(20)

        if (regionError) {
          console.error('❌ Region search error:', regionError)
          regions = []
        } else {
          regions = regionData || []
          console.log('✅ Region search successful, found:', regions.length, 'results')
        }
      } catch (err) {
        console.error('❌ Region search critical error:', err)
        regions = []
      }

      // 지역 이미지 조회: select_city_media 테이블에서 이미지 정보 가져오기
      const cityCodes = regions.map(r => r.city_code)
      let cityMediaMap = new Map<string, string>()
      
      if (cityCodes.length > 0) {
        try {
          console.log('🖼️ Fetching city media for codes:', cityCodes)
          const { data: cityMediaData } = await supabase
            .from('select_city_media')
            .select('city_code, public_url, storage_path, image_seq')
            .in('city_code', cityCodes)
            .order('image_seq', { ascending: true })
          
          if (cityMediaData && cityMediaData.length > 0) {
            for (const m of cityMediaData as any[]) {
              const key = String(m.city_code)
              if (!cityMediaMap.has(key)) {
                cityMediaMap.set(key, m.public_url || m.storage_path || '/placeholder.svg')
              }
            }
            console.log('✅ City media fetched successfully:', cityMediaMap.size, 'images')
          }
        } catch (err) {
          console.error('❌ City media fetch error:', err)
          // 에러 발생해도 계속 진행
        }
      }

      const regionItems: UnifiedRegion[] = regions.map((r) => {
        return {
          type: 'region',
          id: r.city_code,
          city_code: r.city_code,
          city_ko: r.city_ko ?? null,
          city_en: r.city_en ?? null,
          city_slug: r.city_slug ?? null,
          country_code: r.country_code ?? null,
          country_ko: r.country_ko ?? null,
          country_en: r.country_en ?? null,
          image_url: cityMediaMap.get(r.city_code) || '/placeholder.svg'
        }
      })

      // 호텔 검색 - 에러 발생 시 빈 배열 반환하여 다른 검색 결과는 보여주기
      let hotels: HotelRow[] = []
      
      try {
        console.log('🏨 Starting hotel search for query:', query)
        
        // 최소한의 필수 컬럼만 선택
        const selectFields = 'sabre_id, slug, property_name_ko, property_name_en, city, city_ko, city_en, country_ko, country_en, publish, property_details'
        
        // 개별 쿼리 실행 (에러 발생 시에도 다른 쿼리는 계속 진행)
        const queryPromises = [
          // 쿼리 1: 호텔명 한글
          supabase
            .from('select_hotels')
            .select(selectFields)
            .ilike('property_name_ko', `%${query}%`)
            .limit(15)
            .then(result => {
              if (result.error) {
                console.error('Hotel search error (property_name_ko):', result.error)
                return { data: [], error: null }
              }
              console.log('✅ Hotel search query 1 successful, found:', result.data?.length || 0, 'results')
              return result
            })
            .catch(err => {
              console.error('❌ Hotel search query 1 failed:', err)
              return { data: [], error: err }
            }),
          
          // 쿼리 2: 호텔명 영문
          supabase
            .from('select_hotels')
            .select(selectFields)
            .ilike('property_name_en', `%${query}%`)
            .limit(15)
            .then(result => {
              if (result.error) {
                console.error('Hotel search error (property_name_en):', result.error)
                return { data: [], error: null }
              }
              console.log('✅ Hotel search query 2 successful, found:', result.data?.length || 0, 'results')
              return result
            })
            .catch(err => {
              console.error('❌ Hotel search query 2 failed:', err)
              return { data: [], error: err }
            }),
          
          // 쿼리 3: 도시명
          supabase
            .from('select_hotels')
            .select(selectFields)
            .ilike('city_ko', `%${query}%`)
            .limit(15)
            .then(result => {
              if (result.error) {
                console.error('Hotel search error (city_ko):', result.error)
                return { data: [], error: null }
              }
              console.log('✅ Hotel search query 3 successful, found:', result.data?.length || 0, 'results')
              return result
            })
            .catch(err => {
              console.error('❌ Hotel search query 3 failed:', err)
              return { data: [], error: err }
            })
        ]

        // 모든 쿼리 병렬 실행
        const results = await Promise.all(queryPromises)
        
        // 결과 병합
        const hotelMap = new Map<number, HotelRow>()
        results.forEach((result, index) => {
          if (result.data && Array.isArray(result.data)) {
            result.data.forEach(h => {
              const id = Number(h.sabre_id)
              if (!hotelMap.has(id)) {
                hotelMap.set(id, h as HotelRow)
              }
            })
          }
        })
        
        hotels = Array.from(hotelMap.values())
        console.log('🏨 Final hotel search results:', hotels.length)
        
      } catch (err) {
        console.error('❌ Hotel search critical error:', err)
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          query
        })
        // 에러 발생해도 빈 배열로 계속 진행
        hotels = []
      }

      // 호텔 이미지 조회: 첫 이미지 매핑
      const sabreIds = hotels.map((h) => String(h.sabre_id))
      let mediaMap = new Map<string, string>()
      
      if (sabreIds.length > 0) {
        try {
          console.log('🖼️ Fetching hotel media for sabre_ids:', sabreIds)
          const { data: mediaData } = await supabase
            .from('select_hotel_media')
            .select('sabre_id, public_url, storage_path, image_seq')
            .in('sabre_id', sabreIds)
            .order('image_seq', { ascending: true })

          if (mediaData && mediaData.length > 0) {
            for (const m of mediaData as any[]) {
              const key = String(m.sabre_id)
              if (!mediaMap.has(key)) {
                mediaMap.set(key, m.public_url || m.storage_path || '/placeholder.svg')
              }
            }
            console.log('✅ Hotel media fetched successfully:', mediaMap.size, 'images')
          }
        } catch (err) {
          console.error('❌ Hotel media fetch error:', err)
          // 에러 발생해도 계속 진행
        }
      }

      const hotelItems: UnifiedHotel[] = hotels
        .filter((h) => h.publish !== false) // publish가 null이거나 true인 것만
        .slice(0, 20) // 최종 20개로 제한
        .map((h) => ({
          type: 'hotel',
          id: String(h.sabre_id),
          sabre_id: Number(h.sabre_id),
          slug: h.slug ?? null,
          property_name_ko: h.property_name_ko ?? null,
          property_name_en: h.property_name_en ?? null,
          city: h.city ?? null,
          city_ko: h.city_ko ?? null,
          city_en: h.city_en ?? null,
          country_ko: h.country_ko ?? null,
          country_en: h.country_en ?? null,
          image_url: mediaMap.get(String(h.sabre_id)) || '/placeholder.svg',
          snippet: h.property_details ? String(h.property_details).replace(/<[^>]*>/g, '').slice(0, 120) : null
        }))

      // 블로그 검색: 제목/부제, slug에서 매칭
      console.log('📝 Starting blog search for query:', query)
      let blogs: any[] = []
      
      try {
        const { data: blogData, error: blogError } = await supabase
          .from('select_hotel_blogs')
          .select('id, slug, main_title, sub_title, main_image, created_at')
          .or(`main_title.ilike.%${query}%,sub_title.ilike.%${query}%,slug.ilike.%${query}%`)
          .order('id', { ascending: false })
          .limit(20)

        if (blogError) {
          console.error('❌ Blog search error:', blogError)
          blogs = []
        } else {
          blogs = blogData || []
          console.log('✅ Blog search successful, found:', blogs.length, 'results')
        }
      } catch (err) {
        console.error('❌ Blog search critical error:', err)
        blogs = []
      }

      const blogItems: UnifiedBlog[] = blogs.map((b) => ({
        type: 'blog',
        id: b.id,
        slug: b.slug,
        main_title: b.main_title ?? null,
        sub_title: b.sub_title ?? null,
        created_at: b.created_at ?? null,
        image_url: b.main_image || '/placeholder.svg'
      }))

      // 호텔 프로모션 매핑 조회 (있으면 간단 텍스트로 첨부)
      if (includePromotions && sabreIds.length > 0) {
        const { data: maps } = await supabase
          .from('select_hotel_promotions_map')
          .select('sabre_id, promotion_id')
          .in('sabre_id', sabreIds)

        const bySabre = new Map<string, number[]>()
        ;(maps || []).forEach((m: any) => {
          const key = String(m.sabre_id)
          const arr = bySabre.get(key) || []
          arr.push(m.promotion_id)
          bySabre.set(key, arr)
        })

        if (bySabre.size > 0) {
          const allIds = Array.from(new Set(Array.from(bySabre.values()).flat()))
          const { data: promos } = await supabase
            .from('select_hotel_promotions')
            .select('promotion_id, promotion_title, promotion_description, description')
            .in('promotion_id', allIds)

          const promoMap = new Map<number, string>()
          ;(promos || []).forEach((p: any) => {
            const text = p.promotion_title || p.promotion_description || p.description || ''
            promoMap.set(p.promotion_id, String(text).replace(/<[^>]*>/g, ''))
          })

          for (const h of hotelItems) {
            const ids = bySabre.get(String(h.sabre_id)) || []
            h.promotions = ids.map(id => promoMap.get(id)).filter(Boolean) as string[]
          }
        }
      }

      // 단순 합치기: 지역, 호텔, 블로그
      return [...regionItems, ...hotelItems, ...blogItems]
    },
    enabled: q.trim().length > 0,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}



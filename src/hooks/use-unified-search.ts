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
}

type UnifiedBlog = {
  type: 'blog'
  id: string | number
  slug: string
  main_title: string | null
  sub_title: string | null
  created_at?: string | null
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
export function useUnifiedSearch(q: string) {
  return useQuery({
    queryKey: ['unified-search', 'v2', q],
    queryFn: async (): Promise<UnifiedSearchItemWithRegion[]> => {
      const query = q.trim()
      if (!query) return []

      // 지역 검색 (도시 위주)
      const { data: regions, error: regionError } = await supabase
        .from('select_regions')
        .select('city_code, city_ko, city_en, city_slug, country_code, country_ko, country_en, status, region_type')
        .eq('status', 'active')
        .eq('region_type', 'city')
        .or(`city_ko.ilike.%${query}%,city_en.ilike.%${query}%,country_ko.ilike.%${query}%,country_en.ilike.%${query}%`)
        .order('city_code', { ascending: true })
        .limit(20)

      if (regionError) throw regionError

      const regionItems: UnifiedRegion[] = ((regions as RegionRow[] | null) || []).map((r) => ({
        type: 'region',
        id: r.city_code,
        city_code: r.city_code,
        city_ko: r.city_ko ?? null,
        city_en: r.city_en ?? null,
        city_slug: r.city_slug ?? null,
        country_code: r.country_code ?? null,
        country_ko: r.country_ko ?? null,
        country_en: r.country_en ?? null,
      }))

      // 호텔 검색
      const { data: hotels, error: hotelError } = await supabase
        .from('select_hotels')
        .select('sabre_id, slug, property_name_ko, property_name_en, city, city_ko, city_en, country_ko, country_en, publish')
        .or(`property_name_ko.ilike.%${query}%,property_name_en.ilike.%${query}%,city.ilike.%${query}%,city_ko.ilike.%${query}%,city_en.ilike.%${query}%,country_ko.ilike.%${query}%,country_en.ilike.%${query}%`)
        .or('publish.is.null,publish.eq.true')

      if (hotelError) throw hotelError

      const hotelItems: UnifiedHotel[] = ((hotels as HotelRow[] | null) || [])
        .filter((h) => h.publish !== false)
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
        }))

      // 블로그 검색: 제목/부제, slug에서 매칭
      const { data: blogs, error: blogError } = await supabase
        .from('select_hotel_blogs')
        .select('id, slug, main_title, sub_title, created_at')
        .or(`main_title.ilike.%${query}%,sub_title.ilike.%${query}%,slug.ilike.%${query}%`)
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })

      if (blogError) throw blogError

      const blogItems: UnifiedBlog[] = ((blogs as BlogRow[] | null) || []).map((b) => ({
        type: 'blog',
        id: b.id,
        slug: b.slug,
        main_title: b.main_title ?? null,
        sub_title: b.sub_title ?? null,
        created_at: b.created_at ?? null,
      }))

      // 단순 합치기: 지역, 호텔, 블로그
      return [...regionItems, ...hotelItems, ...blogItems]
    },
    enabled: q.trim().length > 0,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}



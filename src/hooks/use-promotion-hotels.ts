'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { transformHotelsToCardData } from '@/lib/hotel-utils'
import { getFirstImagePerHotel } from '@/lib/media-utils'
import { PROMOTION_CONFIG } from '@/config/layout'

/**
 * 띠베너용 호텔 데이터 조회 훅 (Client Component용)
 * PromotionBanner 컴포넌트에서 사용
 */
export function useTopBannerHotels(hotelCount: number = PROMOTION_CONFIG.DEFAULT_HOTEL_COUNT) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['top-banner-hotels', hotelCount],
    queryFn: async () => {
      // KST 오늘 (YYYY-MM-DD)
      const now = new Date()
      const kstMs = now.getTime() + 9 * 60 * 60 * 1000
      const todayKst = new Date(kstMs).toISOString().slice(0, 10)

      const { data: slots } = await supabase
        .from('select_feature_slots')
        .select('sabre_id, start_date, end_date')
        .eq('surface', '띠베너')

      if (!slots || slots.length === 0) return []

      const activeSabreIds = (slots as any[])
        .filter((slot) => {
          const start = (slot.start_date ?? '').toString().slice(0, 10)
          const end = (slot.end_date ?? '').toString().slice(0, 10)
          if (!start && !end) return true
          if (start && todayKst < start) return false
          if (end && todayKst > end) return false
          return true
        })
        .map((slot) => slot.sabre_id)

      if (activeSabreIds.length === 0) return []

      const { data: hotels } = await supabase
        .from('select_hotels')
        .select('*')
        .in('sabre_id', activeSabreIds)
        .limit(hotelCount * 2)

      if (!hotels) return []

      const filteredHotels = hotels.filter((h: any) => h.publish !== false).slice(0, hotelCount)

      const hotelSabreIds = filteredHotels.map(h => String(h.sabre_id))
      const { data: rawMediaData } = await supabase
        .from('select_hotel_media')
        .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
        .in('sabre_id', hotelSabreIds)
        .order('image_seq', { ascending: true })
      
      const mediaData = getFirstImagePerHotel(rawMediaData || [])

      return transformHotelsToCardData(filteredHotels, mediaData, true)
    },
    staleTime: PROMOTION_CONFIG.CACHE_TIME,
  })
}


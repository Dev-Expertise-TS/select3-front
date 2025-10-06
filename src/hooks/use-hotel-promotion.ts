import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface HotelPromotion {
  promotion_id: number
  promotion: string
  booking_date: string | null
  check_in_date: string | null
}

export function useHotelPromotion(sabreId: number | null) {
  return useQuery({
    queryKey: ['hotel-promotion', sabreId],
    queryFn: async (): Promise<HotelPromotion[]> => {
      if (!sabreId) return []

      try {
        const supabase = createClient()

        // 1) 매핑 조회
        const { data: promotionMaps, error: mapError } = await supabase
          .from('select_hotel_promotions_map')
          .select('promotion_id')
          .eq('sabre_id', sabreId)

        if (mapError) {
          console.error('❌ 프로모션 매핑 조회 실패:', {
            message: (mapError as any)?.message,
            code: (mapError as any)?.code,
            details: (mapError as any)?.details,
            hint: (mapError as any)?.hint,
          })
          return []
        }

        if (!promotionMaps || promotionMaps.length === 0) return []

        const promotionIds = promotionMaps.map(map => map.promotion_id)

        // 2) 프로모션 상세 조회(전 컬럼)
        const { data, error: promotionError } = await supabase
          .from('select_hotel_promotions')
          .select('*')
          .in('promotion_id', promotionIds)
          .order('promotion_id', { ascending: true })

        if (promotionError) {
          console.error('❌ 프로모션 정보 조회 실패:', {
            message: (promotionError as any)?.message,
            code: (promotionError as any)?.code,
            details: (promotionError as any)?.details,
            hint: (promotionError as any)?.hint,
          })
          return []
        }

        const promotions = data || []

        // 3) 날짜 필터: 오늘이 [booking_start_date, check_in_end_date]에 포함되면 통과
        const todayKst = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
        }).format(new Date())

        const toKstYmd = (value?: string | null): string => {
          if (!value) return ''
          try {
            return new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
            }).format(new Date(value))
          } catch {
            const v = value.toString().slice(0, 10)
            const parts = v.split('-')
            if (parts.length === 3) {
              const [y, m, d] = parts
              return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`
            }
            return v
          }
        }

        const isInRange = (start?: string | null, end?: string | null) => {
          const s = toKstYmd(start)
          const e = toKstYmd(end)
          if (!s && !e) return true
          if (s && todayKst < s) return false
          if (e && todayKst > e) return false
          return true
        }

        const filtered = promotions.filter((p: any) => {
          const bookingStart = p.booking_start_date ?? p.bookingStartDate ?? null
          const checkinEnd = p.check_in_end_date ?? p.checkInEndDate ?? null
          return isInRange(bookingStart, checkinEnd)
        })

        // 4) 카드에서 기대하는 키로 매핑(끝일 위주로 표기)
        const mapped: HotelPromotion[] = filtered.map((p: any) => ({
          promotion_id: p.promotion_id,
          promotion: p.promotion,
          booking_date: p.booking_end_date ?? p.bookingEndDate ?? p.booking_date ?? null,
          check_in_date: p.check_in_end_date ?? p.checkInEndDate ?? p.check_in_date ?? null,
        }))

        return mapped
      } catch (error) {
        const err: any = error
        console.error('❌ 프로모션 조회 중 오류:', {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
        })
        return []
      }
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  })
}

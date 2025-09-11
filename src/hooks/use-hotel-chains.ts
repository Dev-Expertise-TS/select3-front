import { useQuery } from '@tanstack/react-query'
import { HotelChainFilter } from '@/types/hotel-filter'

export function useHotelChains() {
  return useQuery({
    queryKey: ['hotel-chains'],
    queryFn: async (): Promise<HotelChainFilter[]> => {
      const response = await fetch('/api/hotel-chains')
      
      if (!response.ok) {
        throw new Error('호텔 체인 데이터를 불러올 수 없습니다.')
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '호텔 체인 데이터를 불러올 수 없습니다.')
      }
      
      return result.data || []
    },
    staleTime: 5 * 60 * 1000, // 5분
    retry: 2
  })
}

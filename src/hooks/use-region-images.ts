"use client"

import { useQuery } from '@tanstack/react-query'
import { RegionImagesResponse } from '@/types/region'

/**
 * 특정 도시의 이미지 목록을 조회하는 훅
 * 
 * Best Practice:
 * - city_code 최우선 사용 (가장 정확)
 * - 1시간 캐싱
 * - 조건부 로딩 (enabled)
 * 
 * @param cityCode 도시 코드 (예: "TYO", "BALI")
 * @param enabled 쿼리 활성화 여부
 */
export function useRegionImages(cityCode: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ['region-images', 'v2', cityCode],  // select_city_media 테이블 사용으로 캐시 갱신
    queryFn: async () => {
      if (!cityCode) return null

      const response = await fetch(`/api/regions/${cityCode}/images`, {
        next: { revalidate: 3600 } // 1시간 캐싱
      })
      
      if (!response.ok) {
        throw new Error(`도시 이미지 조회 실패: ${response.status}`)
      }
      
      const result: RegionImagesResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '도시 이미지 조회 실패')
      }
      
      return result.data
    },
    enabled: enabled && !!cityCode,
    staleTime: 60 * 60 * 1000, // 1시간 캐싱 (Best Practice)
    gcTime: 2 * 60 * 60 * 1000, // 2시간 가비지 컬렉션
  })
}

/**
 * 특정 도시의 첫 번째 이미지만 조회하는 훅 (썸네일용 - 추천)
 * 
 * Best Practice:
 * - city_code 최우선 사용
 * - imageUrl 우선 (API에서 생성된 URL)
 * - public_url → file_path 순서로 fallback
 * 
 * @param cityCode 도시 코드
 * @param enabled 쿼리 활성화 여부
 */
export function useRegionFirstImage(cityCode: string | null | undefined, enabled = true) {
  const { data, isLoading, error } = useRegionImages(cityCode, enabled)
  
  const firstImage = data?.firstImage as any
  
  return {
    image: firstImage,
    // 우선순위: imageUrl (API 생성) > public_url > file_path로 URL 생성
    imageUrl: firstImage?.imageUrl || 
              firstImage?.public_url || 
              (firstImage?.file_path 
                ? `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/${firstImage.file_path}` 
                : null),
    isLoading,
    error
  }
}


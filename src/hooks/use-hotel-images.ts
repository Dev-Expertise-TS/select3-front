import { useMemo } from 'react';
import { generateHotelImageUrls, generateHotelImageUrl } from '@/lib/supabase-image-loader';

/**
 * 호텔 이미지 URL 생성을 위한 훅
 */
export function useHotelImages(
  hotelSlug: string | undefined,
  sabreId: number | undefined,
  options?: {
    count?: number;
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }
) {
  return useMemo(() => {
    console.log('🔄 useHotelImages 훅 실행:', { hotelSlug, sabreId, options });
    
    if (!hotelSlug || !sabreId) {
      console.log('❌ hotelSlug 또는 sabreId가 없음:', { hotelSlug, sabreId });
      return {
        images: [],
        getImageUrl: () => null,
        getHeroImageUrl: () => null,
        getThumbnailUrl: () => null,
      };
    }

    const { count = 5, ...imageOptions } = options || {};
    
    // 실제 존재하는 이미지만 생성하도록 수정
    // API에서 이미 존재 여부를 확인했으므로, 여기서는 기본적으로 빈 배열 반환
    // 필요시 API 결과를 기반으로 이미지 URL 생성
    console.log('⚠️ useHotelImages: API에서 실제 존재하는 이미지만 사용하도록 변경됨');
    const images: string[] = [];
    console.log('📋 useHotelImages 빈 배열 반환 (API에서 실제 존재하는 이미지 사용):', images);
    
    // API에서 실제 존재하는 이미지만 사용하므로 null 반환
    const getImageUrl = (sequence: number, customOptions?: typeof imageOptions) => {
      console.log('⚠️ getImageUrl: API에서 실제 존재하는 이미지만 사용하도록 변경됨');
      return null;
    };
    
    const getHeroImageUrl = (customOptions?: typeof imageOptions) => {
      console.log('⚠️ getHeroImageUrl: API에서 실제 존재하는 이미지만 사용하도록 변경됨');
      return null;
    };
    
    const getThumbnailUrl = (sequence: number, customOptions?: typeof imageOptions) => {
      console.log('⚠️ getThumbnailUrl: API에서 실제 존재하는 이미지만 사용하도록 변경됨');
      return null;
    };

    return {
      images,
      getImageUrl,
      getHeroImageUrl,
      getThumbnailUrl,
    };
  }, [hotelSlug, sabreId, options]);
}

/**
 * 이미지 시퀀스 검증 함수
 * 실제로 존재하는 이미지인지 확인하기 위한 헬퍼
 */
export function validateImageSequence(
  hotelSlug: string,
  sabreId: number,
  sequence: number
): boolean {
  // 기본적으로 1-5 시퀀스는 존재한다고 가정
  // 실제로는 API를 통해 존재 여부를 확인할 수 있음
  return sequence >= 1 && sequence <= 5;
}

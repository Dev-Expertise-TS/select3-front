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
    
    // 이전 방식: generateHotelImageUrls 사용
    const images = generateHotelImageUrls(hotelSlug, sabreId, count, imageOptions);
    console.log('📋 useHotelImages 이미지 URL들 생성:', { count: images.length, images });
    
    const getImageUrl = (sequence: number, customOptions?: typeof imageOptions) => {
      return generateHotelImageUrl(hotelSlug, sabreId, sequence, customOptions);
    };
    
    const getHeroImageUrl = (customOptions?: typeof imageOptions) => {
      return generateHotelImageUrl(hotelSlug, sabreId, 1, customOptions);
    };
    
    const getThumbnailUrl = (sequence: number, customOptions?: typeof imageOptions) => {
      return generateHotelImageUrl(hotelSlug, sabreId, sequence, customOptions);
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

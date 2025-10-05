/**
 * Supabase Storage 이미지 URL 생성 유틸리티
 * 클라이언트 컴포넌트에서 직접 사용할 수 있도록 함수 대신 URL 생성 방식 사용
 */

/**
 * Supabase Storage 이미지 URL을 변환 파라미터와 함께 생성
 */
export const createSupabaseImageUrl = (
  src: string, 
  width?: number, 
  quality: number = 85, 
  format: 'webp' | 'avif' | 'auto' = 'auto'
): string => {
  // Supabase Storage URL인지 확인
  if (!src.includes('supabase.co/storage/v1/object/public/')) {
    return src;
  }

  try {
    const url = new URL(src);
    
    // 이미지 변환 파라미터 추가
    if (width) {
      url.searchParams.set('width', String(width));
    }
    url.searchParams.set('quality', String(quality));
    
    // 포맷 설정 (AVIF 우선, WebP 대체)
    if (format === 'avif') {
      url.searchParams.set('format', 'avif');
    } else if (format === 'webp') {
      url.searchParams.set('format', 'webp');
    } else {
      // auto: AVIF 지원 브라우저는 AVIF, 아니면 WebP
      url.searchParams.set('format', 'auto');
    }

    return url.toString();
  } catch (error) {
    console.warn('Supabase 이미지 URL 생성 에러:', error);
    return src;
  }
};

/**
 * @deprecated Next.js 15에서 클라이언트 컴포넌트에 함수 전달 불가
 * createSupabaseImageUrl을 사용하세요
 */
export const supabaseLoader = ({ src, width, quality = 85, format = 'auto' }: { 
  src: string; 
  width: number; 
  quality?: number; 
  format?: 'webp' | 'avif' | 'auto';
}): string => {
  return createSupabaseImageUrl(src, width, quality, format);
};

/**
 * 호텔 이미지 URL 생성 헬퍼
 */
export const generateHotelImageUrl = (
  hotelSlug: string | undefined | null,
  sabreId: number | undefined | null,
  sequence: number = 1,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }
): string | null => {
  // 필수 매개변수 검증
  if (!hotelSlug || !sabreId) {
    console.warn('generateHotelImageUrl: hotelSlug 또는 sabreId가 없습니다', { hotelSlug, sabreId });
    return null;
  }

  // 유효한 시퀀스 번호 검증
  if (sequence < 1 || sequence > 10) {
    console.warn('generateHotelImageUrl: 유효하지 않은 시퀀스 번호', { sequence });
    return null;
  }

  // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
  const decodedSlug = decodeURIComponent(hotelSlug);
  
  console.log('🖼️ 이미지 URL 생성:', {
    originalSlug: hotelSlug,
    decodedSlug: decodedSlug,
    hasSpecialChars: hotelSlug !== decodedSlug,
    sabreId,
    sequence
  });

  const { width, height, quality = 85, format = 'auto' } = options || {};
  
  try {
    // 기본 이미지 파일명 패턴: slug_sabre_id-seq (디코딩된 slug 사용)
    const fileName = `${decodedSlug}_${sabreId}_${sequence.toString().padStart(2, '0')}_1600w.avif`;
    
    // Supabase Storage 공개 URL (디코딩된 slug 사용)
    const baseUrl = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/${decodedSlug}/${fileName}`;
    
    if (width || height || quality !== 85 || format !== 'auto') {
      return createSupabaseImageUrl(
        baseUrl,
        width || 1600,
        quality,
        format
      );
    }
    
    return baseUrl;
  } catch (error) {
    console.error('generateHotelImageUrl: URL 생성 중 오류', error);
    return null;
  }
};

/**
 * 호텔 이미지 시퀀스별 URL 생성
 */
export const generateHotelImageUrls = (
  hotelSlug: string | undefined | null,
  sabreId: number | undefined | null,
  count: number = 5,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }
): string[] => {
  if (!hotelSlug || !sabreId) {
    return [];
  }

  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    const url = generateHotelImageUrl(hotelSlug, sabreId, i, options);
    if (url) {
      urls.push(url);
    }
  }
  return urls;
};

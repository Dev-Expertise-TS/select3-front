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
    // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
    const decodedSrc = decodeURIComponent(src);
    
  // 디버깅 로그 제거됨
    
    // URL 생성 시 인코딩 방지를 위해 수동으로 파라미터 추가
    // 기존 쿼리 파라미터가 있는지 확인
    const [baseUrl, existingQuery] = decodedSrc.split('?');
    const params = new URLSearchParams(existingQuery || '');
    
    // 이미지 변환 파라미터 추가 (기존 파라미터 덮어쓰기)
    if (width) {
      params.set('width', String(width));
    }
    params.set('quality', String(quality));
    
    // 포맷 설정 (AVIF 우선, WebP 대체)
    if (format === 'avif') {
      params.set('format', 'avif');
    } else if (format === 'webp') {
      params.set('format', 'webp');
    } else {
      // auto: AVIF 지원 브라우저는 AVIF, 아니면 WebP
      params.set('format', 'auto');
    }

    return `${baseUrl}?${params.toString()}`;
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

  // 유효한 시퀀스 번호 검증 (11까지 확장)
  if (sequence < 1 || sequence > 11) {
    console.warn('generateHotelImageUrl: 유효하지 않은 시퀀스 번호', { sequence });
    return null;
  }

  // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
  const decodedSlug = decodeURIComponent(hotelSlug);
  
  // 디버깅 로그 제거됨

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

/**
 * 다양한 파일명 패턴으로 호텔 이미지 URL 생성 시도
 */
export const generateHotelImageUrlWithPatterns = async (
  hotelSlug: string | undefined | null,
  sabreId: number | undefined | null,
  sequence: number = 1,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'auto';
  }
): Promise<string | null> => {
  if (!hotelSlug || !sabreId) {
    return null;
  }

  const decodedSlug = decodeURIComponent(hotelSlug);
  
  // 다양한 파일명 패턴들
  const patterns = [
    `${decodedSlug}_${sabreId}_${sequence.toString().padStart(2, '0')}_1600w.avif`, // 기본 패턴
    `${decodedSlug}-${sabreId}_${sequence.toString().padStart(2, '0')}_1600w.avif`, // 하이픈 패턴
    `${decodedSlug}_${sabreId}_${sequence}_1600w.avif`, // 패딩 없는 패턴
    `${decodedSlug}_${sabreId}_${sequence.toString().padStart(2, '0')}.avif`, // width 없는 패턴
    `${decodedSlug}_${sequence.toString().padStart(2, '0')}_1600w.avif`, // sabre_id 없는 패턴
  ];

  // 각 패턴을 시도해서 존재하는 이미지 찾기
  for (const fileName of patterns) {
    const imagePath = `public/${decodedSlug}/${fileName}`;
    const baseUrl = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/${imagePath}`;
    
    try {
      // 이미지 존재 여부 확인
      const response = await fetch(baseUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log(`✅ 이미지 패턴 발견: ${fileName}`);
        
        const { width, height, quality = 85, format = 'auto' } = options || {};
        
        if (width || height || quality !== 85 || format !== 'auto') {
          return createSupabaseImageUrl(
            baseUrl,
            width || 1600,
            quality,
            format
          );
        }
        
        return baseUrl;
      }
    } catch (error) {
      // 계속 다음 패턴 시도
      continue;
    }
  }
  
  console.warn(`❌ 모든 패턴에서 이미지를 찾을 수 없음: ${hotelSlug}, ${sabreId}, ${sequence}`);
  return null;
};

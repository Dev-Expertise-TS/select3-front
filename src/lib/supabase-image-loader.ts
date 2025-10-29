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

    // 캐시 무효화: API에서 이미 v가 오면 그대로 유지, 없을 때만 시간 버킷 기반 v 부여
    if (!params.has('v')) {
      const halfHourBucket = Math.floor(Date.now() / (30 * 60 * 1000));
      params.set('v', String(halfHourBucket));
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
 * select_hotel_media 테이블의 media_path를 우선 사용하고,
 * 없을 경우 Storage 파일명 패턴으로 URL 생성
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
  
  const { width, height, quality = 85, format = 'auto' } = options || {};
  
  try {
    // 기본 이미지 파일명 패턴: slug_sabreId_seq_1600w.avif
    // 다양한 포맷 지원: avif, webp, jpg, jpeg, png
    const seqStr = sequence.toString().padStart(2, '0');
    const fileName = `${decodedSlug}_${sabreId}_${seqStr}_1600w.avif`;
    
    // Supabase Storage 공개 URL
    const baseUrl = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/${decodedSlug}/${fileName}`;
    
    // 항상 createSupabaseImageUrl를 통해 v 파라미터를 부여
    return createSupabaseImageUrl(
      baseUrl,
      width || 1600,
      quality,
      format
    );
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
 * 다양한 파일명 패턴과 포맷으로 호텔 이미지 URL 생성 시도
 * 여러 이미지 확장자 (avif, webp, jpg, jpeg, png)를 지원
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
  const seqStr = sequence.toString().padStart(2, '0');
  
  // 지원하는 이미지 확장자 (우선순위 순서)
  const imageExtensions = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
  
  // 다양한 파일명 패턴들 (각 확장자별로)
  const patterns: string[] = [];
  
  for (const ext of imageExtensions) {
    patterns.push(
      `${decodedSlug}_${sabreId}_${seqStr}_1600w.${ext}`, // 기본 패턴
      `${decodedSlug}_${sabreId}_${seqStr}.${ext}`,        // width 없는 패턴
      `${decodedSlug}-${sabreId}_${seqStr}.${ext}`,        // 하이픈 패턴
      `${decodedSlug}_${seqStr}.${ext}`,                   // sabre_id 없는 패턴
    );
  }

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
        return createSupabaseImageUrl(
          baseUrl,
          width || 1600,
          quality,
          format
        );
      }
    } catch (error) {
      // 계속 다음 패턴 시도
      continue;
    }
  }
  
  console.warn(`❌ 모든 패턴에서 이미지를 찾을 수 없음: ${hotelSlug}, ${sabreId}, ${sequence}`);
  return null;
};

/**
 * Storage에서 실제로 존재하는 호텔 이미지 URL을 동기적으로 생성
 * (여러 포맷 시도)
 */
export const generateHotelImageUrlMultiFormat = (
  hotelSlug: string | undefined | null,
  sabreId: number | undefined | null,
  sequence: number = 1,
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

  const decodedSlug = decodeURIComponent(hotelSlug);
  const seqStr = sequence.toString().padStart(2, '0');
  const { width, height, quality = 85, format = 'auto' } = options || {};
  
  // 지원하는 이미지 확장자 (우선순위 순서)
  const imageExtensions = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
  
  const urls: string[] = [];
  
  for (const ext of imageExtensions) {
    const patterns = [
      `${decodedSlug}_${sabreId}_${seqStr}.${ext}`,        // width 없는 패턴 (우선)
      `${decodedSlug}_${sabreId}_${seqStr}_1600w.${ext}`, // 기본 패턴
      `${decodedSlug}-${sabreId}_${seqStr}.${ext}`,        // 하이픈 패턴
    ];
    
    for (const fileName of patterns) {
      const baseUrl = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/${decodedSlug}/${fileName}`;
      
      urls.push(createSupabaseImageUrl(baseUrl, width || 1600, quality, format));
    }
  }
  
  return urls;
};

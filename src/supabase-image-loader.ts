// Supabase Render Image API 기반 커스텀 로더
// 사용 예: width, quality, cover/contain 제어
type LoaderProps = {
    src: string;       // 'select-media/hotels/.../Q2PyIQ....avif' 같은 Storage 경로
    width: number;     // next/image가 생성해주는 width
    quality?: number;  // 1~100
  };
  
  const PROJECT_ID = 'bnnuekzyfuvgeefmhmnp'; // 고정 사용. 환경변수로 빼려면 교체
  
  const DEFAULT_QUALITY = 75;
  const DEFAULT_RESIZE = 'cover'; // hero/카드 공통으로 무난
  
  const versionParam = () => String(Math.floor(Date.now() / (30 * 60 * 1000))); // 30분 버킷

  const appendV = (url: string) => {
    try {
      const u = new URL(url);
      if (!u.searchParams.has('v')) {
        u.searchParams.set('v', versionParam());
      }
      return u.toString();
    } catch {
      // URL 생성 실패 시 안전하게 쿼리 추가
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}v=${versionParam()}`;
    }
  }

  const buildURL = (src: string, width: number, quality?: number) => {
    const q = quality ?? DEFAULT_QUALITY;
    // src 앞에 'public/' 없이 전달하도록 맞춥니다.
    // 예: 'select-media/hotels/mandarin-oriental-taipei/Q2PyIQ...avif'
    const base = `https://${PROJECT_ID}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${q}&resize=${DEFAULT_RESIZE}`;
    return appendV(base);
  };
  
export default function supabaseLoader({ src, width, quality }: LoaderProps) {
  // 안전 가드: 절대 URL이 들어오면 원본 그대로 반환
  if (src.startsWith('http')) return src;
  
  // 이미 최적화된 이미지 형식(avif, webp)이면 render API 사용 안 함 (타임아웃 방지)
  const isOptimizedFormat = src.toLowerCase().endsWith('.avif') || src.toLowerCase().endsWith('.webp');
  
  if (isOptimizedFormat) {
    // 최적화된 이미지는 원본 URL 직접 반환 (타임아웃 방지)
    return appendV(`https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${src}`);
  }
  
  return buildURL(src, width, quality);
}
  
  /** 유틸: 매우 작은 블러 썸네일(placeholder) 생성용 */
  export const tinyBlurDataURL = (src: string) => {
    // 절대 URL이면 그대로 반환
    if (src.startsWith('http')) return src;
    
    // 이미 최적화된 이미지는 원본 URL 반환 (타임아웃 방지)
    const isOptimizedFormat = src.toLowerCase().endsWith('.avif') || src.toLowerCase().endsWith('.webp');
    if (isOptimizedFormat) {
      return appendV(`https://${PROJECT_ID}.supabase.co/storage/v1/object/public/${src}`);
    }
    
    return appendV(`https://${PROJECT_ID}.supabase.co/storage/v1/render/image/public/${src}?width=24&quality=40&resize=${DEFAULT_RESIZE}&format=webp`);
  }
  
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
  
  const buildURL = (src: string, width: number, quality?: number) => {
    const q = quality ?? DEFAULT_QUALITY;
    // src 앞에 'public/' 없이 전달하도록 맞춥니다.
    // 예: 'select-media/hotels/mandarin-oriental-taipei/Q2PyIQ...avif'
    return `https://${PROJECT_ID}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${q}&resize=${DEFAULT_RESIZE}`;
  };
  
  export default function supabaseLoader({ src, width, quality }: LoaderProps) {
    // 안전 가드: 절대 URL이 들어오면 원본 그대로 반환
    if (src.startsWith('http')) return src;
    return buildURL(src, width, quality);
  }
  
  /** 유틸: 매우 작은 블러 썸네일(placeholder) 생성용 */
  export const tinyBlurDataURL = (src: string) =>
    `https://${PROJECT_ID}.supabase.co/storage/v1/render/image/public/${src}?width=24&quality=40&resize=${DEFAULT_RESIZE}&format=webp`;
  
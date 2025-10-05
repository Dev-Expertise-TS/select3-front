import Image from 'next/image';
import { createSupabaseImageUrl } from '@/lib/supabase-image-loader';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  format?: 'webp' | 'avif' | 'auto';
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 85,
  format = 'auto',
  sizes,
  placeholder = 'empty',
  blurDataURL,
  fill = false,
  objectFit = 'cover',
}: OptimizedImageProps) {
  // src가 유효하지 않은 경우 렌더링하지 않음
  if (!src || src.trim() === '') {
    console.warn('OptimizedImage: src가 비어있거나 유효하지 않습니다', { src, alt });
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center text-gray-400",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={fill ? { width, height } : undefined}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm">이미지 없음</div>
        </div>
      </div>
    );
  }

  // Supabase Storage 이미지인 경우 URL에 변환 파라미터 추가
  const isSupabaseImage = src.includes('supabase.co/storage/v1/object/public/');
  
  // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
  const decodedSrc = isSupabaseImage ? decodeURIComponent(src) : src;
  
  console.log('🖼️ OptimizedImage URL 처리:', {
    originalSrc: src,
    decodedSrc: decodedSrc,
    hasSpecialChars: src !== decodedSrc,
    isSupabaseImage,
    alt
  });
  
  const optimizedSrc = isSupabaseImage 
    ? createSupabaseImageUrl(decodedSrc, width, quality, format)
    : decodedSrc;
  
  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={cn(className)}
      priority={priority}
      quality={quality}
      sizes={sizes}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      style={fill ? { objectFit } : undefined}
      // AVIF/WebP 최적화를 위한 추가 props
      unoptimized={false}
    />
  );
}

/**
 * 호텔 히어로 이미지 컴포넌트
 * LCP 최적화를 위한 특별한 설정
 */
interface HotelHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function HotelHeroImage({ src, alt, className, width = 1920, height = 1080 }: HotelHeroImageProps) {
  // src가 유효하지 않은 경우 처리
  if (!src || src.trim() === '') {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center text-gray-400",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🏨</div>
          <div className="text-lg">호텔 이미지를 불러올 수 없습니다</div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={true}
      quality={90}
      format="avif"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    />
  );
}

/**
 * 호텔 썸네일 이미지 컴포넌트
 * 갤러리용 최적화된 설정
 */
interface HotelThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function HotelThumbnail({ src, alt, className, onClick, isActive }: HotelThumbnailProps) {
  // src가 유효하지 않은 경우 처리
  if (!src || src.trim() === '') {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center text-gray-400 cursor-pointer rounded-lg transition-all duration-200 hover:scale-105",
          isActive ? "ring-2 ring-blue-500" : "opacity-70 hover:opacity-100",
          className
        )}
        style={{ width: 120, height: 90 }}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-lg">📷</div>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={120}
      height={90}
      className={cn(
        "cursor-pointer rounded-lg transition-all duration-200 hover:scale-105",
        isActive ? "ring-2 ring-blue-500" : "opacity-70 hover:opacity-100",
        className
      )}
      quality={80}
      format="webp"
      sizes="120px"
      placeholder="empty"
      onClick={onClick}
    />
  );
}

/**
 * 통합된 스마트 이미지 컴포넌트
 * 로딩 상태, 에러 처리, 최적화를 모두 포함
 */

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { createSupabaseImageUrl } from '@/lib/supabase-image-loader';
import { isValidImageUrl } from '@/lib/image-utils';
import { ImageErrorBoundary } from './image-error-boundary';

interface SmartImageProps {
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
  fallbackComponent?: React.ReactNode;
  showLoadingState?: boolean;
  autoPreload?: boolean;
  onLoad?: (src: string) => void;
  onError?: (src: string, error: Error) => void;
}

export function SmartImage({
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
  fallbackComponent,
  showLoadingState = true,
  autoPreload = true,
  onLoad,
  onError
}: SmartImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 이미지 로드 핸들러
  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.(src);
  }, [src, onLoad]);

  // 이미지 에러 핸들러
  const handleError = useCallback((error: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageError(true);
    onError?.(src, new Error('Image load failed'));
  }, [src, onError]);

  // src가 유효하지 않은 경우
  if (!src || src.trim() === '' || !isValidImageUrl(src)) {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center text-gray-400 rounded-lg",
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

  // Supabase Storage 이미지 URL 최적화
  const isSupabaseImage = src.includes('supabase.co/storage/v1/object/public/');
  const decodedSrc = isSupabaseImage ? decodeURIComponent(src) : src;
  const optimizedSrc = isSupabaseImage 
    ? createSupabaseImageUrl(decodedSrc, width, quality, format)
    : decodedSrc;

  // 디버깅 로그
  console.log(`🖼️ SmartImage 렌더링:`, {
    src: src.substring(src.lastIndexOf('/') + 1),
    optimizedSrc: optimizedSrc.substring(optimizedSrc.lastIndexOf('/') + 1),
    imageLoaded,
    imageError
  });

  // 에러 상태일 때 fallback 컴포넌트 표시
  if (imageError) {
    return fallbackComponent || (
      <div 
        className={cn(
          "bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={fill ? { width, height } : undefined}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-sm">이미지 로딩 실패</div>
        </div>
      </div>
    );
  }

  return (
    <ImageErrorBoundary src={optimizedSrc} alt={alt} className={className}>
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
        onLoad={handleLoad}
        onError={handleError}
        unoptimized={false}
      />
    </ImageErrorBoundary>
  );
}

/**
 * 호텔 히어로 이미지 컴포넌트
 */
interface HotelHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function HotelHeroImage({ 
  src, 
  alt, 
  className, 
  width = 1920, 
  height = 1080 
}: HotelHeroImageProps) {
  return (
    <SmartImage
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
      autoPreload={true}
    />
  );
}

/**
 * 호텔 썸네일 이미지 컴포넌트
 */
interface HotelThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function HotelThumbnail({ 
  src, 
  alt, 
  className, 
  onClick, 
  isActive 
}: HotelThumbnailProps) {
  return (
    <SmartImage
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
      autoPreload={false}
    />
  );
}

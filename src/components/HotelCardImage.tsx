'use client';

import { OptimizedImage } from '@/components/ui/optimized-image';
import { optimizeHotelCardImage } from '@/lib/image-optimization';
import { getSafeImageUrl } from '@/lib/image-utils';

type Props = {
  src: string;      // storage 상대경로
  alt?: string;
  // 고정 비율 카드
  w?: number;       // 레이아웃 계산용 (렌더링 폭은 sizes로 제어)
  h?: number;
  priority?: boolean; // 우선순위 로딩
};

const HotelCardImage = ({ 
  src, 
  alt = 'Hotel image', 
  w = 640, 
  h = 360, 
  priority = false 
}: Props) => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-sm">
      <OptimizedImage
        src={optimizeHotelCardImage(getSafeImageUrl(src))}
        alt={alt}
        width={w}
        height={h}
        priority={priority}
        quality={priority ? 85 : 75}
        format="webp"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        className="h-auto w-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          console.warn(`🖼️ [HotelCardImage] 이미지 로딩 실패:`, {
            src,
            optimized_url: optimizeHotelCardImage(getSafeImageUrl(src))
          })
        }}
      />
    </div>
  );
};

export default HotelCardImage;

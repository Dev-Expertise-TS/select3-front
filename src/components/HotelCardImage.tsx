'use client';

import Image from 'next/image';
import supabaseLoader, { tinyBlurDataURL } from '@/supabase-image-loader';

type Props = {
  src: string;      // storage 상대경로
  alt?: string;
  // 고정 비율 카드
  w?: number;       // 레이아웃 계산용 (렌더링 폭은 sizes로 제어)
  h?: number;
};

const HotelCardImage = ({ src, alt = 'Hotel image', w = 640, h = 360 }: Props) => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-sm">
      <Image
        loader={supabaseLoader}
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL={tinyBlurDataURL(src)}
        className="h-auto w-full object-cover"
      />
    </div>
  );
};

export default HotelCardImage;

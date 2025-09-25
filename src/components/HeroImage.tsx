'use client';

import Image from 'next/image';
import supabaseLoader, { tinyBlurDataURL } from '@/supabase-image-loader';

type Props = {
  // Storage 상대경로만 넣습니다.
  // 예: 'select-media/hotels/mandarin-oriental-taipei/Q2PyIQlanLqkcb3deRIMshhM.avif'
  src: string;
  alt?: string;
};

const HeroImage = ({ src, alt = 'Hero image' }: Props) => {
  return (
    <div className="relative h-[48svh] min-h-[360px] w-full overflow-hidden rounded-2xl">
      <Image
        loader={supabaseLoader}
        src={src}
        alt={alt}
        fill
        priority                   // LCP 가속
        fetchPriority="high"
        sizes="100vw"              // 화면폭 전체
        placeholder="blur"
        blurDataURL={tinyBlurDataURL(src)}
        // className에 object-cover로 잘림 제어
        className="object-cover"
      />
    </div>
  );
};

export default HeroImage;

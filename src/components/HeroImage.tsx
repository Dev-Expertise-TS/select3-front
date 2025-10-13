'use client';

import Image from 'next/image';

type Props = {
  // 이미지 URL (Supabase Storage 또는 절대 경로)
  src: string;
  alt?: string;
};

const HeroImage = ({ src, alt = 'Hero image' }: Props) => {
  return (
    <div className="relative h-[48svh] min-h-[360px] w-full overflow-hidden rounded-2xl">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
};

export default HeroImage;

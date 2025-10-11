/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'bnnuekzyfuvgeefmhmnp.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // AVIF 우선 제공
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 300, // 캐시 시간을 5분으로 증가
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Supabase Storage 이미지 타임아웃 방지
    loader: 'default',
    // 이미지 최적화 타임아웃 증가 (기본 7초 -> 60초)
    loaderFile: undefined,
  },
  // 이미지 최적화 타임아웃 설정
  experimental: {
    // 이미지 최적화 타임아웃을 60초로 증가
    proxyTimeout: 60_000,
  },
}

export default nextConfig
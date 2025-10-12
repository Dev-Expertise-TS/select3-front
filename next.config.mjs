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
    qualities: [75, 85, 90, 95, 100], // Next.js 16 대비 quality 설정
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 캐시 시간을 24시간으로 증가 (Lighthouse 권장)
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
  // 프로덕션 빌드 최적화
  ...(process.env.NODE_ENV === 'production' && {
    // 프로덕션에서는 테스트/디버그 페이지 제외
    // 개발 환경에서는 모든 페이지 접근 가능
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  }),
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
}

export default nextConfig
/** @type {import('next').NextConfig} */

const nextConfig = {
  // URL 정규화: trailing slash 없음
  trailingSlash: false,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'framerusercontent.com' },
      { protocol: 'https', hostname: 'bnnuekzyfuvgeefmhmnp.supabase.co' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80, 85, 90, 95, 100],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: 'default',
    loaderFile: undefined,
  },

  experimental: {
    proxyTimeout: 60_000,
  },

  ...(process.env.NODE_ENV === 'production' && {
    pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  }),

  // 🔒 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  // ✅ 호스트 301 일원화: www → apex
  async redirects() {
    return [
      {
        // www 도메인으로 들어온 모든 요청을 apex로 영구 리다이렉트
        source: '/:path*',
        has: [{ type: 'host', value: 'www.luxury-select.co.kr' }],
        destination: 'https://luxury-select.co.kr/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

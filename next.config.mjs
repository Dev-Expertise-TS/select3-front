/** @type {import('next').NextConfig} */

const nextConfig = {
  // URL 정규화: trailing slash 없음
  trailingSlash: false,

  // Next.js 16: eslint 설정은 더 이상 next.config에서 지원하지 않음
  // eslint.config.mjs 또는 .eslintrc 파일 사용
  typescript: { ignoreBuildErrors: true },

  // Next.js 16: Turbopack 설정 (experimental에서 top-level로 이동)
  turbopack: {
    // Turbopack 관련 설정 (필요시 추가)
  },

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
    // Next.js 16: 기본 quality는 75로 변경됨
    // 프로젝트에서 사용 중인 quality 값들을 모두 포함
    qualities: [75, 80, 85, 90],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Next.js 16: 16px는 4.2%만 사용하므로 제거됨
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    // Next.js 16: 기본값이 4시간(14400초)으로 변경됨
    minimumCacheTTL: 14400,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
          // HSTS: HTTPS 강제 (Google Canonical 권장)
          { 
            key: 'Strict-Transport-Security', 
            value: 'max-age=63072000; includeSubDomains; preload' 
          },
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

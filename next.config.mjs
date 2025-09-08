const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 폰트 최적화 설정
  optimizeFonts: true,
  // 정적 자산 최적화
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 개발 서버 설정
  devIndicators: {
    buildActivity: false,
  },
}

export default nextConfig

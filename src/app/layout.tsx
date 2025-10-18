import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/query-provider"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { KakaoConsultationButton } from "@/components/shared/kakao-consultation-button"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { GTMDebug } from "@/components/analytics/gtm-debug"

// BottomNav가 usePathname을 사용하므로 동적 렌더링 필요
export const dynamic = 'force-dynamic'

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true, // 실제로 사용되는 폰트이므로 preload 유지
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: "투어비스 셀렉트 | 프리미엄 호텔 & 리조트",
  description:
    "프리미엄 호텔 & 리조트를 특별한 혜택과 함께 만나보세요. 투어비스 셀렉트에서 최고의 여행 경험을 시작하세요.",
  generator: "v0.app",
  metadataBase: new URL('https://luxury-select.co.kr'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://luxury-select.co.kr',
    siteName: '투어비스 셀렉트',
    title: '투어비스 셀렉트',
    description: '프리미엄 호텔과 리조트를 특별한 혜택과 함께 만나보세요. 투어비스 셀렉트에서 최고의 여행 경험을 시작하세요.',
    images: [
      {
        url: '/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@selecthotels',
    creator: '@selecthotels',
    title: '투어비스 셀렉트',
    description: '프리미엄 호텔과 리조트를 특별한 혜택과 함께 만나보세요. 투어비스 셀렉트에서 최고의 여행 경험을 시작하세요.',
    images: ['/select_logo.avif'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-W4D9SSJB');
            `,
          }}
        />
        
        {/* DNS Prefetch & Preconnect for critical resources */}
        <link rel="dns-prefetch" href="https://bnnuekzyfuvgeefmhmnp.supabase.co" />
        <link rel="preconnect" href="https://bnnuekzyfuvgeefmhmnp.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://t1.kakaocdn.net" />
        <link rel="preconnect" href="https://t1.kakaocdn.net" crossOrigin="anonymous" />
      </head>
      <body className="bg-background text-foreground antialiased pb-16 lg:pb-0" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-W4D9SSJB"
            height="0" 
            width="0" 
            style={{display: 'none', visibility: 'hidden'}}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        
        <AnalyticsProvider>
          <QueryProvider>
            <Suspense fallback={null}>
              <Header />
            </Suspense>
            <main className="pt-12 md:pt-16">
              {children}
            </main>
            <Suspense fallback={null}>
              <BottomNav />
            </Suspense>
            <Suspense fallback={null}>
              <KakaoConsultationButton />
            </Suspense>
          </QueryProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}

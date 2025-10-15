import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/query-provider"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/bottom-nav"
import { KakaoConsultationButton } from "@/components/shared/kakao-consultation-button"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"

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
  metadataBase: new URL('https://select-hotels.com'),
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://select-hotels.com',
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
    <html lang="ko" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        {/* DNS Prefetch & Preconnect for critical resources */}
        <link rel="dns-prefetch" href="https://bnnuekzyfuvgeefmhmnp.supabase.co" />
        <link rel="preconnect" href="https://bnnuekzyfuvgeefmhmnp.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://t1.kakaocdn.net" />
        <link rel="preconnect" href="https://t1.kakaocdn.net" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased pb-16 lg:pb-0">
        <AnalyticsProvider>
          <QueryProvider>
            <Header />
            <main className="pt-12 md:pt-16">
              {children}
            </main>
            <BottomNav />
            <KakaoConsultationButton />
          </QueryProvider>
        </AnalyticsProvider>
      </body>
    </html>
  )
}

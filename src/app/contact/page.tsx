import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactContent } from "./contact-content"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: "문의하기 | 투어비스 셀렉트",
  description: "럭셔리 호텔 예약 문의, 컨시어지 상담 문의를 카카오톡으로 편리하게 이용하세요. 전문 상담사가 신속하게 답변해드립니다.",
  keywords: [
    '호텔 문의',
    '컨시어지 상담',
    '카카오톡 상담',
    '투어비스 셀렉트 문의',
    '럭셔리 호텔 예약',
    '호텔 컨시어지',
    '프리미엄 호텔 상담'
  ],
  openGraph: {
    title: '문의하기 | 투어비스 셀렉트',
    description: '럭셔리 호텔 예약 문의, 컨시어지 상담 문의를 카카오톡으로 편리하게 이용하세요.',
    url: `${baseUrl}/contact`,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 문의하기'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '문의하기 | 투어비스 셀렉트',
    description: '럭셔리 호텔 예약 문의, 컨시어지 상담 문의를 카카오톡으로 편리하게 이용하세요.',
    images: [`${baseUrl}/select_logo.avif`]
  },
  alternates: {
    canonical: `${baseUrl}/contact`
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
  }
}

// ContactContent가 client component이므로 동적 렌더링
export const dynamic = 'force-dynamic'

export default function ContactPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // ContactPage Structured Data
  const contactPageData = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: '문의하기',
    description: '럭셔리 호텔 예약 문의, 컨시어지 상담 문의를 카카오톡으로 편리하게 이용하세요.',
    url: `${baseUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      url: baseUrl,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['ko', 'en'],
        url: 'https://pf.kakao.com/_cxmxgNG/chat'
      }
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '문의하기',
          item: `${baseUrl}/contact`
        }
      ]
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageData) }}
      />
      
      <Header />
      <ContactContent />
      <Footer />
    </div>
  )
}



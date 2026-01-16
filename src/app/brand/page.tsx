import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { BrandProgramPage } from "@/features/brands/brand-program-page"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '브랜드 & 프로그램 | 투어비스 셀렉트',
  description: '투어비스 셀렉트와 함께하는 글로벌 럭셔리 호텔 브랜드들을 만나보세요. Virtuoso, 하얏트 프리베, IHG, 샹그릴라 서클 등 최고의 호텔 체인과의 공식 파트너십을 통해 특별한 혜택을 제공합니다.',
  openGraph: {
    title: '브랜드 & 프로그램 | 투어비스 셀렉트',
    description: '투어비스 셀렉트와 함께하는 글로벌 럭셔리 호텔 브랜드들을 만나보세요. Virtuoso, 하얏트 프리베, IHG, 샹그릴라 서클 등 최고의 호텔 체인과의 공식 파트너십을 통해 특별한 혜택을 제공합니다.',
    url: `${baseUrl}/brand`,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 브랜드 & 프로그램',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '브랜드 & 프로그램 | 투어비스 셀렉트',
    description: '투어비스 셀렉트와 함께하는 글로벌 럭셔리 호텔 브랜드들을 만나보세요. Virtuoso, 하얏트 프리베, IHG, 샹그릴라 서클 등 최고의 호텔 체인과의 공식 파트너십을 통해 특별한 혜택을 제공합니다.',
    images: [`${baseUrl}/select_logo.avif`],
  },
  alternates: {
    canonical: `${baseUrl}/brand`
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

export default async function BrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const { getCompanyFromServer } = await import('@/lib/company-filter')
  const company = searchParams ? await getCompanyFromServer(searchParams) : null
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* 프로모션 베너: 브랜드 페이지에서는 숨김 (나중에 사용 가능하도록 유지) */}
      <div className="hidden">
        <PromotionBanner />
      </div>
      <main>
        <BrandProgramPage company={company} />
      </main>
      <Footer />
    </div>
  )
}

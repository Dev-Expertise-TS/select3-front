import { Metadata } from 'next'
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { PromotionPageContent } from './promotion-content'

export const metadata: Metadata = {
  title: '프로모션 호텔 | 투어비스 셀렉트',
  description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요. 최고의 럭셔리 호텔과 리조트를 특별한 가격으로 예약하실 수 있습니다.',
  openGraph: {
    title: '프로모션 호텔 | 투어비스 셀렉트',
    description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요. 최고의 럭셔리 호텔과 리조트를 특별한 가격으로 예약하실 수 있습니다.',
    images: [
      {
        url: '/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 프로모션',
      },
    ],
  },
  twitter: {
    title: '프로모션 호텔 | 투어비스 셀렉트',
    description: '투어비스 셀렉트에서 진행 중인 특별한 호텔 프로모션을 만나보세요. 최고의 럭셔리 호텔과 리조트를 특별한 가격으로 예약하실 수 있습니다.',
    images: ['/select_logo.avif'],
  },
}

export default function PromotionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PromotionBanner />
      <PromotionPageContent />
      <Footer />
    </div>
  )
}

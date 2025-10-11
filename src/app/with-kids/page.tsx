import type { Metadata } from "next"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import WithKidsClient from "./with-kids-client"

export const metadata: Metadata = {
  title: "아이와 함께 떠나는 여행 | 투어비스 셀렉트",
  description: "키즈풀, 키즈 클럽, 베이비시팅 서비스까지 가족 여행에 어울리는 호텔 추천",
}

export default function WithKidsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PromotionBanner />

      <main>
        {/* Hero */}
        <section className="bg-white border-b">
          <div className="container mx-auto max-w-[1440px] px-4 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              아이와 함께 떠나는 여행
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              키즈풀, 키즈 클럽, 베이비시팅 서비스까지
              <br className="hidden sm:block" />
              가족 여행에 어울리는 호텔을 추천드려요
            </p>
          </div>
        </section>

        {/* 추천 호텔 리스트 */}
        <section className="py-6 sm:py-10">
          <div className="container mx-auto max-w-[1440px] px-4">
            <WithKidsClient />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}



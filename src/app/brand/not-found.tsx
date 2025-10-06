import Link from "next/link"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { PageBanner } from "@/components/shared/page-banner"

export default function BrandsNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PromotionBanner />
      <main>
        {/* Page Banner */}
        <PageBanner
          title="Brand & Program"
          subtitle="셀렉트에서 추천하는 최고의 브랜드와 프로그램"
        />

        {/* Not Found Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1440px] text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">브랜드 정보를 찾을 수 없습니다</h2>
              <p className="text-gray-600 mb-8">
                요청하신 브랜드 정보를 찾을 수 없습니다. 
                잠시 후 다시 시도하거나 다른 브랜드를 둘러보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/brand" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  브랜드 목록으로 돌아가기
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-300"
                >
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

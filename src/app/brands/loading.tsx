import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import { PageBanner } from "@/components/shared/page-banner"

export default function BrandsLoading() {
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

        {/* Loading Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-[1440px]">
            <div className="text-center mb-12">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-xl aspect-[4/3] mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
                </div>
              ))}
            </div>

            {/* Loading Additional Information */}
            <div className="mt-16 text-center">
              <div className="max-w-3xl mx-auto">
                <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse" />
                <div className="grid md:grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="text-center animate-pulse">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
                      <div className="h-5 bg-gray-200 rounded w-32 mx-auto mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-40 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

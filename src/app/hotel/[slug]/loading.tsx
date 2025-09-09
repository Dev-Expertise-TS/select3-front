import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"

export default function HotelDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
          {/* 호텔 정보 로딩 스켈레톤 */}
          <div className="animate-pulse">
            {/* 호텔 이미지 로딩 */}
            <div className="mb-8">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-24 h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            {/* 호텔 기본 정보 로딩 */}
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-6 h-6 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            {/* 탭 로딩 */}
            <div className="mb-8">
              <div className="flex gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>

            {/* 검색 폼 로딩 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

import { Metadata } from 'next'
import { getAllBrandsWithHotelCount } from './all-brands-server'
import { BrandMosaicCard } from './components/brand-mosaic-card'

export const metadata: Metadata = {
  title: '럭셔리 호텔 브랜드 | 투어비스 셀렉트',
  description: '세계 최고의 럭셔리 호텔 브랜드를 한눈에 만나보세요. 프리미엄 호텔 예약의 새로운 기준, 투어비스 셀렉트.',
  openGraph: {
    title: '럭셔리 호텔 브랜드 | 투어비스 셀렉트',
    description: '세계 최고의 럭셔리 호텔 브랜드를 한눈에 만나보세요.',
    url: 'https://luxury-select.co.kr/hotel/brand',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/hotel/brand'
  }
}

export default async function AllBrandsPage() {
  const brands = await getAllBrandsWithHotelCount()
  
  // 알파벳 순 정렬
  const sortedBrands = [...brands].sort((a, b) => {
    const nameA = (a.brand_name_en || a.brand_name_ko || '').toLowerCase()
    const nameB = (b.brand_name_en || b.brand_name_ko || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })

  return (
    <div className="min-h-screen bg-black">
      {/* 중앙 타이틀 오버레이 */}
      <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="text-center">
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-[0.3em] uppercase"
            style={{ 
              textShadow: '0 4px 20px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9)',
              letterSpacing: '0.3em'
            }}
          >
            TOURVIS SELECT
          </h1>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-white/40"></div>
            <p 
              className="text-lg md:text-xl text-white/90 tracking-[0.2em] uppercase font-light"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}
            >
              Official Partners
            </p>
            <div className="h-px w-16 bg-white/40"></div>
          </div>
        </div>
      </div>

      {/* 브랜드 모자이크 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
        {sortedBrands.map((brand) => (
          <BrandMosaicCard
            key={brand.brand_id}
            brand={brand}
          />
        ))}
      </div>

      {/* Empty State */}
      {brands.length === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="mb-2 text-xl font-semibold">
              브랜드가 없습니다
            </h3>
            <p className="text-white/70">
              현재 등록된 브랜드가 없습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


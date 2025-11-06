interface BrandHeroSectionProps {
  brand: {
    brand_id: number
    brand_name_en: string
    brand_name_ko?: string | null
    brand_slug: string
    brand_description?: string | null
    brand_description_ko?: string | null
  }
  hotelCount: number
  articleCount: number
}

export function BrandHeroSection({ brand, hotelCount, articleCount }: BrandHeroSectionProps) {
  const brandName = brand.brand_name_ko || brand.brand_name_en
  const brandDescription = brand.brand_description_ko || brand.brand_description || 
    `${brandName}는 전 세계에서 가장 럭셔리한 호텔 브랜드 중 하나로, 최고급 서비스와 독특한 경험을 제공합니다.`

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="container mx-auto max-w-[1200px] px-6 py-16 md:py-24">
        {/* 카테고리 태그 */}
        <div className="mb-8">
          <span className="inline-block text-xs font-medium text-gray-500 uppercase tracking-[0.2em]">
            LUXURY HOTELS
          </span>
        </div>
        
        {/* 브랜드명 */}
        <div className="mb-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-normal text-gray-900 mb-6 leading-[1.1] tracking-tight">
            {brand.brand_name_ko || brand.brand_name_en}
          </h1>
          {brand.brand_name_ko && (
            <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
              {brand.brand_name_en}
            </p>
          )}
        </div>
        
        {/* 메타 정보 */}
        <div className="flex items-center gap-6 mb-10 text-sm text-gray-500">
          <span>{hotelCount}개 호텔</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{articleCount}개 아티클</span>
        </div>
        
        {/* 브랜드 설명 */}
        <div className="max-w-3xl">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light">
            {brandDescription}
          </p>
        </div>
      </div>
    </section>
  )
}


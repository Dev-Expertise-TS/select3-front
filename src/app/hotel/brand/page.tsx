import { Metadata } from 'next'
import { getAllBrandsWithHotelCount } from './all-brands-server'
import { BrandMosaicCard } from './components/brand-mosaic-card'

export const metadata: Metadata = {
  title: '럭셔리 호텔 브랜드 전체 목록 | 투어비스 셀렉트',
  description: '세계 최고의 럭셔리 호텔 브랜드를 한눈에 만나보세요. Marriott, Hyatt, Hilton, IHG 등 프리미엄 호텔 브랜드별 전문 컨시어지 서비스. 투어비스 셀렉트.',
  keywords: [
    '럭셔리 호텔 브랜드',
    '프리미엄 호텔',
    '호텔 브랜드',
    '특급 호텔',
    'Marriott',
    'Hyatt',
    'Hilton',
    'IHG',
    'Accor',
    '호텔 컨시어지',
    '투어비스 셀렉트'
  ],
  openGraph: {
    title: '럭셔리 호텔 브랜드 전체 목록 | 투어비스 셀렉트',
    description: '세계 최고의 럭셔리 호텔 브랜드를 한눈에 만나보세요. 전문 컨시어지 서비스.',
    url: 'https://luxury-select.co.kr/hotel/brand',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://luxury-select.co.kr/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 럭셔리 호텔 브랜드'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '럭셔리 호텔 브랜드 전체 목록 | 투어비스 셀렉트',
    description: '세계 최고의 럭셔리 호텔 브랜드를 한눈에 만나보세요.',
    images: ['https://luxury-select.co.kr/select_logo.avif']
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/hotel/brand'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export default async function AllBrandsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // company 파라미터 추출 (쿠키 우선, 없으면 searchParams)
  const { getCompanyFromServer } = await import('@/lib/company-filter')
  const company = searchParams ? await getCompanyFromServer(searchParams) : null
  
  const brands = await getAllBrandsWithHotelCount(company)
  
  // 알파벳 순 정렬
  const sortedBrands = [...brands].sort((a, b) => {
    const nameA = (a.brand_name_en || a.brand_name_ko || '').toLowerCase()
    const nameB = (b.brand_name_en || b.brand_name_ko || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })

  // Structured Data (JSON-LD) 생성
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '럭셔리 호텔 브랜드 목록',
    description: '세계 최고의 럭셔리 호텔 브랜드를 한눈에 만나보세요.',
    url: `${baseUrl}/hotel/brand`,
    mainEntity: {
      '@type': 'ItemList',
      name: '호텔 브랜드 목록',
      numberOfItems: brands.length,
      itemListElement: sortedBrands.map((brand, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Brand',
          name: brand.brand_name_en || brand.brand_name_ko,
          url: `${baseUrl}/hotel/brand/${brand.brand_slug}`,
          alternateName: brand.brand_name_ko
        }
      }))
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
          name: '호텔',
          item: `${baseUrl}/hotel`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: '브랜드',
          item: `${baseUrl}/hotel/brand`
        }
      ]
    },
    provider: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      url: baseUrl,
      logo: `${baseUrl}/select_logo.avif`
    }
  }

  return (
    <main className="min-h-screen bg-black">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0" aria-label="호텔 브랜드 목록">
        {sortedBrands.map((brand) => (
          <BrandMosaicCard
            key={brand.brand_id}
            brand={brand}
          />
        ))}
      </section>

      {/* Empty State */}
      {brands.length === 0 && (
        <section className="min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="mb-2 text-xl font-semibold">
              브랜드가 없습니다
            </h2>
            <p className="text-white/70">
              현재 등록된 브랜드가 없습니다.
            </p>
          </div>
        </section>
      )}
    </main>
  )
}


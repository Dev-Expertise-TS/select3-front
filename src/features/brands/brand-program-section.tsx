import Link from "next/link"
import { BrandCard } from "@/components/shared/brand-card"
import { withCompanyParam } from "@/lib/url-utils"

interface HotelChain {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string
  slug: string
  logo_path?: string
}

// 호텔 체인 데이터 조회 (Server-side)
async function getHotelChains() {
  // DB hotel_chains 테이블과 일치하는 slug 사용 (logo_path는 기존 이미지 유지)
  const brandCards: HotelChain[] = [
    { chain_id: 1, chain_name_en: 'Accor Hotels', chain_name_kr: '아코르 호텔 그룹', slug: 'accor', logo_path: '/brand-image/accor.avif' },
    { chain_id: 2, chain_name_en: 'Marriott International', chain_name_kr: '메리어트 인터내셔널', slug: 'marriott', logo_path: '/brand-image/marriott.avif' },
    { chain_id: 3, chain_name_en: 'Hilton', chain_name_kr: '힐튼', slug: 'hilton', logo_path: '/brand-image/hilton.avif' },
    { chain_id: 4, chain_name_en: 'InterContinental Hotels Group (IHG)', chain_name_kr: '인터컨티넨탈 호텔 그룹', slug: 'ihg', logo_path: '/brand-image/ihg.avif' },
    { chain_id: 8, chain_name_en: 'Aman Resorts International', chain_name_kr: '아만 리조트 인터네셔널', slug: 'aman', logo_path: '/brand-image/aman.avif' },
    { chain_id: 11, chain_name_en: 'Mandarin Oriental Hotel Group', chain_name_kr: '만다린 오리엔탈 호텔 그룹', slug: 'mandarin-oriental', logo_path: '/brand-image/mandarin.avif' },
    { chain_id: 12, chain_name_en: 'Shangri-La Hotels and Resorts', chain_name_kr: '샹그릴라 호텔 & 리조트', slug: 'shangri-la', logo_path: '/brand-image/shangri-la.avif' },
    { chain_id: 16, chain_name_en: 'Capella Hotel Group', chain_name_kr: '카펠라 호텔 그룹', slug: 'capella', logo_path: '/brand-image/capella.avif' },
    { chain_id: 18, chain_name_en: 'Hyatt Hotels Corporation', chain_name_kr: '하얏트 호텔 그룹', slug: 'hyatt', logo_path: '/brand-image/hyatt.avif' },
    { chain_id: 20, chain_name_en: 'Heavens Portfolio', chain_name_kr: '헤븐스 포트폴리오', slug: 'heavens-portfolio', logo_path: '/brand-image/heavens-portfolio.avif' },
    { chain_id: 21, chain_name_en: 'LHW VITA', chain_name_kr: 'LHW VITA', slug: 'lhw-vita', logo_path: '/brand-image/lhw-vita.avif' },
    { chain_id: 22, chain_name_en: 'Pan Pacific', chain_name_kr: '팬 퍼시픽', slug: 'pan-pacific', logo_path: '/brand-image/pacific.avif' },
    { chain_id: 23, chain_name_en: 'Preferred Hotels & Resorts', chain_name_kr: '프리퍼드 호텔 & 리조트', slug: 'preferred-hotels-resorts', logo_path: '/brand-image/preferred-hotels-resorts.avif' },
    { chain_id: 24, chain_name_en: 'Virtuoso', chain_name_kr: '버추오소', slug: 'virtuoso', logo_path: '/brand-image/virtuoso.avif' },
    { chain_id: 25, chain_name_en: 'Melia', chain_name_kr: '멜리아', slug: 'melia', logo_path: '/brand-image/melia.avif' },
  ]
  
  return brandCards
}

export async function BrandProgramSection({ company }: { company?: string | null }) {
  const chains = await getHotelChains()
  
  // company=sk일 때 특정 브랜드만 노출
  let filteredChains = chains
  if (company === 'sk') {
    const allowedSlugs = ['accor', 'aman', 'hilton', 'preferred-hotels-resorts', 'hyatt']
    filteredChains = chains.filter(chain => allowedSlugs.includes(chain.slug))
  } else {
    // 특정 브랜드 숨기기: marriott, platinum
    filteredChains = chains.filter(
      chain => chain.slug !== 'marriott' && chain.slug !== 'platinum'
    )
  }
  
  // 아만 리조트 인터네셔널을 첫번째로 정렬
  const sortedChains = [...filteredChains].sort((a, b) => {
    if (a.slug === 'aman') return -1
    if (b.slug === 'aman') return 1
    return 0
  })
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-[1440px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brand & Program</h2>
          <p className="text-lg text-gray-600 mb-6">셀렉트와 함께하는 글로벌 Top 호텔 체인 & 브랜드</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-6">
          {sortedChains.map((chain) => (
            <BrandCard
              key={chain.chain_id}
              chainId={chain.chain_id}
              chainName={chain.chain_name_en}
              chainNameKr={chain.chain_name_kr}
              slug={chain.slug}
              logoPath={chain.logo_path || "/placeholder.svg"}
            />
          ))}
        </div>

        {/* 더 보기 버튼 */}
        <div className="text-center mt-8">
          <Link
            href={withCompanyParam("/brand")}
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            브랜드 더 보기
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

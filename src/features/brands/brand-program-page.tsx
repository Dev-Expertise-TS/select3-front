import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { isCompanyWithVccFilter } from "@/lib/company-filter"
import { withCompanyParam } from "@/lib/url-utils"

interface HotelChain {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string
  chain_slug: string
  logo_path?: string
}

async function getHotelChains() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr, chain_slug')
    .order('chain_name_en')

  // 임시로 fallback 데이터만 사용 (이미지 경로 문제 해결용)
  if (true || error || !data) {
    console.warn('[ Server ] 호텔 체인 조회 실패 또는 빈 결과. 로컬 폴백을 사용합니다.')
    // 실제 이미지 파일이 있는 브랜드만 포함 (파일명 기준)
    const fallback: HotelChain[] = [
      { chain_id: 1, chain_name_en: 'Accor Hotels', chain_name_kr: '아코르 호텔 그룹', chain_slug: 'accor', logo_path: '/brand-image/accor.avif' },
      { chain_id: 8, chain_name_en: 'Aman Resorts International', chain_name_kr: '아만 리조트 인터네셔널', chain_slug: 'aman', logo_path: '/brand-image/aman.avif' },
      { chain_id: 16, chain_name_en: 'Capella Hotel Group', chain_name_kr: '카펠라 호텔 그룹', chain_slug: 'capella', logo_path: '/brand-image/capella.avif' },
      { chain_id: 20, chain_name_en: 'Heavens Portfolio', chain_name_kr: '헤븐스 포트폴리오', chain_slug: 'heavens-portfolio', logo_path: '/brand-image/heavens-portfolio.avif' },
      { chain_id: 3, chain_name_en: 'Hilton', chain_name_kr: '힐튼', chain_slug: 'hilton', logo_path: '/brand-image/hilton.avif' },
      { chain_id: 18, chain_name_en: 'Hyatt Hotels Corporation', chain_name_kr: '하얏트 호텔 그룹', chain_slug: 'hyatt', logo_path: '/brand-image/hyatt.avif' },
      { chain_id: 4, chain_name_en: 'InterContinental Hotels Group (IHG)', chain_name_kr: '인터컨티넨탈 호텔 그룹', chain_slug: 'ihg', logo_path: '/brand-image/ihg.avif' },
      { chain_id: 21, chain_name_en: 'LHW VITA', chain_name_kr: 'LHW VITA', chain_slug: 'lhw-vita', logo_path: '/brand-image/lhw-vita.avif' },
      { chain_id: 11, chain_name_en: 'Mandarin Oriental Hotel Group', chain_name_kr: '만다린 오리엔탈 호텔 그룹', chain_slug: 'mandarin-oriental', logo_path: '/brand-image/mandarin.avif' },
      { chain_id: 2, chain_name_en: 'Marriott International', chain_name_kr: '메리어트 인터내셔널', chain_slug: 'marriott', logo_path: '/brand-image/marriott.avif' },
      { chain_id: 25, chain_name_en: 'Melia', chain_name_kr: '멜리아', chain_slug: 'melia', logo_path: '/brand-image/melia.avif' },
      { chain_id: 22, chain_name_en: 'Pan Pacific', chain_name_kr: '팬 퍼시픽', chain_slug: 'pan-pacific', logo_path: '/brand-image/pacific.avif' },
      { chain_id: 23, chain_name_en: 'Preferred Hotels & Resorts', chain_name_kr: '프리퍼드 호텔 & 리조트', chain_slug: 'preferred-hotels-resorts', logo_path: '/brand-image/preferred-hotels-resorts.avif' },
      { chain_id: 26, chain_name_en: 'Platinum', chain_name_kr: '플래티넘', chain_slug: 'platinum', logo_path: '/brand-image/platinum.avif' },
      { chain_id: 12, chain_name_en: 'Shangri-La Hotels and Resorts', chain_name_kr: '샹그릴라 호텔 & 리조트', chain_slug: 'shangri-la', logo_path: '/brand-image/shangri-la.avif' },
      { chain_id: 24, chain_name_en: 'Virtuoso', chain_name_kr: '버추오소', chain_slug: 'virtuoso', logo_path: '/brand-image/virtuoso.avif' },
    ]
    return fallback
  }

  // logo_path 매핑 (실제 이미지 파일이 있는 브랜드만 포함)
  const logoMap: Record<string, string> = {
    'accor': '/brand-image/accor.avif',
    'aman': '/brand-image/aman.avif',
    'capella': '/brand-image/capella.avif',
    'heavens-portfolio': '/brand-image/heavens-portfolio.avif',
    'hilton': '/brand-image/hilton.avif',
    'hyatt': '/brand-image/hyatt.avif',
    'ihg': '/brand-image/ihg.avif',
    'lhw-vita': '/brand-image/lhw-vita.avif',
    'mandarin-oriental': '/brand-image/mandarin.avif',
    'marriott': '/brand-image/marriott.avif',
    'melia': '/brand-image/melia.avif',
    'pan-pacific': '/brand-image/pacific.avif',
    'preferred-hotels-resorts': '/brand-image/preferred-hotels-resorts.avif',
    'platinum': '/brand-image/platinum.avif',
    'shangri-la': '/brand-image/shangri-la.avif',
    'virtuoso': '/brand-image/virtuoso.avif',
  }

  // 이미지 파일이 있는 브랜드만 필터링
  return data
    .map(chain => ({
      ...chain,
      logo_path: logoMap[chain.chain_slug]
    }))
    .filter(chain => chain.logo_path) // logo_path가 있는 브랜드만
}

export async function BrandProgramPage({ company }: { company?: string | null }) {
  const chains = await getHotelChains()
  
  // vcc 필터 적용 company일 때 특정 브랜드만 노출 (설정: config/company.ts)
  let filteredChains = chains
  if (isCompanyWithVccFilter(company)) {
    const allowedSlugs = ['accor', 'aman', 'hilton', 'preferred-hotels-resorts', 'hyatt']
    filteredChains = chains.filter(chain => allowedSlugs.includes(chain.chain_slug))
  } else {
    // 특정 브랜드 숨기기: marriott, platinum
    filteredChains = chains.filter(
      chain => chain.chain_slug !== 'marriott' && chain.chain_slug !== 'platinum'
    )
  }
  
  return (
    <>
      {/* Main Content */}
      <section className="py-8 pb-[100px] bg-white">
        <div className="container mx-auto px-4 max-w-[1440px]">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">Premium Brand & Benefit</h2>
            <p className="text-base text-gray-600">
              <span className="hidden sm:inline">투어비스 셀렉트와 제휴된 프리미엄 호텔 브랜드와 혜택을 경험해 보세요.</span>
              <span className="sm:hidden">
                투어비스 셀렉트와 제휴된 <br />
                프리미엄 호텔 브랜드와 혜택을 경험해 보세요.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredChains.map((chain) => (
              <Link key={chain.chain_id} href={withCompanyParam(`/brand/${chain.chain_slug}`)}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden aspect-[4/3] relative border border-gray-100">
                  <Image
                    src={chain.logo_path || "/placeholder.svg"}
                    alt={chain.chain_name_en}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 20vw"
                    className="object-contain p-4 transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {chain.chain_name_en}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* 더 많은 브랜드 보기 버튼 (SK인 경우 숨김) */}
          {!isCompanyWithVccFilter(company) && (
            <div className="text-center mt-8">
              <Link
                href="/hotel/brand"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                더 많은 브랜드 보기
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { PageBanner } from "@/components/shared/page-banner"

interface HotelChain {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string
  slug: string
  logo_path?: string
}

async function getHotelChains() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr, slug')
    .order('chain_name_en')

  if (error || !data) {
    console.warn('[ Server ] 호텔 체인 조회 실패 또는 빈 결과. 로컬 폴백을 사용합니다.')
    const fallback: HotelChain[] = [
      { chain_id: 1, chain_name_en: 'Accor Hotels', chain_name_kr: '아코르 호텔 그룹', slug: 'accor', logo_path: '/brand-image/accor.avif' },
      { chain_id: 2, chain_name_en: 'Marriott International', chain_name_kr: '메리어트 인터내셔널', slug: 'marriott', logo_path: '/brand-image/marriott.avif' },
      { chain_id: 3, chain_name_en: 'Hilton', chain_name_kr: '힐튼', slug: 'hilton', logo_path: '/brand-image/hilton.avif' },
      { chain_id: 4, chain_name_en: 'InterContinental Hotels Group (IHG)', chain_name_kr: '인터컨티넨탈 호텔 그룹', slug: 'ihg', logo_path: '/brand-image/ihg.avif' },
      { chain_id: 5, chain_name_en: 'Wyndham Hotels & Resorts', chain_name_kr: '윈덤 호텔 & 리조트', slug: 'wyndham-hotels-resorts', logo_path: '/placeholder.svg' },
      { chain_id: 6, chain_name_en: 'Radisson Hotel Group', chain_name_kr: '래디슨 호텔 그룹', slug: 'radisson-hotel-group', logo_path: '/placeholder.svg' },
      { chain_id: 7, chain_name_en: 'Global Hotel Alliance', chain_name_kr: '글로벌 호텔 얼라이언스', slug: 'global-hotel-alliance', logo_path: '/placeholder.svg' },
      { chain_id: 8, chain_name_en: 'Aman Resorts International', chain_name_kr: '아만 리조트 인터네셔널', slug: 'aman', logo_path: '/brand-image/aman.avif' },
      { chain_id: 9, chain_name_en: 'Four Seasons Hotels and Resorts', chain_name_kr: '포시즌스 호텔 & 리조트', slug: 'four-seasons-hotels-and-resorts', logo_path: '/placeholder.svg' },
      { chain_id: 10, chain_name_en: 'The Ritz-Carlton Hotel Company', chain_name_kr: '리츠칼튼 호텔', slug: 'the-ritz-carlton-hotel-company', logo_path: '/placeholder.svg' },
      { chain_id: 11, chain_name_en: 'Mandarin Oriental Hotel Group', chain_name_kr: '만다린 오리엔탈 호텔 그룹', slug: 'mandarin-oriental', logo_path: '/brand-image/mandarin.avif' },
      { chain_id: 12, chain_name_en: 'Shangri-La Hotels and Resorts', chain_name_kr: '샹그릴라 호텔 & 리조트', slug: 'shangri-la', logo_path: '/brand-image/shangri-la.avif' },
      { chain_id: 13, chain_name_en: 'Kempinski Hotels', chain_name_kr: '켐핀스키 호텔', slug: 'kempinski-hotels', logo_path: '/placeholder.svg' },
      { chain_id: 14, chain_name_en: 'Fairmont Hotels & Resorts', chain_name_kr: '페어몬트 호텔 & 리조트', slug: 'fairmont-hotels-resorts', logo_path: '/placeholder.svg' },
      { chain_id: 15, chain_name_en: 'Sofitel Hotels & Resorts', chain_name_kr: '소피텔 호텔 & 리조트', slug: 'sofitel-hotels-resorts', logo_path: '/placeholder.svg' },
      { chain_id: 16, chain_name_en: 'Capella Hotel Group', chain_name_kr: '카펠라 호텔 그룹', slug: 'capella', logo_path: '/brand-image/capella.avif' },
      { chain_id: 17, chain_name_en: 'The Peninsula Hotels', chain_name_kr: '페닌슐라 호텔', slug: 'the-peninsula-hotels', logo_path: '/placeholder.svg' },
      { chain_id: 18, chain_name_en: 'Hyatt Hotels Corporation', chain_name_kr: '하얏트 호텔 그룹', slug: 'hyatt', logo_path: '/brand-image/hyatt.avif' },
      { chain_id: 20, chain_name_en: 'Heavens Portfolio', chain_name_kr: '헤븐스 포트폴리오', slug: 'heavens-portfolio', logo_path: '/brand-image/heavens-portfolio.avif' },
      { chain_id: 21, chain_name_en: 'LHW VITA', chain_name_kr: 'LHW VITA', slug: 'lhw-vita', logo_path: '/brand-image/LW.avif' },
      { chain_id: 22, chain_name_en: 'Pan Pacific', chain_name_kr: '팬 퍼시픽', slug: 'pacific', logo_path: '/brand-image/pan-pacific.avif' },
      { chain_id: 23, chain_name_en: 'Preferred Hotels & Resorts', chain_name_kr: '프리퍼드 호텔 & 리조트', slug: 'preferred-hotels-resorts', logo_path: '/brand-image/platinum.avif' },
      { chain_id: 24, chain_name_en: 'Virtuoso', chain_name_kr: '버추오소', slug: 'virtuoso', logo_path: '/brand-image/virtuoso.avif' },
      { chain_id: 25, chain_name_en: 'Melia', chain_name_kr: '멜리아', slug: 'melia', logo_path: '/brand-image/bravos.avif' },
    ]
    return fallback
  }

  // logo_path 매핑 (DB에 없으므로 slug 기반으로 매핑)
  const logoMap: Record<string, string> = {
    'accor': '/brand-image/accor.avif',
    'marriott': '/brand-image/marriott.avif',
    'hilton': '/brand-image/hilton.avif',
    'ihg': '/brand-image/ihg.avif',
    'aman': '/brand-image/aman.avif',
    'mandarin-oriental': '/brand-image/mandarin.avif',
    'shangri-la': '/brand-image/shangri-la.avif',
    'capella': '/brand-image/capella.avif',
    'hyatt': '/brand-image/hyatt.avif',
    'heavens-portfolio': '/brand-image/heavens-portfolio.avif',
    'lhw-vita': '/brand-image/LW.avif',
    'pacific': '/brand-image/pan-pacific.avif',
    'preferred-hotels-resorts': '/brand-image/platinum.avif',
    'virtuoso': '/brand-image/virtuoso.avif',
    'melia': '/brand-image/bravos.avif',
  }

  return data.map(chain => ({
    ...chain,
    logo_path: logoMap[chain.slug] || '/placeholder.svg'
  }))
}

export async function BrandProgramPage() {
  const chains = await getHotelChains()
  
  return (
    <>
      {/* Page Banner */}
      <PageBanner
        title="Brand & Program"
        subtitle="셀렉트에서 추천하는 최고의 브랜드와 프로그램"
      />

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-[1440px]">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">Premium Hotel Brands</h2>
            <p className="text-base text-gray-600">각 브랜드의 고유한 특성과 서비스를 경험해보세요</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {chains.map((chain) => (
              <Link key={chain.chain_id} href={`/brand/${chain.slug}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer overflow-hidden aspect-[4/3] relative border border-gray-100">
                  <Image
                    src={chain.logo_path || "/placeholder.svg"}
                    alt={chain.chain_name_en}
                    fill
                    className="object-contain p-4 transition-all duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {chain.chain_name_en}
                  </h3>
                  {chain.chain_name_kr && (
                    <p className="text-xs text-gray-500 mt-1">{chain.chain_name_kr}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose Select Brands?</h3>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Premium Quality</h4>
                  <p className="text-sm text-gray-600">세계적으로 인정받는 최고 품질의 호텔 브랜드</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Exclusive Benefits</h4>
                  <p className="text-sm text-gray-600">셀렉트만의 독점적인 혜택과 특별 서비스</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Personalized Service</h4>
                  <p className="text-sm text-gray-600">개인 맞춤형 서비스와 VIP 대우</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

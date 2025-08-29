import Image from "next/image"
import Link from "next/link"

interface HotelChain {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string
  slug: string
  logo_path?: string
}

// slug 컬럼을 사용하므로 alias 매핑이 필요 없음
// function toSlug(name: string) {
//   const alias: Record<string, string> = {
//     'Aman Resorts': 'aman-resorts-international',
//     'Hyatt Hotels Corporation': 'hyatt-hotels',
//     'Hilton Hotels & Resorts (Hilton Worldwide Holdings Inc.)': 'hilton-worldwide',
//     'Marriott International': 'marriott-international',
//     'Accor Hotels': 'accor-hotels',
//     'InterContinental Hotels Group (IHG)': 'ihg-hotels',
//     'Wyndham Hotels & Resorts': 'wyndham-hotels',
//     'Radisson Hotel Group': 'radisson-hotels',
//     'Four Seasons Hotels & Resorts': 'four-seasons',
//     'The Ritz-Carlton Hotel Company': 'ritz-carlton',
//     'Mandarin Oriental Hotel Group': 'mandarin-oriental',
//     'Shangri-La Hotels & Resorts': 'shangri-la',
//     'Kempinski Hotels': 'kempinski',
//     'Fairmont Hotels & Resorts': 'fairmont-hotels',
//     'Sofitel Hotels & Resorts': 'sofitel-hotels',
//     'Capella Hotel Group': 'capella-hotels',
//     'The Peninsula Hotels': 'peninsula-hotels',
//   }
//   if (alias[name]) return alias[name]
//   return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
// }

async function getHotelChains() {
  // /public/brand-image 폴더의 이미지들을 사용하여 브랜드 카드 구성
  const brandCards: HotelChain[] = [
    { chain_id: 1, chain_name_en: 'Marriott International', slug: 'marriott-international', logo_path: '/brand-image/marriott.avif' },
    { chain_id: 2, chain_name_en: 'Aman Resorts', slug: 'aman-resorts-international', logo_path: '/brand-image/aman.avif' },
    { chain_id: 3, chain_name_en: 'Hyatt Hotels', slug: 'hyatt-hotels-corporation', logo_path: '/brand-image/hyatt.avif' },
    { chain_id: 4, chain_name_en: 'IHG Hotels', slug: 'intercontinental-hotels-group-ihg', logo_path: '/brand-image/ihg.avif' },
    { chain_id: 5, chain_name_en: 'Accor Hotels', slug: 'accor-hotels', logo_path: '/brand-image/accor.avif' },
    { chain_id: 6, chain_name_en: 'Hilton Worldwide', slug: 'hilton-hotels-resorts-hilton-worldwide-holdings-inc', logo_path: '/brand-image/hilton.avif' },
    { chain_id: 7, chain_name_en: 'Shangri-La Hotels', slug: 'shangri-la-hotels-and-resorts', logo_path: '/brand-image/shangri-la.avif' },
    { chain_id: 8, chain_name_en: 'Mandarin Oriental', slug: 'mandarin-oriental', logo_path: '/brand-image/mandarin.avif' },
    { chain_id: 9, chain_name_en: 'Capella Hotels', slug: 'capella-hotels', logo_path: '/brand-image/capella.avif' },
    { chain_id: 10, chain_name_en: 'Pan Pacific', slug: 'pan-pacific', logo_path: '/brand-image/pan-pacific.avif' },
    { chain_id: 11, chain_name_en: 'Virtuoso', slug: 'virtuoso', logo_path: '/brand-image/virtuoso.avif' },
    { chain_id: 12, chain_name_en: 'Platinum', slug: 'platinum', logo_path: '/brand-image/platinum.avif' },
    { chain_id: 13, chain_name_en: 'Bravo', slug: 'bravos', logo_path: '/brand-image/bravos.avif' },
    { chain_id: 14, chain_name_en: 'Heavens Portfolio', slug: 'heavens-portfolio', logo_path: '/brand-image/heavens-portfolio.avif' },
    { chain_id: 15, chain_name_en: 'LW', slug: 'lw', logo_path: '/brand-image/LW.avif' },
  ]
  
  return brandCards
}

export async function BrandProgramSection() {
  const chains = await getHotelChains()
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-[1440px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brand & Program</h2>
          <p className="text-lg text-gray-600 mb-6">셀렉트와 함께하는 글로벌 Top 호텔 체인 & 브랜드</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
          {chains.map((chain) => (
            <Link key={chain.chain_id} href={`/chain/${chain.slug}`}>
              <div className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden aspect-[4/3] relative">
                <Image
                  src={chain.logo_path || "/placeholder.svg"}
                  alt={chain.chain_name_en}
                  fill
                  className="object-contain transition-all duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

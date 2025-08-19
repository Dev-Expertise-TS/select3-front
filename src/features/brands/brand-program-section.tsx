import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

interface HotelChain {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string
  logo_path?: string
}

// 체인명 → 슬러그 변환 (오버라이드 적용)
function toSlug(name: string) {
  const alias: Record<string, string> = {
    'Aman Resorts': 'aman-resorts-international',
    'Hyatt Hotels Corporation': 'hyatt-hotels',
  }
  if (alias[name]) return alias[name]
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

async function getHotelChains() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hotel_chains')
    .select('chain_id, chain_name_en, chain_name_kr, logo_path')
    .order('chain_name_en')

  if (error || !data) {
    console.warn('[ Server ] 호텔 체인 조회 실패 또는 빈 결과. 로컬 폴백을 사용합니다.')
    const fallback: HotelChain[] = [
      { chain_id: 1, chain_name_en: 'Marriott International', logo_path: '/brand-image/marriott.avif' },
      { chain_id: 2, chain_name_en: 'Aman Resorts', logo_path: '/brand-image/aman.avif' },
      { chain_id: 3, chain_name_en: 'Hyatt Hotels', logo_path: '/brand-image/hyatt.avif' },
      { chain_id: 4, chain_name_en: 'IHG Hotels', logo_path: '/brand-image/ihg.avif' },
      { chain_id: 5, chain_name_en: 'Accor Hotels', logo_path: '/brand-image/accor.avif' },
      { chain_id: 6, chain_name_en: 'Hilton Worldwide', logo_path: '/brand-image/hilton.avif' },
      { chain_id: 7, chain_name_en: 'Shangri-La Hotels', logo_path: '/brand-image/shangri-la.avif' },
    ]
    return fallback
  }

  return data
}

export async function BrandProgramSection() {
  const chains = await getHotelChains()
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brand & Program</h2>
          <p className="text-lg text-gray-600 mb-6">셀렉트에서 추천하는 최고의 브랜드와 프로그램</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
          {chains.map((chain) => (
            <Link key={chain.chain_id} href={`/chain/${toSlug(chain.chain_name_en)}`}>
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

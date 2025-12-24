import type { Metadata } from 'next'
import { resolveDestination } from '@/lib/regions/resolve-destination'
import { BaliHotelComparison } from '@/features/poi-hotels/components/bali-hotel-comparison'

export const revalidate = 0

export async function generateMetadata(props: {
  params: Promise<{ destination: string }>
}): Promise<Metadata> {
  const { destination } = await props.params
  const resolved = await resolveDestination(destination)
  return {
    title: `${resolved.label} 호텔 비교 | 투어비스 셀렉트`,
    description: `${resolved.label} 지역 호텔의 위치, 가격, 특징을 지도에서 한눈에 비교해보세요.`,
    alternates: {
      canonical: `https://luxury-select.co.kr/${encodeURIComponent(destination)}/hotels/map`,
    },
  }
}

export default async function DestinationHotelsMapPage(props: {
  params: Promise<{ destination: string }>
}) {
  const { destination } = await props.params
  const resolved = await resolveDestination(destination)

  return (
    <main className="pt-12 md:pt-16">
      <div className="container mx-auto max-w-[1440px] px-4 py-6">
            <BaliHotelComparison
              destinationRaw={destination}
              destinationLabel={resolved.label}
              destinationQueryText={resolved.queryText}
            />
      </div>
    </main>
  )
}



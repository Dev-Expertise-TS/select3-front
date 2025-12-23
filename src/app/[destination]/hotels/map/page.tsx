import type { Metadata } from 'next'
import { resolveDestination } from '@/lib/regions/resolve-destination'
import { PoiHotelsMapClient } from '@/features/poi-hotels/components/poi-hotels-map-client'

export const revalidate = 0

export async function generateMetadata(props: {
  params: Promise<{ destination: string }>
}): Promise<Metadata> {
  const { destination } = await props.params
  const resolved = await resolveDestination(destination)
  return {
    title: `${resolved.label} 호텔 지도 검색 | 투어비스 셀렉트`,
    description: `${resolved.label} 주변 호텔을 지도(POI) 기반으로 검색합니다.`,
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
        <PoiHotelsMapClient
          destinationRaw={destination}
          destinationLabel={resolved.label}
          destinationQueryText={resolved.queryText}
        />
      </div>
    </main>
  )
}



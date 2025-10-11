import { Suspense } from 'react'
import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { UnifiedSearchResults } from '@/features/search/unified-search-results'

export const metadata: Metadata = {
  title: '검색 | Select',
  description: '호텔/아티클 통합 검색 결과',
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <UnifiedSearchResults />
        </main>
        <Footer />
      </div>
    </Suspense>
  )
}



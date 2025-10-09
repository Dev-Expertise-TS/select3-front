import { Suspense } from "react"
import { HotelSearchResults } from "@/components/shared/hotel-search-results"

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <HotelSearchResults 
        title="호텔 검색 결과"
        subtitle="검색어에 맞는 호텔을 찾아보세요"
        showAllHotels={false}
      />
    </Suspense>
  )
}

import { HotelSearchResults } from "@/components/shared/hotel-search-results"

export default function SearchResultsPage() {
  return (
    <HotelSearchResults 
      title="호텔 검색 결과"
      subtitle="검색어에 맞는 호텔을 찾아보세요"
      showAllHotels={false}
    />
  )
}

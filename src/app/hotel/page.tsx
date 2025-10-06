import { HotelSearchResults } from "@/components/shared/hotel-search-results"

export default function AllHotelResortPage() {
  return (
    <HotelSearchResults 
      title="호텔 & 리조트 전체보기"
      subtitle="전 세계 프리미엄 호텔과 리조트를 모두 확인해보세요"
      showAllHotels={true}
      hideSearchBar={true}
      showFilters={true}
    />
  )
}

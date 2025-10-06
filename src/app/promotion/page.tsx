import { HotelSearchResults } from "@/components/shared/hotel-search-results"

export default function PromotionsPage() {
  return (
    <HotelSearchResults 
      title="프로모션"
      subtitle="지금 진행 중인 프로모션 혜택을 확인해보세요"
      showAllHotels={true}
      hideSearchBar={true}
      showFilters={true}
    />
  )
}


"use client"

import { useMemo } from "react"
import { HotelListSectionAllView } from "@/components/shared/hotel-list-section-all-view"
import { useAllHotels } from "@/hooks/use-hotel-queries"

// 간단한 키워드 프리필터: 'kids', 'family', 'child' 등의 키워드를 이름/설명에서 탐색
function useKidsFriendlyHotels(allHotels: any[] | undefined) {
  return useMemo(() => {
    if (!allHotels || allHotels.length === 0) return []
    const keywords = ["kids", "kid", "child", "children", "family", "families", "키즈", "패밀리", "가족"]
    const containsKeyword = (text: string) => keywords.some(k => text.toLowerCase().includes(k))

    return allHotels.filter((h: any) => {
      const name = `${h.property_name_en || ""} ${h.property_name_ko || ""}`.toLowerCase()
      const brand = `${h.brand_name_en || ""} ${h.brand_name_ko || ""}`.toLowerCase()
      const city = `${h.city_en || ""} ${h.city_ko || ""}`.toLowerCase()
      return containsKeyword(name) || containsKeyword(brand) || containsKeyword(city)
    })
  }, [allHotels])
}

export default function WithKidsClient() {
  const { data: allHotels, isLoading, error } = useAllHotels()
  const kidsHotels = useKidsFriendlyHotels(allHotels)

  return (
    <HotelListSectionAllView
      title="추천 호텔"
      subtitle={isLoading ? "로딩 중..." : kidsHotels?.length ? `${kidsHotels.length}개 호텔` : "추천 호텔을 준비 중입니다."}
      hotels={kidsHotels?.slice(0, 24) || []}
      isLoading={isLoading}
      error={error}
      hasMoreData={false}
      columns={4}
      variant="default"
      gap="lg"
      showBenefits={true}
      showRating={false}
      showPrice={false}
      showBadge={false}
      showPromotionBadge={false}
    />
  )
}



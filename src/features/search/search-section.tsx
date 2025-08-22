"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CommonSearchBar } from "@/features/search"

export function SearchSection() {
  const router = useRouter()
  const [searchDates, setSearchDates] = useState({
    checkIn: "",
    checkOut: ""
  })

  const handleSearch = (query: string, dates?: { checkIn: string; checkOut: string }) => {
    if (query.trim()) {
      // 검색 결과 페이지로 이동 (날짜 포함)
      const params = new URLSearchParams()
      params.set('q', query.trim())
      if (dates?.checkIn) params.set('checkIn', dates.checkIn)
      if (dates?.checkOut) params.set('checkOut', dates.checkOut)
      
      router.push(`/search-results?${params.toString()}`)
    }
  }

  const handleDatesChange = useCallback((dates: { checkIn: string; checkOut: string }) => {
    setSearchDates(dates)
  }, [])

  return (
    <section className="bg-gray-50 py-6">
      <div className="container mx-auto max-w-[1440px] px-4">
        <CommonSearchBar 
          variant="landing" 
          onSearch={handleSearch}
          onDatesChange={handleDatesChange}
          checkIn={searchDates.checkIn}
          checkOut={searchDates.checkOut}
        />
      </div>
    </section>
  )
}

"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CommonSearchBar } from "@/features/search"

export function SearchSection() {
  const router = useRouter()
  const [searchDates, setSearchDates] = useState(() => {
    const today = new Date()
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
    twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
    
    return {
      checkIn: twoWeeksLater.toISOString().split('T')[0],
      checkOut: twoWeeksLaterPlusOne.toISOString().split('T')[0]
    }
  })
  const [searchGuests, setSearchGuests] = useState({
    rooms: 1,
    adults: 2,
    children: 0
  })

  const handleSearch = (query: string, dates?: { checkIn: string; checkOut: string }, guests?: { rooms: number; adults: number; children: number }) => {
    if (query.trim()) {
      // 검색 결과 페이지로 이동 (날짜 및 게스트 정보 포함)
      const params = new URLSearchParams()
      params.set('q', query.trim())
      if (dates?.checkIn) params.set('checkIn', dates.checkIn)
      if (dates?.checkOut) params.set('checkOut', dates.checkOut)
      if (guests) {
        params.set('rooms', guests.rooms.toString())
        params.set('adults', guests.adults.toString())
        params.set('children', guests.children.toString())
      }
      
      router.push(`/search-results?${params.toString()}`)
    }
  }

  const handleDatesChange = useCallback((dates: { checkIn: string; checkOut: string }) => {
    setSearchDates(dates)
  }, [])

  const handleGuestsChange = useCallback((guests: { rooms: number; adults: number; children: number }) => {
    setSearchGuests(guests)
  }, [])

  return (
    <section className="bg-gray-50 py-6">
      <div className="container mx-auto max-w-[1440px] px-4">
        <CommonSearchBar 
          variant="landing" 
          onSearch={handleSearch}
          onDatesChange={handleDatesChange}
          onGuestsChange={handleGuestsChange}
          checkIn={searchDates.checkIn}
          checkOut={searchDates.checkOut}
          guests={searchGuests}
        />
      </div>
    </section>
  )
}

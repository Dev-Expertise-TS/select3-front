"use client"

import { useState, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { CommonSearchBar } from "@/features/search"

export function SearchSection() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchDates, setSearchDates] = useState(() => {
    const today = new Date()
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
    twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
    
    // 로컬 시간 기준으로 날짜 문자열 생성
    const formatDateToLocalString = (date: Date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      checkIn: formatDateToLocalString(twoWeeksLater),
      checkOut: formatDateToLocalString(twoWeeksLaterPlusOne)
    }
  })
  const [searchGuests, setSearchGuests] = useState({
    rooms: 1,
    adults: 2,
    children: 0
  })

  const handleSearch = (query: string, dates?: { checkIn: string; checkOut: string }, guests?: { rooms: number; adults: number; children: number }) => {
    const trimmed = query.trim()
    if (!trimmed) return

    // 목표 URL 구성
    const params = new URLSearchParams()
    params.set('q', trimmed)
    if (dates?.checkIn) params.set('checkIn', dates.checkIn)
    if (dates?.checkOut) params.set('checkOut', dates.checkOut)
    if (guests) {
      params.set('rooms', guests.rooms.toString())
      params.set('adults', guests.adults.toString())
      params.set('children', guests.children.toString())
    }
    const target = `/search-results?${params.toString()}`

    // 현재 URL과 동일하면 refresh, 다르면 push
    const currentPath = pathname
    const currentParams = searchParams?.toString() || ""
    const isSame = currentPath === "/search-results" && currentParams === params.toString()

    if (isSame) {
      router.refresh()
    } else {
      router.push(target)
    }
  }

  const handleDatesChange = useCallback((dates: { checkIn: string; checkOut: string }) => {
    setSearchDates(dates)
  }, [])

  const handleGuestsChange = useCallback((guests: { rooms: number; adults: number; children: number }) => {
    setSearchGuests(guests)
  }, [])

  return (
    <section className="bg-white sm:bg-gray-50 pt-0 pb-1 sm:py-6">
      <div className="container mx-auto max-w-[1440px] px-2 sm:px-4 relative z-auto">
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

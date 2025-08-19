"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CommonSearchBar } from "@/features/search"

export function SearchSection() {
  const router = useRouter()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // 검색 결과 페이지로 이동
      router.push(`/search-results?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="bg-gray-50 py-6">
      <div className="container mx-auto max-w-[1440px] px-4">
        <CommonSearchBar variant="landing" onSearch={handleSearch} />
      </div>
    </section>
  )
}

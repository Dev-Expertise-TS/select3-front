"use client"

import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface CommonSearchBarProps {
  variant?: "landing" | "hotel-detail" | "destination"
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: string
  onSearch?: (query: string) => void
  className?: string
}

export function CommonSearchBar({
  variant = "landing",
  location = "",
  checkIn = "",
  checkOut = "",
  guests = "",
  onSearch,
  className = "",
}: CommonSearchBarProps) {
  // All variants now use the same hotel-detail style with blue border and compact layout
  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center gap-4 border-2 border-blue-500 rounded-lg p-3">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-5 w-5 text-gray-600" />
          <span className="text-gray-900 font-medium">
            {variant === "destination" ? location || "Thailand" : location || "후쿠오카"}
          </span>
          <button className="text-gray-400 hover:text-gray-600">
            <span className="text-lg">×</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 border-l border-gray-200 pl-4">
          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-lg">📅</span>
          </div>
          <span className="text-gray-900 font-medium">
            {checkIn && checkOut
              ? `${checkIn} - ${checkOut}`
              : variant === "destination"
                ? "Anytime"
                : "8월 16일(토) - 8월 17일(일)"}
          </span>
          {variant !== "destination" && <span className="text-sm text-gray-600">1박</span>}
        </div>

        <div className="flex items-center gap-2 flex-1 border-l border-gray-200 pl-4">
          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-lg">👤</span>
          </div>
          <span className="text-gray-900 font-medium">
            {guests || (variant === "destination" ? "2 adults (1 room)" : "객실 1개, 성인 2명, 어린이 0명")}
          </span>
        </div>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-2 rounded-lg" 
          onClick={() => onSearch?.(location || "후쿠오카")}
        >
          <span className="text-lg mr-2">🔍</span>
          검색
        </Button>
      </div>
    </div>
  )
}

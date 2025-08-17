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
  initialQuery?: string
}

export function CommonSearchBar({
  variant = "landing",
  location = "",
  checkIn = "",
  checkOut = "",
  guests = "",
  onSearch,
  className = "",
  initialQuery = "",
}: CommonSearchBarProps) {
  // All variants now use the same hotel-detail style with blue border and compact layout
  return (
    <div className={`bg-gradient-to-br from-white via-gray-50/20 to-gray-100/40 rounded-xl p-3 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${className}`}
      style={{ borderColor: '#E6CDB5' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <MapPin className="h-5 w-5 text-gray-600" />
          <span className="text-gray-900 font-medium">
            {initialQuery || (variant === "destination" ? location || "Thailand" : location || "후쿠오카")}
          </span>
          {initialQuery && (
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => onSearch?.("")}
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 border-l-2 pl-4"
          style={{ borderLeftColor: '#E6CDB5' }}>
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

        <div className="flex items-center gap-2 flex-1 border-l-2 pl-4"
          style={{ borderLeftColor: '#E6CDB5' }}>
          <div className="flex items-center gap-1 text-blue-600">
            <span className="text-lg">👤</span>
          </div>
                      <span className="text-gray-900 font-medium">
              {guests || (variant === "destination" ? "2 adults (1 room)" : "객실 1개, 성인 2명, 어린이 0명")}
            </span>
          </div>

                          <Button 
           variant="primary"
           className="font-bold px-8 py-2 rounded-lg" 
           onClick={() => onSearch?.(initialQuery || location || "후쿠오카")}
         >
           검색
         </Button>
      </div>
    </div>
  )
}

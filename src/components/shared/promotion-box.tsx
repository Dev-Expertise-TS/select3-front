import { Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateDot } from "@/lib/date-utils"
import { HOTEL_CARD_CONFIG } from "@/config/layout"

interface PromotionBoxProps {
  text: string
  bookingDate?: string
  checkInDate?: string
  isThreeGrid?: boolean
}

export function PromotionBox({ text, bookingDate, checkInDate, isThreeGrid }: PromotionBoxProps) {
  const hasAnyDate = Boolean(bookingDate || checkInDate)
  const isShortText = typeof text === 'string' && text.length <= 27

  return (
    <div
      className={cn(
        "bg-blue-50 p-2 rounded-lg flex flex-col",
        !hasAnyDate && "justify-center"
      )}
      style={{ height: `${HOTEL_CARD_CONFIG.PROMOTION_BOX.HEIGHT}px` }}
    >
      <div
        className={cn(
          "text-gray-700 font-medium line-clamp-2 flex items-center",
          isThreeGrid ? "text-sm" : "text-xs",
          isShortText ? "mb-0" : "mb-1"
        )}
        style={{ height: `${HOTEL_CARD_CONFIG.PROMOTION_BOX.TEXT_HEIGHT}px` }}
        title={text}
      >
        {text && text.length > 27 ? `${text.substring(0, 27)}...` : text}
      </div>
      {hasAnyDate && (
        <div className={cn(
          "flex items-center gap-4 text-gray-500 mt-auto",
          isThreeGrid ? "text-sm" : "text-xs"
        )}>
          {bookingDate && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">예약일 : ~{formatDateDot(bookingDate)}</span>
            </div>
          )}
          {checkInDate && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">투숙일 : ~{formatDateDot(checkInDate)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

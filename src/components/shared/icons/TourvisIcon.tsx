"use client"

import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
}

export function TourvisIcon({ className }: IconProps) {
  return (
    <img
      src="/tourvis_logo.jpg"
      alt="Tourvis"
      className={cn("object-contain", className)}
    />
  )
}

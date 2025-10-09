"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import * as React from "react"

interface SearchInputProps extends React.ComponentProps<"input"> {
  leading?: React.ReactNode
  onClear?: () => void
  isBusy?: boolean
  size?: "sm" | "md" | "lg"
}

export function SearchInput({ leading, onClear, isBusy, className, size = "md", ...props }: SearchInputProps) {
  const sizeClasses = size === "sm" ? "text-xs h-7" : size === "lg" ? "text-base h-10" : "text-sm h-9"
  return (
    <div className={cn("flex items-center gap-2", size === "sm" ? "h-7" : size === "lg" ? "h-10" : "h-9")}> 
      {leading}
      <Input
        {...props}
        className={cn(
          "border-0 bg-transparent p-0 shadow-none focus:ring-0 focus:outline-none min-w-0 flex-1 placeholder:text-gray-400",
          sizeClasses,
          className
        )}
      />
      {!!props.value && !isBusy && (
        <button type="button" aria-label="clear" onClick={onClear} className="text-gray-400 hover:text-gray-600">
          <X className={cn(size === "sm" ? "w-4 h-4" : "w-5 h-5")} />
        </button>
      )}
    </div>
  )
}

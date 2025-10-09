import { cn } from "@/lib/utils"
import * as React from "react"

interface SectionContainerProps extends React.PropsWithChildren {
  className?: string
}

export function SectionContainer({ className, children }: SectionContainerProps) {
  return (
    <div className={cn("container mx-auto max-w-[1440px] px-4", className)}>
      {children}
    </div>
  )
}

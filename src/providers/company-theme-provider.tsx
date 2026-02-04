"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getCompanyFromURL } from "@/lib/company-filter"

/**
 * company=benepia일 때 data-company="benepia"를 설정하여
 * CSS 변수(--company-primary 등) 기반 테마가 적용되도록 합니다.
 */
export function CompanyThemeProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const [company, setCompany] = useState<string | null>(null)

  useEffect(() => {
    setCompany(getCompanyFromURL())
  }, [searchParams])

  return (
    <div data-company={company === "benepia" ? "benepia" : undefined}>
      {children}
    </div>
  )
}

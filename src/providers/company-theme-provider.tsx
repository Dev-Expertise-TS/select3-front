"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getCompanyFromURL } from "@/lib/company-filter"

interface CompanyThemeProviderProps {
  children: React.ReactNode
  /** 서버에서 전달한 company 값 (하이드레이션 일치용) */
  initialCompany?: string | null
}

/**
 * company=benepia일 때 data-company="benepia"를 설정하여
 * CSS 변수(--company-primary 등) 기반 테마가 적용되도록 합니다.
 */
export function CompanyThemeProvider({ children, initialCompany = null }: CompanyThemeProviderProps) {
  const searchParams = useSearchParams()
  const [company, setCompany] = useState<string | null>(initialCompany ?? null)

  useEffect(() => {
    setCompany(initialCompany ?? getCompanyFromURL())
  }, [searchParams, initialCompany])

  return (
    <div data-company={company === "benepia" ? "benepia" : undefined}>
      {children}
    </div>
  )
}

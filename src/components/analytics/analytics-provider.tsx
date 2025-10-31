'use client'

import { GoogleAnalytics } from './google-analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // GTM이 모든 GA4 초기화를 담당하므로 GoogleAnalytics 컴포넌트는 dataLayer만 초기화
  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  )
}

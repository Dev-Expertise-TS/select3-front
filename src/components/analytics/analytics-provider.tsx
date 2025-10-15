'use client'

import { GoogleAnalytics } from './google-analytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <>
      {measurementId && <GoogleAnalytics measurementId={measurementId} />}
      {children}
    </>
  )
}

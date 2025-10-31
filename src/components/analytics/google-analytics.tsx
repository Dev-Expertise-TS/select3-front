'use client'

import Script from 'next/script'

// GTM을 통한 GA4 초기화를 사용하므로 gtag.js 직접 로드는 제거
// dataLayer만 초기화 (GTM이 모든 GA4 설정을 담당)
export function GoogleAnalytics() {
  return (
    <Script id="google-analytics-init" strategy="beforeInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
      `}
    </Script>
  )
}

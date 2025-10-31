'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      {/* Google Analytics 초기화 스크립트 */}
      <Script id="google-analytics-init" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          // gtag.js가 로드되기 전까지 임시 함수 정의
          // gtag.js가 로드되면 자동으로 window.gtag가 실제 함수로 교체됨
          window.gtag = window.gtag || function() {
            window.dataLayer.push(arguments);
          };
        `}
      </Script>
      
      {/* Google Analytics Script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          // gtag.js가 로드된 후 실제 함수로 교체되었는지 확인하고 초기화
          const checkAndInit = () => {
            if (typeof window === 'undefined' || !window.gtag) {
              return false
            }
            
            try {
              // 실제 GA4 서버로 요청을 보내는 Google의 gtag 함수 사용
              window.gtag('js', new Date())
              window.gtag('config', measurementId, {
                page_title: document.title,
                page_location: window.location.href,
              })
              
              // 개발 환경에서 확인 로그
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ [GA4] gtag.js 로드 완료 및 초기화:', measurementId)
                console.log('✅ [GA4] 이벤트 전송 가능 상태')
                
                // gtag 함수가 실제 Google 함수인지 확인 (Google의 함수는 일반적으로 더 복잡함)
                const gtagStr = window.gtag.toString()
                // 실제 Google gtag 함수는 일반적으로 더 긴 문자열이거나 특정 패턴 포함
                const isRealGtag = gtagStr.length > 50 || gtagStr.includes('gtag/js') || gtagStr.includes('dataLayer')
                console.log('✅ [GA4] 실제 gtag 함수 여부:', isRealGtag ? '예' : '아니오')
                if (!isRealGtag) {
                  console.warn('⚠️ [GA4] 임시 함수가 여전히 사용되고 있습니다. gtag.js가 제대로 로드되지 않았을 수 있습니다.')
                }
              }
              
              return true
            } catch (error) {
              console.error('❌ [GA4] 초기화 실패:', error)
              return false
            }
          }
          
          // 즉시 시도
          if (!checkAndInit()) {
            // 실패 시 재시도 (gtag.js가 완전히 로드되는데 시간이 걸릴 수 있음)
            let attempts = 0
            const maxAttempts = 10
            
            const retryInterval = setInterval(() => {
              attempts++
              if (checkAndInit() || attempts >= maxAttempts) {
                clearInterval(retryInterval)
                if (attempts >= maxAttempts) {
                  console.warn('⚠️ [GA4] gtag.js 초기화 재시도 실패:', measurementId)
                }
              }
            }, 100)
          }
        }}
      />
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'

export function KakaoConsultationButton() {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    let animationTimer: NodeJS.Timeout | null = null
    
    // 애니메이션 실행 함수
    const runAnimation = () => {
      setShouldAnimate(true)
      animationTimer = setTimeout(() => {
        setShouldAnimate(false)
      }, 2000) // 2초간 애니메이션
    }

    // 즉시 첫 애니메이션 시작
    runAnimation()

    // 5초마다 반복 (첫 실행 포함)
    const interval = setInterval(() => {
      runAnimation()
    }, 5000)

    return () => {
      clearInterval(interval)
      if (animationTimer) {
        clearTimeout(animationTimer)
      }
    }
  }, [])

  const handleClick = () => {
    // ✅ GA4 네이티브 이벤트 전송 (구체적인 이벤트명 사용)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'kakao_consultation', {
        event_category: 'engagement',
        event_label: 'floating_button',
        button_location: 'floating_button',
        button_type: 'consultation',
        button_style: 'floating'
      })
      console.log('✅ [GA4] 카카오톡 상담 이벤트 전송 완료: kakao_consultation')
    } else {
      console.warn('⚠️ [GA4] gtag 함수가 로드되지 않았습니다.')
    }
    
    // ✅ 기존 trackEvent도 유지 (호환성)
    trackEvent('kakao_consultation', 'engagement', 'floating_button')
    
    // ✅ GTM dataLayer 상세 데이터
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'kakao_consultation',
        button_location: 'floating_button',
        button_type: 'consultation',
        button_style: 'floating',
        timestamp: new Date().toISOString()
      })
      console.log('✅ [GTM] dataLayer push 완료')
    } else {
      console.warn('⚠️ [GTM] dataLayer가 없습니다.')
    }
    
    console.log('💬 [Analytics] 카카오톡 상담 플로팅 버튼 클릭:', {
      위치: 'floating_button',
      버튼타입: 'consultation',
      버튼스타일: 'floating',
      gtag_로드: typeof window !== 'undefined' && typeof window.gtag !== 'undefined',
      dataLayer_로드: typeof window !== 'undefined' && typeof (window as any).dataLayer !== 'undefined'
    })
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 hidden lg:block pointer-events-none">
      <div className="container mx-auto max-w-[1440px] px-4 relative h-0">
        <a
          id="kakao-floating-button"
          href="https://pf.kakao.com/_cxmxgNG/chat"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="absolute -right-2 bottom-0 group pointer-events-auto"
          aria-label="카카오톡 상담"
        >
          <div className="relative">
            {/* Pulse ring effect */}
            <div 
              className={`absolute inset-0 rounded-full ${shouldAnimate ? 'animate-kakao-pulse' : ''}`}
              style={{ 
                background: 'transparent',
                pointerEvents: 'none'
              }}
            />
            
            {/* Button image */}
            <img
              src="https://appservice-img.s3.amazonaws.com/apps/gdc7WwhtIx4htbBH2iGjuB/ko/icon/splash?1753264267"
              alt="카카오톡 상담"
              className={`block select-none w-[80px] h-auto transition-all duration-200 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] active:scale-95 ${shouldAnimate ? 'animate-kakao-bounce' : ''}`}
              draggable={false}
              loading="lazy"
            />
          </div>
        </a>
      </div>
    </div>
  )
}

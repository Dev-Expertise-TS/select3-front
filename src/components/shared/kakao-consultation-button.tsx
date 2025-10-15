'use client'

import { useState, useEffect } from 'react'

export function KakaoConsultationButton() {
  const [shouldAnimate, setShouldAnimate] = useState(false)

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

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 hidden lg:block pointer-events-none">
      <div className="container mx-auto max-w-[1440px] px-4 relative h-0">
        <a
          href="https://pf.kakao.com/_cxmxgNG/chat"
          target="_blank"
          rel="noopener noreferrer"
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

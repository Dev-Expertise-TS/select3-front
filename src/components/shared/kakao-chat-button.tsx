'use client'

import { useAnalytics } from '@/hooks/use-analytics'

interface KakaoChatButtonProps {
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  location?: string
}

export function KakaoChatButton({ 
  text = '카카오톡 상담하기',
  className = '',
  size = 'md',
  location = 'unknown'
}: KakaoChatButtonProps) {
  const { trackEvent } = useAnalytics()
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 sm:py-3 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-5 h-5'
  }

  const handleClick = () => {
    // ✅ GTM을 통해 이벤트 전송 (GTM이 GA4로 전달)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'kakao_consultation',
        event_category: 'engagement',
        event_label: location,
        button_location: location,
        button_type: 'consultation',
        button_text: text || '카카오톡 상담하기',
        timestamp: new Date().toISOString()
      })
      console.log('✅ [GTM] 카카오톡 상담 이벤트 전송 완료: kakao_consultation')
    } else {
      console.warn('⚠️ [GTM] dataLayer가 없습니다.')
    }
    
    // ✅ 기존 trackEvent도 유지 (호환성)
    trackEvent('kakao_consultation', 'engagement', location)
    
    console.log('💬 [Analytics] 카카오톡 상담 클릭:', {
      위치: location,
      버튼타입: 'consultation',
      버튼텍스트: text,
      dataLayer_로드: typeof window !== 'undefined' && typeof (window as any).dataLayer !== 'undefined'
    })
  }

  return (
    <a
      href="https://pf.kakao.com/_cxmxgNG/chat"
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 hover:scale-105 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
    >
      <svg className={`${iconSizes[size]} mr-2`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 01-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 00-.656-.676l-1.928 1.866V9.282a.472.472 0 00-.944 0v2.557a.471.471 0 000 .222V13.5a.472.472 0 00.944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 10.771-.542l-1.512-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 00-.943 0v4.159c0 .26.211.472.471.472h1.932a.472.472 0 000-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 00-.127-.32l-1.046-2.8a.69.69 0 00-.627-.474.696.696 0 00-.653.447l-1.661 4.075a.472.472 0 00.896.364l.32-.783h2.07l.293.8a.472.472 0 00.886-.293l-.353-.8zM8.293 9.302a.472.472 0 00-.471-.472H4.577a.472.472 0 100 .944h1.16v3.736a.472.472 0 00.944 0V9.774h1.14a.472.472 0 00.472-.472z"/>
      </svg>
      {text}
    </a>
  )
}


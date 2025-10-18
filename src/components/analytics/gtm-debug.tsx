'use client'

import { useEffect } from 'react'

/**
 * GTM/GA4 디버그 헬퍼 컴포넌트
 * 개발 환경에서만 작동하며 브라우저 콘솔에 이벤트를 자동으로 로깅합니다.
 */
export function GTMDebug() {
  useEffect(() => {
    // 프로덕션 환경에서는 실행하지 않음
    if (process.env.NODE_ENV === 'production') return

    // GTM 로드 확인
    const checkGTM = () => {
      console.log('%c🔍 GTM 디버그 모드 활성화', 'background: #4285f4; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;')
      console.log('GTM 로드:', typeof window.dataLayer !== 'undefined' ? '✅' : '❌')
      console.log('GA4 로드:', typeof window.gtag !== 'undefined' ? '✅' : '❌')
      
      if (window.dataLayer) {
        console.log('현재 dataLayer:', window.dataLayer)
      }
    }

    // 초기 로드 확인
    setTimeout(checkGTM, 1000)

    // dataLayer 이벤트 모니터링
    if (typeof window !== 'undefined') {
      const originalPush = window.dataLayer?.push
      
      if (originalPush && window.dataLayer) {
        window.dataLayer.push = function(...args) {
          console.log('%c📊 GTM 이벤트 발생', 'background: #fbbc04; color: black; padding: 4px 8px; border-radius: 4px; font-weight: bold;')
          console.log('이벤트 데이터:', args[0])
          console.log('전체 dataLayer:', window.dataLayer)
          return originalPush.apply(this, args)
        }
      }
    }

    // 전역 헬퍼 함수 등록
    if (typeof window !== 'undefined') {
      (window as any).gtmDebug = {
        check: () => {
          console.log('%c=== GTM 상태 확인 ===', 'color: #4285f4; font-weight: bold; font-size: 14px;')
          console.log('GTM 로드:', typeof window.dataLayer !== 'undefined')
          console.log('GA4 로드:', typeof window.gtag !== 'undefined')
          console.log('dataLayer 길이:', window.dataLayer?.length || 0)
          console.log('최근 3개 이벤트:', window.dataLayer?.slice(-3))
          return window.dataLayer
        },
        
        events: () => {
          console.log('%c=== 전체 이벤트 목록 ===', 'color: #34a853; font-weight: bold; font-size: 14px;')
          window.dataLayer?.forEach((item, index) => {
            if (item.event) {
              console.log(`${index + 1}. ${item.event}`, item)
            }
          })
          return window.dataLayer?.filter(item => item.event)
        },
        
        kakao: () => {
          console.log('%c=== 카카오톡 클릭 이벤트 ===', 'color: #FEE500; font-weight: bold; font-size: 14px; background: black; padding: 4px 8px;')
          const kakaoEvents = window.dataLayer?.filter(item => 
            item.event === 'kakao_click' || 
            (item.event === 'click' && item.event_category === 'kakao_consultation')
          )
          console.table(kakaoEvents)
          return kakaoEvents
        },
        
        clear: () => {
          console.clear()
          console.log('%c✨ 콘솔 클리어 완료', 'color: #ea4335; font-weight: bold;')
        },
        
        help: () => {
          console.log('%c=== GTM 디버그 헬퍼 함수 ===', 'color: #4285f4; font-weight: bold; font-size: 16px;')
          console.log(`
📊 사용 가능한 함수:

window.gtmDebug.check()   - GTM 상태 확인
window.gtmDebug.events()  - 전체 이벤트 목록
window.gtmDebug.kakao()   - 카카오톡 클릭 이벤트만 조회
window.gtmDebug.clear()   - 콘솔 클리어
window.gtmDebug.help()    - 도움말 표시

📝 예시:
- window.gtmDebug.check()   // GTM 로드 여부 확인
- window.gtmDebug.kakao()   // 카카오톡 이벤트 테이블로 보기
          `)
        }
      }

      console.log('%c💡 Tip: window.gtmDebug.help() 를 입력하면 사용 가능한 함수를 볼 수 있습니다', 'color: #888; font-style: italic;')
    }

    // 클린업
    return () => {
      // 프로덕션에서는 헬퍼 함수 제거
      if (typeof window !== 'undefined' && (window as any).gtmDebug) {
        delete (window as any).gtmDebug
      }
    }
  }, [])

  // 아무것도 렌더링하지 않음
  return null
}


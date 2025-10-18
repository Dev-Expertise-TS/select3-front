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
          console.log('최근 5개 이벤트:', window.dataLayer?.slice(-5))
          
          // 이벤트 타입별 카운트
          const eventCounts: Record<string, number> = {}
          window.dataLayer?.forEach(item => {
            if (item.event) {
              eventCounts[item.event] = (eventCounts[item.event] || 0) + 1
            }
          })
          console.log('이벤트 타입별 카운트:', eventCounts)
          
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
        
        search: () => {
          console.log('%c=== 검색 이벤트 ===', 'color: #34a853; font-weight: bold; font-size: 14px; background: white; padding: 4px 8px;')
          const searchEvents = window.dataLayer?.filter(item => 
            item.event === 'hotel_search' || 
            item.event === 'search'
          )
          console.table(searchEvents?.map(e => ({
            이벤트: e.event,
            검색어: e.search_term || e.event_label,
            체크인: e.check_in_date,
            체크아웃: e.check_out_date,
            숙박일: e.nights,
            룸: e.rooms,
            성인: e.adults,
            어린이: e.children,
            검색타입: e.search_type,
            위치: e.search_location,
            호텔ID: e.selected_hotel_id,
            호텔명: e.selected_hotel_name
          })))
          console.log('상세 데이터:', searchEvents)
          return searchEvents
        },
        
        viewItem: () => {
          console.log('%c=== 호텔 조회 이벤트 (view_item) ===', 'color: #ea4335; font-weight: bold; font-size: 14px; background: white; padding: 4px 8px;')
          const viewEvents = window.dataLayer?.filter(item => 
            item.event === 'view_item'
          )
          console.table(viewEvents)
          return viewEvents
        },
        
        kakao: () => {
          console.log('%c=== 카카오톡 클릭 이벤트 ===', 'color: #FEE500; font-weight: bold; font-size: 14px; background: black; padding: 4px 8px;')
          const kakaoEvents = window.dataLayer?.filter(item => 
            item.event === 'kakao_click' || 
            (item.event === 'click' && item.event_category === 'kakao_consultation') ||
            (item.event === 'conversion' && item.event_label?.includes('kakao'))
          )
          console.table(kakaoEvents)
          return kakaoEvents
        },
        
        byType: (eventType: string) => {
          console.log(`%c=== ${eventType} 이벤트 ===`, 'color: #fbbc04; font-weight: bold; font-size: 14px;')
          const filteredEvents = window.dataLayer?.filter(item => 
            item.event === eventType
          )
          console.table(filteredEvents)
          return filteredEvents
        },
        
        stats: () => {
          console.log('%c=== 이벤트 통계 ===', 'color: #9334ea; font-weight: bold; font-size: 14px;')
          const eventCounts: Record<string, number> = {}
          const eventFirst: Record<string, any> = {}
          const eventLast: Record<string, any> = {}
          
          window.dataLayer?.forEach(item => {
            if (item.event) {
              eventCounts[item.event] = (eventCounts[item.event] || 0) + 1
              if (!eventFirst[item.event]) {
                eventFirst[item.event] = item
              }
              eventLast[item.event] = item
            }
          })
          
          console.log('📊 이벤트별 발생 횟수:')
          console.table(eventCounts)
          
          console.log('\n🔍 주요 이벤트별 최신 데이터:')
          Object.keys(eventCounts).forEach(eventType => {
            console.log(`\n${eventType} (${eventCounts[eventType]}회):`, eventLast[eventType])
          })
          
          return { eventCounts, eventFirst, eventLast }
        },
        
        clear: () => {
          console.clear()
          console.log('%c✨ 콘솔 클리어 완료', 'color: #ea4335; font-weight: bold;')
        },
        
        help: () => {
          console.log('%c=== GTM 디버그 헬퍼 함수 ===', 'color: #4285f4; font-weight: bold; font-size: 16px;')
          console.log(`
📊 사용 가능한 함수:

✅ 상태 확인
window.gtmDebug.check()      - GTM 상태 및 이벤트 카운트 확인
window.gtmDebug.stats()      - 이벤트 통계 및 분석

📋 이벤트 조회
window.gtmDebug.events()     - 전체 이벤트 목록
window.gtmDebug.search()     - 검색 이벤트 (hotel_search)
window.gtmDebug.viewItem()   - 호텔 조회 이벤트 (view_item)
window.gtmDebug.kakao()      - 카카오톡 클릭 이벤트
window.gtmDebug.byType('이벤트명') - 특정 이벤트만 필터링

🛠️ 유틸리티
window.gtmDebug.clear()      - 콘솔 클리어
window.gtmDebug.help()       - 도움말 표시

📝 예시:
- window.gtmDebug.check()           // GTM 로드 및 통계 확인
- window.gtmDebug.search()          // 검색 이벤트만 테이블로 보기
- window.gtmDebug.kakao()           // 카카오톡 이벤트 조회
- window.gtmDebug.byType('click')   // 특정 타입 이벤트만 조회
- window.gtmDebug.stats()           // 전체 통계 분석
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


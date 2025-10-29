"use client"

import { useMemo } from "react"

// Deep get function for nested object access
function deepGetFn(obj: any, path: string[]): any {
  if (!obj || !Array.isArray(path)) return undefined
  let current = obj
  for (const key of path) {
    if (current === null || current === undefined) return undefined
    current = current[key]
  }
  return current
}

// Room processing utilities
export function useRoomProcessing() {
  const processRoomData = useMemo(() => {
    return (roomArray: any[]) => {
      const processedRooms: any[] = []
      const ratePlans: any[] = []
      
      console.log('🔍 처리할 Room 개수:', roomArray.length)
      
      for (let i = 0; i < roomArray.length; i++) {
        const room = roomArray[i]
        const r = room as any
        console.log(`🔍 ${i + 1}번째 Room 처리 중:`, r)
        
        // Room 기본 정보 추출
        const rt = deepGetFn(r, ['RoomType'])
        const rdName = deepGetFn(r, ['RoomDescription', 'Name'])
        const descSrc = deepGetFn(r, ['RoomDescription', 'Text'])
        
        const roomType: string = typeof rt === 'string' ? rt : (typeof rdName === 'string' ? rdName : '')
        const roomName: string = typeof rdName === 'string' ? rdName : ''
        const description: string = Array.isArray(descSrc) ? 
          (typeof (descSrc as unknown[])[0] === 'string' ? (descSrc as unknown[])[0] as string : '') : 
          (typeof descSrc === 'string' ? descSrc as string : '')
        
        // RoomViewDescription 추출 (다양한 경로 시도)
        let roomViewDescription = null
        roomViewDescription = deepGetFn(r, ['RoomViewDescription']) || r.RoomViewDescription
        if (!roomViewDescription) { roomViewDescription = deepGetFn(r, ['Room', 'RoomViewDescription']) }
        if (!roomViewDescription && Array.isArray(r.Room)) { 
          roomViewDescription = r.Room.find((roomItem: any) => roomItem.RoomViewDescription)?.RoomViewDescription 
        }
        if (!roomViewDescription && r.RatePlans && r.RatePlans.RatePlan) {
          const ratePlanArray = Array.isArray(r.RatePlans.RatePlan) ? r.RatePlans.RatePlan : [r.RatePlans.RatePlan]
          roomViewDescription = ratePlanArray.find((rp: any) => rp.RoomViewDescription)?.RoomViewDescription
        }
        if (!roomViewDescription) { roomViewDescription = null }
        
        // RatePlans 정보 추출
        const plansNode = deepGetFn(r, ['RatePlans', 'RatePlan'])
        console.log(`🔍 ${i + 1}번째 Room의 RatePlans 정보:`, plansNode)
        if (plansNode) {
          const plans: unknown[] = Array.isArray(plansNode) ? plansNode : [plansNode]
          console.log(`🔍 ${i + 1}번째 Room의 RatePlan 개수:`, plans.length)
          
          for (const plan of plans) {
            const p = plan as Record<string, unknown>
            
            // RateKey 추출 (다양한 경로 시도)
            const rateKey: string = (() => {
              const paths = [
                ['RateKey'],
                ['RatePlanCode'],
                ['BookingCode'],
                ['RateCode'],
                ['PlanCode'],
                ['Code'],
                ['Id']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'string' && v) return v
              }
              return ''
            })()
            
            // 기타 요금 정보 추출 (다양한 경로 시도)
            const currency: string = (() => {
              const paths = [
                ['ConvertedRateInfo', 'CurrencyCode'],
                ['RateInfo', 'CurrencyCode'],
                ['CurrencyCode'],
                ['Currency']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'string' && v) return v
              }
              return 'KRW' // 기본값
            })()
            
            const amountAfterTax: number = (() => {
              const paths = [
                ['ConvertedRateInfo', 'AmountAfterTax'],
                ['RateInfo', 'AmountAfterTax'],
                ['AmountAfterTax'],
                ['TotalAmount'],
                ['Amount'],
                ['Price']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'number' && v > 0) return v
                if (typeof v === 'string' && v && !isNaN(Number(v))) return Number(v)
              }
              return 0
            })()
            
            const amountBeforeTax: number = (() => {
              const paths = [
                ['ConvertedRateInfo', 'AmountBeforeTax'],
                ['RateInfo', 'AmountBeforeTax'],
                ['AmountBeforeTax'],
                ['BaseAmount'],
                ['SubTotal']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'number' && v > 0) return v
                if (typeof v === 'string' && v && !isNaN(Number(v))) return Number(v)
              }
              return 0
            })()
            
            // RatePlan 이름/설명 추출
            const ratePlanName: string = (() => {
              const paths = [
                ['RatePlanDescription', 'Text'],
                ['RatePlanDescription'],
                ['Description'],
                ['Name'],
                ['PlanName']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'string' && v) return v
                if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') return v[0]
              }
              return ''
            })()
            
            // RatePlan 코드 추출
            const ratePlanCode: string = (() => {
              const paths = [
                ['RatePlanCode'],
                ['BookingCode'],
                ['RateCode'],
                ['PlanCode'],
                ['Code']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'string' && v) return v
              }
              return ''
            })()
            
            // 할인 정보 추출
            const discountAmount: number = (() => {
              const paths = [
                ['ConvertedRateInfo', 'DiscountAmount'],
                ['RateInfo', 'DiscountAmount'],
                ['DiscountAmount'],
                ['Savings'],
                ['Discount']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'number' && v > 0) return v
                if (typeof v === 'string' && v && !isNaN(Number(v))) return Number(v)
              }
              return 0
            })()
            
            // 취소 정책 추출
            const cancellationPolicy: string = (() => {
              const paths = [
                ['CancelPenalties', 'CancelPenalty', 'Description'],
                ['CancelPenalties', 'CancelPenalty'],
                ['CancellationPolicy'],
                ['CancelPolicy']
              ]
              
              for (const path of paths) {
                const v = deepGetFn(p, path)
                if (typeof v === 'string' && v) return v
                if (Array.isArray(v) && v.length > 0) {
                  const firstItem = v[0]
                  if (typeof firstItem === 'object' && firstItem !== null) {
                    const desc = deepGetFn(firstItem, ['Description'])
                    if (typeof desc === 'string' && desc) return desc
                  }
                }
              }
              return ''
            })()
            
            // RatePlan 데이터 구성
            const ratePlanData = {
              rateKey,
              currency,
              amountAfterTax,
              amountBeforeTax,
              ratePlanName,
              ratePlanCode,
              discountAmount,
              cancellationPolicy,
              roomType,
              roomName,
              description,
              roomViewDescription,
              originalData: p
            }
            
            ratePlans.push(ratePlanData)
            console.log(`🔍 RatePlan 데이터 구성 완료:`, ratePlanData)
          }
        }
        
        // Room 데이터 구성
        const roomData = {
          roomType,
          roomName,
          description,
          roomViewDescription,
          originalData: r
        }
        
        processedRooms.push(roomData)
        console.log(`🔍 Room 데이터 구성 완료:`, roomData)
      }
      
      return { processedRooms, ratePlans }
    }
  }, [])

  return { processRoomData }
}

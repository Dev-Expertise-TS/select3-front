"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search"
import { Star, MapPin, MessageCircle, Car, Utensils, Heart, ArrowLeft, Shield, Bed, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useHotelBySlug, useHotelMedia } from "@/hooks/use-hotels"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

interface HotelDetailProps {
  hotelSlug: string
}

export function HotelDetail({ hotelSlug }: HotelDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("benefits")
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showImageDetail, setShowImageDetail] = useState(false)
  const [selectedDetailImage, setSelectedDetailImage] = useState(0)
  
  // slug로 호텔 데이터 조회
  const { data: hotel, isLoading, error } = useHotelBySlug(hotelSlug)
  
  // 호텔 미디어 이미지 조회
  const { data: hotelMedia = [] } = useHotelMedia(hotel?.sabre_id || 0)

  // Sabre API를 통해 호텔 상세 정보 조회
  const { data: sabreHotelInfo, isLoading: sabreLoading, error: sabreError } = useQuery({
    queryKey: ['sabre-hotel-details', hotel?.sabre_id],
    queryFn: async () => {
      if (!hotel?.sabre_id) return null
      
      try {
        // Sabre Hotel Details API 직접 호출
        const requestBody = {
          HotelCode: hotel.sabre_id.toString(),
          CurrencyCode: 'KRW',
          StartDate: new Date().toISOString().split('T')[0],
          EndDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          Adults: 2
        }

        const response = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(15000)
        })
        
        if (!response.ok) throw new Error('Sabre API 호출 실패')
        
        const result = await response.json()
        if (result.GetHotelDetailsRS?.HotelDetailsInfo?.HotelInfo) {
          return result.GetHotelDetailsRS.HotelDetailsInfo.HotelInfo
        }
        return null
      } catch (error) {
        console.error('Sabre API 호출 오류:', error)
        return null
      }
    },
    enabled: !!hotel?.sabre_id,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  })



  // Sabre API에서 Rate Plan 데이터 조회 및 처리
  const { data: ratePlanCodes, isLoading: ratePlanLoading, error: ratePlanError } = useQuery({
    queryKey: ['sabre-rate-plans', hotel?.sabre_id],
    queryFn: async () => {
      if (!hotel?.sabre_id) return null
      
      try {
        console.log('🚀 Sabre API 호출 시작 - Hotel Details:', hotel.sabre_id)
        
        // Sabre Hotel Details API 호출
        const response = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sabreId: hotel.sabre_id
          })
        })
        
        if (!response.ok) {
          throw new Error(`Sabre API 호출 실패: ${response.status} ${response.statusText}`)
        }
        
        const sabreData = await response.json()
        console.log('✅ Sabre API 응답 성공:', sabreData)
        
        // deepGet 유틸리티 함수로 중첩된 객체에서 값 추출
        const deepGet = (obj: unknown, keys: string[]): unknown => {
          let cur: unknown = obj
          for (const key of keys) {
            if (cur && typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur as object, key)) {
              cur = (cur as Record<string, unknown>)[key]
            } else {
              return undefined
            }
          }
          return cur
        }
        
        // Sabre API 응답 구조에서 Room 정보 추출
        const root = deepGet(sabreData, ['GetHotelDetailsRS', 'HotelDetailsInfo', 'HotelRateInfo', 'Rooms', 'Room'])
        if (root) {
          console.log('✅ Sabre API에서 Room 정보 발견:', root)
          
          const roomArray: unknown[] = Array.isArray(root) ? root : [root]
          const allRatePlans: any[] = []
          
          // 각 Room에 대해 처리
          for (const room of roomArray) {
            const r = room as Record<string, unknown>
            
            // Room 기본 정보 추출
            const rt = deepGet(r, ['RoomType'])
            const rdName = deepGet(r, ['RoomDescription', 'Name'])
            const descSrc = deepGet(r, ['RoomDescription', 'Text'])
            
            const roomType: string = typeof rt === 'string' ? rt : (typeof rdName === 'string' ? rdName : '')
            const roomName: string = typeof rdName === 'string' ? rdName : ''
            const description: string = Array.isArray(descSrc) ? 
              (typeof (descSrc as unknown[])[0] === 'string' ? (descSrc as unknown[])[0] as string : '') : 
              (typeof descSrc === 'string' ? descSrc as string : '')
            
            // RatePlans 정보 추출
            const plansNode = deepGet(r, ['RatePlans', 'RatePlan'])
            if (plansNode) {
              const plans: unknown[] = Array.isArray(plansNode) ? plansNode : [plansNode]
              
              // 각 RatePlan에 대해 처리
              for (const plan of plans) {
                const p = plan as Record<string, unknown>
                
                // RateKey 추출 - 핵심 부분
                const rateKeyVal = deepGet(p, ['RateKey'])
                const rateKey: string = typeof rateKeyVal === 'string' ? rateKeyVal : ''
                
                // 기타 요금 정보 추출
                const currency: string = (() => {
                  const v = deepGet(p, ['ConvertedRateInfo', 'CurrencyCode'])
                  return typeof v === 'string' ? v : ''
                })()
                
                const amountAfterTax = (() => {
                  const v = deepGet(p, ['ConvertedRateInfo', 'AmountAfterTax'])
                  if (typeof v === 'number') return v
                  if (typeof v === 'string') {
                    const parsed = parseFloat(v)
                    return isNaN(parsed) ? '' : parsed
                  }
                  return ''
                })()
                
                const amountBeforeTax = (() => {
                  const v = deepGet(p, ['ConvertedRateInfo', 'AmountBeforeTax'])
                  if (typeof v === 'number') return v
                  if (typeof v === 'string') {
                    const parsed = parseFloat(v)
                    return isNaN(parsed) ? '' : parsed
                  }
                  return ''
                })()
                
                // Rate Plan 타입 정보 추출
                const ratePlanType = (() => {
                  const v = deepGet(p, ['RatePlanType'])
                  return typeof v === 'string' ? v : ''
                })()
                
                // Room Type Code 추출
                const roomTypeCode = (() => {
                  const v = deepGet(r, ['RoomTypeCode'])
                  return typeof v === 'string' ? v : ''
                })()
                
                // Rate Plan 설명 추출
                const ratePlanDescription = (() => {
                  const v = deepGet(p, ['RatePlanDescription'])
                  return typeof v === 'string' ? v : ''
                })()
                
                // 행 데이터 생성
                allRatePlans.push({
                  RateKey: rateKey,
                  RoomType: roomType,
                  RoomName: roomName,
                  Description: description,
                  Currency: currency,
                  AmountAfterTax: amountAfterTax,
                  AmountBeforeTax: amountBeforeTax,
                  RoomTypeCode: roomTypeCode,
                  RatePlanType: ratePlanType,
                  RatePlanDescription: ratePlanDescription
                })
              }
            }
          }
          
          if (allRatePlans.length > 0) {
            console.log('✅ Sabre API에서 Rate Plan 데이터 추출 성공:', allRatePlans)
            return allRatePlans
          } else {
            console.log('⚠️ Sabre API에서 Rate Plan 데이터를 찾을 수 없음')
            return []
          }
        } else {
          console.log('⚠️ Sabre API에서 Room 정보를 찾을 수 없음')
          return []
        }
              
              // 3차 경로: 다른 가능한 구조들
              if (!foundRatePlans) {
                if (parsedData.Rates && Array.isArray(parsedData.Rates)) {
                  console.log('✅ Rates 배열 발견')
                  foundRatePlans = parsedData.Rates
                } else if (parsedData.rates && Array.isArray(parsedData.rates)) {
                  console.log('✅ rates 배열 발견')
                  foundRatePlans = parsedData.rates
                } else if (parsedData.RoomRates && Array.isArray(parsedData.RoomRates)) {
                  console.log('✅ RoomRates 배열 발견')
                  foundRatePlans = parsedData.RoomRates
                } else if (parsedData.roomRates && Array.isArray(parsedData.roomRates)) {
                  console.log('✅ roomRates 배열 발견')
                  foundRatePlans = parsedData.roomRates
                }
              }
              
              // 3-1차 경로: 추가 구조들
              if (!foundRatePlans) {
                if (parsedData.RoomTypes && Array.isArray(parsedData.RoomTypes)) {
                  console.log('✅ RoomTypes 배열 발견')
                  foundRatePlans = parsedData.RoomTypes
                } else if (parsedData.roomTypes && Array.isArray(parsedData.roomTypes)) {
                  console.log('✅ roomTypes 배열 발견')
                  foundRatePlans = parsedData.roomTypes
                } else if (parsedData.Packages && Array.isArray(parsedData.Packages)) {
                  console.log('✅ Packages 배열 발견')
                  foundRatePlans = parsedData.Packages
                } else if (parsedData.packages && Array.isArray(parsedData.packages)) {
                  console.log('✅ packages 배열 발견')
                  foundRatePlans = parsedData.packages
                } else if (parsedData.Offers && Array.isArray(parsedData.Offers)) {
                  console.log('✅ Offers 배열 발견')
                  foundRatePlans = parsedData.Offers
                } else if (parsedData.offers && Array.isArray(parsedData.offers)) {
                  console.log('✅ offers 배열 발견')
                  foundRatePlans = parsedData.offers
                }
              }
              
              // 3-2차 경로: 일반적인 배열 구조들
              if (!foundRatePlans) {
                // 모든 키에서 배열을 찾기
                const arrayKeys = Object.keys(parsedData).filter(key => 
                  Array.isArray(parsedData[key]) && parsedData[key].length > 0
                )
                if (arrayKeys.length > 0) {
                  console.log('✅ 배열 형태의 키들 발견:', arrayKeys)
                  // 첫 번째 배열 사용
                  foundRatePlans = parsedData[arrayKeys[0]]
                  console.log(`✅ ${arrayKeys[0]} 배열 사용:`, foundRatePlans)
                }
              }
              
              if (foundRatePlans) {
                ratePlanData = foundRatePlans
              } else {
                console.log('✅ 단일 객체를 배열로 변환')
                ratePlanData = [parsedData]
              }
            } else {
              console.log('✅ 단일 값을 배열로 변환')
              ratePlanData = [parsedData]
            }
            
            console.log('🔍 최종 ratePlanData:', ratePlanData)
          } catch (parseError) {
            console.log('❌ rate_code 파싱 실패:', parseError)
            console.log('📝 원본 rate_code 데이터:', supabaseHotel.rate_code)
            // 파싱 실패 시 원본 데이터를 그대로 사용
            ratePlanData = [supabaseHotel.rate_code]
          }
        } else if (supabaseHotel.rate_plan_codes && supabaseHotel.rate_plan_codes !== '') {
          console.log('✅ rate_plan_codes 필드에서 데이터 발견:', supabaseHotel.rate_plan_codes)
          console.log('🔍 rate_plan_codes 타입:', typeof supabaseHotel.rate_plan_codes)
          
          try {
            let parsedData = null
            
            if (typeof supabaseHotel.rate_plan_codes === 'string') {
              if (supabaseHotel.rate_plan_codes.startsWith('{') || supabaseHotel.rate_plan_codes.startsWith('[')) {
                parsedData = JSON.parse(supabaseHotel.rate_plan_codes)
                console.log('✅ rate_plan_codes JSON 파싱 성공:', parsedData)
              } else {
                console.log('📝 rate_plan_codes가 JSON 형식이 아님, 원본 데이터 사용')
                parsedData = supabaseHotel.rate_plan_codes
              }
            } else {
              parsedData = supabaseHotel.rate_plan_codes
            }
            
            if (Array.isArray(parsedData)) {
              console.log('✅ rate_plan_codes 배열 형태의 데이터 발견')
              ratePlanData = parsedData
            } else if (parsedData && typeof parsedData === 'object') {
              console.log('✅ rate_plan_codes 객체 형태의 데이터 발견')
              console.log('🔍 rate_plan_codes 객체 키들:', Object.keys(parsedData))
              
              // rate_plan_codes에서도 다양한 구조 탐색
              let foundRatePlans = null
              
              if (parsedData.RatePlanCodes && Array.isArray(parsedData.RatePlanCodes)) {
                console.log('✅ rate_plan_codes에서 RatePlanCodes 배열 발견')
                foundRatePlans = parsedData.RatePlanCodes
              } else if (parsedData.ratePlanCodes && Array.isArray(parsedData.ratePlanCodes)) {
                console.log('✅ rate_plan_codes에서 ratePlanCodes 배열 발견')
                foundRatePlans = parsedData.ratePlanCodes
              } else if (parsedData.RatePlanCode && Array.isArray(parsedData.RatePlanCode)) {
                console.log('✅ rate_plan_codes에서 RatePlanCode 배열 발견')
                foundRatePlans = parsedData.RatePlanCode
              } else if (parsedData.ratePlanCode && Array.isArray(parsedData.ratePlanCode)) {
                console.log('✅ rate_plan_codes에서 ratePlanCode 배열 발견')
                foundRatePlans = parsedData.ratePlanCode
              } else if (parsedData.Rates && Array.isArray(parsedData.Rates)) {
                console.log('✅ rate_plan_codes에서 Rates 배열 발견')
                foundRatePlans = parsedData.Rates
              } else if (parsedData.rates && Array.isArray(parsedData.rates)) {
                console.log('✅ rate_plan_codes에서 rates 배열 발견')
                foundRatePlans = parsedData.rates
              }
              
              if (foundRatePlans) {
                ratePlanData = foundRatePlans
              } else {
                console.log('✅ rate_plan_codes 단일 객체를 배열로 변환')
                ratePlanData = [parsedData]
              }
            } else {
              console.log('✅ rate_plan_codes 단일 값을 배열로 변환')
              ratePlanData = [parsedData]
            }
            
            console.log('🔍 rate_plan_codes 최종 ratePlanData:', ratePlanData)
          } catch (parseError) {
            console.log('❌ rate_plan_codes 파싱 실패:', parseError)
            console.log('📝 원본 rate_plan_codes 데이터:', supabaseHotel.rate_plan_codes)
            ratePlanData = [supabaseHotel.rate_plan_codes]
          }

          

            
            
            // deepGet 유틸리티 함수로 중첩된 객체에서 값 추출
            const deepGet = (obj: unknown, keys: string[]): unknown => {
              let cur: unknown = obj
              for (const key of keys) {
                if (cur && typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur as object, key)) {
                  cur = (cur as Record<string, unknown>)[key]
                } else {
                  return undefined
                }
              }
              return cur
            }
            
            // 1차: 직접적인 RateKey 필드들
            rateKey = deepGet(item, ['RateKey']) || deepGet(item, ['rateKey']) || deepGet(item, ['rate_key'])
            
            // 2차: RatePlans > RatePlan > RateKey 구조 (참조 코드와 동일)
            if (!rateKey) {
              rateKey = deepGet(item, ['RatePlans', 'RatePlan', 'RateKey'])
            }
            
            // 3차: ConvertedRateInfo > RateKey 구조 (참조 코드와 동일)
            if (!rateKey) {
              rateKey = deepGet(item, ['ConvertedRateInfo', 'RateKey'])
            }
            
            // 4차: Room > RatePlans > RatePlan > RateKey 구조 (참조 코드와 동일)
            if (!rateKey) {
              rateKey = deepGet(item, ['Room', 'RatePlans', 'RatePlan', 'RateKey'])
            }
            
            // 5차: HotelDetailsInfo > HotelRateInfo > Rooms > Room > RatePlans > RatePlan > RateKey 구조
            if (!rateKey) {
              rateKey = deepGet(item, ['HotelDetailsInfo', 'HotelRateInfo', 'Rooms', 'Room', 'RatePlans', 'RatePlan', 'RateKey'])
            }
            
            // 6차: GetHotelDetailsRS > HotelDetailsInfo > HotelRateInfo > Rooms > Room > RatePlans > RatePlan > RateKey 구조
            if (!rateKey) {
              rateKey = deepGet(item, ['GetHotelDetailsRS', 'HotelDetailsInfo', 'HotelRateInfo', 'Rooms', 'Room', 'RatePlans', 'RatePlan', 'RateKey'])
            }
            
            // 7차: 다른 가능한 경로들
            if (!rateKey) {
              rateKey = deepGet(item, ['RatePlan', 'RateKey']) || 
                       deepGet(item, ['ratePlan', 'rateKey']) ||
                       deepGet(item, ['Plan', 'RateKey']) ||
                       deepGet(item, ['plan', 'rateKey'])
            }
            
            // 8차: 일반적인 필드들 (폴백)
            if (!rateKey) {
              rateKey = item.RateKey || item.rateKey || item.rate_key || item.rateCode || item.rate_code || 
                       item.RatePlanCode || item.ratePlanCode || item.RatePlan || item.ratePlan ||
                       item.RateCode || item.rate_code || item.Rate || item.rate
            }
            
            // 9차: 첫 번째 비어있지 않은 문자열 값 사용 (최후 수단)
            if (!rateKey) {
              const firstStringValue = Object.values(item).find(value => 
                typeof value === 'string' && value.trim() !== '' && value !== 'null' && value !== 'undefined'
              )
              if (firstStringValue) {
                rateKey = firstStringValue
                console.log(`🔍 첫 번째 문자열 값에서 RateKey 발견:`, firstStringValue)
              }
            }
            

            
            console.log(`🔍 아이템 ${index} RateKey 추출 시도 (참조 코드 기반):`, {
              RateKey: item.RateKey,
              rateKey: item.rateKey,
              rate_key: item.rate_key,
              rateCode: item.rateCode,
              rate_code: item.rate_code,
              RatePlanCode: item.RatePlanCode,
              ratePlanCode: item.ratePlanCode,
              RatePlan: item.RatePlan,
              ratePlan: item.ratePlan,
              RateCode: item.RateCode,
              Rate: item.Rate,
              rate: item.rate,
              BookingCode: item.BookingCode,
              PlanCode: item.PlanCode,
              Id: item.Id,
              ID: item.ID,
              Identifier: item.Identifier
            })
            
            if (!rateKey) {
              console.log(`⚠️ 아이템 ${index}에서 RateKey를 찾을 수 없음:`, item)
              console.log(`🔍 사용 가능한 키들:`, Object.keys(item))
              console.log(`🔍 모든 값들:`, Object.values(item))
              
              // 추가 디버깅: 각 키-값 쌍 출력
              Object.entries(item).forEach(([key, value]) => {
                console.log(`  ${key}: ${value} (${typeof value})`)
              })
            } else {
              console.log(`✅ 아이템 ${index}에서 RateKey 발견:`, rateKey)
            }
            
            // RoomType 추출 - 객실 유형 (STD, SUP, DLX, STE 등)
            const roomType = item.RoomType || item.roomType || item.room_type || item.RoomTypeCode || 
                           item.roomTypeCode || item.RoomCategory || item.roomCategory || item.RoomClass || item.roomClass
            
            console.log(`🔍 아이템 ${index} RoomType 추출:`, {
              RoomType: item.RoomType,
              roomType: item.roomType,
              room_type: item.room_type,
              RoomTypeCode: item.RoomTypeCode,
              roomTypeCode: item.roomTypeCode,
              RoomCategory: item.RoomCategory,
              roomCategory: item.roomCategory,
              RoomClass: item.RoomClass,
              roomClass: item.roomClass
            })
            
            // RoomName 추출 - 객실 상세 명칭
            const roomName = item.RoomName || item.roomName || item.room_name || item.RoomDescription || 
                           item.roomDescription || item.RoomTitle || item.roomTitle || item.RoomLabel || item.roomLabel
            
            console.log(`🔍 아이템 ${index} RoomName 추출:`, {
              RoomName: item.RoomName,
              roomName: item.roomName,
              room_name: item.room_name,
              RoomDescription: item.RoomDescription,
              roomDescription: item.roomDescription,
              RoomTitle: item.RoomTitle,
              roomTitle: item.roomTitle,
              RoomLabel: item.RoomLabel,
              roomLabel: item.roomLabel
            })
            
            // Description 추출 - 객실 상세 설명
            const description = item.Description || item.description || item.Description || item.RatePlanDescription || 
                              item.ratePlanDescription || item.RateDescription || item.rateDescription || 
                              item.RoomDescription || item.roomDescription || item.Details || item.details
            
            console.log(`🔍 아이템 ${index} Description 추출:`, {
              Description: item.Description,
              description: item.description,
              RatePlanDescription: item.RatePlanDescription,
              ratePlanDescription: item.ratePlanDescription,
              RateDescription: item.RateDescription,
              rateDescription: item.rateDescription,
              RoomDescription: item.RoomDescription,
              roomDescription: item.roomDescription,
              Details: item.Details,
              details: item.details
            })
            
            // Currency 추출 - 통화 코드
            const currency = item.Currency || item.currency || item.CurrencyCode || item.currencyCode || 
                           item.Curr || item.curr || 'KRW'
            
            console.log(`🔍 아이템 ${index} Currency 추출:`, {
              Currency: item.Currency,
              currency: item.currency,
              CurrencyCode: item.CurrencyCode,
              currencyCode: item.currencyCode,
              Curr: item.Curr,
              curr: item.curr
            })
            
            // AmountAfterTax 추출 - 세후 가격
            const amountAfterTax = item.AmountAfterTax || item.amountAfterTax || item.amount_after_tax || 
                                 item.TotalAmount || item.totalAmount || item.Total || item.total || 
                                 item.Price || item.price || item.Cost || item.cost
            
            console.log(`🔍 아이템 ${index} AmountAfterTax 추출:`, {
              AmountAfterTax: item.AmountAfterTax,
              amountAfterTax: item.amountAfterTax,
              amount_after_tax: item.amount_after_tax,
              TotalAmount: item.TotalAmount,
              totalAmount: item.totalAmount,
              Total: item.Total,
              total: item.total,
              Price: item.Price,
              price: item.price,
              Cost: item.Cost,
              cost: item.cost
            })
            
            // AmountBeforeTax 추출 - 세전 가격
            const amountBeforeTax = item.AmountBeforeTax || item.amountBeforeTax || item.amount_before_tax || 
                                  item.BaseAmount || item.baseAmount || item.Base || item.base || 
                                  item.Subtotal || item.subtotal || item.NetAmount || item.netAmount
            
            console.log(`🔍 아이템 ${index} AmountBeforeTax 추출:`, {
              AmountBeforeTax: item.AmountBeforeTax,
              amountBeforeTax: item.amountBeforeTax,
              amount_before_tax: item.amount_before_tax,
              BaseAmount: item.BaseAmount,
              baseAmount: item.baseAmount,
              Base: item.Base,
              base: item.base,
              Subtotal: item.Subtotal,
              subtotal: item.subtotal,
              NetAmount: item.NetAmount,
              netAmount: item.netAmount
            })
            
            // RoomTypeCode 추출 - 객실 타입 코드
            const roomTypeCode = item.RoomTypeCode || item.roomTypeCode || item.room_type_code || 
                               item.RoomCode || item.roomCode || item.TypeCode || item.typeCode || 
                               item.CategoryCode || item.categoryCode
            
            console.log(`🔍 아이템 ${index} RoomTypeCode 추출:`, {
              RoomTypeCode: item.RoomTypeCode,
              roomTypeCode: item.roomTypeCode,
              room_type_code: item.room_type_code,
              RoomCode: item.RoomCode,
              roomCode: item.roomCode,
              TypeCode: item.TypeCode,
              typeCode: item.typeCode,
              CategoryCode: item.CategoryCode,
              categoryCode: item.categoryCode
            })
            
            // RatePlanType 추출 - 요금 플랜 타입
            const ratePlanType = item.RatePlanType || item.ratePlanType || item.rate_plan_type || 
                               item.RateType || item.rateType || item.PlanType || item.planType || 
                               item.RateCategory || item.rateCategory || item.PricingType || item.pricingType
            
            console.log(`🔍 아이템 ${index} RatePlanType 추출:`, {
              RatePlanType: item.RatePlanType,
              ratePlanType: item.ratePlanType,
              rate_plan_type: item.rate_plan_type,
              RateType: item.RateType,
              rateType: item.rateType,
              PlanType: item.PlanType,
              planType: item.planType,
              RateCategory: item.RateCategory,
              rateCategory: item.rateCategory,
              PricingType: item.PricingType,
              pricingType: item.pricingType
            })
            
            // BookingCode 추출 - 예약 코드
            const bookingCode = item.BookingCode || item.bookingCode || item.booking_code || 
                              item.ReservationCode || item.reservationCode || item.BookCode || item.bookCode || 
                              item.ConfirmationCode || item.confirmationCode
            
            console.log(`🔍 아이템 ${index} BookingCode 추출:`, {
              BookingCode: item.BookingCode,
              bookingCode: item.bookingCode,
              booking_code: item.booking_code,
              ReservationCode: item.ReservationCode,
              reservationCode: item.reservationCode,
              BookCode: item.BookCode,
              bookCode: item.bookCode,
              ConfirmationCode: item.ConfirmationCode,
              confirmationCode: item.confirmationCode
            })
            
            // RatePlanDescription 추출 - 요금 플랜 설명
            const ratePlanDescription = item.RatePlanDescription || item.ratePlanDescription || item.rate_plan_description || 
                                      item.RateDescription || item.rateDescription || item.PlanDescription || item.planDescription || 
                                      item.RateInfo || item.rateInfo || item.PlanInfo || item.planInfo
            
            console.log(`🔍 아이템 ${index} RatePlanDescription 추출:`, {
              RatePlanDescription: item.RatePlanDescription,
              ratePlanDescription: item.ratePlanDescription,
              rate_plan_description: item.rate_plan_description,
              RateDescription: item.RateDescription,
              rateDescription: item.rateDescription,
              PlanDescription: item.PlanDescription,
              planDescription: item.planDescription,
              RateInfo: item.RateInfo,
              rateInfo: item.rateInfo,
              PlanInfo: item.PlanInfo,
              planInfo: item.planInfo
            })
            
            const result = {
              RateKey: rateKey || 'N/A',
              RoomType: roomType || 'N/A',
              RoomName: roomName || 'N/A',
              Description: description || 'N/A',
              Currency: currency || 'KRW',
              AmountAfterTax: amountAfterTax || 'N/A',
              AmountBeforeTax: amountBeforeTax || 'N/A',
              RoomTypeCode: roomTypeCode || 'N/A',
              RatePlanDescription: ratePlanDescription || 'N/A',
              RatePlanType: ratePlanType || 'N/A',
              BookingCode: bookingCode || 'N/A'
            }
            
            console.log(`🔍 아이템 ${index} 최종 변환 결과:`, result)
            return result
          })
          
          console.log('🔄 변환된 Rate Plan 데이터:', transformedData)
          return transformedData
        }
        

    },
    enabled: !!hotel?.sabre_id,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  })

  // 이미지 갤러리 열기
  const openImageGallery = () => {
    setShowImageGallery(true)
    setGalleryIndex(0)
  }

  // 이미지 갤러리 닫기
  const closeImageGallery = () => {
    setShowImageGallery(false)
  }

  // 이미지 상세 보기 열기
  const openImageDetail = (index: number) => {
    setSelectedDetailImage(index)
    setShowImageDetail(true)
  }

  // 이미지 상세 보기 닫기
  const closeImageDetail = () => {
    setShowImageDetail(false)
  }

  // 이전 이미지
  const prevImage = () => {
    setSelectedDetailImage((prev) => (prev === 0 ? hotelMedia.length - 1 : prev - 1))
  }

  // 다음 이미지
  const nextImage = () => {
    setSelectedDetailImage((prev) => (prev === hotelMedia.length - 1 ? 0 : prev + 1))
  }

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageDetail) return
      
      if (e.key === 'Escape') {
        closeImageDetail()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'ArrowRight') {
        nextImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showImageDetail])

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-[1440px] px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-64 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error || !hotel) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-[1440px] px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">호텔을 찾을 수 없습니다</h1>
            <p className="text-gray-600 mb-4">요청하신 호텔 정보를 불러올 수 없습니다.</p>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header with Back Button */}
      <div className="py-3">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="flex items-center gap-3">
            <Link href={`/destination/${hotel.city_ko || hotel.city_eng || 'unknown'}`}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                <ArrowLeft className="h-4 w-4 mr-1" />
                {hotel.city_ko || hotel.city_eng || '모든 숙소'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Combined Hotel Info Header and Image Gallery */}
      <div className="bg-gray-100 py-1.5">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Hotel Info Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{hotel.property_name_ko || '호텔명'}</h1>
                  {hotel.property_name_en && (
                    <span className="text-2xl font-bold text-gray-900">({hotel.property_name_en})</span>
                  )}
                  <div className="flex items-center">
                    {hotel.rating && [...Array(hotel.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{hotel.property_address || '주소 정보 없음'}</span>
                  <Link href="#" className="text-blue-600 text-sm hover:underline ml-2">
                    지도에서 호텔보기
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="flex gap-2 h-[400px] rounded-lg overflow-hidden">
              <div
                className="w-[60%] relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                onClick={() => openImageGallery()}
              >
                {hotelMedia.length > 0 ? (
                  <Image
                    src={hotelMedia[selectedImage]?.media_path || hotelMedia[0]?.media_path}
                    alt={hotel.property_name_ko || '호텔 이미지'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">📷</div>
                      <div className="text-sm font-medium">No Image</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {/* 호텔 미디어 이미지가 있는 경우 순차적으로 표시 */}
                {hotelMedia.length > 0 ? (
                  <>
                    {hotelMedia.slice(1, 5).map((media, index) => (
                      <div
                        key={media.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => {
                          setSelectedImage(index + 1)
                          openImageGallery()
                        }}
                      >
                        <Image
                          src={media.media_path}
                          alt={`Gallery ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && hotelMedia.length > 5 && (
                          <div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              openImageGallery()
                            }}
                          >
                            <div className="text-white text-center">
                              <div className="text-lg font-bold">사진 모두보기</div>
                              <div className="text-sm">({hotelMedia.length}장)</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 5개 미만인 경우 빈 썸네일 표시 */}
                    {hotelMedia.length < 5 && Array.from({ length: 5 - hotelMedia.length }).map((_, index) => (
                      <div key={`empty-${index}`} className="bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-lg mb-1">📷</div>
                          <div className="text-xs font-medium">No Image</div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] max-h-[800px] overflow-hidden">
            {/* Top Header Bar */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {hotel.property_name_ko || hotel.property_name_en || '호텔명'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>2026년 7월 15일</span>
                  <span>-</span>
                  <span>2026년 7월 16일</span>
                  <span className="ml-2">성인 2명</span>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  확인
                </Button>
              </div>
              <button
                onClick={closeImageGallery}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Image Category Tabs */}
            <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-200 overflow-x-auto">
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                슬라이드쇼
              </button>
              <button className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-2 whitespace-nowrap">
                전체({hotelMedia.length})
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                동영상(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                객실(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                숙소(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                편의/부대시설(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                식사 공간/장소(0)
              </button>
              <button className="text-sm text-gray-600 hover:text-blue-600 whitespace-nowrap">
                주변 명소(0)
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex h-[calc(100%-140px)]">
              {/* Left Section - Image Grid */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!showImageDetail ? (
                  <div className="grid grid-cols-3 gap-4">
                    {hotelMedia.map((media, index) => (
                      <div 
                        key={media.id} 
                        className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => openImageDetail(index)}
                      >
                        <Image
                          src={media.media_path}
                          alt={`Gallery ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                        {index === 0 && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                  </div>
                ) : (
                  /* Image Detail View */
                  <div className="h-full flex flex-col">
                    {/* Detail Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={closeImageDetail}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>갤러리로 돌아가기</span>
                      </button>
                      <div className="text-sm text-gray-500">
                        {selectedDetailImage + 1} / {hotelMedia.length}
                      </div>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100">
                      {hotelMedia.length > 0 ? (
                        <Image
                          src={hotelMedia[selectedDetailImage]?.media_path}
                          alt={`Detail ${selectedDetailImage + 1}`}
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <div className="text-4xl mb-4">📷</div>
                            <div className="text-xl">이미지가 없습니다</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Controls */}
                    {hotelMedia.length > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <button
                          onClick={prevImage}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>이전</span>
                        </button>
                        <button
                          onClick={nextImage}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <span>다음</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Thumbnail Navigation */}
                    {hotelMedia.length > 1 && (
                      <div className="mt-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {hotelMedia.map((media, index) => (
                            <button
                              key={media.id}
                              onClick={() => setSelectedDetailImage(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                index === selectedDetailImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Image
                                src={media.media_path}
                                alt={`Thumbnail ${index + 1}`}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Section - Information Sidebar */}
              <div className="w-80 border-l border-gray-200 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      [숙소 100배 즐기기]
                    </h3>
                  </div>

                  {/* Benefit List */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">대중교통(260m 거리)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">공항 이동 교통편 서비스</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-700">
                        {hotel.city_ko || hotel.city_eng || '도시'}의 중심지에 위치
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700">무료 Wi-Fi (모든 객실)</span>
                    </div>
                  </div>

                  {/* Promotional Text */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-blue-600">인기 많은 숙소입니다!</p>
                    <p className="text-xs text-gray-600">오늘 21명의 여행객이 이 숙소 예약함</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full text-gray-700 border-gray-300 hover:bg-gray-50">
                      숙소 인근 명소 보기
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      예약 가능한 객실 보기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Promotion */}
      <div className="bg-gray-100 py-4 mt-1.5">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="font-medium text-lg">프로모션</span>
              <div className="flex gap-2">
                <span className="bg-pink-500 px-3 py-1 rounded text-sm font-medium">% 최대 8,000원 할인</span>
                <span className="bg-orange-500 px-3 py-1 rounded text-sm font-medium">① 최대 27,882원</span>
                <span className="bg-pink-500 px-3 py-1 rounded text-sm font-medium">최대 20% 할인</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Tab Navigation */}
            <div className="flex items-center gap-8 border-b mb-6">
              <button
                onClick={() => setActiveTab("benefits")}
                className={`flex items-center gap-2 pb-3 font-semibold ${
                  activeTab === "benefits"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="text-xl">🏆</span>
                예약 혜택
              </button>
              <button
                onClick={() => setActiveTab("introduction")}
                className={`pb-3 font-semibold ${
                  activeTab === "introduction"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                호텔 소개
              </button>
              <button
                onClick={() => setActiveTab("transportation")}
                className={`pb-3 font-semibold ${
                  activeTab === "transportation"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                위치 및 교통
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "benefits" && (
              <div className="space-y-3">
                <h4 className="text-base font-medium text-gray-700 mb-4">예약 시 제공되는 혜택</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Utensils className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="text-xs text-gray-700">2인 조식 무료 제공</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-green-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-semibold text-xs">$</span>
                    </div>
                    <div className="text-xs text-gray-700">100$ 상당의 식음료 크레딧</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-purple-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="text-xs text-gray-700">얼리 체크인, 레이트 체크아웃 (현장 가능시)</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-indigo-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Bed className="h-3 w-3 text-indigo-600" />
                    </div>
                    <div className="text-xs text-gray-700">객실 무료 업그레이드 (현장 가능시)</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-amber-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Star className="h-3 w-3 text-amber-600" />
                    </div>
                    <div className="text-xs text-gray-700">글로벌 체인 멤버십 포인트 적립</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-slate-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <Shield className="h-3 w-3 text-slate-600" />
                    </div>
                    <div className="text-xs text-gray-700">투숙 후 호텔에서 체크아웃 시 결제</div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                    <div className="w-6 h-6 bg-rose-50 rounded-md flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-3 w-3 text-rose-600" />
                    </div>
                    <div className="text-xs text-gray-700">전문 컨시어지를 통한 1:1 프라이빗 상담 예약</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "introduction" && (
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <h4 className="text-lg font-semibold mb-3">{hotel.property_name_ko || '호텔'} 소개</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {hotel.property_description || `${hotel.property_name_ko || '호텔'}에 대한 상세한 정보가 제공되지 않았습니다.`}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">위치</h5>
                      <p className="text-sm text-gray-600">{hotel.city_ko || hotel.city_eng || '위치 정보 없음'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold mb-2">체인</h5>
                      <p className="text-sm text-gray-600">{hotel.chain_ko || hotel.chain_eng || '체인 정보 없음'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "transportation" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    교통편 안내
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-blue-900 mb-2">📍 위치 정보</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>도시</span>
                          <span className="text-blue-600 font-medium">{hotel.city_ko || hotel.city_eng || '정보 없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>주소</span>
                          <span className="text-blue-600 font-medium">{hotel.property_address || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-green-900 mb-2">🏨 호텔 정보</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>체인</span>
                          <span className="text-green-600 font-medium">{hotel.chain_ko || hotel.chain_eng || '정보 없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>브랜드</span>
                          <span className="text-blue-600 font-medium">{hotel.brand_ko || hotel.brand_eng || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-orange-900 mb-2">⭐ 등급</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>호텔 등급</span>
                          <span className="text-orange-600 font-medium">{hotel.rating || '정보 없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>카테고리</span>
                          <span className="text-orange-600 font-medium">{hotel.category || '정보 없음'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">ℹ️ 추가 정보</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>설명</span>
                          <span className="text-gray-600 font-medium">{hotel.property_description ? '있음' : '없음'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>이미지</span>
                          <span className="text-gray-600 font-medium">{hotel.image ? '있음' : '없음'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
          <CommonSearchBar
            variant="hotel-detail"
            location={hotel.city_ko || hotel.city_eng || '도시'}
            checkIn="체크인 날짜"
            checkOut="체크아웃 날짜"
            guests="객실 1개, 성인 2명, 어린이 0명"
          />
        </div>
      </div>

      {/* Room types & rates */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-white rounded-lg shadow-sm">


            {/* Room Details and Pricing Table */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">객실 타입별 요금 상세</h3>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">타입</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">뷰</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">베드</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">어메니티</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">객실 설명</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">포함 서비스</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">추가 서비스</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">부가 설명</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">가격</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Sample Room Row 1 */}
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="font-medium">퀸룸</div>
                        <div className="text-xs text-gray-500 mt-1">편안한 퀸 사이즈 침대로 구성된 객실</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>Standard</div>
                        <div className="text-xs text-gray-500">STD</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>코트야드 뷰</div>
                        <div className="text-xs text-gray-500">Courtyard</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>퀸 1개</div>
                        <div className="text-xs text-gray-500">160cm x 200cm</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🛁 욕조</div>
                          <div className="text-xs">🚿 샤워</div>
                          <div className="text-xs">❄️ 에어컨</div>
                          <div className="text-xs">📶 Wi-Fi</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🏨 숙박</div>
                          <div className="text-xs">🍳 조식 (선택)</div>
                          <div className="text-xs">🧹 청소</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🚭 금연</div>
                          <div className="text-xs">🌿 발코니</div>
                          <div className="text-xs">🅿️ 주차</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          40m², 2층, 엘리베이터 이용 가능, 24시간 프론트 데스크
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-right">
                          <div className="line-through text-gray-400">₩1,200,000</div>
                          <div className="text-red-600 font-semibold">₩980,000</div>
                        </div>
                      </td>
                    </tr>

                    {/* Sample Room Row 2 */}
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="font-medium">디럭스 킹룸</div>
                        <div className="text-xs text-gray-500 mt-1">넓은 공간과 킹 사이즈 침대의 프리미엄 객실</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>Deluxe</div>
                        <div className="text-xs text-gray-500">DLX</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>시티 뷰</div>
                        <div className="text-xs text-gray-500">City View</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>킹 1개</div>
                        <div className="text-xs text-gray-500">180cm x 200cm</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🛁 욕조</div>
                          <div className="text-xs">🚿 샤워</div>
                          <div className="text-xs">❄️ 에어컨</div>
                          <div className="text-xs">📶 Wi-Fi</div>
                          <div className="text-xs">🛋️ 소파</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🏨 숙박</div>
                          <div className="text-xs">🍳 조식 포함</div>
                          <div className="text-xs">🧹 청소</div>
                          <div className="text-xs">☕ 미니바</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🚭 금연</div>
                          <div className="text-xs">🌿 발코니</div>
                          <div className="text-xs">🅿️ 주차</div>
                          <div className="text-xs">🏊 수영장</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          55m², 5층, 엘리베이터 이용 가능, 24시간 프론트 데스크, 컨시어지 서비스
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-right">
                          <div className="line-through text-gray-400">₩1,500,000</div>
                          <div className="text-red-600 font-semibold">₩1,250,000</div>
                        </div>
                      </td>
                    </tr>

                    {/* Sample Room Row 3 */}
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="font-medium">스위트룸</div>
                        <div className="text-xs text-gray-500 mt-1">최고급 시설과 넓은 공간의 프리미엄 스위트</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>Suite</div>
                        <div className="text-xs text-gray-500">SUITE</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>오션 뷰</div>
                        <div className="text-xs text-gray-500">Ocean View</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div>킹 1개 + 소파베드</div>
                        <div className="text-xs text-gray-500">180cm x 200cm + 120cm x 200cm</div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🛁 욕조</div>
                          <div className="text-xs">🚿 샤워</div>
                          <div className="text-xs">❄️ 에어컨</div>
                          <div className="text-xs">📶 Wi-Fi</div>
                          <div className="text-xs">🛋️ 소파</div>
                          <div className="text-xs">🍽️ 다이닝</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🏨 숙박</div>
                          <div className="text-xs">🍳 조식 포함</div>
                          <div className="text-xs">🧹 청소</div>
                          <div className="text-xs">☕ 미니바</div>
                          <div className="text-xs">🍷 웰컴 드링크</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="space-y-1">
                          <div className="text-xs">🚭 금연</div>
                          <div className="text-xs">🌿 발코니</div>
                          <div className="text-xs">🅿️ 주차</div>
                          <div className="text-xs">🏊 수영장</div>
                          <div className="text-xs">💆 스파</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">
                          80m², 8층, 엘리베이터 이용 가능, 24시간 프론트 데스크, 전용 컨시어지, 발코니 테라스
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-sm text-gray-700">
                        <div className="text-right">
                          <div className="line-through text-gray-400">₩2,200,000</div>
                          <div className="text-red-600 font-semibold">₩1,850,000</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">테이블 설명</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">타입:</span> 객실 등급과 코드
                  </div>
                  <div>
                    <span className="font-medium">뷰:</span> 객실에서 보이는 전망
                  </div>
                  <div>
                    <span className="font-medium">베드:</span> 침대 타입과 크기
                  </div>
                  <div>
                    <span className="font-medium">어메니티:</span> 객실 내 제공 시설
                  </div>
                  <div>
                    <span className="font-medium">객실 설명:</span> 객실명과 간단한 설명
                  </div>
                  <div>
                    <span className="font-medium">포함 서비스:</span> 숙박료에 포함된 서비스
                  </div>
                  <div>
                    <span className="font-medium">추가 서비스:</span> 추가 제공되는 옵션
                  </div>
                  <div>
                    <span className="font-medium">부가 설명:</span> 기타 상세 정보
                  </div>
                </div>
              </div>

              {/* Sabre API 호텔 상세 정보 테이블 */}
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🏨</span>
                  Sabre API 호텔 상세 정보
                </h4>
                
                {sabreLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Sabre API에서 호텔 상세 정보를 가져오는 중...</span>
                    </div>
                  </div>
                ) : sabreError ? (
                  <div className="text-center py-6">
                    <div className="text-red-500 mb-2">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-sm text-red-600 mb-3">Sabre API 연결에 실패했습니다.</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• 네트워크 연결을 확인해주세요</p>
                      <p>• 잠시 후 다시 시도해주세요</p>
                    </div>
                  </div>
                ) : sabreHotelInfo ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-blue-200">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">구분</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">상세 정보</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 기본 정보 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">기본 정보</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-medium w-20">Sabre ID:</span>
                                <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                                  {hotel?.sabre_id}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium w-20">호텔명:</span>
                                <span className="font-semibold">{sabreHotelInfo.HotelName || '정보 없음'}</span>
                              </div>
                              {sabreHotelInfo.HotelCode && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">호텔 코드:</span>
                                  <span>{sabreHotelInfo.HotelCode}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* 주소 정보 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">주소 정보</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              {sabreHotelInfo.Address?.AddressLine && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">주소:</span>
                                  <span>
                                    {Array.isArray(sabreHotelInfo.Address.AddressLine) 
                                      ? sabreHotelInfo.Address.AddressLine.join(', ')
                                      : sabreHotelInfo.Address.AddressLine
                                    }
                                  </span>
                                </div>
                              )}
                              {sabreHotelInfo.Address?.Street && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">도로명:</span>
                                  <span>{sabreHotelInfo.Address.Street}</span>
                                </div>
                              )}
                              {sabreHotelInfo.Address?.CityName && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">도시:</span>
                                  <span>{sabreHotelInfo.Address.CityName}</span>
                                </div>
                              )}
                              {sabreHotelInfo.Address?.CountryCode && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">국가:</span>
                                  <span>{sabreHotelInfo.Address.CountryCode}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* 위치 정보 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">위치 정보</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              {sabreHotelInfo.LocationInfo?.CityName && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">도시명:</span>
                                  <span>{sabreHotelInfo.LocationInfo.CityName}</span>
                                </div>
                              )}
                              {sabreHotelInfo.LocationInfo?.CountryCode && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">국가 코드:</span>
                                  <span>{sabreHotelInfo.LocationInfo.CountryCode}</span>
                                </div>
                              )}
                              {sabreHotelInfo.LocationInfo?.StateCode && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">주/도:</span>
                                  <span>{sabreHotelInfo.LocationInfo.StateCode}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* 연락처 정보 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">연락처 정보</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              {sabreHotelInfo.ContactInfo?.Phone && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">전화번호:</span>
                                  <span>{sabreHotelInfo.ContactInfo.Phone}</span>
                                </div>
                              )}
                              {sabreHotelInfo.ContactInfo?.Fax && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">팩스:</span>
                                  <span>{sabreHotelInfo.ContactInfo.Fax}</span>
                                </div>
                              )}
                              {sabreHotelInfo.ContactInfo?.Email && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">이메일:</span>
                                  <span className="text-blue-600 underline">{sabreHotelInfo.ContactInfo.Email}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* 호텔 등급 및 정보 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">호텔 등급</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              {sabreHotelInfo.HotelRating && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">등급:</span>
                                  <span className="flex items-center gap-1">
                                    {Array.from({ length: parseInt(sabreHotelInfo.HotelRating) || 0 }).map((_, i) => (
                                      <span key={i} className="text-yellow-500">⭐</span>
                                    ))}
                                    <span className="ml-2">({sabreHotelInfo.HotelRating}성급)</span>
                                  </span>
                                </div>
                              )}
                              {sabreHotelInfo.HotelCategory && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">카테고리:</span>
                                  <span>{sabreHotelInfo.HotelCategory}</span>
                                </div>
                              )}
                              {sabreHotelInfo.ChainCode && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">체인 코드:</span>
                                  <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                                    {sabreHotelInfo.ChainCode}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* 시설 정보 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">시설 정보</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              {sabreHotelInfo.Amenities && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">편의시설:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.isArray(sabreHotelInfo.Amenities) 
                                      ? sabreHotelInfo.Amenities.map((amenity: string, index: number) => (
                                          <span key={index} className="bg-blue-100 px-2 py-1 rounded text-xs">
                                            {amenity}
                                          </span>
                                        ))
                                      : <span>{sabreHotelInfo.Amenities}</span>
                                    }
                                  </div>
                                </div>
                              )}
                              {sabreHotelInfo.Features && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">특징:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {Array.isArray(sabreHotelInfo.Features)
                                      ? sabreHotelInfo.Features.map((feature: string, index: number) => (
                                          <span key={index} className="bg-green-100 px-2 py-1 rounded text-xs text-green-700">
                                            {feature}
                                          </span>
                                        ))
                                      : <span>{sabreHotelInfo.Features}</span>
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* API 연동 상태 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">연동 상태</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="flex items-center gap-3">
                              <span className="font-medium w-20">상태:</span>
                              <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-xs font-medium">
                                ✓ 실시간 연동
                              </span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Sabre API에서 호텔 상세 정보를 찾을 수 없습니다.</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Sabre ID: {hotel?.sabre_id}</p>
                      <p>• 해당 호텔이 Sabre 시스템에 등록되어 있는지 확인해주세요</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 이 정보는 <a href="https://developer.sabre.com/docs/rest_apis/hotel/search/get_hotel_details/reference-documentation" 
                    target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">Sabre Hotel Details API</a>에서 실시간으로 가져온 최신 호텔 정보입니다.
                  </p>
                </div>
              </div>

              {/* Sabre API 기반 객실 타입 및 가격 정보 테이블 */}
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🏨</span>
                  Sabre API 기반 객실 정보 테이블
                </h4>
                
                {ratePlanLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Sabre API에서 Rate Plan 정보를 가져오는 중...</span>
                    </div>
                  </div>
                ) : ratePlanError ? (
                  <div className="text-center py-6">
                    <div className="text-red-500 mb-2">
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <p className="text-sm text-red-600 mb-3">Sabre API Rate Plan 데이터 조회에 실패했습니다.</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Sabre API 연결을 확인해주세요</p>
                      <p>• 호텔의 Rate Plan 정보가 있는지 확인해주세요</p>
                      <p>• 잠시 후 다시 시도해주세요</p>
                    </div>
                  </div>
                ) : ratePlanCodes && ratePlanCodes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-blue-200">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">RateKey</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">RoomType</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">RoomName</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">Description</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">Currency</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">AmountAfterTax</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">AmountBeforeTax</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">RoomTypeCode</th>
                          <th className="border border-blue-200 px-4 py-3 text-left text-sm font-semibold text-blue-900">RatePlanType</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratePlanCodes.map((ratePlan: any, index: number) => (
                          <tr key={index} className="hover:bg-blue-50">
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700 font-mono bg-blue-50">
                              {ratePlan.RateKey && ratePlan.RateKey !== 'N/A' ? (
                                ratePlan.RateKey.length > 10 ? 
                                  `${ratePlan.RateKey.slice(0, 10)}...` : 
                                  ratePlan.RateKey
                              ) : 'N/A'}
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700 font-medium">
                              {ratePlan.RoomType || 'N/A'}
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              {ratePlan.RoomName || 'N/A'}
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.Description || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.Currency || 'KRW'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              <div className="font-bold text-lg text-blue-800">
                                {ratePlan.AmountAfterTax ? 
                                  parseInt(ratePlan.AmountAfterTax).toLocaleString() : 'N/A'
                                }
                              </div>
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              <div className="font-medium text-blue-800">
                                {ratePlan.AmountBeforeTax ? 
                                  parseInt(ratePlan.AmountBeforeTax).toLocaleString() : 'N/A'
                                }
                              </div>
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RoomTypeCode || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RatePlanType || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-500 mb-2">
                      <span className="text-2xl">🏨</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Sabre API에서 Rate Plan 정보를 찾을 수 없습니다.</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Sabre ID: {hotel?.sabre_id}</p>
                      <p>• 해당 호텔의 Sabre API 연결을 확인해주세요</p>
                      <p>• Sabre API에 Rate Plan 정보가 있는지 확인해주세요</p>
                      <p>• 브라우저 개발자 도구 콘솔에서 API 응답을 확인해주세요</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 이 정보는 <strong>Sabre API의 실시간 Rate Plan 데이터</strong>에서 가져온 객실 정보입니다.
                    <br />
                    • <strong>RateKey</strong>: 각 요금 플랜의 고유 식별자 (Sabre 시스템 내 고유값)
                    <br />
                    • <strong>RoomType</strong>: 객실의 종류 (Standard, Deluxe, Suite 등)
                    <br />
                    • <strong>RoomName</strong>: 객실의 상세 명칭
                    <br />
                    • <strong>Description</strong>: 객실에 대한 상세 설명
                    <br />
                    • <strong>Currency</strong>: 통화 코드 (Sabre API 응답 기준)
                    <br />
                    • <strong>AmountAfterTax</strong>: 세후 가격 (실시간 Sabre 가격)
                    <br />
                    • <strong>AmountBeforeTax</strong>: 세전 가격 (실시간 Sabre 가격)
                    <br />
                    • <strong>RoomTypeCode</strong>: 객실 타입 코드 (Sabre 시스템 코드)
                    <br />
                    • <strong>RatePlanType</strong>: 요금 플랜 타입 (패키지, 할인 등)
                    <br />
                    • <em>참고: 이 데이터는 Sabre API에서 실시간으로 가져와 표시됩니다</em>
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

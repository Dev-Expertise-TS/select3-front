
"use client"

// Next.js
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// React
import { useState, useMemo, useEffect, useCallback } from "react"

// External libraries
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search"
import { ImageGallery } from "./components/ImageGallery"
import { MobileImageGrid } from "@/components/hotel/MobileImageGrid"
import { HotelPromotion } from "./components/HotelPromotion"
import { HotelTabs } from "./components/HotelTabs"
import { HotelInfo } from "./components/HotelInfo"
import { RoomCardList } from "./components/RoomCardList"
import { RoomRatesTable } from "./components/RoomRatesTable"

// Hooks
import { useHotelBySlug, useHotelMedia, useHotel } from "@/hooks/use-hotels"
import { HotelNotFound } from "@/components/hotel/HotelNotFound"
import { useRoomAIProcessing } from "@/hooks/use-room-ai-processing"

// Utils & Services
import { supabase } from "@/lib/supabase"
import { processHotelImages, getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"
import { useHotelImages } from "@/hooks/use-hotel-images"
import { useHotelStorageImages } from "@/hooks/use-hotel-storage-images"
import { HotelHeroImage, HotelThumbnail } from "@/components/ui/smart-image"

// Types
interface HotelDetailProps {
  hotelSlug: string;
  initialHotel?: any; // 서버에서 전달받은 초기 호텔 데이터
  searchDates?: {
    checkIn?: string;
    checkOut?: string;
  };
}

interface HotelPromotion {
  promotion_id: number;
  promotion: string;
  promotion_description: string;
  booking_date: string;
  check_in_date: string;
}

// 유틸리티 함수들 (컴포넌트 외부로 이동하여 무한 리렌더링 방지)
function deepGet(obj: unknown, keys: string[]): unknown {
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

// 개별 추출 함수들은 extractRatePlansFromSabreData 내부에서 처리하므로 제거됨

function extractRatePlansFromSabreData(sabreData: any): any[] {
  console.log('🔍 extractRatePlansFromSabreData 호출됨:', sabreData)
  if (!sabreData) {
    console.log('❌ sabreData가 없음')
    return []
  }
  
  // Sabre API 응답 구조 전체 분석
  console.log('🔍 Sabre API 응답 구조 분석:', {
    topLevelKeys: Object.keys(sabreData),
    hotelDetailsInfo: sabreData.HotelDetailsInfo ? Object.keys(sabreData.HotelDetailsInfo) : '없음',
    hotelRateInfo: sabreData.HotelDetailsInfo?.HotelRateInfo ? Object.keys(sabreData.HotelDetailsInfo.HotelRateInfo) : '없음',
    rooms: sabreData.HotelDetailsInfo?.HotelRateInfo?.Rooms ? Object.keys(sabreData.HotelDetailsInfo.HotelRateInfo.Rooms) : '없음',
    ratePlans: sabreData.HotelDetailsInfo?.RatePlans ? Object.keys(sabreData.HotelDetailsInfo.RatePlans) : '없음'
  })
  
  // Rooms에서 Rate Plan 정보 추출
  const extractRatePlansFromRooms = (roomsNode: unknown, deepGetFn: (obj: unknown, keys: string[]) => unknown): any[] => {
    console.log('🔍 extractRatePlansFromRooms 호출됨:', roomsNode)
    const roomArray: unknown[] = Array.isArray(roomsNode) ? roomsNode : [roomsNode]
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
      if (!roomViewDescription) { roomViewDescription = null } // 기본값 제거
      
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
          
          // RoomTypeCode와 BookingCode 추출
          const roomTypeCode: string = (() => {
            const paths = [
              ['RoomTypeCode'],
              ['RoomCode'],
              ['TypeCode'],
              ['Room', 'RoomTypeCode'],
              ['Room', 'Code']
            ]
            
            for (const path of paths) {
              const v = deepGetFn(p, path)
              if (typeof v === 'string' && v) return v
            }
            return ''
          })()
          
          const bookingCode: string = (() => {
            const paths = [
              ['BookingCode'],
              ['RatePlanCode'],
              ['PlanCode'],
              ['Code'],
              ['Id']
            ]
            
            for (const path of paths) {
              const v = deepGetFn(p, path)
              if (typeof v === 'string' && v) return v
            }
            return rateKey // RateKey를 기본값으로 사용
          })()
          
          // 디버깅 로그 추가
          console.log('Rate Plan 추출 결과:', {
            RateKey: rateKey,
            RoomType: roomType,
            Currency: currency,
            AmountAfterTax: amountAfterTax,
            AmountBeforeTax: amountBeforeTax,
            RoomTypeCode: roomTypeCode,
            BookingCode: bookingCode,
            RoomViewDescription: roomViewDescription,
            originalData: p
          })
          
          ratePlans.push({
            RateKey: rateKey,
            RoomType: roomType,
            RoomName: roomName,
            Description: description,
            RoomViewDescription: roomViewDescription,
            RoomView: roomViewDescription, // RoomViewDescription과 동일하게 설정
            Currency: currency,
            AmountAfterTax: amountAfterTax,
            AmountBeforeTax: amountBeforeTax,
            RoomTypeCode: roomTypeCode,
            BookingCode: bookingCode,
            // 추가 필드들
            RatePlanDescription: '',
            RatePlanType: '',
            RateDescription: '',
            PlanDescription: '',
            RateInfo: '',
            PlanInfo: '',
            RateCategory: '',
            RoomCategory: '',
            MealPlan: '',
            CancellationPolicy: '',
            DepositRequired: '',
            Prepaid: '',
            // 원본 데이터도 보존
            _original: p
          })
        }
      }
    }
    
    console.log('🔍 extractRatePlansFromRooms 최종 결과:', ratePlans)
    return ratePlans
  }
  
  // 1차 경로: GetHotelDetailsRS > HotelDetailsInfo > HotelRateInfo > Rooms > Room > RatePlans > RatePlan
  const roomsNode = deepGet(sabreData, ['HotelDetailsInfo', 'HotelRateInfo', 'Rooms', 'Room'])
  if (roomsNode) {
    console.log('✅ 1차 경로: Rooms 정보 발견:', roomsNode)
    const result = extractRatePlansFromRooms(roomsNode, deepGet)
    console.log('✅ 1차 경로 결과:', result)
    return result
  }
  
  // 2차 경로: GetHotelDetailsRS > HotelDetailsInfo > RatePlans > RatePlan
  const ratePlansNode = deepGet(sabreData, ['HotelDetailsInfo', 'RatePlans', 'RatePlan'])
  if (ratePlansNode) {
    console.log('✅ 2차 경로: RatePlans 정보 발견:', ratePlansNode)
    const plans: unknown[] = Array.isArray(ratePlansNode) ? ratePlansNode : [ratePlansNode]
    const result = plans.map((plan: any) => ({
      RateKey: plan.RateKey || '',
      RoomType: plan.RoomType || '',
      RoomName: plan.RoomName || '',
      Description: plan.Description || '',
      RoomViewDescription: plan.RoomViewDescription || null,
      RoomView: plan.RoomViewDescription || null,
      Currency: plan.Currency || '',
      AmountAfterTax: plan.AmountAfterTax || 0,
      AmountBeforeTax: plan.AmountBeforeTax || 0,
      RoomTypeCode: plan.RoomTypeCode || '',
      BookingCode: plan.BookingCode || '',
      RatePlanDescription: plan.RatePlanDescription || '',
      RatePlanType: plan.RatePlanType || '',
      RateDescription: plan.RateDescription || '',
      PlanDescription: plan.PlanDescription || '',
      RateInfo: plan.RateInfo || '',
      PlanInfo: plan.PlanInfo || '',
      RateCategory: plan.RateCategory || '',
      RoomCategory: plan.RoomCategory || '',
      MealPlan: plan.MealPlan || '',
      CancellationPolicy: plan.CancellationPolicy || '',
      DepositRequired: plan.DepositRequired || '',
      Prepaid: plan.Prepaid || '',
      _original: plan
    }))
    console.log('✅ 2차 경로 결과:', result)
    return result
  }
  
  // 3차 경로: GetHotelDetailsRS > HotelDetailsInfo > Rooms > Room > RatePlans > RatePlan
  const roomsNode2 = deepGet(sabreData, ['HotelDetailsInfo', 'Rooms', 'Room'])
  if (roomsNode2) {
    console.log('✅ 3차 경로: Rooms 정보 발견:', roomsNode2)
    const result = extractRatePlansFromRooms(roomsNode2, deepGet)
    console.log('✅ 3차 경로 결과:', result)
    return result
  }
  
  // 4차 경로: GetHotelDetailsRS > HotelDetailsInfo > HotelRateInfo > RatePlans > RatePlan
  const ratePlansNode2 = deepGet(sabreData, ['HotelDetailsInfo', 'HotelRateInfo', 'RatePlans', 'RatePlan'])
  if (ratePlansNode2) {
    console.log('✅ 4차 경로: RatePlans 정보 발견:', ratePlansNode2)
    const plans: unknown[] = Array.isArray(ratePlansNode2) ? ratePlansNode2 : [ratePlansNode2]
    const result = plans.map((plan: any) => ({
      RateKey: plan.RateKey || '',
      RoomType: plan.RoomType || '',
      RoomName: plan.RoomName || '',
      Description: plan.Description || '',
      RoomViewDescription: plan.RoomViewDescription || null,
      RoomView: plan.RoomViewDescription || null,
      Currency: plan.Currency || '',
      AmountAfterTax: plan.AmountAfterTax || 0,
      AmountBeforeTax: plan.AmountBeforeTax || 0,
      RoomTypeCode: plan.RoomTypeCode || '',
      BookingCode: plan.BookingCode || '',
      RatePlanDescription: plan.RatePlanDescription || '',
      RatePlanType: plan.RatePlanType || '',
      RateDescription: plan.RateDescription || '',
      PlanDescription: plan.PlanDescription || '',
      RateInfo: plan.RateInfo || '',
      PlanInfo: plan.PlanInfo || '',
      RateCategory: plan.RateCategory || '',
      RoomCategory: plan.RoomCategory || '',
      MealPlan: plan.MealPlan || '',
      CancellationPolicy: plan.CancellationPolicy || '',
      DepositRequired: plan.DepositRequired || '',
      Prepaid: plan.Prepaid || '',
      _original: plan
    }))
    console.log('✅ 4차 경로 결과:', result)
    return result
  }
  
  // 5차 경로: GetHotelDetailsRS > HotelDetailsInfo > HotelRateInfo > Rooms
  const roomsNode3 = deepGet(sabreData, ['HotelDetailsInfo', 'HotelRateInfo', 'Rooms'])
  if (roomsNode3) {
    console.log('✅ 5차 경로: Rooms 정보 발견:', roomsNode3)
    const result = extractRatePlansFromRooms(roomsNode3, deepGet)
    console.log('✅ 5차 경로 결과:', result)
    return result
  }
  
  // 6차 경로: GetHotelDetailsRS > HotelDetailsInfo > Rooms
  const roomsNode4 = deepGet(sabreData, ['HotelDetailsInfo', 'Rooms'])
  if (roomsNode4) {
    console.log('✅ 6차 경로: Rooms 정보 발견:', roomsNode4)
    const result = extractRatePlansFromRooms(roomsNode4, deepGet)
    console.log('✅ 6차 경로 결과:', result)
    return result
  }
  
  // 7차 경로: ConvertedRateInfo (현재 버전의 경로도 시도)
  const convertedRateInfos = deepGet(sabreData, ['HotelDetailsInfo', 'HotelRateInfo', 'RateInfos', 'ConvertedRateInfo'])
  if (convertedRateInfos) {
    console.log('✅ 7차 경로: ConvertedRateInfo 정보 발견:', convertedRateInfos)
    const rateInfoArray: unknown[] = Array.isArray(convertedRateInfos) ? convertedRateInfos : [convertedRateInfos]
    const result = rateInfoArray.map((rateInfo: any) => ({
      RateKey: rateInfo?.RateKey || '',
      RoomType: '', // ConvertedRateInfo에는 객실 상세 정보가 없을 수 있음
      RoomName: '',
      Description: '',
      RoomViewDescription: null,
      RoomView: null,
      Currency: rateInfo?.CurrencyCode || 'KRW',
      AmountAfterTax: rateInfo?.AmountAfterTax || 0,
      AmountBeforeTax: rateInfo?.AmountBeforeTax || 0,
      AverageNightlyRate: rateInfo?.AverageNightlyRate || 0,
      StartDate: rateInfo?.StartDate || '',
      EndDate: rateInfo?.EndDate || '',
      RoomTypeCode: '',
      BookingCode: '',
      RatePlanDescription: '',
      RatePlanType: '',
      RateDescription: '',
      PlanDescription: '',
      RateInfo: '',
      PlanInfo: '',
      RateCategory: '',
      RoomCategory: '',
      MealPlan: '',
      CancellationPolicy: '',
      DepositRequired: '',
      Prepaid: '',
      _original: rateInfo
    }))
    console.log('✅ 7차 경로 결과:', result)
    return result
  }
  
  console.log('❌ 모든 경로에서 Rate Plan 데이터를 찾을 수 없음')
  return []
}

interface SearchDates {
  checkIn: string;
  checkOut: string;
}

export function HotelDetail({ hotelSlug, initialHotel }: HotelDetailProps) {
  // URL 쿼리 파라미터
  const searchParams = useSearchParams()
  
  // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
  const decodedSlug = decodeURIComponent(hotelSlug)
  
  console.log('🏨 HotelDetail 컴포넌트:', {
    originalSlug: hotelSlug,
    decodedSlug: decodedSlug,
    hasSpecialChars: hotelSlug !== decodedSlug
  })

  // UI 상태 관리
  const [selectedImage, setSelectedImage] = useState(0)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [originalSelectedImage, setOriginalSelectedImage] = useState(0)

  // 검색 관련 상태
  const [searchDates, setSearchDates] = useState(() => {
    const today = new Date()
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(today.getDate() + 14)
    const twoWeeksLaterPlusOne = new Date(twoWeeksLater)
    twoWeeksLaterPlusOne.setDate(twoWeeksLater.getDate() + 1)
    
    return {
      checkIn: twoWeeksLater.toISOString().split('T')[0],
      checkOut: twoWeeksLaterPlusOne.toISOString().split('T')[0]
    }
  })
  const [hasSearched, setHasSearched] = useState(false)

  // AI 처리 훅 사용
  const {
    roomIntroductions,
    globalOTAStyleRoomNames,
    bedTypes,
    isGeneratingIntroductions,
    isGeneratingRoomNames,
    isGeneratingBedTypes,
    currentProcessingRow,
    processRatePlans,
    processRemainingRatePlans,
    processSingleRoomIntro,
    cacheStats,
    clearCache,
    getCacheInfo
  } = useRoomAIProcessing()

  // URL로부터 checkIn/checkOut이 오면 초기화
  useEffect(() => {
    const ci = searchParams?.get('checkIn') || ''
    const co = searchParams?.get('checkOut') || ''
    if (ci && co) {
      setSearchDates({ checkIn: ci, checkOut: co })
    }
  }, [searchParams])

  // 프로모션 데이터 상태 관리
  const [hotelPromotions, setHotelPromotions] = useState<HotelPromotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false)

  // 이미지 로딩 상태 관리 (기존 로직 유지)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [imageLoadingStates, setImageLoadingStates] = useState<Map<string, 'loading' | 'loaded' | 'error'>>(new Map())

  // ===== 유틸리티 함수들 =====
  const preloadImage = useCallback(async (src: string) => {
    // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    
    // 디버깅 로그 제거됨
    
    // 현재 상태를 함수 내부에서 확인하여 의존성 제거
    setPreloadedImages(prev => {
      if (prev.has(decodedSrc)) return prev
      
      // 로딩 상태 설정
      setImageLoadingStates(prevState => new Map(prevState).set(decodedSrc, 'loading'))
      
      // 이미지 존재 여부를 먼저 확인 (캐싱된 결과 사용)
      import('@/lib/image-cache').then(({ checkImageExists }) => {
        return checkImageExists(decodedSrc);
      }).then((exists) => {
        if (!exists) {
          // 이미지가 존재하지 않으면 preload하지 않음
          setImageLoadingStates(prevState => new Map(prevState).set(decodedSrc, 'error'))
          console.log(`⏭️ 이미지 존재하지 않음, preload 건너뜀: ${decodedSrc.substring(decodedSrc.lastIndexOf('/') + 1)}`);
          return;
        }
        
        // 이미지가 존재하면 preload 진행
        const img = new window.Image()
        img.onload = () => {
          setImageLoadingStates(prevState => new Map(prevState).set(decodedSrc, 'loaded'))
          console.log(`✅ 이미지 preload 완료: ${decodedSrc.substring(decodedSrc.lastIndexOf('/') + 1)}`)
        }
        img.onerror = (error) => {
          setImageLoadingStates(prevState => new Map(prevState).set(decodedSrc, 'error'))
          
          console.warn(`⚠️ 이미지 preload 실패: ${decodedSrc.substring(decodedSrc.lastIndexOf('/') + 1)}`, {
            error: error,
            errorType: typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString(),
            note: '이미지 preload 실패는 페이지 기능에 영향을 주지 않습니다.'
          })
        }
        img.src = decodedSrc
      }).catch((error) => {
        setImageLoadingStates(prevState => new Map(prevState).set(decodedSrc, 'error'))
        console.warn(`⚠️ 이미지 존재 여부 확인 실패: ${decodedSrc.substring(decodedSrc.lastIndexOf('/') + 1)}`, error);
      });
      
      return new Set([...prev, decodedSrc])
    })
    
    return Promise.resolve(null)
  }, []) // 의존성 완전 제거

  // 이미지 로딩 상태 확인 (디코딩된 URL 사용)
  const isImageLoading = (src: string) => {
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    return imageLoadingStates.get(decodedSrc) === 'loading';
  }
  const isImageLoaded = (src: string) => {
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    return imageLoadingStates.get(decodedSrc) === 'loaded';
  }
  const isImageError = (src: string) => {
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    return imageLoadingStates.get(decodedSrc) === 'error';
  }

  
  // URL에서 sabreId 읽기
  const sabreIdParam = Number(searchParams?.get('sabreId') || 0)

  // 호텔 데이터 조회: 초기 데이터 우선, 없으면 클라이언트에서 조회
  const { data: hotelBySlug, isLoading, error } = useHotelBySlug(hotelSlug)
  const { data: hotelById } = useHotel(sabreIdParam)
  const hotel = initialHotel || hotelById || hotelBySlug

  // 에러 처리: 호텔 데이터 조회 실패 시
  useEffect(() => {
    if (error && !initialHotel) {
      // 호텔을 찾을 수 없는 경우는 정상적인 상황이므로 경고 수준으로 로깅
      console.warn('호텔 데이터 조회 실패 (클라이언트):', {
        originalSlug: hotelSlug,
        decodedSlug: decodedSlug,
        sabreIdParam,
        error: error.message || error,
        stack: error.stack
      })
    }
  }, [error, hotelSlug, decodedSlug, sabreIdParam, initialHotel])
  
  // 페이지 렌더링/리프레시 시 자동으로 검색 실행 상태로 전환 (테이블 데이터 자동 로드)
  useEffect(() => {
    if (hotel?.sabre_id && !hasSearched) {
      setHasSearched(true)
    }
  }, [hotel?.sabre_id, hasSearched])
  
  // ===== 프로모션 관련 함수들 =====
  const fetchHotelPromotions = async (sabreId: number) => {
    console.log('🎯 fetchHotelPromotions 호출됨:', { sabreId })
    
    if (!sabreId) {
      console.log('⚠️ sabreId가 없음')
      return []
    }
    
    setIsLoadingPromotions(true)
    
    try {
      // 1단계: select_hotel_promotions_map 테이블에서 promotion_id 조회
      const { data: promotionMapData, error: mapError } = await supabase
        .from('select_hotel_promotions_map')
        .select('promotion_id')
        .eq('sabre_id', sabreId)
      
      if (mapError) {
        console.error('❌ 프로모션 맵 조회 오류:', mapError)
        return []
      }
      
      if (!promotionMapData || promotionMapData.length === 0) {
        console.log('📋 해당 호텔의 프로모션 맵 데이터 없음')
        return []
      }
      
      const promotionIds = promotionMapData.map((item: any) => item.promotion_id)
      console.log('📋 조회된 프로모션 ID들:', promotionIds)
      
      // 2단계: select_hotel_promotions 테이블에서 프로모션 상세 정보 조회 (전 컬럼 조회로 스키마 차이 안전하게 처리)
      const { data: promotionData, error: promotionError } = await supabase
        .from('select_hotel_promotions')
        .select('*')
        .in('promotion_id', promotionIds)
        .order('promotion_id', { ascending: true })
      
      if (promotionError) {
        console.error('❌ 프로모션 상세 정보 조회 오류:', {
          message: (promotionError as any)?.message,
          details: (promotionError as any)?.details,
          hint: (promotionError as any)?.hint,
          code: (promotionError as any)?.code,
        })
        return []
      }
      
      if (!promotionData || promotionData.length === 0) {
        console.log('📋 프로모션 상세 정보 없음')
        return []
      }
      
      // KST 기준 오늘 날짜 (YYYY-MM-DD) - 타임존 안전 방식
      const todayKst = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date())

      // 날짜 정규화(모든 입력을 KST YYYY-MM-DD로)
      const toKstYmd = (value?: string | null): string => {
        if (!value) return ''
        try {
          const d = new Date(value)
          return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
        } catch {
          // value가 이미 YYYY-MM-DD라면 그대로 사용(자리수 보정)
          const v = value.toString().slice(0, 10)
          const parts = v.split('-')
          if (parts.length === 3) {
            const [y,m,d] = parts
            const mm = m.padStart(2,'0')
            const dd = d.padStart(2,'0')
            return `${y}-${mm}-${dd}`
          }
          return v
        }
      }

      // 날짜 범위 포함 여부 판단 함수(경계 포함)
      const isInRange = (start?: string | null, end?: string | null): boolean => {
        const s = toKstYmd(start)
        const e = toKstYmd(end)
        if (!s && !e) return true
        if (s && todayKst < s) return false
        if (e && todayKst > e) return false
        return true
      }

      const filtered = (promotionData || []).filter((p: any) => {
        // 컬럼 이름이 다를 수 있어 유연하게 접근
        const bookingStart = p.booking_start_date ?? p.bookingStartDate ?? null
        const checkinEnd = p.check_in_end_date ?? p.checkInEndDate ?? null

        // 새로운 규칙: 예약 시작일 ~ 투숙 종료일 범위에 오늘 포함 시 노출(경계 포함)
        return isInRange(bookingStart, checkinEnd)
      })

      // 표준화된 키로 매핑 (컴포넌트에서 일관 사용)
      const normalized = filtered.map((p: any) => ({
        promotion_id: p.promotion_id,
        promotion: p.promotion,
        promotion_description: p.promotion_description ?? p.description ?? '',
        booking_start_date: p.booking_start_date ?? p.bookingStartDate ?? null,
        booking_end_date: p.booking_end_date ?? p.bookingEndDate ?? null,
        check_in_start_date: p.check_in_start_date ?? p.checkInStartDate ?? null,
        check_in_end_date: p.check_in_end_date ?? p.checkInEndDate ?? null,
        note: p.note ?? null,
      }))

      console.log('✅ 프로모션 데이터 조회 완료(필터+정규화):', normalized)
      return normalized as any
      
    } catch (error) {
      console.error('❌ 프로모션 데이터 조회 중 오류:', error)
      return []
    } finally {
      setIsLoadingPromotions(false)
    }
  }
  
  // 호텔 미디어 이미지 조회 (select_hotel_media 테이블)
  const { data: hotelMedia = [] } = useHotelMedia(hotel?.sabre_id || 0)
  
  // select_hotel_media 테이블 데이터를 사용한 이미지 배열 생성
  const hotelImages = useMemo(() => {
    if (!hotel) return []
    
    return processHotelImages(hotel, hotelMedia)
  }, [hotel, hotelMedia])
  
  // Supabase Storage 기반 호텔 이미지 URL 생성 (기본 5개)
  // hotel?.slug가 있으면 사용, 없으면 디코딩된 slug 사용
  const slugForImages = hotel?.slug || decodedSlug
  const { images: storageImages, getHeroImageUrl, getThumbnailUrl } = useHotelImages(
    slugForImages,
    hotel?.sabre_id,
    {
      count: 5,
      format: 'avif',
      quality: 85,
    }
  )

  // Supabase Storage의 모든 이미지 조회
  const { data: allStorageImagesData, loading: loadingAllImages, error: allImagesError } = useHotelStorageImages(
    hotel?.sabre_id
  )

  // 디버깅: 이미지 데이터 로깅
  useEffect(() => {
    console.log('🔍 호텔 이미지 디버깅 정보:', {
      hotel: hotel ? {
        slug: hotel.slug,
        sabre_id: hotel.sabre_id,
        property_name_ko: hotel.property_name_ko
      } : null,
      storageImages: storageImages,
      storageImagesLength: storageImages.length,
      allStorageImages: allStorageImagesData?.images,
      allStorageImagesLength: allStorageImagesData?.images.length,
      hotelImages: hotelImages,
      hotelImagesLength: hotelImages.length,
      hotelMedia: hotelMedia,
      hotelMediaLength: hotelMedia.length,
    });
  }, [hotel, storageImages, allStorageImagesData, hotelImages, hotelMedia]);
  
  // 이미지 데이터 우선순위: select_hotel_media 테이블 > Storage API > Storage URL 패턴 > select_hotels 이미지 > placeholder
  const displayImages = useMemo(() => {
    console.log('🔄 displayImages 계산 시작... (호텔 카드와 동일 방식)', {
      hotelMediaLength: hotelMedia?.length || 0,
      allStorageImagesLength: allStorageImagesData?.images?.length || 0,
      storageImagesLength: storageImages.length,
      hotelImagesLength: hotelImages.length,
      loadingAllImages: loadingAllImages,
      allImagesError: allImagesError
    });

    // 1순위: select_hotel_media 테이블 (호텔 카드와 동일)
    if (hotelMedia && hotelMedia.length > 0) {
      console.log('✅ select_hotel_media 테이블 사용 (우선순위 1) - 호텔 카드와 동일');
      const convertedImages = hotelMedia.map((media: any, index: number) => ({
        id: media.id || `media-${index}`,
        media_path: media.public_url || media.storage_path || '/placeholder.svg',
        alt: `${hotel?.property_name_ko || hotel?.property_name_en || '호텔'} 이미지 ${media.image_seq || index + 1}`,
        isMain: media.image_seq === 1 || index === 0,
        sequence: media.image_seq || index + 1,
        filename: media.file_name
      }));
      console.log('📋 select_hotel_media 이미지들:', {
        count: convertedImages.length,
        images: convertedImages.map((img: any) => ({ 
          id: img.id, 
          media_path: img.media_path, 
          sequence: img.sequence 
        }))
      });
      return convertedImages;
    }
    console.log('⚠️ select_hotel_media 테이블이 비어있음 (호텔 카드와 동일 방식)');

    // 2순위: Supabase Storage API 모든 이미지 (fallback)
    if (!loadingAllImages && !allImagesError && allStorageImagesData?.images && allStorageImagesData.images.length > 0) {
      console.log('✅ Supabase Storage API 사용 (우선순위 2 - fallback)');
      const convertedImages = allStorageImagesData.images.map((img) => ({
        id: img.id,
        media_path: img.media_path || img.url,
        alt: img.alt || `${hotel?.property_name_ko || hotel?.property_name_en || '호텔'} 이미지`,
        isMain: img.isMain,
        sequence: img.sequence,
        filename: img.filename
      }));
      console.log('📋 Storage API fallback 이미지들:', { count: convertedImages.length });
      return convertedImages;
    }

    // 3순위: 기본 Supabase Storage URL 패턴 (5개)
    if (storageImages.length > 0) {
      console.log('✅ Storage URL 패턴 사용 (우선순위 3)');
      const convertedImages = storageImages.map((url, index) => ({
        id: `storage-${index}`,
        media_path: url,
        alt: `${hotel?.property_name_ko || hotel?.property_name_en || '호텔'} 이미지 ${index + 1}`,
        isMain: index === 0
      }));
      return convertedImages;
    }
    
    // 4순위: select_hotels 이미지
    if (hotelImages.length > 0) {
      console.log('✅ select_hotels 이미지 사용 (우선순위 4)');
      return hotelImages;
    }
    
    // 5순위: placeholder
    console.log('⚠️ 모든 이미지 소스 실패, placeholder 사용');
    return [{
      id: 'placeholder',
      media_path: '/placeholder.svg',
      alt: '이미지 없음',
      isMain: true
    }];
  }, [hotelMedia, allStorageImagesData?.images, storageImages, hotelImages, hotel?.property_name_ko, hotel?.property_name_en, loadingAllImages, allImagesError]);
  
  // 이미지 preloading useEffect (최적화된 버전)
  useEffect(() => {
    if (displayImages.length > 0) {
      // 이미지 경로들을 문자열로 변환해서 비교
      const currentImagePaths = displayImages.map((img: any) => img.media_path).join(',')
      const lastPreloadedPaths = Array.from(preloadedImages).join(',')
      
      // 이미지 경로가 동일하면 다시 preload하지 않음
      if (currentImagePaths === lastPreloadedPaths) return

      console.log(`🖼️ 이미지 preloading 시작: ${displayImages.length}개 이미지`)
      
      // 모든 이미지를 순차적으로 preload (첫 번째는 이미 priority로 로드됨)
      const preloadPromises = displayImages.map((media: any, index: number) => {
        if (media.media_path) {
          console.log(`🔄 이미지 preloading 중 (${index + 1}번째): ${media.media_path}`)
          return preloadImage(media.media_path)
        }
        return Promise.resolve(null)
      })
      
      // 모든 preload 완료 후 로그
      Promise.allSettled(preloadPromises).then(() => {
        console.log(`✅ 모든 이미지 preloading 완료`)
      })
    }
  }, [displayImages.map((img: any) => img.media_path).join(',')]) // 이미지 경로만 의존성으로 사용

  // 모달이 열릴 때 body 스크롤 막기
  useEffect(() => {
    if (showImageGallery) {
      // body 스크롤 막기
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px' // 스크롤바 너비만큼 패딩 추가하지 않음
    } else {
      // body 스크롤 복원
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }

    // cleanup function
    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [showImageGallery])
  
  // sabre_hotels 테이블에서 property_details 조회 (select_hotels의 fallback으로 사용)
  const { data: sabreHotelDetails } = useQuery({
    queryKey: ['sabre-hotel-property-details', hotel?.sabre_id],
    queryFn: async () => {
      if (!hotel?.sabre_id) return null
      try {
        const { data, error } = await supabase
          .from('sabre_hotels')
          .select('property_details')
          .eq('sabre_id', hotel.sabre_id)
          .single()
        if (error) {
          console.warn('sabre_hotels.property_details 조회 오류 (fallback용):', error)
          return null
        }
        console.log('🔎 sabre_hotels.property_details 조회 결과 (fallback용):', data)
        return data
      } catch (e) {
        console.warn('sabre_hotels.property_details 조회 예외 (fallback용):', e)
        return null
      }
    },
    enabled: !!hotel?.sabre_id,
    staleTime: 5 * 60 * 1000,
  })
  
  // 호텔 소개 HTML 결정 (select_hotels > sabre_hotels 순서로 변경, select_hotels 우선)
  const introHtml = useMemo(() => {
    const rawSelect = hotel?.property_details as unknown
    const rawSabre = (sabreHotelDetails as any)?.property_details

    const normalizeHtml = (v: unknown): string | null => {
      if (!v) return null
      // 1) 문자열
      if (typeof v === 'string') {
        const t = v.trim()
        return t.length > 0 ? t : null
      }
      // 2) 배열 -> 문자열 합치기
      if (Array.isArray(v)) {
        const joined = v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n')
        return joined.trim().length > 0 ? joined : null
      }
      // 3) 객체 -> 흔한 필드 우선, 없으면 전체를 문자열화
      if (typeof v === 'object') {
        const obj = v as Record<string, unknown>
        const candidates = [
          obj.html,
          obj.content,
          obj.description,
          obj.details,
        ]
        for (const c of candidates) {
          if (typeof c === 'string' && c.trim().length > 0) return c
          if (Array.isArray(c)) {
            const joined = c.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n')
            if (joined.trim().length > 0) return joined
          }
        }
        try {
          const s = JSON.stringify(v)
          return s && s !== '{}' ? s : null
        } catch {
          return null
        }
      }
      return null
    }

    // select_hotels 우선, sabre_hotels는 fallback
    const selectHtml = normalizeHtml(rawSelect)
    const sabreHtml = normalizeHtml(rawSabre)
    const chosen = selectHtml || sabreHtml

    console.log('🧩 호텔 소개 선택 값 (select_hotels 우선):', {
      selectType: typeof rawSelect,
      sabreType: typeof rawSabre,
      selectLen: selectHtml?.length || 0,
      sabreLen: sabreHtml?.length || 0,
      picked: selectHtml ? 'select_hotels' : (sabreHtml ? 'sabre_hotels' : 'none')
    })
    return chosen || null
  }, [hotel?.property_details, sabreHotelDetails])

  // 호텔 위치 정보 HTML 결정 (property_location 우선)
  const locationHtml = useMemo(() => {
    const rawLocation = hotel?.property_location as unknown

    const normalizeHtml = (v: unknown): string | null => {
      if (!v) return null
      // 1) 문자열
      if (typeof v === 'string') {
        const t = v.trim()
        return t.length > 0 ? t : null
      }
      // 2) 배열 -> 문자열 합치기
      if (Array.isArray(v)) {
        const joined = v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n')
        return joined.trim().length > 0 ? joined : null
      }
      // 3) 객체 -> 흔한 필드 우선, 없으면 전체를 문자열화
      if (typeof v === 'object') {
        const obj = v as Record<string, unknown>
        const candidates = [
          obj.html,
          obj.content,
          obj.description,
          obj.details,
        ]
        for (const c of candidates) {
          if (typeof c === 'string' && c.trim().length > 0) return c
          if (Array.isArray(c)) {
            const joined = c.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n')
            if (joined.trim().length > 0) return joined
          }
        }
        try {
          const s = JSON.stringify(v)
          return s && s !== '{}' ? s : null
        } catch {
          return null
        }
      }
      return null
    }

    const locationHtml = normalizeHtml(rawLocation)

    console.log('📍 호텔 위치 정보:', {
      locationType: typeof rawLocation,
      locationLen: locationHtml?.length || 0,
      hasLocation: !!locationHtml
    })
    return locationHtml || null
  }, [hotel?.property_location])
  
  // 호텔 프로모션 데이터 조회
  useEffect(() => {
    if (hotel?.sabre_id) {
      console.log('🎯 호텔 프로모션 데이터 조회 시작:', hotel.sabre_id)
      fetchHotelPromotions(hotel.sabre_id).then(promotions => {
        setHotelPromotions(promotions)
        console.log('💾 프로모션 데이터 상태 업데이트 완료:', promotions.length, '개')
      })
    }
  }, [hotel?.sabre_id])

  // Sabre API를 통해 객실 데이터 조회
  const { data: sabreData, isLoading: sabreLoading, error: sabreError } = useQuery({
    queryKey: ['sabre-hotel-details', hotel?.sabre_id, searchDates.checkIn, searchDates.checkOut, hasSearched],
    queryFn: async () => {
      if (!hotel?.sabre_id || !hasSearched) return null
      
      // 날짜가 없으면 기본값 사용 (내일부터 3일 후까지)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const threeDaysLater = new Date()
      threeDaysLater.setDate(threeDaysLater.getDate() + 3)
      
      const startDate = searchDates.checkIn || tomorrow.toISOString().split('T')[0]
      const endDate = searchDates.checkOut || threeDaysLater.toISOString().split('T')[0]
      
      try {
        // rate_plan_code 파싱
        let requestRatePlanCodes: string[] = []
        
        if (hotel?.rate_plan_code) {
          try {
            if (typeof hotel.rate_plan_code === 'string') {
              const parsed = JSON.parse(hotel.rate_plan_code)
              requestRatePlanCodes = Array.isArray(parsed) ? parsed : [parsed]
            } else if (Array.isArray(hotel.rate_plan_code)) {
              requestRatePlanCodes = hotel.rate_plan_code
            } else {
              requestRatePlanCodes = [String(hotel.rate_plan_code)]
            }
          } catch (parseError) {
            console.warn('rate_plan_code 파싱 실패:', parseError)
            requestRatePlanCodes = []
          }
        }
        
        // API 요청 (rate_plan_code가 없으면 모든 Rate Plan 조회)
        const requestBody = {
          hotelCode: hotel.sabre_id.toString(),
          startDate: startDate,
          endDate: endDate,
          adults: 2,
          rooms: 1,
          // rate_plan_code가 있으면 해당 코드만, 없으면 모든 Rate Plan 조회
          ...(requestRatePlanCodes.length > 0 && { ratePlanCodes: requestRatePlanCodes })
        }

        console.log('📤 Hotel Details API 요청:', {
          requestBody,
          hotelInfo: {
            sabre_id: hotel.sabre_id,
            name_ko: hotel.property_name_ko,
            name_en: hotel.property_name_en,
            rate_plan_code: hotel.rate_plan_code
          }
        })

        const response = await fetch('/api/hotel-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(15000)
        })
        
        console.log('📥 Hotel Details API 응답 상태:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('❌ Hotel Details API 응답 오류:', {
            status: response.status,
            statusText: response.statusText,
            errorData
          })
          throw new Error(errorData.error || `API 호출 실패: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        console.log('📥 Hotel Details API 응답 데이터:', {
          success: result.success,
          hasData: !!result.data,
          hasGetHotelDetailsRS: !!result.data?.GetHotelDetailsRS,
          responseStructure: result.data ? Object.keys(result.data) : 'no data'
        })
        
        if (result.success && result.data?.GetHotelDetailsRS) {
          const responseData = {
            hotelInfo: result.data.GetHotelDetailsRS.HotelDetailsInfo?.HotelInfo,
            ratePlans: result.data.GetHotelDetailsRS
          }
          
          console.log('✅ API 응답 성공:', {
            hasHotelInfo: !!responseData.hotelInfo,
            hasRatePlans: !!responseData.ratePlans,
            ratePlansStructure: responseData.ratePlans ? Object.keys(responseData.ratePlans) : 'no ratePlans',
            fullResponseData: responseData // 전체 응답 데이터 로그
          })
          
          return responseData
        }
        
        console.warn('⚠️ API 응답에서 유효한 데이터를 찾을 수 없음:', result)
        return null
      } catch (error) {
        console.error('Hotel Details API 호출 오류:', error)
        
        // 네트워크 오류인 경우 더 자세한 로그
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          console.error('❌ 네트워크 연결 실패: Sabre API 서버에 연결할 수 없습니다.')
          console.error('❌ 서버 URL: https://sabre-nodejs-9tia3.ondigitalocean.app')
          console.error('❌ 가능한 원인: 서버 다운, 네트워크 문제, CORS 정책')
        }
        
        return null
      }
    },
    enabled: !!hotel?.sabre_id && hasSearched,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  })

  // 중복된 함수들 제거됨 - 컴포넌트 외부의 함수들 사용

  // sabreData에서 ratePlans 추출 (useMemo로 메모이제이션하여 무한 리렌더링 방지)
  const ratePlanCodes = useMemo(() => {
    if (!sabreData?.ratePlans) {
      console.log('🔍 sabreData 또는 ratePlans가 없음')
      return []
    }
    
    return extractRatePlansFromSabreData(sabreData.ratePlans)
  }, [sabreData?.ratePlans]) // sabreData.ratePlans가 변경될 때만 재계산
  
  console.log('🔍 ratePlanCodes 상태:', {
    hasSabreData: !!sabreData,
    hasRatePlans: !!sabreData?.ratePlans,
    sabreDataStructure: sabreData ? Object.keys(sabreData) : 'no sabreData',
    ratePlansStructure: sabreData?.ratePlans ? Object.keys(sabreData.ratePlans) : 'no ratePlans',
        ratePlanCodesLength: ratePlanCodes.length,
    ratePlanCodes: ratePlanCodes.slice(0, 3) // 처음 3개만 로그
  })

  // ratePlanCodes가 변경될 때 AI 처리 함수들 호출
  useEffect(() => {
    if (ratePlanCodes && ratePlanCodes.length > 0 && hotel?.property_name_ko) {
      processRatePlans(ratePlanCodes, hotel.property_name_ko, searchDates.checkIn, searchDates.checkOut)
    }
  }, [ratePlanCodes, hotel?.property_name_ko, searchDates.checkIn, searchDates.checkOut]) // processRatePlans 제거 (함수가 재생성되지 않음)

  // ===== UI 이벤트 핸들러들 =====
  const closeImageGallery = () => {
    setShowImageGallery(false)
    setSelectedImage(originalSelectedImage) // 원래 선택된 이미지로 되돌리기
  }

  const openImageGallery = () => {
    setOriginalSelectedImage(selectedImage) // 현재 선택된 이미지 인덱스 저장
    setShowImageGallery(true)
  }

  const handleImageSelect = (index: number) => {
    setSelectedImage(index)
  }

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

  // 호텔 데이터가 없는 경우 HotelNotFound 컴포넌트 표시
  if (!hotel) {
    return <HotelNotFound slug={hotelSlug} />
  }

  return (
    <div className="bg-gray-100 min-h-screen -mt-16 sm:mt-0">
      {/* Header with Back Button - 데스크톱에서만 표시 */}
      <div className="hidden sm:block py-1 pb-0 sm:pb-1 bg-white sm:bg-transparent">
        <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-0">
            <div className="flex items-center gap-2">
              <Link href="/hotel">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 px-2 sm:px-3">
                  <span className="hidden sm:inline">전체 호텔</span>
                  <span className="sm:hidden">전체 호텔</span>
                </Button>
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-900 font-normal text-sm">
                {hotel.property_name_ko}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Info and Image Gallery */}
      <HotelInfo
        hotel={hotel}
        images={displayImages}
        selectedImage={selectedImage}
        onImageSelect={handleImageSelect}
        onGalleryOpen={openImageGallery}
        preloadedImages={preloadedImages}
        imageLoadingStates={imageLoadingStates}
        isImageLoading={isImageLoading}
        isImageLoaded={isImageLoaded}
        isImageError={isImageError}
      />

      {/* Image Gallery Modal */}
      <ImageGallery
        images={(allStorageImagesData?.images && allStorageImagesData.images.length > 0)
          ? allStorageImagesData.images.map((img: any) => ({
              id: img.id,
              media_path: img.media_path || img.url,
              alt: img.alt || `${hotel.property_name_ko || hotel.property_name_en} 이미지 ${img.sequence || ''}`,
              isMain: img.isMain,
              sequence: img.sequence,
              filename: img.filename,
            }))
          : displayImages}
        hotelName={hotel.property_name_ko || hotel.property_name_en || '호텔명'}
        isOpen={showImageGallery}
        onClose={closeImageGallery}
        selectedImage={selectedImage}
        onImageSelect={handleImageSelect}
        loading={loadingAllImages}
        error={allImagesError}
      />

      {/* Promotion */}
      <HotelPromotion
        promotions={hotelPromotions}
        isLoading={isLoadingPromotions}
      />

      {/* Hotel Tabs */}
      <HotelTabs
        introHtml={introHtml}
        locationHtml={locationHtml}
        hotelName={hotel.property_name_ko || '호텔'}
        propertyAddress={hotel.property_address}
        propertyDescription={hotel.property_description}
        sabreId={hotel.sabre_id}
        hotelBlogs={hotel.blogs}
      />

      {/* Search Bar - Sticky */}
      <div className="sticky top-14 sm:top-16 z-40 bg-gray-100 pt-0 pb-1.5 sm:py-4">
        <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
          <CommonSearchBar
            variant="hotel-detail"
            location={hotel.city_ko || hotel.city_eng || '도시'}
            checkIn={searchDates.checkIn}
            checkOut={searchDates.checkOut}
            guests={{ rooms: 1, adults: 2 }}
            initialQuery={hotel.property_name_ko && hotel.property_name_en ? `${hotel.property_name_ko}(${hotel.property_name_en})` : hotel.property_name_ko || hotel.property_name_en || ''}
            onSearch={(query, dates, guests) => {
              if (dates) {
                setSearchDates(dates)
              }
              setHasSearched(true)
            }}
            isSabreLoading={sabreLoading}
          />
        </div>
      </div>

      {/* Room types & rates */}
      <div className="bg-gray-100 py-0 sm:py-4">
        <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
          <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm">


            {/* Room Details and Pricing Table */}
            <div className="p-3 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">객실 타입별 요금 상세</h3>
              
              {/* 객실 정보 표시 */}
                {sabreLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-3 text-blue-600">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium">객실 정보를 불러오는 중...</span>
                    </div>
                  </div>
                ) : sabreError ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">
                    <span className="text-4xl">⚠️</span>
                    </div>
                  <p className="text-lg text-red-600 mb-3">객실 정보를 불러올 수 없습니다.</p>
                  <div className="text-sm text-gray-500 space-y-1 mb-4">
                      <p>• 네트워크 연결을 확인해주세요</p>
                      <p>• 잠시 후 다시 시도해주세요</p>
                    <p>• 검색 버튼을 다시 클릭해주세요</p>
                    </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-600 text-lg mr-2">ℹ️</span>
                      <h4 className="text-sm font-medium text-yellow-800">서비스 상태</h4>
                  </div>
                    <p className="text-xs text-yellow-700">
                      호텔 정보 서버에 일시적인 문제가 있습니다. 기본 호텔 정보는 정상적으로 표시됩니다.
                    </p>
                    </div>
                  </div>
                ) : ratePlanCodes && ratePlanCodes.length > 0 ? (
                <div className="space-y-8">
                  {/* 객실 카드 리스트 */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">객실 타입별 요금</h4>
                    <RoomCardList
                      ratePlans={ratePlanCodes}
                      roomIntroductions={roomIntroductions}
                      globalOTAStyleRoomNames={globalOTAStyleRoomNames}
                      bedTypes={bedTypes}
                      isGeneratingIntroductions={isGeneratingIntroductions}
                      currentProcessingRow={currentProcessingRow}
                      checkIn={searchDates.checkIn}
                      checkOut={searchDates.checkOut}
                      onRequestIntro={(index) => {
                        if (!hotel?.property_name_ko) return
                        if (!ratePlanCodes || ratePlanCodes.length === 0) return
                        // 해당 index의 카드만 처리
                        processSingleRoomIntro(ratePlanCodes, hotel.property_name_ko, index, searchDates.checkIn, searchDates.checkOut)
                      }}
                    />
                    </div>
                    
                  {/* 객실 요금 상세 테이블, 데이터 테이블, 필터 영역 (비표시)
                    - 향후 재사용을 위해 코드 흔적만 남김
                    - 아래 블록 전체를 비활성화
                  */}
                  {false && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">객실 요금 상세 테이블</h4>
                      <RoomRatesTable
                        ratePlans={ratePlanCodes}
                        roomIntroductions={roomIntroductions}
                        globalOTAStyleRoomNames={globalOTAStyleRoomNames}
                        bedTypes={bedTypes}
                        isGeneratingIntroductions={isGeneratingIntroductions}
                        isGeneratingRoomNames={isGeneratingRoomNames}
                        currentProcessingRow={currentProcessingRow}
                        sabreLoading={sabreLoading}
                        sabreError={sabreError}
                        hasSearched={hasSearched}
                        cacheStats={cacheStats}
                        clearCache={clearCache}
                        getCacheInfo={getCacheInfo}
                        processRemainingRatePlans={processRemainingRatePlans}
                        hotelName={hotel?.property_name_ko || ''}
                        checkIn={searchDates.checkIn}
                        checkOut={searchDates.checkOut}
                      />
                              </div>
                  )}
                              </div>
              ) : hasSearched ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <span className="text-4xl">🏨</span>
                              </div>
                  <p className="text-lg text-gray-600 mb-3">해당 날짜에 이용 가능한 객실이 없습니다.</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>• 다른 날짜로 검색해보세요</p>
                    <p>• 호텔에 직접 문의해보세요</p>
                              </div>
                  </div>
                ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <span className="text-4xl">🔍</span>
                    </div>
                  <p className="text-lg text-gray-600 mb-3">검색 버튼을 클릭하여 객실 정보를 확인하세요.</p>
                  <div className="text-sm text-gray-500">
                    <p>위의 검색 영역에서 날짜를 선택하고 검색해주세요.</p>
                    </div>
                  </div>
                )}
                

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

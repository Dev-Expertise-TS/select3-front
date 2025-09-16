"use client"

// Next.js
import Link from "next/link"
import { useSearchParams } from "next/navigation"

// React
import { useState, useMemo, useEffect } from "react"

// External libraries
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"

// Components
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search"
import { ImageGallery } from "./components/ImageGallery"
import { HotelPromotion } from "./components/HotelPromotion"
import { HotelTabs } from "./components/HotelTabs"
import { HotelInfo } from "./components/HotelInfo"
import { RoomRatesTable } from "./components/RoomRatesTable"
import { RoomCardList } from "./components/RoomCardList"

// Hooks
import { useHotelBySlug, useHotelMedia, useHotel } from "@/hooks/use-hotels"
import { useRoomAIProcessing } from "@/hooks/use-room-ai-processing"

// Utils & Services
import { supabase } from "@/lib/supabase"
import { processHotelImages, getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"

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

interface SearchDates {
  checkIn: string;
  checkOut: string;
}

export function HotelDetail({ hotelSlug, initialHotel }: HotelDetailProps) {
  // URL 쿼리 파라미터
  const searchParams = useSearchParams()

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

  // 이미지 preloading을 위한 상태
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [imageLoadingStates, setImageLoadingStates] = useState<Map<string, 'loading' | 'loaded' | 'error'>>(new Map())

  // ===== 유틸리티 함수들 =====
  const preloadImage = (src: string) => {
    if (preloadedImages.has(src)) return Promise.resolve(null)
    
    // 로딩 상태 설정
    setImageLoadingStates(prev => new Map(prev).set(src, 'loading'))
    
    return new Promise<HTMLImageElement | null>((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        setPreloadedImages(prev => new Set([...prev, src]))
        setImageLoadingStates(prev => new Map(prev).set(src, 'loaded'))
        console.log(`✅ 이미지 preload 완료: ${src}`)
        resolve(img)
      }
      img.onerror = (error) => {
        setImageLoadingStates(prev => new Map(prev).set(src, 'error'))
        console.error(`❌ 이미지 preload 실패: ${src}`, error)
        reject(error)
      }
      img.src = src
    })
  }

  // 이미지 로딩 상태 확인
  const isImageLoading = (src: string) => imageLoadingStates.get(src) === 'loading'
  const isImageLoaded = (src: string) => imageLoadingStates.get(src) === 'loaded'
  const isImageError = (src: string) => imageLoadingStates.get(src) === 'error'

  
  // URL에서 sabreId 읽기
  const sabreIdParam = Number(searchParams?.get('sabreId') || 0)

  // 호텔 데이터 조회: 초기 데이터 우선, 없으면 클라이언트에서 조회
  const { data: hotelBySlug, isLoading, error } = useHotelBySlug(hotelSlug)
  const { data: hotelById } = useHotel(sabreIdParam)
  const hotel = initialHotel || hotelById || hotelBySlug
  
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
      
      const promotionIds = promotionMapData.map(item => item.promotion_id)
      console.log('📋 조회된 프로모션 ID들:', promotionIds)
      
      // 2단계: select_hotel_promotions 테이블에서 프로모션 상세 정보 조회
      const { data: promotionData, error: promotionError } = await supabase
        .from('select_hotel_promotions')
        .select('promotion_id, promotion, promotion_description, booking_date, check_in_date')
        .in('promotion_id', promotionIds)
        .order('promotion_id', { ascending: true })
      
      if (promotionError) {
        console.error('❌ 프로모션 상세 정보 조회 오류:', promotionError)
        return []
      }
      
      if (!promotionData || promotionData.length === 0) {
        console.log('📋 프로모션 상세 정보 없음')
        return []
      }
      
      console.log('✅ 프로모션 데이터 조회 완료:', promotionData)
      return promotionData as HotelPromotion[]
      
    } catch (error) {
      console.error('❌ 프로모션 데이터 조회 중 오류:', error)
      return []
    } finally {
      setIsLoadingPromotions(false)
    }
  }
  
  // 호텔 미디어 이미지 조회 (기존 방식)
  const { data: hotelMedia = [] } = useHotelMedia(hotel?.sabre_id || 0)
  
  // select_hotels 테이블의 이미지 컬럼들을 사용한 이미지 배열 생성 (안전한 처리)
  const hotelImages = useMemo(() => {
    if (!hotel) return []
    
    return processHotelImages(hotel)
  }, [hotel])
  
  // 이미지 데이터 우선순위: select_hotels 이미지 > hotel_media
  const displayImages = hotelImages.length > 0 ? hotelImages : hotelMedia
  
  // 이미지 preloading useEffect (개선된 버전)
  useEffect(() => {
    if (displayImages.length > 0) {
      console.log(`🖼️ 이미지 preloading 시작: ${displayImages.length}개 이미지`)
      
      // 모든 이미지를 순차적으로 preload (첫 번째는 이미 priority로 로드됨)
      const preloadPromises = displayImages.map((media, index) => {
        if (media.media_path && !preloadedImages.has(media.media_path)) {
          console.log(`🔄 이미지 preloading 중 (${index + 1}번째): ${media.media_path}`)
          return preloadImage(media.media_path).catch(error => {
            console.warn(`이미지 preload 실패 (${index + 1}번째):`, error)
            return null
          })
        }
        return Promise.resolve(null)
      })
      
      // 모든 preload 완료 후 로그
      Promise.allSettled(preloadPromises).then(() => {
        console.log(`✅ 모든 이미지 preloading 완료: ${preloadedImages.size}개 성공`)
      })
    }
  }, [displayImages, preloadedImages])

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

  // Sabre API를 통해 호텔 상세 정보 조회
  const { data: sabreData, isLoading: sabreLoading, error: sabreError } = useQuery({
    queryKey: ['sabre-hotel-details', hotel?.sabre_id, searchDates.checkIn, searchDates.checkOut],
    queryFn: async () => {
      if (!hotel?.sabre_id) return null
      
      // 날짜가 없으면 기본값 사용 (체크인은 오늘, 체크아웃은 2주 뒤)
      const startDate = searchDates.checkIn || new Date().toISOString().split('T')[0]
      const endDate = searchDates.checkOut || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      try {
        // rate_plan_code 파싱 (JSON 문자열 또는 배열 형태)
        let requestRatePlanCodes: string[] = []
        
        if (hotel?.rate_plan_code) {
          try {
            // JSON 문자열인 경우 파싱
            if (typeof hotel.rate_plan_code === 'string') {
              const parsed = JSON.parse(hotel.rate_plan_code)
              requestRatePlanCodes = Array.isArray(parsed) ? parsed : [parsed]
            } else if (Array.isArray(hotel.rate_plan_code)) {
              requestRatePlanCodes = hotel.rate_plan_code
            } else {
              requestRatePlanCodes = [String(hotel.rate_plan_code)]
            }
          } catch (parseError) {
            console.warn('rate_plan_code 파싱 실패, 기본값 사용:', parseError)
            requestRatePlanCodes = []
          }
        }
        
        console.log('🔍 호텔 rate_plan_code 정보:', {
          raw: hotel?.rate_plan_code,
          parsed: requestRatePlanCodes,
          type: typeof hotel?.rate_plan_code
        })
        
        // 내부 API 라우트 호출
        const requestBody = {
          hotelCode: hotel.sabre_id.toString(),
          startDate: startDate,
          endDate: endDate,
          adults: 2,
          rooms: 1,
          ratePlanCodes: requestRatePlanCodes.length > 0 ? requestRatePlanCodes : undefined
        }

        console.log('📤 Hotel Details API 요청:', requestBody)

        const response = await fetch('/api/hotel-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(15000)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error('Hotel Details API 응답 오류:', response.status, response.statusText, errorData)
          throw new Error(errorData.error || `API 호출 실패: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        if (result.success && result.data?.GetHotelDetailsRS) {
          // HotelInfo와 Rate Plan 데이터를 모두 반환
          return {
            hotelInfo: result.data.GetHotelDetailsRS.HotelDetailsInfo?.HotelInfo,
            ratePlans: result.data.GetHotelDetailsRS // Rate Plan 데이터는 전체 응답에서 추출
          }
        }
        return null
      } catch (error) {
        console.error('Hotel Details API 호출 오류:', error)
        return null
      }
    },
    enabled: !!hotel?.sabre_id && hasSearched,
    staleTime: 5 * 60 * 1000, // 5분 캐시
  })



  // sabreData에서 hotelInfo와 ratePlans 분리
  const sabreHotelInfo = sabreData?.hotelInfo
  const ratePlanCodes = sabreData?.ratePlans ? extractRatePlansFromSabreData(sabreData.ratePlans) : null
  
  // 디버깅 로그 추가
  console.log('🔍 Sabre API 응답 데이터:', {
    sabreData: sabreData,
    sabreHotelInfo: sabreHotelInfo,
    ratePlans: sabreData?.ratePlans,
    extractedRatePlanCodes: ratePlanCodes,
    ratePlanCodesLength: ratePlanCodes?.length
  })


  // ratePlanCodes가 변경될 때 AI 처리 함수들 호출 (날짜별로 처리)
  useEffect(() => {
    if (ratePlanCodes && ratePlanCodes.length > 0 && hotel?.property_name_ko) {
      processRatePlans(ratePlanCodes, hotel.property_name_ko, searchDates.checkIn, searchDates.checkOut)
    }
  }, [ratePlanCodes, hotel?.property_name_ko, searchDates.checkIn, searchDates.checkOut, processRatePlans])

  // Rate Plan 데이터 추출 함수
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
    
    // deepGet 유틸리티 함수
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
        if (!roomViewDescription) { roomViewDescription = 'N/A' }
            
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
                  // 다양한 경로에서 RateKey 추출
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
                  // 다양한 경로에서 통화 정보 추출
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
                  // 다양한 경로에서 세후 요금 추출
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
                  // 다양한 경로에서 세전 요금 추출
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
                  originalData: p
                })
            
            ratePlans.push({
              RateKey: rateKey,
                  RoomType: roomType,
                  RoomName: roomName,
                  Description: description,
              RoomViewDescription: roomViewDescription,
              Currency: currency,
              AmountAfterTax: amountAfterTax,
              AmountBeforeTax: amountBeforeTax,
                  RoomTypeCode: roomTypeCode,
                  BookingCode: bookingCode,
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
        RoomViewDescription: plan.RoomViewDescription || 'N/A',
        Currency: plan.Currency || '',
        AmountAfterTax: plan.AmountAfterTax || 0,
        AmountBeforeTax: plan.AmountBeforeTax || 0,
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
        RoomViewDescription: plan.RoomViewDescription || 'N/A',
        Currency: plan.Currency || '',
        AmountAfterTax: plan.AmountAfterTax || 0,
        AmountBeforeTax: plan.AmountBeforeTax || 0,
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
    
        console.log('❌ 모든 경로에서 Rate Plan 데이터를 찾을 수 없음')
        return []
  }

  // 검색 후 ratePlanCodes가 로드되면 AI 처리 함수들 자동 실행

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
        images={displayImages}
        hotelName={hotel.property_name_ko || hotel.property_name_en || '호텔명'}
        isOpen={showImageGallery}
        onClose={closeImageGallery}
        selectedImage={selectedImage}
        onImageSelect={handleImageSelect}
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
      <div className="sticky top-16 z-40 bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
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
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto max-w-[1440px] px-4">
          <div className="bg-white rounded-lg shadow-sm">


            {/* Room Details and Pricing Table */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">객실 타입별 요금 상세</h3>
              
              {/* 객실 카드 리스트 */}
              {ratePlanCodes && ratePlanCodes.length > 0 && (
                <div className="mb-8">
           <RoomCardList
             ratePlans={ratePlanCodes}
             roomIntroductions={roomIntroductions}
             globalOTAStyleRoomNames={globalOTAStyleRoomNames}
             bedTypes={bedTypes}
             isGeneratingIntroductions={isGeneratingIntroductions}
             currentProcessingRow={currentProcessingRow}
             checkIn={searchDates.checkIn}
             checkOut={searchDates.checkOut}
           />
                </div>
              )}
              
              <RoomRatesTable
                ratePlans={ratePlanCodes || []}
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
                hotelName={hotel?.property_name_ko || hotel?.property_name_en || ''}
                checkIn={searchDates.checkIn}
                checkOut={searchDates.checkOut}
              />

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
                              {hotel?.rate_plan_code && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">Rate Plan Code:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {(() => {
                                      try {
                                        const codes = typeof hotel.rate_plan_code === 'string' 
                                          ? JSON.parse(hotel.rate_plan_code) 
                                          : hotel.rate_plan_code
                                        const codeArray = Array.isArray(codes) ? codes : [codes]
                                        return codeArray.map((code: string, index: number) => (
                                          <span key={index} className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
                                            {code}
                                          </span>
                                        ))
                                      } catch {
                                        return (
                                          <span className="bg-green-100 px-2 py-1 rounded text-xs font-mono">
                                            {String(hotel.rate_plan_code)}
                                          </span>
                                        )
                                      }
                                    })()}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* 요금 코드 */}
                        <tr className="hover:bg-blue-50">
                          <td className="border border-blue-200 px-4 py-3 text-sm font-medium text-blue-800 bg-blue-50">요금 코드</td>
                          <td className="border border-blue-200 px-4 py-3 text-sm text-blue-700">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="font-medium w-20">Rate Code:</span>
                                <span className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                                  {hotel?.rate_code || '정보 없음'}
                                </span>
                              </div>
                              {hotel?.rate_code && (
                                <div className="flex items-center gap-3">
                                  <span className="font-medium w-20">상세:</span>
                                  <div className="text-xs text-gray-600 max-w-md">
                                    {typeof hotel.rate_code === 'string' && hotel.rate_code.length > 100 
                                      ? `${hotel.rate_code.substring(0, 100)}...` 
                                      : hotel.rate_code
                                    }
                                  </div>
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
                                      <span key={`hotel-rating-star-${i}`} className="text-yellow-500">⭐</span>
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
                
                {!hasSearched ? (
                  <div className="text-center py-8">
                    <div className="text-blue-500 mb-3">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <p className="text-lg font-medium text-blue-800 mb-2">검색을 시작해주세요</p>
                    <p className="text-sm text-blue-600 mb-4">위의 검색창에서 날짜와 인원을 선택한 후 검색 버튼을 눌러주세요.</p>
                    <div className="text-xs text-blue-500 space-y-1">
                      <p>• 체크인/체크아웃 날짜를 선택해주세요</p>
                      <p>• 객실, 성인, 어린이 수를 설정해주세요</p>
                      <p>• 검색 버튼을 클릭하면 실시간 객실 정보를 확인할 수 있습니다</p>
                    </div>
                  </div>
                ) : sabreLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3 text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Sabre API에서 Rate Plan 정보를 가져오는 중...</span>
                    </div>
                  </div>
                ) : sabreError ? (
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
                    {/* 디버깅 정보 추가 */}
                    <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded text-xs">
                      <p className="font-semibold text-yellow-800 mb-2">🔍 디버깅 정보:</p>
                      <p className="text-yellow-700">• 데이터 개수: {ratePlanCodes.length}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 컬럼들: {Object.keys(ratePlanCodes[0]).join(', ')}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 RoomViewDescription: {ratePlanCodes[0]?.RoomViewDescription || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 Room.RoomViewDescription: {ratePlanCodes[0]?.Room?.RoomViewDescription || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 ViewDescription: {ratePlanCodes[0]?.ViewDescription || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 View: {ratePlanCodes[0]?.View || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 RoomView: {ratePlanCodes[0]?.RoomView || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 ViewType: {ratePlanCodes[0]?.ViewType || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 ViewCategory: {ratePlanCodes[0]?.ViewCategory || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 ViewInfo: {ratePlanCodes[0]?.ViewInfo || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 ViewName: {ratePlanCodes[0]?.ViewName || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 ViewCode: {ratePlanCodes[0]?.ViewCode || 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 Room 객체 존재: {ratePlanCodes[0]?.Room ? 'Yes' : 'No'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 Room 객체 키들: {ratePlanCodes[0]?.Room ? Object.keys(ratePlanCodes[0].Room).join(', ') : 'N/A'}</p>
                      <p className="text-yellow-700">• 첫 번째 항목 데이터: {JSON.stringify(ratePlanCodes[0], null, 2).substring(0, 200)}...</p>
                    </div>
                    
                    <table className="w-full border-collapse border border-blue-200">
                      <thead>
                        <tr className="bg-blue-100">
                          {/* 기본 컬럼들 */}
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RateKey</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RoomType</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RoomName</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">View</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">Description</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">Currency</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">AmountAfterTax</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">AmountBeforeTax</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RoomTypeCode</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RatePlanDescription</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RatePlanType</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">BookingCode</th>
                          {/* 추가 컬럼들 */}
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RateDescription</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">PlanDescription</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RateInfo</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">PlanInfo</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RateCategory</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">RoomCategory</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">MealPlan</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">CancellationPolicy</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">DepositRequired</th>
                          <th className="border border-blue-200 px-2 py-2 text-left text-xs font-semibold text-blue-900 min-w-[120px]">Prepaid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratePlanCodes.map((ratePlan: any, index: number) => (
                          <tr key={index} className="hover:bg-blue-50">
                            {/* 기본 컬럼들 */}
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="font-mono bg-blue-50 p-1 rounded">
                                {ratePlan.RateKey && ratePlan.RateKey !== 'N/A' ? 
                                  (ratePlan.RateKey.length > 15 ? 
                                    `${ratePlan.RateKey.slice(0, 15)}...` : 
                                    ratePlan.RateKey
                                  ) : 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700 font-medium">
                              {ratePlan.RoomType || 'N/A'}
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              {ratePlan.RoomName || 'N/A'}
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RoomViewDescription || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.Description || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.Currency || 'KRW'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="font-bold text-blue-800">
                                {ratePlan.AmountAfterTax && ratePlan.AmountAfterTax > 0 ? 
                                  `${ratePlan.AmountAfterTax.toLocaleString()} ${ratePlan.Currency || 'KRW'}` : 
                                  <span className="text-red-500">요금 정보 없음</span>
                                }
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="font-medium text-blue-800">
                                {ratePlan.AmountBeforeTax && ratePlan.AmountBeforeTax > 0 ? 
                                  `${ratePlan.AmountBeforeTax.toLocaleString()} ${ratePlan.Currency || 'KRW'}` : 
                                  <span className="text-red-500">요금 정보 없음</span>
                                }
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RoomTypeCode || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.RatePlanDescription || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RatePlanType || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.BookingCode || 'N/A'}
                              </span>
                            </td>
                            {/* 추가 컬럼들 */}
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.RateDescription || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.PlanDescription || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.RateInfo || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.PlanInfo || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RateCategory || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.RoomCategory || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.MealPlan || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <div className="max-w-xs">
                                {ratePlan.CancellationPolicy || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.DepositRequired || 'N/A'}
                              </span>
                            </td>
                            <td className="border border-blue-200 px-2 py-2 text-xs text-blue-700">
                              <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
                                {ratePlan.Prepaid || 'N/A'}
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
                      {hotel?.sabre_id === 90 && (
                        <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                          <p className="text-yellow-800 font-medium">🔍 Sabre ID 90 특별 정보:</p>
                          <p className="text-yellow-700 text-xs">• 이 호텔은 Sabre ID 90으로 등록되어 있습니다</p>
                          <p className="text-yellow-700 text-xs">• API 연결 문제가 있을 수 있습니다</p>
                          <p className="text-yellow-700 text-xs">• 콘솔에서 상세한 디버깅 정보를 확인해주세요</p>
                        </div>
                      )}
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

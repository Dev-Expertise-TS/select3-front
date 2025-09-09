"use client"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CommonSearchBar } from "@/features/search"
import { Star, MapPin, MessageCircle, Car, Utensils, Heart, ArrowLeft, Shield, Bed, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import { useHotelBySlug, useHotelMedia, useHotel } from "@/hooks/use-hotels"
import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { generateRoomIntroductionBatch, generateRoomIntroduction, generateGlobalOTAStyleRoomName, interpretBedType } from "@/lib/openai"

interface HotelDetailProps {
  hotelSlug: string;
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

export function HotelDetail({ hotelSlug }: HotelDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState("benefits")
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [showImageDetail, setShowImageDetail] = useState(false)
  const [selectedDetailImage, setSelectedDetailImage] = useState(0)
  const [originalSelectedImage, setOriginalSelectedImage] = useState(0) // 원래 선택된 이미지 인덱스 저장
  
  // URL 쿼리 파라미터에서 날짜 읽기
  const searchParams = useSearchParams()

  // 날짜 상태 관리
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
  // URL로부터 checkIn/checkOut이 오면 초기화
  useEffect(() => {
    const ci = searchParams?.get('checkIn') || ''
    const co = searchParams?.get('checkOut') || ''
    if (ci && co) {
      setSearchDates({ checkIn: ci, checkOut: co })
    }
  }, [searchParams])
  
  // 검색 버튼을 눌렀는지 추적하는 상태
  const [hasSearched, setHasSearched] = useState(false)
  
  // 객실 소개 상태 관리
  const [roomIntroductions, setRoomIntroductions] = useState<Map<string, string>>(new Map())
  const [globalOTAStyleRoomNames, setGlobalOTAStyleRoomNames] = useState<Map<string, string>>(new Map())
  const [bedTypes, setBedTypes] = useState<Map<string, string>>(new Map())
  const [isGeneratingIntroductions, setIsGeneratingIntroductions] = useState(false)
  const [isGeneratingRoomNames, setIsGeneratingRoomNames] = useState(false)
  const [isGeneratingBedTypes, setIsGeneratingBedTypes] = useState(false)
  
  // 프로모션 데이터 상태 관리
  const [hotelPromotions, setHotelPromotions] = useState<HotelPromotion[]>([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(false)
  
  // 통합 AI 처리 함수 - 순차적으로 모든 AI 처리를 완료 (주석 처리됨)
  /*
  const processAllAI = async (ratePlans: any[], hotelName: string) => {
    console.log('🚀 processAllAI 호출됨 - 모든 AI 처리를 순차적으로 실행:', {
      ratePlanCodesLength: ratePlanCodes?.length,
      ratePlanCodes: ratePlanCodes,
      hotelName: hotelName
    })
    
    if (!ratePlanCodes || ratePlanCodes.length === 0) {
      console.log('⚠️ ratePlanCodes가 비어있음')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음')
      return
    }
    
    // 모든 로딩 상태를 true로 설정
    setIsGeneratingRoomNames(true)
    setIsGeneratingBedTypes(true)
    setIsGeneratingIntroductions(true)
    
    console.log('🔄 통합 AI 처리 시작...')
    
    try {
      // 1단계: 글로벌 호텔 OTA 스타일 객실명 생성
      console.log('📋 1단계: 글로벌 호텔 OTA 스타일 객실명 생성 시작')
      const roomNames = new Map<string, string>()
      
      for (let i = 0; i < ratePlanCodes.length; i++) {
        const rp = ratePlanCodes[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const key = `${roomType}-${roomName}`
        
        console.log(`🔍 ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 중:`, { roomType, roomName, description })
        
        try {
          const otaStyleName = await generateGlobalOTAStyleRoomName(roomType, roomName, description, hotelName)
          roomNames.set(key, otaStyleName)
          console.log(`✅ ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 완료:`, otaStyleName)
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 실패:`, roomError)
          const fallbackName = roomType && roomType !== 'N/A' ? roomType.substring(0, 15) : '객실'
          roomNames.set(key, fallbackName)
          console.log(`🔄 ${i + 1}번째 객실 fallback 객실명 사용:`, fallbackName)
        }
        
        // API 호출 간격 조절
        if (i < ratePlanCodes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      setGlobalOTAStyleRoomNames(roomNames)
      console.log('✅ 1단계 완료: 글로벌 호텔 OTA 스타일 객실명')
      
      // 2단계: 베드 타입 해석
      console.log('📋 2단계: 베드 타입 해석 시작')
      const bedTypeMap = new Map<string, string>()
      
      for (let i = 0; i < ratePlanCodes.length; i++) {
        const rp = ratePlanCodes[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const key = `${roomType}-${roomName}`
        
        console.log(`🔍 ${i + 1}번째 객실 베드 타입 해석 중:`, { roomType, roomName, description })
        
        try {
          const bedType = await interpretBedType(description, roomName)
          bedTypeMap.set(key, bedType)
          console.log(`✅ ${i + 1}번째 객실 베드 타입 해석 완료:`, bedType)
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 베드 타입 해석 실패:`, roomError)
          const fallbackType = '베드 정보 없음'
          bedTypeMap.set(key, fallbackType)
          console.log(`🔄 ${i + 1}번째 객실 fallback 베드 타입 사용:`, fallbackType)
        }
        
        // API 호출 간격 조절
        if (i < ratePlanCodes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      setBedTypes(bedTypeMap)
      console.log('✅ 2단계 완료: 베드 타입 해석')
      
      // 3단계: 객실 소개 생성
      console.log('📋 3단계: 객실 소개 생성 시작')
      const introductions = new Map<string, string>()
      
      for (let i = 0; i < ratePlanCodes.length; i++) {
        const rp = ratePlanCodes[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const key = `${roomType}-${roomName}`
        
        console.log(`🔍 ${i + 1}번째 객실 소개 생성 중:`, { roomType, roomName, description })
        
        try {
          const roomInfo = { roomType, roomName, description }
          const intro = await generateRoomIntroduction(roomInfo, hotelName)
          introductions.set(key, intro)
          console.log(`✅ ${i + 1}번째 객실 소개 생성 완료:`, intro)
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 소개 생성 실패:`, roomError)
          const fallbackIntro = `${hotelName}의 ${roomType} ${roomName} 객실입니다. ${description || '편안하고 아늑한 분위기로 최고의 숙박 경험을 제공합니다.'}`
          introductions.set(key, fallbackIntro)
          console.log(`🔄 ${i + 1}번째 객실 fallback 소개문 사용:`, fallbackIntro)
        }
        
        // API 호출 간격 조절
        if (i < ratePlanCodes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      setRoomIntroductions(introductions)
      console.log('✅ 3단계 완료: 객실 소개 생성')
      
      console.log('🎉 모든 AI 처리 완료!')
      
    } catch (error) {
      console.error('❌ 통합 AI 처리 오류:', error)
      // 에러 발생 시 모든 fallback 생성
      const fallbackNames = new Map<string, string>()
      const fallbackTypes = new Map<string, string>()
      const fallbackIntros = new Map<string, string>()
      
      ratePlanCodes.forEach((rp: any) => {
        const key = `${rp.RoomType || rp.RoomName || 'N/A'}-${rp.RoomName || 'N/A'}`
        const fallbackName = rp.RoomType && rp.RoomType !== 'N/A' ? rp.RoomType.substring(0, 15) : '객실'
        const fallbackType = '베드 정보 없음'
        const fallbackIntro = `${hotelName}의 ${rp.RoomType || rp.RoomName || 'N/A'} ${rp.RoomName || 'N/A'} 객실입니다. ${rp.Description || '편안하고 아늑한 분위기로 최고의 숙박 경험을 제공합니다.'}`
        
        fallbackNames.set(key, fallbackName)
        fallbackTypes.set(key, fallbackType)
        fallbackIntros.set(key, fallbackIntro)
      })
      
      setGlobalOTAStyleRoomNames(fallbackNames)
      setBedTypes(fallbackTypes)
      setRoomIntroductions(fallbackIntros)
      console.log('🔄 모든 fallback 데이터 생성 완료')
      
    } finally {
      // 모든 로딩 상태를 false로 설정
      setIsGeneratingRoomNames(false)
      setIsGeneratingBedTypes(false)
      setIsGeneratingIntroductions(false)
      console.log('🏁 통합 AI 처리 완료')
    }
  }
  */

  // 베드 타입 해석 함수
  const generateBedTypes = async (ratePlans: any[], hotelName: string) => {
    console.log('🛏️ generateBedTypes 호출됨:', {
      ratePlansLength: ratePlans?.length,
      ratePlans: ratePlans,
      hotelName: hotelName
    })
    
    if (!ratePlans || ratePlans.length === 0) {
      console.log('⚠️ ratePlans가 비어있음')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음')
      return
    }
    
    setIsGeneratingBedTypes(true)
    console.log('🔄 베드 타입 해석 시작...')
    
    try {
      const bedTypeMap = new Map<string, string>()
      
      // 첫 번째 행 1개만 AI 처리
      const roomsToProcess = ratePlans.slice(0, 1)
      console.log(`🔍 베드 타입 해석 대상: ${roomsToProcess.length}개 객실 (전체 ${ratePlans.length}개 중 첫 번째 행만)`)
      
      for (let i = 0; i < roomsToProcess.length; i++) {
        const rp = roomsToProcess[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const key = `${roomType}-${roomName}`
        
        console.log(`🔍 ${i + 1}번째 객실 베드 타입 해석 중:`, { roomType, roomName, description, key })
        
        try {
          const bedType = await interpretBedType(description, roomName)
          bedTypeMap.set(key, bedType)
          console.log(`✅ ${i + 1}번째 객실 베드 타입 해석 완료:`, bedType, 'key:', key)
          
          // API 호출 간격 조절 (rate limiting 방지)
          if (i < roomsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 베드 타입 해석 실패:`, roomError)
          // 개별 객실 실패 시 fallback 사용
          const fallbackType = '베드 정보 없음'
          bedTypeMap.set(key, fallbackType)
          console.log(`🔄 ${i + 1}번째 객실 fallback 베드 타입 사용:`, fallbackType, 'key:', key)
        }
      }
      
      console.log('✅ 생성된 베드 타입:', bedTypeMap)
      setBedTypes(bedTypeMap)
      console.log('💾 베드 타입 상태 업데이트 완료')
      
    } catch (error) {
      console.error('❌ 베드 타입 해석 오류:', error)
      // 에러 발생 시 기본 베드 타입 생성 (첫 번째 행만)
      const fallbackTypes = new Map<string, string>()
      const roomsToProcess = ratePlans.slice(0, 1)
      roomsToProcess.forEach((rp: any) => {
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const key = `${roomType}-${roomName}`
        const fallbackType = '베드 정보 없음'
        fallbackTypes.set(key, fallbackType)
        console.log('🔄 fallback 베드 타입 생성:', { key, fallbackType })
      })
      console.log('🔄 fallback 베드 타입 전체:', fallbackTypes)
      setBedTypes(fallbackTypes)
    } finally {
      setIsGeneratingBedTypes(false)
      console.log('🏁 베드 타입 해석 완료')
    }
  }

  // 글로벌 호텔 OTA 스타일 객실명 생성 함수
  const generateGlobalOTAStyleRoomNames = async (ratePlans: any[], hotelName: string) => {
    console.log('🏨 generateGlobalOTAStyleRoomNames 호출됨:', {
      ratePlansLength: ratePlans?.length,
      ratePlans: ratePlans,
      hotelName: hotelName
    })
    
    if (!ratePlans || ratePlans.length === 0) {
      console.log('⚠️ ratePlans가 비어있음')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음')
      return
    }
    
    setIsGeneratingRoomNames(true)
    console.log('🔄 글로벌 호텔 OTA 스타일 객실명 생성 시작...')
    
    try {
      const roomNames = new Map<string, string>()
      
      // 첫 번째 행 1개만 AI 처리
      const roomsToProcess = ratePlans.slice(0, 1)
      console.log(`🔍 객실명 생성 대상: ${roomsToProcess.length}개 객실 (전체 ${ratePlans.length}개 중 첫 번째 행만)`)
      
      for (let i = 0; i < roomsToProcess.length; i++) {
        const rp = roomsToProcess[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const key = `${roomType}-${roomName}`
        
        console.log(`🔍 ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 중:`, { roomType, roomName, description, key })
        
        try {
          const otaStyleName = await generateGlobalOTAStyleRoomName(roomType, roomName, description, hotelName)
          roomNames.set(key, otaStyleName)
          console.log(`✅ ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 완료:`, otaStyleName, 'key:', key)
          
          // API 호출 간격 조절 (rate limiting 방지)
          if (i < roomsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 실패:`, roomError)
          // 개별 객실 실패 시 fallback 사용
          const fallbackName = roomType && roomType !== 'N/A' ? roomType.substring(0, 15) : '객실'
          roomNames.set(key, fallbackName)
          console.log(`🔄 ${i + 1}번째 객실 fallback 객실명 사용:`, fallbackName, 'key:', key)
        }
      }
      
      console.log('✅ 생성된 글로벌 호텔 OTA 스타일 객실명:', roomNames)
      setGlobalOTAStyleRoomNames(roomNames)
      console.log('💾 글로벌 호텔 OTA 스타일 객실명 상태 업데이트 완료')
      
    } catch (error) {
      console.error('❌ 글로벌 호텔 OTA 스타일 객실명 생성 오류:', error)
      // 에러 발생 시 기본 객실명 생성 (3행까지만)
      const fallbackNames = new Map<string, string>()
      const roomsToProcess = ratePlans.slice(0, 3)
      roomsToProcess.forEach((rp: any) => {
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const key = `${roomType}-${roomName}`
        const fallbackName = roomType && roomType !== 'N/A' ? roomType.substring(0, 15) : '객실'
        fallbackNames.set(key, fallbackName)
        console.log('🔄 fallback 객실명 생성:', { key, fallbackName })
      })
      console.log('🔄 fallback 객실명 전체:', fallbackNames)
      setGlobalOTAStyleRoomNames(fallbackNames)
    } finally {
      setIsGeneratingRoomNames(false)
      console.log('🏁 글로벌 호텔 OTA 스타일 객실명 생성 완료')
    }
  }

  // 객실 소개 생성 함수
  const generateRoomIntroductions = async (ratePlans: any[], hotelName: string) => {
    console.log('🔍 generateRoomIntroductions 호출됨:', { 
      ratePlansLength: ratePlans?.length, 
      ratePlans: ratePlans,
      hotelName: hotelName 
    })
    
    if (!ratePlans || ratePlans.length === 0) {
      console.log('⚠️ ratePlans가 비어있음')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음')
      return
    }
    
    setIsGeneratingIntroductions(true)
    console.log('🔄 객실 소개 생성 시작...')
    
    try {
      // 첫 번째 행 1개만 AI 처리
      const roomsToProcess = ratePlans.slice(0, 1)
      const roomInfos = roomsToProcess.map((rp: any) => ({
        roomType: rp.RoomType || rp.RoomName || 'N/A',
        roomName: rp.RoomName || 'N/A',
        description: rp.Description || 'N/A',
        rateKey: rp.RateKey || 'N/A',
      }))
      
      console.log('📋 변환된 객실 정보:', roomInfos)
      console.log(`🔍 객실 소개 생성 대상: ${roomInfos.length}개 객실 (전체 ${ratePlans.length}개 중 첫 번째 행만)`)
      console.log('🏨 호텔명:', hotelName)
      
      // 첫 번째 행만 OpenAI API 적용
      console.log('🚀 첫 번째 행만 OpenAI API 적용...')
      const allIntroductions = new Map<string, string>()
      
      try {
        // 첫 번째 행에 대해서만 OpenAI API 호출
        console.log('📋 처리할 객실 수:', roomInfos.length)
        
        for (let i = 0; i < roomInfos.length; i++) {
          const room = roomInfos[i]
          const key = `${room.roomType}-${room.roomName}-${room.rateKey}`
          console.log(`🔍 ${i + 1}번째 객실 처리 중:`, room, 'key:', key)
          
          try {
            const intro = await generateRoomIntroduction(room, hotelName)
            allIntroductions.set(key, intro)
            console.log(`✅ ${i + 1}번째 객실 AI 소개문 생성 완료:`, intro, 'key:', key)
            
            // API 호출 간격 조절 (rate limiting 방지)
            if (i < roomInfos.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          } catch (roomError) {
            console.error(`❌ ${i + 1}번째 객실 AI 소개문 생성 실패:`, roomError)
            // 개별 객실 실패 시 fallback 사용
            const fallbackIntro = `${hotelName}의 ${room.roomType} ${room.roomName} 객실입니다. ${room.description || '편안하고 아늑한 분위기로 최고의 숙박 경험을 제공합니다.'}`
            allIntroductions.set(key, fallbackIntro)
            console.log(`🔄 ${i + 1}번째 객실 fallback 소개문 사용:`, fallbackIntro, 'key:', key)
          }
        }
        
        const introductions = allIntroductions
        
        console.log('✅ 생성된 객실 소개:', introductions)
        console.log('📊 소개문 개수:', introductions.size)
        
        setRoomIntroductions(introductions)
        console.log('💾 상태 업데이트 완료')
      } catch (apiError) {
        console.error('❌ OpenAI API 배치 처리 중 오류:', apiError)
        // API 오류 시 첫 번째 행만 fallback 소개문 생성
        const fallbackIntroductions = new Map<string, string>()
        roomInfos.forEach((room) => {
          const key = `${room.roomType}-${room.roomName}-${room.rateKey}`
          const fallbackIntro = `${hotelName}의 ${room.roomType} ${room.roomName} 객실입니다. ${room.description || '편안하고 아늑한 분위기로 최고의 숙박 경험을 제공합니다.'}`
          fallbackIntroductions.set(key, fallbackIntro)
          console.log('🔄 fallback 소개문 생성:', { key, fallbackIntro })
        })
        console.log('🔄 fallback 소개문 전체:', fallbackIntroductions)
        setRoomIntroductions(fallbackIntroductions)
      }
    } catch (error) {
      console.error('❌ 객실 소개 생성 오류:', error)
      // 에러 발생 시 기본 소개문 생성 (첫 번째 행만)
      const fallbackIntroductions = new Map<string, string>()
      const roomsToProcess = ratePlans.slice(0, 1)
      roomsToProcess.forEach((rp: any) => {
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const rateKey = rp.RateKey || 'N/A'
        const key = `${roomType}-${roomName}-${rateKey}`
        const fallbackIntro = `${hotelName}의 ${roomType} ${roomName} 객실입니다. ${rp.Description || '편안하고 아늑한 분위기로 최고의 숙박 경험을 제공합니다.'}`
        fallbackIntroductions.set(key, fallbackIntro)
        console.log('🔄 fallback 소개문 생성:', { key, fallbackIntro })
      })
      console.log('🔄 fallback 소개문 전체:', fallbackIntroductions)
      setRoomIntroductions(fallbackIntroductions)
    } finally {
      setIsGeneratingIntroductions(false)
      console.log('🏁 객실 소개 생성 완료')
    }
  }
  
  // URL에서 sabreId 읽기
  const sabreIdParam = Number(searchParams?.get('sabreId') || 0)

  // 호텔 데이터 조회: sabreId 우선, 없으면 slug
  const { data: hotelBySlug, isLoading, error } = useHotelBySlug(hotelSlug)
  const { data: hotelById } = useHotel(sabreIdParam)
  const hotel = hotelById || hotelBySlug
  
  // 페이지 렌더링/리프레시 시 자동으로 검색 실행 상태로 전환 (테이블 데이터 자동 로드)
  useEffect(() => {
    if (hotel?.sabre_id && !hasSearched) {
      setHasSearched(true)
    }
  }, [hotel?.sabre_id, hasSearched])
  
  // 호텔 프로모션 데이터 조회
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
  
  // select_hotels 테이블의 이미지 컬럼들을 사용한 이미지 배열 생성
  const hotelImages = useMemo(() => {
    if (!hotel) return []
    
    const images = []
    
    // image_1을 가장 큰 그리드에 사용하기 위해 첫 번째로 추가
    if (hotel.image_1) {
      images.push({
        id: 'image_1',
        media_path: hotel.image_1,
        alt: `${hotel.property_name_ko} - 메인 이미지`,
        isMain: true
      })
    }
    
    // 나머지 이미지들 추가
    if (hotel.image_2) {
      images.push({
        id: 'image_2',
        media_path: hotel.image_2,
        alt: `${hotel.property_name_ko} - 갤러리 이미지 2`,
        isMain: false
      })
    }
    
    if (hotel.image_3) {
      images.push({
        id: 'image_3',
        media_path: hotel.image_3,
        alt: `${hotel.property_name_ko} - 갤러리 이미지 3`,
        isMain: false
      })
    }
    
    if (hotel.image_4) {
      images.push({
        id: 'image_4',
        media_path: hotel.image_4,
        alt: `${hotel.property_name_ko} - 갤러리 이미지 4`,
        isMain: false
      })
    }
    
    if (hotel.image_5) {
      images.push({
        id: 'image_5',
        media_path: hotel.image_5,
        alt: `${hotel.property_name_ko} - 갤러리 이미지 5`,
        isMain: false
      })
    }
    
    return images
  }, [hotel])
  
  // 이미지 데이터 우선순위: select_hotels 이미지 > hotel_media
  const displayImages = hotelImages.length > 0 ? hotelImages : hotelMedia
  
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

  // 이미지 갤러리 닫기
  const closeImageGallery = () => {
    setShowImageGallery(false)
    setSelectedImage(originalSelectedImage) // 원래 선택된 이미지로 되돌리기
  }

  // 이미지 상세 보기 열기
  const openImageDetail = (index: number) => {
    setOriginalSelectedImage(selectedImage) // 현재 선택된 이미지 인덱스 저장
    setSelectedDetailImage(index)
    setShowImageDetail(true)
  }

  // 이미지 상세 보기 닫기
  const closeImageDetail = () => {
    setShowImageDetail(false)
    setSelectedImage(originalSelectedImage) // 원래 선택된 이미지로 되돌리기
  }

  // 이전 이미지
  const prevImage = () => {
    setSelectedDetailImage((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  // 다음 이미지
  const nextImage = () => {
    setSelectedDetailImage((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
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

  const [copiedRateKeyRow, setCopiedRateKeyRow] = useState<number | null>(null)
  const [isHotelInfoExpanded, setIsHotelInfoExpanded] = useState(false)
  
  const copyRateKey = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedRateKeyRow(index)
      setTimeout(() => setCopiedRateKeyRow(null), 1200)
    } catch (_e) {
      // noop
    }
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
                onClick={() => {
                  setOriginalSelectedImage(selectedImage) // 현재 선택된 이미지 인덱스 저장
                  setShowImageGallery(true)
                }}
              >
                {displayImages.length > 0 ? (
                  <Image
                    src={displayImages[selectedImage]?.media_path || displayImages[0]?.media_path}
                    alt={displayImages[selectedImage]?.alt || displayImages[0]?.alt || hotel.property_name_ko || '호텔 이미지'}
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
                {/* 호텔 이미지가 있는 경우 순차적으로 표시 */}
                {displayImages.length > 0 ? (
                  <>
                    {displayImages.slice(1, 5).map((media, index) => (
                      <div
                        key={media.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden"
                        onClick={() => {
                          setOriginalSelectedImage(selectedImage) // 현재 선택된 이미지 인덱스 저장
                          setSelectedImage(index + 1)
                          setShowImageGallery(true)
                        }}
                      >
                        <Image
                          src={media.media_path}
                          alt={media.alt || `Gallery ${index + 2}`}
                          fill
                          className="object-cover"
                        />
                        {index === 3 && displayImages.length > 5 && (
                          <div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOriginalSelectedImage(selectedImage) // 현재 선택된 이미지 인덱스 저장
                              setShowImageGallery(true)
                            }}
                          >
                            <div className="text-white text-center">
                              <div className="text-lg font-bold">사진 모두보기</div>
                              <div className="text-sm">({displayImages.length}장)</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* 5개 미만인 경우 빈 썸네일 표시 */}
                    {displayImages.length < 5 && Array.from({ length: 5 - displayImages.length }).map((_, index) => (
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
                전체({displayImages.length})
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
                    {displayImages.map((media, index) => (
                      <div 
                        key={media.id} 
                        className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => openImageDetail(index)}
                      >
                        <Image
                          src={media.media_path}
                          alt={media.alt || `Gallery ${index + 1}`}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
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
                        {selectedDetailImage + 1} / {displayImages.length}
                      </div>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100">
                      {displayImages.length > 0 ? (
                        <Image
                          src={displayImages[selectedDetailImage]?.media_path}
                          alt={displayImages[selectedDetailImage]?.alt || `Detail ${selectedDetailImage + 1}`}
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
                    {displayImages.length > 1 && (
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
                    {displayImages.length > 1 && (
                      <div className="mt-4">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {displayImages.map((media, index) => (
                            <button
                              key={media.id}
                              onClick={() => setSelectedDetailImage(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                index === selectedDetailImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Image
                                src={media.media_path}
                                alt={media.alt || `Thumbnail ${index + 1}`}
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
      {(isLoadingPromotions || (hotelPromotions && hotelPromotions.length > 0)) && (
        <div className="bg-gray-100 py-4 mt-1.5">
          <div className="container mx-auto max-w-[1440px] px-4">
            {isLoadingPromotions ? (
              <div className="bg-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-lg">프로모션</span>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span className="text-sm">프로모션 정보를 불러오는 중...</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium text-lg">프로모션</span>
                  <div className="flex gap-2 flex-wrap items-center">
                    {hotelPromotions.map((promotion, index) => (
                      <div key={promotion.promotion_id} className="flex items-center gap-2 min-w-0 flex-shrink-0">
                        <span className="bg-pink-500 px-3 py-1 rounded text-xs font-medium whitespace-nowrap">
                          {promotion.promotion}
                        </span>
                        {promotion.promotion_description && (
                          <span className="bg-orange-500 px-3 py-1 rounded text-xs font-medium whitespace-nowrap">
                            {promotion.promotion_description}
                          </span>
                        )}
                        {promotion.booking_date && (
                          <span className="text-xs text-blue-100 whitespace-nowrap">
                            예약: ~{new Date(promotion.booking_date).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                        {promotion.check_in_date && (
                          <span className="text-xs text-blue-100 whitespace-nowrap">
                            투숙: ~{new Date(promotion.check_in_date).toLocaleDateString('ko-KR')}
                          </span>
                        )}
                        {index < hotelPromotions.length - 1 && (
                          <span className="text-blue-200 mx-1">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
                호텔 상세 정보
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
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-2 pb-3 font-semibold ${
                  activeTab === "reviews"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="text-xl">⭐</span>
                리뷰 평가 분석
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "benefits" && (
              <div className="space-y-6">
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

                                 {/* 호텔 상세 정보 섹션 */}
                 <div className="border-t border-gray-200 pt-6">
                   <div className="mb-4">
                     <h4 className="text-base font-medium text-gray-700">호텔 상세 정보</h4>
                   </div>
                  
                                     {/* 접힌 상태 - 미리보기 */}
                   {!isHotelInfoExpanded && introHtml && (
                     <div className="max-w-[70%] mx-auto">
                       <div className="relative h-20 overflow-hidden">
                         <div 
                           className="text-gray-600 text-sm leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                           dangerouslySetInnerHTML={{ __html: introHtml }}
                         />
                         {/* 그라데이션 오버레이 */}
                         <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                       </div>
                     </div>
                   )}
                   
                   {/* 펼쳐진 상태 - 전체 내용 */}
                   {isHotelInfoExpanded && (
                     <div className="max-w-[70%] mx-auto">
                       {introHtml ? (
                         <div 
                           className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                           dangerouslySetInnerHTML={{ __html: introHtml }}
                         />
                       ) : (
                         <p className="text-gray-700 leading-relaxed">
                           {hotel.property_description || `${hotel.property_name_ko || '호텔'}의 상세 정보가 아직 제공되지 않았습니다.`}
                         </p>
                       )}
                     </div>
                   )}
                   
                   {/* 버튼 - 하단 가운데 */}
                   <div className="text-center mt-6">
                     <button
                       onClick={() => setIsHotelInfoExpanded(!isHotelInfoExpanded)}
                       className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
                     >
                       {isHotelInfoExpanded ? (
                         <>
                           <span>호텔정보 접기</span>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                           </svg>
                         </>
                       ) : (
                         <>
                           <span>호텔정보 더보기</span>
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                         </>
                       )}
                     </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "introduction" && (
              <div className="space-y-4">
                <div className="prose max-w-none">
                  
                  {/* Property Details 표시 */}
                  {introHtml ? (
                    <div className="max-w-[70%] mx-auto mb-6">
                      <div
                        className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: introHtml }}
                      />
                    </div>
                  ) : (
                    <div className="max-w-[70%] mx-auto mb-6">
                      <p className="text-gray-700 leading-relaxed">
                        {hotel.property_description || `${hotel.property_name_ko || '호텔'}의 상세 정보가 아직 제공되지 않았습니다.`}
                      </p>
                    </div>
                  )}


                </div>
              </div>
            )}

            {activeTab === "transportation" && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">📍</div>
                  <p className="text-gray-500">위치 및 교통 정보가 준비 중입니다.</p>
                        </div>
                        </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">⭐</div>
                  <p className="text-gray-500">리뷰 평가 분석이 준비 중입니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[168px] min-w-[168px]">객실명</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px] min-w-[100px]">View</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700 w-[100px] min-w-[100px]">베드 타입</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">객실 소개</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">총 요금</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">통화</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">RATEKEY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(ratePlanCodes) && ratePlanCodes.length > 0 ? (
                      ratePlanCodes.map((rp: any, idx: number) => {
                        const roomType = rp.RoomType || rp.RoomName || 'N/A'
                        const roomName = rp.RoomName || 'N/A'
                        const amount = rp.AmountAfterTax || rp.Amount || rp.Total || '0'
                        const currency = rp.Currency || 'KRW'
                        const rateKey: string = rp.RateKey || 'N/A'
                        const shortRateKey = typeof rateKey === 'string' && rateKey.length > 10 ? `${rateKey.slice(0, 10)}...` : rateKey
                        
                        // AI 처리 함수들과 동일한 키 생성 방식 사용
                        const rowKey = `${roomType}-${roomName}`
                        const introKey = `${roomType}-${roomName}-${rateKey}`
                        const roomIntroduction = roomIntroductions.get(introKey) || 'AI가 객실 소개를 생성 중입니다...'
                        
                        // 디버깅을 위한 로그 (첫 번째 행만)
                        if (idx === 0) {
                          console.log('🔍 테이블 렌더링 디버깅:', {
                            idx,
                            roomType,
                            roomName,
                            rowKey,
                            globalOTAStyleRoomName: globalOTAStyleRoomNames.get(rowKey),
                            bedType: bedTypes.get(rowKey),
                            roomIntroduction: roomIntroductions.get(rowKey),
                            allGlobalOTAStyleKeys: Array.from(globalOTAStyleRoomNames.keys()),
                            allBedTypeKeys: Array.from(bedTypes.keys()),
                            allIntroductionKeys: Array.from(roomIntroductions.keys())
                          })
                        }
                        
                        return (
                          <tr key={`rp-${idx}`} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center w-[168px] min-w-[168px]">
                              <div className="text-gray-700 font-medium">
                                {isGeneratingRoomNames && idx === 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-500">AI가 객실 타입을 추출 중입니다...</span>
                                  </div>
                                ) : (
                                  globalOTAStyleRoomNames.get(rowKey) || '정보 없음'
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center w-[100px] min-w-[100px]">
                              <div className="text-gray-700 font-medium">
                                {rp.RoomViewDescription || 'N/A'}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center w-[100px] min-w-[100px]">
                              <div className="text-gray-700 font-medium">
                                {isGeneratingBedTypes && idx === 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-500">AI가 베드 구성을 해석 중입니다...</span>
                                  </div>
                                ) : (
                                  bedTypes.get(rowKey) || '정보 없음'
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-left">
                              <div className="text-gray-700">
                                {roomIntroductions.has(introKey) ? (
                                  roomIntroduction
                                ) : isGeneratingIntroductions && idx === 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span className="text-gray-500">AI가 객실 소개를 생성 중입니다...</span>
                                  </div>
                                ) : (
                                  rp.Description || 'N/A'
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center">
                              {amount && amount !== 'N/A' && !isNaN(Number(amount)) && Number(amount) > 0 ? 
                                `${parseInt(String(amount)).toLocaleString()} ${currency}` : 
                                <span className="text-red-500">요금 정보 없음</span>
                              }
                            </td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center">{currency}</td>
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700 text-center">
                              <button
                                type="button"
                                title={typeof rateKey === 'string' ? rateKey : ''}
                                onClick={() => copyRateKey(String(rateKey), idx)}
                                className="font-mono underline decoration-dotted hover:text-blue-600"
                              >
                                {shortRateKey}
                              </button>
                              {copiedRateKeyRow === idx && (
                                <span className="ml-2 text-xs text-green-600">Copied</span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">데이터 없음</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">데이터 없음</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">데이터 없음</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">데이터가 없습니다</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500 text-right">0</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">KRW</td>
                        <td className="border border-gray-200 px-4 py-3 text-sm text-gray-500">N/A</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">테이블 설명</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">객실명:</span> AI가 글로벌 호텔 OTA 스타일로 생성한 객실명
                  </div>
                  <div>
                    <span className="font-medium">베드:</span> AI가 해석한 침대 구성 (킹, 트윈, 더블 등)
                  </div>
                  <div>
                    <span className="font-medium">객실 소개:</span> AI가 생성한 매력적인 객실 소개
                  </div>
                  <div>
                    <span className="font-medium">RoomType:</span> 객실 등급과 코드
                  </div>
                  <div>
                    <span className="font-medium">RoomName:</span> 객실의 정확한 이름
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> 객실에 대한 상세 정보
                  </div>
                  <div>
                    <span className="font-medium">총 요금:</span> 세금 포함 최종 요금
                  </div>
                  <div>
                    <span className="font-medium">통화:</span> 요금 단위
                  </div>
                  <div>
                    <span className="font-medium">RATEKEY:</span> 예약 시 필요한 고유 코드
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

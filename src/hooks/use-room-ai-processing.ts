"use client"

import { useState, useEffect, useCallback } from "react"
import { generateRoomIntroduction, generateGlobalOTAStyleRoomName } from "@/lib/openai"

// 캐시 관련 상수
const CACHE_PREFIX = 'room_ai_cache_'
const CACHE_EXPIRY_HOURS = 24 // 24시간 후 만료
const CACHE_VERSION = '1.0' // 캐시 버전 (구조 변경 시 업데이트)

// 캐시 데이터 타입
interface CacheData {
  version: string
  timestamp: number
  data: string
}

// 원 데이터 해시 생성 함수 (날짜 정보 포함)
const generateDataHash = (roomType: string, roomName: string, description: string, hotelName: string, checkIn?: string, checkOut?: string): string => {
  const dataString = `${roomType}|${roomName}|${description}|${hotelName}|${checkIn || ''}|${checkOut || ''}`
  // 간단한 해시 함수 (실제 프로덕션에서는 crypto.subtle.digest 사용 권장)
  let hash = 0
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수로 변환
  }
  return Math.abs(hash).toString(36)
}

// 캐시에서 데이터 조회
const getCachedData = (cacheKey: string): string | null => {
  try {
    const cached = localStorage.getItem(cacheKey)
    if (!cached) return null
    
    const cacheData: CacheData = JSON.parse(cached)
    
    // 버전 확인
    if (cacheData.version !== CACHE_VERSION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    // 만료 시간 확인
    const now = Date.now()
    const expiryTime = cacheData.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000)
    if (now > expiryTime) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    console.log(`💾 캐시 조회 성공:`, { cacheKey, dataLength: cacheData.data.length, age: Date.now() - cacheData.timestamp })
    return cacheData.data
  } catch (error) {
    console.warn('캐시 데이터 조회 실패:', error, { cacheKey })
    return null
  }
}

// 캐시에 데이터 저장
const setCachedData = (cacheKey: string, data: string): void => {
  try {
    const cacheData: CacheData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      data: data
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    console.log(`💾 캐시 저장 성공:`, { cacheKey, dataLength: data.length, timestamp: cacheData.timestamp })
  } catch (error) {
    console.warn('캐시 데이터 저장 실패:', error, { cacheKey, dataLength: data.length })
  }
}

export function useRoomAIProcessing() {
  console.log('🚀 useRoomAIProcessing 훅이 초기화되었습니다.')
  
  // AI 처리 상태 관리
  const [roomIntroductions, setRoomIntroductions] = useState<Map<string, string>>(new Map())
  const [globalOTAStyleRoomNames, setGlobalOTAStyleRoomNames] = useState<Map<string, string>>(new Map())
  const [bedTypes, setBedTypes] = useState<Map<string, string>>(new Map())
  const [isGeneratingIntroductions, setIsGeneratingIntroductions] = useState(false)
  const [isGeneratingRoomNames, setIsGeneratingRoomNames] = useState(false)
  const [isGeneratingBedTypes, setIsGeneratingBedTypes] = useState(false)
  const [currentProcessingRow, setCurrentProcessingRow] = useState<number>(-1)
  // hasProcessedAI 플래그 제거 - 날짜별로 처리하므로 불필요
  
  // 캐시 상태 관리
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    totalProcessed: 0
  })

  // 객실 소개 AI 생성 함수 (1행씩 순차 처리, 캐시 적용)
  const generateRoomIntroductionsSequential = async (ratePlans: any[], hotelName: string, checkIn?: string, checkOut?: string, startIndex: number = 0, endIndex?: number) => {
    console.log('🏨 generateRoomIntroductionsSequential 호출됨:', {
      ratePlansLength: ratePlans?.length,
      ratePlans: ratePlans,
      hotelName: hotelName,
      checkIn,
      checkOut,
      startIndex,
      endIndex,
      stackTrace: new Error().stack
    })
    
    if (!ratePlans || ratePlans.length === 0) {
      console.log('⚠️ ratePlans가 비어있음')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음')
      return
    }
    
    // 이미 처리 중이면 중복 실행 방지
    if (isGeneratingIntroductions) {
      console.log('⚠️ 이미 객실 소개 생성 중이므로 중복 실행 방지')
      return
    }
    
    setIsGeneratingIntroductions(true)
    setCurrentProcessingRow(-1) // 초기화
    console.log('🔄 객실 소개 AI 생성 시작 (1행씩 순차 처리, 캐시 적용)...')
    
    try {
      // 처리할 레코드 범위 결정 (기본값: 전체, 또는 지정된 범위)
      const roomsToProcess = ratePlans.slice(startIndex, endIndex || ratePlans.length)
      console.log(`🔍 객실 소개 생성 대상: ${roomsToProcess.length}개 객실 (전체 ${ratePlans.length}개, 시작: ${startIndex}, 끝: ${endIndex || ratePlans.length})`)
      
      for (let i = 0; i < roomsToProcess.length; i++) {
        const rp = roomsToProcess[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const roomView = rp.RoomViewDescription || rp.RoomView || 'N/A'
        
        // View 컬럼 데이터가 있으면 설명에 포함
        const enhancedDescription = roomView && roomView !== 'N/A' 
          ? `${description} (View: ${roomView})`
          : description
        
        const introKey = `${roomType}-${roomName}-${rp.RateKey || 'N/A'}`
        
        // 현재 처리 중인 행 번호 업데이트 (원본 배열 기준)
        const actualRowIndex = startIndex + i
        setCurrentProcessingRow(actualRowIndex)
        console.log(`🔍 ${i + 1}번째 객실 소개 생성 중 (전체 ${actualRowIndex + 1}번째):`, { 
          roomType, 
          roomName, 
          description: description.substring(0, 100) + '...',
          roomView,
          enhancedDescription: enhancedDescription.substring(0, 100) + '...',
          introKey, 
          currentRow: i,
          actualRowIndex: actualRowIndex,
          totalRows: roomsToProcess.length,
          startIndex: startIndex,
          endIndex: endIndex || ratePlans.length
        })
        
        // 캐시 키 생성 (날짜 정보 포함, View 데이터 포함된 설명 사용)
        const dataHash = generateDataHash(roomType, roomName, enhancedDescription, hotelName, checkIn, checkOut)
        const cacheKey = `${CACHE_PREFIX}intro_${dataHash}`
        
        console.log(`🔑 ${i + 1}번째 캐시 키 생성:`, {
          roomType,
          roomName,
          description: description.substring(0, 50) + '...',
          roomView,
          enhancedDescription: enhancedDescription.substring(0, 50) + '...',
          hotelName,
          checkIn,
          checkOut,
          dataHash,
          cacheKey
        })
        
        // 캐시에서 조회 시도
        const cachedIntro = getCachedData(cacheKey)
        if (cachedIntro) {
          console.log(`💾 ${i + 1}번째 객실 소개 캐시 히트:`, {
            introKey,
            cacheKey,
            dataHash,
            cachedIntro: cachedIntro.substring(0, 100) + '...',
            roomType,
            roomName,
            currentRow: i,
            totalRows: roomsToProcess.length
          })
          
          // 캐시 통계 업데이트
          // setCacheStats(prev => ({
          //   ...prev,
          //   hits: prev.hits + 1,
          //   totalProcessed: prev.totalProcessed + 1
          // }))
          
          // 캐시된 데이터를 즉시 상태에 반영
          setRoomIntroductions(prev => {
            const newMap = new Map(prev)
            newMap.set(introKey, cachedIntro)
            return newMap
          })
          
          // API 호출 간격 조절 (rate limiting 방지)
          if (i < roomsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100)) // 캐시 히트 시 더 빠른 처리
          }
          continue
        }
        
        console.log(`🔄 ${i + 1}번째 객실 소개 캐시 미스, AI 생성 시작:`, { 
          roomType, 
          roomName, 
          description: description.substring(0, 50) + '...',
          roomView,
          enhancedDescription: enhancedDescription.substring(0, 50) + '...',
          cacheKey,
          dataHash,
          introKey,
          currentRow: i,
          totalRows: roomsToProcess.length
        })
        
        // 캐시 통계 업데이트
        // setCacheStats(prev => ({
        //   ...prev,
        //   misses: prev.misses + 1,
        //   totalProcessed: prev.totalProcessed + 1
        // }))
        
        try {
          const intro = await generateRoomIntroduction({
            roomType: roomType,
            roomName: roomName,
            description: enhancedDescription
          }, hotelName)
          
          // 캐시에 저장
          setCachedData(cacheKey, intro)
          console.log(`💾 ${i + 1}번째 객실 소개 캐시 저장 완료:`, intro, 'cacheKey:', cacheKey)
          
          // 즉시 상태 업데이트 (1행씩 표시)
          setRoomIntroductions(prev => {
            const newMap = new Map(prev)
            newMap.set(introKey, intro)
            return newMap
          })
          
          console.log(`✅ ${i + 1}번째 객실 소개 생성 완료 및 즉시 표시:`, intro, 'key:', introKey)
          
          // API 호출 간격 조절 (rate limiting 방지)
          if (i < roomsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 소개 생성 실패:`, roomError)
          // 개별 객실 실패 시 fallback 사용
          const fallbackIntro = `${hotelName}의 ${roomType} ${roomName} 객실입니다. ${description || '편안하고 아늑한 분위기로 최고의 숙박 경험을 제공합니다.'}`
          
          // fallback도 캐시에 저장 (다음에는 AI 호출 없이 사용)
          setCachedData(cacheKey, fallbackIntro)
          console.log(`💾 ${i + 1}번째 객실 fallback 소개문 캐시 저장:`, fallbackIntro, 'cacheKey:', cacheKey)
          
          // 즉시 상태 업데이트 (fallback도 1행씩 표시)
          setRoomIntroductions(prev => {
            const newMap = new Map(prev)
            newMap.set(introKey, fallbackIntro)
            return newMap
          })
          
          console.log(`🔄 ${i + 1}번째 객실 fallback 소개문 사용 및 즉시 표시:`, fallbackIntro, 'key:', introKey)
        }
      }
      
      console.log('✅ 모든 객실 소개 순차 처리 완료')
      
    } catch (error) {
      console.error('❌ 객실 소개 AI 생성 중 오류 발생:', error)
    } finally {
      setIsGeneratingIntroductions(false)
      setCurrentProcessingRow(-1) // 처리 완료 후 초기화
      console.log('🏁 객실 소개 AI 생성 완료')
    }
  }

  // 글로벌 호텔 OTA 스타일 객실명 생성 함수 (캐시 적용)
  const generateGlobalOTAStyleRoomNames = async (ratePlans: any[], hotelName: string, checkIn?: string, checkOut?: string, startIndex: number = 0, endIndex?: number) => {
    console.log('🏨 generateGlobalOTAStyleRoomNames 호출됨:', {
      ratePlansLength: ratePlans?.length,
      ratePlans: ratePlans,
      hotelName: hotelName,
      checkIn,
      checkOut,
      startIndex,
      endIndex,
      stackTrace: new Error().stack
    })
    
    if (!ratePlans || ratePlans.length === 0) {
      console.log('⚠️ ratePlans가 비어있음')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음')
      return
    }
    
    // 이미 처리 중이면 중복 실행 방지
    if (isGeneratingRoomNames) {
      console.log('⚠️ 이미 객실명 생성 중이므로 중복 실행 방지')
      return
    }
    
    setIsGeneratingRoomNames(true)
    console.log('🔄 글로벌 호텔 OTA 스타일 객실명 생성 시작 (캐시 적용)...')
    
    try {
      const roomNames = new Map<string, string>()
      
      // 처리할 레코드 범위 결정 (기본값: 전체, 또는 지정된 범위)
      const roomsToProcess = ratePlans.slice(startIndex, endIndex || ratePlans.length)
      console.log(`🔍 객실명 생성 대상: ${roomsToProcess.length}개 객실 (전체 ${ratePlans.length}개, 시작: ${startIndex}, 끝: ${endIndex || ratePlans.length})`)
      
      for (let i = 0; i < roomsToProcess.length; i++) {
        const rp = roomsToProcess[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const roomView = rp.RoomViewDescription || rp.RoomView || 'N/A'
        
        // View 컬럼 데이터가 있으면 설명에 포함
        const enhancedDescription = roomView && roomView !== 'N/A' 
          ? `${description} (View: ${roomView})`
          : description
        
        const key = `${roomType}-${roomName}`
        
        // 현재 처리 중인 행 번호 업데이트 (원본 배열 기준)
        const actualRowIndex = startIndex + i
        
        console.log(`🔍 ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 중 (전체 ${actualRowIndex + 1}번째):`, { 
          roomType, 
          roomName, 
          description: description.substring(0, 100) + '...',
          roomView,
          enhancedDescription: enhancedDescription.substring(0, 100) + '...',
          key,
          currentRow: i,
          actualRowIndex: actualRowIndex,
          totalRows: roomsToProcess.length,
          startIndex: startIndex,
          endIndex: endIndex || ratePlans.length
        })
        
        // 캐시 키 생성 (날짜 정보 포함, View 데이터 포함된 설명 사용)
        const dataHash = generateDataHash(roomType, roomName, enhancedDescription, hotelName, checkIn, checkOut)
        const cacheKey = `${CACHE_PREFIX}roomname_${dataHash}`
        
        console.log(`🔑 ${i + 1}번째 객실명 캐시 키 생성:`, {
          roomType,
          roomName,
          description: description.substring(0, 50) + '...',
          roomView,
          enhancedDescription: enhancedDescription.substring(0, 50) + '...',
          hotelName,
          checkIn,
          checkOut,
          dataHash,
          cacheKey
        })
        
        // 캐시에서 조회 시도
        const cachedRoomName = getCachedData(cacheKey)
        if (cachedRoomName) {
          console.log(`💾 ${i + 1}번째 객실명 캐시 히트:`, cachedRoomName, 'key:', key)
          
          // 캐시 통계 업데이트
          // setCacheStats(prev => ({
          //   ...prev,
          //   hits: prev.hits + 1,
          //   totalProcessed: prev.totalProcessed + 1
          // }))
          
          // 캐시된 데이터를 즉시 상태에 반영
          setGlobalOTAStyleRoomNames(prev => {
            const newMap = new Map(prev)
            newMap.set(key, cachedRoomName)
            return newMap
          })
          
          // API 호출 간격 조절 (rate limiting 방지)
          if (i < roomsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100)) // 캐시 히트 시 더 빠른 처리
          }
          continue
        }
        
        console.log(`🔄 ${i + 1}번째 객실명 캐시 미스, AI 생성 시작:`, { 
          roomType, 
          roomName, 
          description: description.substring(0, 50) + '...',
          roomView,
          enhancedDescription: enhancedDescription.substring(0, 50) + '...',
          cacheKey,
          dataHash
        })
        
        // 캐시 통계 업데이트
        // setCacheStats(prev => ({
        //   ...prev,
        //   misses: prev.misses + 1,
        //   totalProcessed: prev.totalProcessed + 1
        // }))
        
        try {
          const otaStyleName = await generateGlobalOTAStyleRoomName(roomType, roomName, enhancedDescription, hotelName)
          
          // 캐시에 저장
          setCachedData(cacheKey, otaStyleName)
          console.log(`💾 ${i + 1}번째 객실명 캐시 저장 완료:`, otaStyleName, 'cacheKey:', cacheKey)
          
          // 즉시 상태 업데이트 (1행씩 표시)
          setGlobalOTAStyleRoomNames(prev => {
            const newMap = new Map(prev)
            newMap.set(key, otaStyleName)
            return newMap
          })
          
          console.log(`✅ ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 완료 및 즉시 표시:`, otaStyleName, 'key:', key)
          
          // API 호출 간격 조절 (rate limiting 방지)
          if (i < roomsToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } catch (roomError) {
          console.error(`❌ ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 실패:`, roomError)
          // 개별 객실 실패 시 fallback 사용
          const fallbackName = roomType && roomType !== 'N/A' ? roomType.substring(0, 15) : '객실'
          
          // fallback도 캐시에 저장 (다음에는 AI 호출 없이 사용)
          setCachedData(cacheKey, fallbackName)
          console.log(`💾 ${i + 1}번째 객실 fallback 객실명 캐시 저장:`, fallbackName, 'cacheKey:', cacheKey)
          
          // 즉시 상태 업데이트 (fallback도 1행씩 표시)
          setGlobalOTAStyleRoomNames(prev => {
            const newMap = new Map(prev)
            newMap.set(key, fallbackName)
            return newMap
          })
          
          console.log(`🔄 ${i + 1}번째 객실 fallback 객실명 사용 및 즉시 표시:`, fallbackName, 'key:', key)
        }
      }
      
      console.log('✅ 모든 객실명 순차 처리 완료')
      
    } catch (error) {
      console.error('❌ 글로벌 호텔 OTA 스타일 객실명 생성 오류:', error)
      // 에러 발생 시 기본 객실명 생성 (전체 레코드)
      const fallbackNames = new Map<string, string>()
      const roomsToProcess = ratePlans
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

  // 캐시 관리 함수들
  const clearCache = () => {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
      cacheKeys.forEach(key => localStorage.removeItem(key))
      console.log('🗑️ 캐시 클리어 완료:', cacheKeys.length, '개 항목 삭제')
    } catch (error) {
      console.warn('캐시 클리어 실패:', error)
    }
  }

  const getCacheInfo = () => {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
      const cacheData = cacheKeys.map(key => {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          return {
            key,
            timestamp: parsed.timestamp,
            age: Date.now() - parsed.timestamp,
            version: parsed.version
          }
        }
        return null
      }).filter(Boolean)
      
      return {
        totalItems: cacheKeys.length,
        items: cacheData,
        stats: cacheStats
      }
    } catch (error) {
      console.warn('캐시 정보 조회 실패:', error)
      return { totalItems: 0, items: [], stats: cacheStats }
    }
  }

  // ratePlanCodes가 변경될 때 AI 처리 함수들 호출 (날짜별로 처리)
  const processRatePlans = (ratePlans: any[], hotelName: string, checkIn?: string, checkOut?: string) => {
    console.log('🚀 processRatePlans 함수가 호출되었습니다:', {
      ratePlansLength: ratePlans?.length,
      hotelName,
      checkIn,
      checkOut,
      stackTrace: new Error().stack
    })
    
    if (ratePlans && ratePlans.length > 0 && hotelName) {
      // 날짜별로 고유한 처리 키 생성
      const processKey = `${hotelName}-${checkIn || ''}-${checkOut || ''}`
      
      console.log('🚀 ratePlanCodes 변경 감지, AI 처리 함수들 호출 시작 (첫 3행만):', {
        ratePlansLength: ratePlans.length,
        hotelName: hotelName,
        checkIn: checkIn,
        checkOut: checkOut,
        processKey: processKey
      })
      
      // AI 처리 함수들 호출 (첫 3행만 처리)
      generateGlobalOTAStyleRoomNames(ratePlans, hotelName, checkIn, checkOut, 0, 3)
      generateRoomIntroductionsSequential(ratePlans, hotelName, checkIn, checkOut, 0, 3)
    }
  }

  // 나머지 레코드 AI 처리 함수 (더보기 버튼용)
  const processRemainingRatePlans = (ratePlans: any[], hotelName: string, checkIn?: string, checkOut?: string) => {
    console.log('🚀 processRemainingRatePlans 함수가 호출되었습니다:', {
      ratePlansLength: ratePlans?.length,
      hotelName,
      checkIn,
      checkOut,
      stackTrace: new Error().stack
    })
    
    if (!ratePlans || ratePlans.length === 0) {
      console.log('⚠️ ratePlans가 비어있음 - AI 처리 중단')
      return
    }
    
    if (!hotelName) {
      console.log('⚠️ hotelName이 비어있음 - AI 처리 중단')
      return
    }
    
    if (ratePlans.length <= 3) {
      console.log('⚠️ 전체 레코드가 3개 이하 - 나머지 처리 불필요')
      return
    }
    
    console.log('🚀 나머지 레코드 AI 처리 시작:', {
      ratePlansLength: ratePlans.length,
      hotelName: hotelName,
      checkIn: checkIn,
      checkOut: checkOut,
      remainingCount: ratePlans.length - 3
    })
    
    // 나머지 레코드에 대해 AI 처리 함수들 호출 (3행부터 끝까지)
    generateGlobalOTAStyleRoomNames(ratePlans, hotelName, checkIn, checkOut, 3)
    generateRoomIntroductionsSequential(ratePlans, hotelName, checkIn, checkOut, 3)
  }

  return {
    roomIntroductions,
    globalOTAStyleRoomNames,
    bedTypes,
    isGeneratingIntroductions,
    isGeneratingRoomNames,
    isGeneratingBedTypes,
    currentProcessingRow,
    processRatePlans,
    processRemainingRatePlans,
    // 캐시 관련 추가
    cacheStats,
    clearCache,
    getCacheInfo
  }
}
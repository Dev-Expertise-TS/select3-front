"use client"

import { useState, useEffect } from "react"
import { generateRoomIntroduction, generateGlobalOTAStyleRoomName } from "@/lib/openai"

export function useRoomAIProcessing() {
  // AI 처리 상태 관리
  const [roomIntroductions, setRoomIntroductions] = useState<Map<string, string>>(new Map())
  const [globalOTAStyleRoomNames, setGlobalOTAStyleRoomNames] = useState<Map<string, string>>(new Map())
  const [bedTypes, setBedTypes] = useState<Map<string, string>>(new Map())
  const [isGeneratingIntroductions, setIsGeneratingIntroductions] = useState(false)
  const [isGeneratingRoomNames, setIsGeneratingRoomNames] = useState(false)
  const [isGeneratingBedTypes, setIsGeneratingBedTypes] = useState(false)
  const [currentProcessingRow, setCurrentProcessingRow] = useState<number>(-1)
  const [hasProcessedAI, setHasProcessedAI] = useState(false)

  // 객실 소개 AI 생성 함수 (1행씩 순차 처리)
  const generateRoomIntroductionsSequential = async (ratePlans: any[], hotelName: string) => {
    console.log('🏨 generateRoomIntroductionsSequential 호출됨:', {
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
    
    // 이미 처리 중이면 중복 실행 방지
    if (isGeneratingIntroductions) {
      console.log('⚠️ 이미 객실 소개 생성 중이므로 중복 실행 방지')
      return
    }
    
    setIsGeneratingIntroductions(true)
    setCurrentProcessingRow(-1) // 초기화
    console.log('🔄 객실 소개 AI 생성 시작 (1행씩 순차 처리)...')
    
    try {
      // 1번째부터 3번째 행까지 순차적으로 AI 처리
      const roomsToProcess = ratePlans.slice(0, 3)
      console.log(`🔍 객실 소개 생성 대상: ${roomsToProcess.length}개 객실 (전체 ${ratePlans.length}개 중 1-3번째 행)`)
      
      for (let i = 0; i < roomsToProcess.length; i++) {
        const rp = roomsToProcess[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const introKey = `${roomType}-${roomName}-${rp.RateKey || 'N/A'}`
        
        // 현재 처리 중인 행 번호 업데이트
        setCurrentProcessingRow(i)
        console.log(`🔍 ${i + 1}번째 객실 소개 생성 중:`, { roomType, roomName, description, introKey, currentRow: i })
        
        try {
          const intro = await generateRoomIntroduction({
            roomType: roomType,
            roomName: roomName,
            description: description
          }, hotelName)
          
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
    
    // 이미 처리 중이면 중복 실행 방지
    if (isGeneratingRoomNames) {
      console.log('⚠️ 이미 객실명 생성 중이므로 중복 실행 방지')
      return
    }
    
    setIsGeneratingRoomNames(true)
    console.log('🔄 글로벌 호텔 OTA 스타일 객실명 생성 시작...')
    
    try {
      const roomNames = new Map<string, string>()
      
      // 1번째부터 3번째 행까지 순차적으로 AI 처리
      const roomsToProcess = ratePlans.slice(0, 3)
      console.log(`🔍 객실명 생성 대상: ${roomsToProcess.length}개 객실 (전체 ${ratePlans.length}개 중 1-3번째 행)`)
      
      for (let i = 0; i < roomsToProcess.length; i++) {
        const rp = roomsToProcess[i]
        const roomType = rp.RoomType || rp.RoomName || 'N/A'
        const roomName = rp.RoomName || 'N/A'
        const description = rp.Description || 'N/A'
        const key = `${roomType}-${roomName}`
        
        console.log(`🔍 ${i + 1}번째 객실 글로벌 호텔 OTA 스타일 객실명 생성 중:`, { roomType, roomName, description, key })
        
        try {
          const otaStyleName = await generateGlobalOTAStyleRoomName(roomType, roomName, description, hotelName)
          
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

  // ratePlanCodes가 변경될 때 AI 처리 함수들 호출 (한 번만)
  const processRatePlans = (ratePlans: any[], hotelName: string) => {
    if (ratePlans && ratePlans.length > 0 && hotelName && !hasProcessedAI) {
      console.log('🚀 ratePlanCodes 변경 감지, AI 처리 함수들 호출 시작 (한 번만):', {
        ratePlansLength: ratePlans.length,
        hotelName: hotelName,
        hasProcessedAI: hasProcessedAI
      })
      
      // AI 처리 플래그 설정
      setHasProcessedAI(true)
      
      // AI 처리 함수들 호출 (객실 소개만 순차 처리)
      generateGlobalOTAStyleRoomNames(ratePlans, hotelName)
      generateRoomIntroductionsSequential(ratePlans, hotelName)
    }
  }

  return {
    roomIntroductions,
    globalOTAStyleRoomNames,
    bedTypes,
    isGeneratingIntroductions,
    isGeneratingRoomNames,
    isGeneratingBedTypes,
    currentProcessingRow,
    hasProcessedAI,
    processRatePlans,
    setHasProcessedAI
  }
}
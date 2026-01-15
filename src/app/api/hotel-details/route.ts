import { NextRequest, NextResponse } from 'next/server'
import { devLog, devError } from '@/lib/optimization-utils'

interface HotelDetailsRequest {
  hotelCode: string
  startDate: string
  endDate: string
  adults?: number
  children?: number
  rooms?: number
  ratePlanCodes?: string[]
}

interface HotelDetailsResponse {
  success: boolean
  data?: any
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: HotelDetailsRequest = await request.json()
    const pricingSource = (process.env.SABRE_PRICING_SOURCE || 'details').toLowerCase()
    
    if (!body.hotelCode || !body.startDate || !body.endDate) {
      return NextResponse.json<HotelDetailsResponse>(
        {
          success: false,
          error: 'hotelCode, startDate, and endDate are required'
        },
        { status: 400 }
      )
    }

    const rooms = body.rooms || 1
    const adultsPerRoom = body.adults || 2
    
    const requestBody: any = {
      HotelCode: body.hotelCode.toString(),
      CurrencyCode: 'KRW',
      StartDate: body.startDate,
      EndDate: body.endDate,
      Adults: adultsPerRoom,
      Children: body.children || 0,
      Rooms: rooms
    }
    
    devLog('🔢 룸 정보 (요청 전):', {
      받은값: {
        rooms: body.rooms,
        adults: body.adults,
        children: body.children
      },
      실제전송값: {
        Rooms: rooms,
        Adults: adultsPerRoom,
        Children: body.children || 0,
        totalAdults: adultsPerRoom * rooms
      }
    })
    
    // ratePlanCodes가 있으면 추가
    if (body.ratePlanCodes && body.ratePlanCodes.length > 0) {
      devLog('✅ ratePlanCodes 받음:', body.ratePlanCodes)
      requestBody.RatePlanCode = body.ratePlanCodes
      requestBody.ExactMatchOnly = true
    } else {
      devLog('⚠️ ratePlanCodes 없음 - 모든 Rate Plan 조회')
    }

    devLog('📤 Sabre Hotel Details API 요청:', requestBody)

    // 여러 Sabre API 엔드포인트를 시도하여 객실 상세 정보 가져오기
    const descriptiveData = null
    
    // 1. hotel-avail API 시도 (일시 비활성화 - 404 오류)
    // TODO: API 서버 복구 후 다시 활성화
    /*
    try {
      devLog('📤 Hotel Avail API 요청:', {
        HotelCode: body.hotelCode.toString(),
        StartDate: body.startDate,
        EndDate: body.endDate,
        Adults: body.adults || 2,
        Children: body.children || 0,
        Rooms: body.rooms || 1
      })
      
      const availResponse = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-avail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          HotelCode: body.hotelCode.toString(),
          StartDate: body.startDate,
          EndDate: body.endDate,
          Adults: body.adults || 2,
          Children: body.children || 0,
          Rooms: body.rooms || 1
        }),
        signal: AbortSignal.timeout(10000)
      })
      
      if (availResponse.ok) {
        descriptiveData = await availResponse.json()
        devLog('📥 Hotel Avail API 응답:', {
          hasResult: !!descriptiveData,
          resultKeys: descriptiveData ? Object.keys(descriptiveData) : 'no result',
          fullResponse: descriptiveData
        })
      } else {
        devError('Hotel Avail API 호출 실패:', {
          status: availResponse.status,
          statusText: availResponse.statusText,
          url: 'https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-avail',
          hotelCode: body.hotelCode
        })
        // 404 오류인 경우 API 서버 문제로 간주하고 계속 진행
        if (availResponse.status === 404) {
          devError('Sabre API 서버가 응답하지 않습니다. 기본 데이터로 진행합니다.')
        }
      }
    } catch (error) {
      devError('Hotel Avail API 호출 오류:', error)
    }
    */
    
    // 1. hotel-avail API 시도 비활성화 (요청에 따라 주석 처리 유지)
    const availableData: any = null

    // 2. hotel-info API 시도 (일시 비활성화 - 404 오류)
    // TODO: API 서버 복구 후 다시 활성화
    /*
    if (!descriptiveData) {
      try {
        devLog('📤 Hotel Info API 요청:', {
          HotelCode: body.hotelCode.toString(),
          CodeContext: 'GLOBAL'
        })
        
        const infoResponse = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            HotelCode: body.hotelCode.toString(),
            CodeContext: 'GLOBAL'
          }),
          signal: AbortSignal.timeout(10000)
        })
        
        if (infoResponse.ok) {
          descriptiveData = await infoResponse.json()
          devLog('📥 Hotel Info API 응답:', {
            hasResult: !!descriptiveData,
            resultKeys: descriptiveData ? Object.keys(descriptiveData) : 'no result',
            fullResponse: descriptiveData
          })
      } else {
        devError('Hotel Info API 호출 실패:', {
          status: infoResponse.status,
          statusText: infoResponse.statusText,
          url: 'https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-info',
          hotelCode: body.hotelCode
        })
        // 404 오류인 경우 API 서버 문제로 간주하고 계속 진행
        if (infoResponse.status === 404) {
          devError('Sabre Hotel Info API 서버가 응답하지 않습니다. 기본 데이터로 진행합니다.')
        }
      }
      } catch (error) {
        devError('Hotel Info API 호출 오류:', error)
      }
    }
    */
    
    // 3. hotel-search API 시도 (일시 비활성화 - 404 오류)
    // TODO: API 서버 복구 후 다시 활성화
    /*
    if (!descriptiveData) {
      try {
        devLog('📤 Hotel Search API 요청:', {
          HotelCode: body.hotelCode.toString()
        })
        
        const searchResponse = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            HotelCode: body.hotelCode.toString()
          }),
          signal: AbortSignal.timeout(10000)
        })
        
        if (searchResponse.ok) {
          descriptiveData = await searchResponse.json()
          devLog('📥 Hotel Search API 응답:', {
            hasResult: !!descriptiveData,
            resultKeys: descriptiveData ? Object.keys(descriptiveData) : 'no result',
            fullResponse: descriptiveData
          })
      } else {
        devError('Hotel Search API 호출 실패:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          url: 'https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-search',
          hotelCode: body.hotelCode
        })
        // 404 오류인 경우 API 서버 문제로 간주하고 계속 진행
        if (searchResponse.status === 404) {
          devError('Sabre Hotel Search API 서버가 응답하지 않습니다. 기본 데이터로 진행합니다.')
        }
      }
      } catch (error) {
        devError('Hotel Search API 호출 오류:', error)
      }
    }
    */

    // 기존 hotel-details API 호출 (avail 사용 중이어도 호환성 위해 병행 호출)
    let response: Response
    try {
      // response = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-details', {
      // response = await fetch('https://sabre-nodejs-test-j58vk.ondigitalocean.app/public/hotel/sabre/hotel-details', {
        response = await fetch('http://localhost:3000/public/hotel/sabre/hotel-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000)
      })
    } catch (fetchError) {
      devError('❌ Sabre API 네트워크 오류:', fetchError)
      
      // 네트워크 오류인 경우 사용자 친화적인 메시지 반환
      if (fetchError instanceof TypeError && fetchError.message === 'Failed to fetch') {
        return NextResponse.json<HotelDetailsResponse>(
          {
            success: false,
            error: '호텔 정보 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
          },
          { status: 503 } // Service Unavailable
        )
      }
      
      // 기타 네트워크 오류
      return NextResponse.json<HotelDetailsResponse>(
        {
          success: false,
          error: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        },
        { status: 500 }
      )
    }
    
    if (!response.ok) {
      const errorText = await response.text()
      devError('Sabre API 응답 오류:', response.status, response.statusText, errorText)
      
      let userFriendlyMessage = `Sabre API 호출 실패: ${response.status} ${response.statusText}`
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessage = errorData.errors[0]
          if (errorMessage === 'StartDate는 오늘 이후 날짜여야 합니다.') {
            userFriendlyMessage = '체크인 날짜는 오늘 이후 날짜이어야 합니다.'
          }
        }
      } catch (parseError) {
        // JSON 파싱 실패 시 기본 메시지 사용
      }
      
      return NextResponse.json<HotelDetailsResponse>(
        {
          success: false,
          error: userFriendlyMessage
        },
        { status: response.status }
      )
    }
    
    const result = await response.json()
    
    devLog('📥 Sabre API 응답:', {
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : 'no result',
      hasGetHotelDetailsRS: !!result?.GetHotelDetailsRS,
      getHotelDetailsRSKeys: result?.GetHotelDetailsRS ? Object.keys(result.GetHotelDetailsRS) : 'no GetHotelDetailsRS'
    })
    
    // 룸 개수별 요금 확인을 위한 상세 로깅
    const hasRoomStays = result?.GetHotelDetailsRS?.RoomStays?.RoomStay
    devLog('🔍 RoomStays 존재 여부:', !!hasRoomStays)
    
    if (hasRoomStays) {
      const roomStays = Array.isArray(result.GetHotelDetailsRS.RoomStays.RoomStay) 
        ? result.GetHotelDetailsRS.RoomStays.RoomStay 
        : [result.GetHotelDetailsRS.RoomStays.RoomStay]
      
      const firstRoomStay = roomStays[0]
      const roomRates = firstRoomStay?.RoomRates?.RoomRate
      const firstRate = Array.isArray(roomRates) ? roomRates[0] : roomRates
      
      devLog('🏨 룸 응답 상세 분석 (서버):', {
        요청값: {
          requestedRooms: rooms,
          requestedAdultsPerRoom: adultsPerRoom,
          totalAdultsRequested: adultsPerRoom * rooms
        },
        응답값: {
          totalRoomStays: roomStays.length,
          hasRoomRates: !!roomRates,
          roomRatesCount: Array.isArray(roomRates) ? roomRates.length : (roomRates ? 1 : 0),
          firstRateStructure: firstRate ? Object.keys(firstRate) : 'N/A',
          firstRateAmount: firstRate?.Total?.AmountAfterTax || firstRate?.AmountAfterTax || 'N/A',
          firstRateCurrency: firstRate?.Total?.CurrencyCode || firstRate?.Currency || 'N/A',
          sampleFirstThreeRates: roomRates && Array.isArray(roomRates) ? roomRates.slice(0, 3).map((rate: any) => ({
            RoomType: rate.RoomType || 'N/A',
            Amount: rate.Total?.AmountAfterTax || rate.AmountAfterTax || 'N/A',
            Currency: rate.Total?.CurrencyCode || rate.Currency || 'N/A'
          })) : 'Single rate or none'
        }
      })
    } else {
      // HotelDetailsInfo 구조 확인
      const hotelDetailsInfo = result?.GetHotelDetailsRS?.HotelDetailsInfo
      const hotelRateInfo = hotelDetailsInfo?.HotelRateInfo
      const rooms = hotelRateInfo?.Rooms?.Room
      
      devLog('🏨 대체 응답 구조 상세 분석:', {
        hasHotelDetailsInfo: !!hotelDetailsInfo,
        hotelDetailsInfoKeys: hotelDetailsInfo ? Object.keys(hotelDetailsInfo) : 'N/A',
        hasHotelRateInfo: !!hotelRateInfo,
        hotelRateInfoKeys: hotelRateInfo ? Object.keys(hotelRateInfo) : 'N/A',
        hasRooms: !!rooms,
        roomsType: Array.isArray(rooms) ? 'array' : typeof rooms,
        roomsCount: Array.isArray(rooms) ? rooms.length : (rooms ? 1 : 0),
        sampleRoomStructure: rooms ? (Array.isArray(rooms) ? Object.keys(rooms[0] || {}) : Object.keys(rooms)) : 'N/A',
        sampleRoomData: rooms ? (Array.isArray(rooms) ? rooms[0] : rooms) : 'N/A'
      })
      
      // RatePlans 구조 확인
      if (rooms) {
        const roomArray = Array.isArray(rooms) ? rooms : [rooms]
        const firstRoom = roomArray[0]
        const ratePlans = firstRoom?.RatePlans?.RatePlan
        
        devLog('🏨 RatePlans 상세 분석:', {
          hasRatePlans: !!ratePlans,
          ratePlansType: Array.isArray(ratePlans) ? 'array' : typeof ratePlans,
          ratePlansCount: Array.isArray(ratePlans) ? ratePlans.length : (ratePlans ? 1 : 0),
          sampleRatePlan: ratePlans ? (Array.isArray(ratePlans) ? ratePlans[0] : ratePlans) : 'N/A',
          sampleFirstThreeRatePlans: ratePlans && Array.isArray(ratePlans) ? ratePlans.slice(0, 3).map((rp: any) => ({
            RoomType: rp.RoomType || 'N/A',
            RateKey: rp.RateKey || 'N/A',
            AmountAfterTax: rp.ConvertedRateInfo?.AmountAfterTax || rp.RateInfo?.AmountAfterTax || 'N/A',
            Currency: rp.ConvertedRateInfo?.CurrencyCode || rp.RateInfo?.CurrencyCode || 'N/A'
          })) : 'Single or none'
        })
      }
    }
    
    return NextResponse.json<HotelDetailsResponse>(
      {
        success: true,
        data: {
          ...result,
          descriptiveData: descriptiveData, // 객실 상세 정보 추가
          availableData // 가격/재고 기반 응답 (pricingSource=avail일 때 시도)
        },
        // 응답 메타 정보 추가
        // 현재 어떤 소스를 시도했는지와 avail 데이터 존재 여부를 노출
        // 클라이언트에서 디버깅/분기 처리에 활용 가능
      
        // NOTE: API Contracts의 meta 필드 가이드에 따라 추가
        // { "success": true, "data": ..., "meta": {...} }
        // 상태코드는 기존과 동일 유지
        // 하위 호환성 위해 선택적 필드로만 제공
        meta: {
          pricingSourceAttempted: pricingSource,
          hasAvailableData: !!availableData
        }
      },
      { status: 200 }
    )

  } catch (error) {
    devError('Hotel details API 오류:', error)
    return NextResponse.json<HotelDetailsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}
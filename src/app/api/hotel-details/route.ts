import { NextRequest, NextResponse } from 'next/server'

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
    
    if (!body.hotelCode || !body.startDate || !body.endDate) {
      return NextResponse.json<HotelDetailsResponse>(
        {
          success: false,
          error: 'hotelCode, startDate, and endDate are required'
        },
        { status: 400 }
      )
    }

    const requestBody: any = {
      HotelCode: body.hotelCode.toString(),
      CurrencyCode: 'KRW',
      StartDate: body.startDate,
      EndDate: body.endDate,
      Adults: body.adults || 2,
      Children: body.children || 0,
      Rooms: body.rooms || 1
    }
    
    // ratePlanCodes가 있으면 추가
    if (body.ratePlanCodes && body.ratePlanCodes.length > 0) {
      requestBody.RatePlanCode = body.ratePlanCodes
      requestBody.ExactMatchOnly = true
    }

    console.log('📤 Sabre Hotel Details API 요청:', requestBody)

    const response = await fetch('https://sabre-nodejs-9tia3.ondigitalocean.app/public/hotel/sabre/hotel-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(15000)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Sabre API 응답 오류:', response.status, response.statusText, errorText)
      
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
    
    console.log('📥 Sabre API 응답:', {
      hasResult: !!result,
      resultKeys: result ? Object.keys(result) : 'no result',
      hasGetHotelDetailsRS: !!result?.GetHotelDetailsRS,
      getHotelDetailsRSKeys: result?.GetHotelDetailsRS ? Object.keys(result.GetHotelDetailsRS) : 'no GetHotelDetailsRS'
    })
    
    return NextResponse.json<HotelDetailsResponse>(
      {
        success: true,
        data: result
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Hotel details API 오류:', error)
    return NextResponse.json<HotelDetailsResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { selectHotelBenefitsMapUtils } from '@/lib/supabase-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sabreId: string }> }
) {
  try {
    const { sabreId } = await params
    
    if (!sabreId) {
      return NextResponse.json(
        { success: false, error: '호텔 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const sabreIdNumber = parseInt(sabreId, 10)
    if (isNaN(sabreIdNumber)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 호텔 ID입니다.' },
        { status: 400 }
      )
    }

    console.log(`🔍 호텔 ${sabreIdNumber}의 혜택 조회 시작...`)
    
    const benefitsData = await selectHotelBenefitsMapUtils.getHotelBenefits(sabreIdNumber)
    
    console.log(`✅ 호텔 ${sabreIdNumber}의 혜택 ${benefitsData.length}개 조회 완료`)
    
    return NextResponse.json({
      success: true,
      data: benefitsData,
      meta: {
        sabreId: sabreIdNumber,
        count: benefitsData.length
      }
    })
    
  } catch (error) {
    console.error('호텔 혜택 조회 오류:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: '호텔 혜택을 불러오는데 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    )
  }
}

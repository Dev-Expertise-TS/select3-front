import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chainId = searchParams.get('chainId')
    
    if (!chainId) {
      return NextResponse.json({
        success: false,
        error: 'chainId is required'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // chain_id로 chain_slug 조회
    const { data, error } = await supabase
      .from('hotel_chains')
      .select('chain_slug')
      .eq('chain_id', parseInt(chainId))
      .maybeSingle()
    
    if (error) {
      console.error('체인 slug 조회 오류:', error)
      return NextResponse.json({
        success: false,
        error: '체인 정보를 찾을 수 없습니다'
      }, { status: 404 })
    }
    
    if (!data || !data.chain_slug) {
      return NextResponse.json({
        success: false,
        error: '체인 slug를 찾을 수 없습니다'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      chainSlug: data.chain_slug
    })
    
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다'
    }, { status: 500 })
  }
}


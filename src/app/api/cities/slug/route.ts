import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cityCode = searchParams.get('cityCode')
    
    if (!cityCode) {
      return NextResponse.json({
        success: false,
        error: 'cityCode is required'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('select_regions')
      .select('city_slug')
      .eq('city_code', cityCode)
      .eq('region_type', 'city')
      .eq('status', 'active')
      .maybeSingle()
    
    if (error) {
      console.error('도시 slug 조회 오류:', error)
      return NextResponse.json({
        success: false,
        error: '도시 정보를 찾을 수 없습니다'
      }, { status: 404 })
    }
    
    if (!data || !data.city_slug) {
      return NextResponse.json({
        success: false,
        error: '도시 slug를 찾을 수 없습니다'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      citySlug: data.city_slug
    })
    
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다'
    }, { status: 500 })
  }
}


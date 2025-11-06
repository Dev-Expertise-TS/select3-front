import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const brandName = searchParams.get('brandName')
    
    if (!brandName) {
      return NextResponse.json({
        success: false,
        error: 'brandName is required'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // brand_name_en으로 brand_slug 조회
    const { data, error } = await supabase
      .from('hotel_brands')
      .select('brand_slug')
      .eq('brand_name_en', brandName)
      .maybeSingle()
    
    if (error) {
      console.error('브랜드 slug 조회 오류:', error)
      return NextResponse.json({
        success: false,
        error: '브랜드 정보를 찾을 수 없습니다'
      }, { status: 404 })
    }
    
    if (!data || !data.brand_slug) {
      return NextResponse.json({
        success: false,
        error: '브랜드 slug를 찾을 수 없습니다'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      brandSlug: data.brand_slug
    })
    
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다'
    }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // publish된 토픽 페이지 목록 조회 (최신순)
    const { data: pages, error } = await supabase
      .from('select_topic_pages')
      .select('slug, title_ko')
      .eq('publish', true)
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (error) {
      console.error('토픽 페이지 목록 조회 실패:', error)
      return NextResponse.json(
        { success: false, error: '토픽 페이지를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      pages: pages || []
    })
  } catch (error) {
    console.error('토픽 페이지 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


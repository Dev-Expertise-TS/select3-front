import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // 1. 태그 카테고리 조회
    const { data: categories, error: categoriesError } = await supabase
      .from('select_tag_categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (categoriesError) {
      console.error('태그 카테고리 조회 실패:', categoriesError)
      return NextResponse.json(
        { success: false, error: '카테고리를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
    
    // 2. 각 카테고리별 태그 조회
    const categoriesWithTags = await Promise.all(
      (categories || []).map(async (category) => {
        const { data: tags, error: tagsError } = await supabase
          .from('select_tags')
          .select('*')
          .eq('category_id', category.id)
          .eq('active', true)
          .order('sort_order', { ascending: true })
        
        if (tagsError) {
          console.error(`카테고리 ${category.id}의 태그 조회 실패:`, tagsError)
          return { ...category, tags: [] }
        }
        
        return { ...category, tags: tags || [] }
      })
    )
    
    return NextResponse.json({
      success: true,
      categories: categoriesWithTags
    })
  } catch (error) {
    console.error('필터 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


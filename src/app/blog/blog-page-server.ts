import { createClient } from '@/lib/supabase/server'

/**
 * 서버에서 블로그 목록 페이지 데이터 조회
 */
export async function getBlogPageData() {
  const supabase = await createClient()
  
  console.log('🔍 [BlogPage] 서버 데이터 조회 시작')

  // 블로그 목록 조회 (publish가 true인 것만)
  const { data: blogs, error } = await supabase
    .from('select_hotel_blogs')
    .select('id, slug, main_image, main_title, sub_title, created_at, updated_at')
    .eq('publish', true)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
  
  if (error) {
    console.error('❌ [BlogPage] 블로그 조회 실패:', error)
    return { blogs: [] }
  }
  
  console.log('✅ [BlogPage] 블로그 조회 완료:', blogs?.length || 0, '개')

  return {
    blogs: blogs || []
  }
}


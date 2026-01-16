import { createClient } from '@/lib/supabase/server'

/**
 * 서버에서 블로그 목록 페이지 데이터 조회
 */
export async function getBlogPageData(company?: string | null) {
  const supabase = await createClient()
  
  console.log('🔍 [BlogPage] 서버 데이터 조회 시작', company ? `(company: ${company})` : '')

  // 블로그 목록 조회 (publish가 true인 것만)
  // vcc 필터링을 위해 sN_sabre_id 필드들도 함께 조회
  const { data: blogs, error } = await supabase
    .from('select_hotel_blogs')
    .select(`
      id, 
      slug, 
      main_image, 
      main_title, 
      sub_title, 
      created_at, 
      updated_at,
      s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
      s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
      s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id
    `)
    .eq('publish', true)
    .order('updated_at', { ascending: false })
    .order('id', { ascending: false })
  
  if (error) {
    console.error('❌ [BlogPage] 블로그 조회 실패:', error)
    return { blogs: [] }
  }

  let filteredBlogs = blogs || []

  // company=sk일 때 vcc=true 필터 적용
  if (company === 'sk' && filteredBlogs.length > 0) {
    const sabreIds = new Set<number>()
    filteredBlogs.forEach((blog: any) => {
      for (let i = 1; i <= 12; i++) {
        const id = blog[`s${i}_sabre_id`]
        if (id) sabreIds.add(id)
      }
    })

    if (sabreIds.size > 0) {
      const { data: vccData, error: vccError } = await supabase
        .from('select_hotels')
        .select('sabre_id, vcc')
        .in('sabre_id', Array.from(sabreIds))

      if (!vccError && vccData) {
        const vccMap = new Map(vccData.map((h: any) => [h.sabre_id, h.vcc]))
        
        filteredBlogs = filteredBlogs.filter((blog: any) => {
          for (let i = 1; i <= 12; i++) {
            const id = blog[`s${i}_sabre_id`]
            if (id && vccMap.get(id) !== true) {
              return false
            }
          }
          return true
        })
      }
    }
  }

  // sabre_id 필드 제거
  const resultBlogs = filteredBlogs.map((blog: any) => {
    const { 
      s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
      s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
      s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id,
      ...rest 
    } = blog
    return rest
  })
  
  console.log('✅ [BlogPage] 블로그 조회 완료:', resultBlogs.length, '개', company === 'sk' ? '(vcc=TRUE 필터 적용)' : '')

  return {
    blogs: resultBlogs
  }
}


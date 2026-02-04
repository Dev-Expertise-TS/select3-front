import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCompanyFromSearchParams, isCompanyWithVccFilter } from "@/lib/company-filter"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const company = getCompanyFromSearchParams(searchParams)
    
    let query = supabase
      .from("select_hotel_blogs")
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
      .eq("publish", true)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })

    const { data: blogs, error } = await query

    if (error) {
      console.error("Blog fetch error:", error)
      return NextResponse.json(
        { success: false, error: "블로그 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }

    let filteredBlogs = blogs || []

    // vcc 필터 적용 company일 때 vcc=true 필터 적용
    if (isCompanyWithVccFilter(company) && filteredBlogs.length > 0) {
      // 1. 모든 블로그에서 언급된 sabre_id 추출
      const sabreIds = new Set<number>()
      filteredBlogs.forEach((blog: any) => {
        for (let i = 1; i <= 12; i++) {
          const id = blog[`s${i}_sabre_id`]
          if (id) sabreIds.add(id)
        }
      })

      if (sabreIds.size > 0) {
        // 2. 언급된 호텔들의 vcc 상태 조회
        const { data: vccData, error: vccError } = await supabase
          .from('select_hotels')
          .select('sabre_id, vcc')
          .in('sabre_id', Array.from(sabreIds))

        if (!vccError && vccData) {
          const vccMap = new Map(vccData.map((h: any) => [h.sabre_id, h.vcc]))
          
          // 3. vcc가 TRUE가 아닌 호텔이 포함된 블로그 필터링
          filteredBlogs = filteredBlogs.filter((blog: any) => {
            for (let i = 1; i <= 12; i++) {
              const id = blog[`s${i}_sabre_id`]
              // 언급된 호텔이 있는데 그 호텔의 vcc가 TRUE가 아니면 제외
              if (id && vccMap.get(id) !== true) {
                return false
              }
            }
            return true
          })
        }
      }
    }

    // 보안 및 데이터 크기를 위해 sabre_id 필드 제거 후 반환
    const resultBlogs = filteredBlogs.map((blog: any) => {
      const { 
        s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
        s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
        s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id,
        ...rest 
      } = blog
      return rest
    })

    return NextResponse.json({
      success: true,
      data: resultBlogs,
      meta: {
        count: resultBlogs.length
      }
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

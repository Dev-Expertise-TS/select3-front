import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCompanyFromSearchParams } from "@/lib/company-filter"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const company = getCompanyFromSearchParams(searchParams)
    
    const { data: blog, error } = await supabase
      .from("select_hotel_blogs")
      .select(`
        slug,
        main_title,
        main_image,
        sub_title,
        s1_contents,
        s2_contents,
        s3_contents,
        s4_contents,
        s5_contents,
        s6_contents,
        s7_contents,
        s8_contents,
        s9_contents,
        s10_contents,
        s11_contents,
        s12_contents,
        s1_sabre_id,
        s2_sabre_id,
        s3_sabre_id,
        s4_sabre_id,
        s5_sabre_id,
        s6_sabre_id,
        s7_sabre_id,
        s8_sabre_id,
        s9_sabre_id,
        s10_sabre_id,
        s11_sabre_id,
        s12_sabre_id,
        created_at,
        publish
      `)
      .eq("slug", slug)
      .single()

    if (error || !blog) {
      console.error("Blog fetch error:", error)
      return NextResponse.json(
        { success: false, error: "블로그를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // publish 상태 확인
    if (blog.publish === false) {
      return NextResponse.json(
        { success: false, error: "게시되지 않은 블로그입니다." },
        { status: 404 }
      )
    }

    // company=sk일 때 vcc=true 필터 적용
    if (company === 'sk') {
      const sabreIds = []
      for (let i = 1; i <= 12; i++) {
        const id = (blog as any)[`s${i}_sabre_id`]
        if (id) sabreIds.push(id)
      }

      if (sabreIds.length > 0) {
        const { data: vccData, error: vccError } = await supabase
          .from('select_hotels')
          .select('sabre_id, vcc')
          .in('sabre_id', sabreIds)

        if (!vccError && vccData) {
          const vccMap = new Map(vccData.map((h: any) => [h.sabre_id, h.vcc]))
          
          for (const id of sabreIds) {
            if (vccMap.get(id) !== true) {
              return NextResponse.json(
                { success: false, error: "접근 권한이 없는 블로그입니다." },
                { status: 403 }
              )
            }
          }
        }
      }
    }

    // 불필요한 필드 제거 후 반환
    const { publish, ...blogData } = blog

    return NextResponse.json({
      success: true,
      data: blogData
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCompanyFromSearchParams } from "@/lib/company-filter"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sabreId: string }> }
) {
  try {
    const supabase = await createClient()
    const { sabreId } = await params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const company = getCompanyFromSearchParams(searchParams)
    
    console.log(`🔍 [API] 호텔 ${sabreId}의 블로그 조회 시작...`)
    
    // 먼저 호텔 정보를 가져오기
    const { data: hotel, error: hotelError } = await supabase
      .from("select_hotels")
      .select("sabre_id, property_name_ko, vcc")
      .eq("sabre_id", sabreId)
      .single()

    if (hotelError) {
      console.error("Hotel fetch error:", hotelError)
      return NextResponse.json(
        { success: false, error: "호텔을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // company=sk일 때 현재 호텔의 vcc가 TRUE가 아니면 빈 배열 반환
    if (company === 'sk' && hotel?.vcc !== true) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          hotelName: hotel?.property_name_ko || "알 수 없는 호텔",
          sabreId: sabreId,
          filteredByVcc: true
        }
      })
    }

    // 블로그 데이터 조회 (s1_sabre_id ~ s12_sabre_id 중 하나라도 일치하는 블로그 찾기)
    const { data: blogs, error: blogsError } = await supabase
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
        s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
        s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
        s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id,
        created_at,
        updated_at
      `)
      .or(`s1_sabre_id.eq.${sabreId},s2_sabre_id.eq.${sabreId},s3_sabre_id.eq.${sabreId},s4_sabre_id.eq.${sabreId},s5_sabre_id.eq.${sabreId},s6_sabre_id.eq.${sabreId},s7_sabre_id.eq.${sabreId},s8_sabre_id.eq.${sabreId},s9_sabre_id.eq.${sabreId},s10_sabre_id.eq.${sabreId},s11_sabre_id.eq.${sabreId},s12_sabre_id.eq.${sabreId}`)
      .eq('publish', true)
      .order("created_at", { ascending: false })

    if (blogsError) {
      console.error("Blogs fetch error:", blogsError)
      return NextResponse.json(
        { success: false, error: "블로그 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }

    let filteredBlogs = blogs || []

    // company=sk일 때 vcc=true 필터 적용
    if (company === 'sk' && filteredBlogs.length > 0) {
      const allMentionedSabreIds = new Set<number>()
      filteredBlogs.forEach((blog: any) => {
        for (let i = 1; i <= 12; i++) {
          const id = blog[`s${i}_sabre_id`]
          if (id) allMentionedSabreIds.add(id)
        }
      })

      if (allMentionedSabreIds.size > 0) {
        const { data: vccData, error: vccError } = await supabase
          .from('select_hotels')
          .select('sabre_id, vcc')
          .in('sabre_id', Array.from(allMentionedSabreIds))

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

    console.log(`✅ [API] 호텔 ${sabreId}의 블로그 ${resultBlogs.length}개 조회 완료 ${company === 'sk' ? '(vcc=TRUE 필터 적용)' : ''}`)

    return NextResponse.json({
      success: true,
      data: resultBlogs,
      meta: {
        count: resultBlogs.length,
        hotelName: hotel?.property_name_ko || "알 수 없는 호텔",
        sabreId: sabreId
      }
    })
  } catch (error) {
    console.error("Unexpected error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const supabase = await createClient()
    const { slug } = await params
    
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
        created_at
      `)
      .eq("slug", slug)
      .single()

    if (error) {
      console.error("Blog fetch error:", error)
      return NextResponse.json(
        { success: false, error: "블로그를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "블로그를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: blog
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

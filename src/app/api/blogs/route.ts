import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: blogs, error } = await supabase
      .from("select_hotel_blogs")
      .select("id, slug, main_image, main_title, sub_title, created_at, updated_at")
      .eq("publish", true)
      .order("updated_at", { ascending: false })
      .order("id", { ascending: false })

    if (error) {
      console.error("Blog fetch error:", error)
      return NextResponse.json(
        { success: false, error: "블로그 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: blogs || [],
      meta: {
        count: blogs?.length || 0
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

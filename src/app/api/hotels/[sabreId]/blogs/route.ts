import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sabreId: string }> }
) {
  try {
    const supabase = await createClient()
    const { sabreId } = await params
    
    // 먼저 호텔 정보를 가져와서 blogs 필드 확인
    const { data: hotel, error: hotelError } = await supabase
      .from("select_hotels")
      .select("blogs, property_name_ko")
      .eq("sabre_id", sabreId)
      .single()

    if (hotelError) {
      console.error("Hotel fetch error:", hotelError)
      return NextResponse.json(
        { success: false, error: "호텔을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    if (!hotel || !hotel.blogs) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          hotelName: hotel?.property_name_ko || "알 수 없는 호텔"
        }
      })
    }

    // blogs 필드에서 slug 목록 추출
    let blogSlugs: string[] = []
    
    if (typeof hotel.blogs === 'string') {
      // JSON 문자열인지 확인 (배열 형태)
      if (hotel.blogs.startsWith('[') && hotel.blogs.endsWith(']')) {
        try {
          blogSlugs = JSON.parse(hotel.blogs)
        } catch (parseError) {
          console.warn("JSON parsing failed, treating as comma-separated string:", parseError)
          blogSlugs = hotel.blogs.split(',').map(slug => slug.trim()).filter(slug => slug.length > 0)
        }
      } else {
        // 단순 문자열인 경우 (쉼표로 구분된 경우 처리)
        blogSlugs = hotel.blogs.split(',').map(slug => slug.trim()).filter(slug => slug.length > 0)
      }
    } else if (Array.isArray(hotel.blogs)) {
      // 이미 배열인 경우
      blogSlugs = hotel.blogs
    } else if (hotel.blogs) {
      // 단일 값인 경우
      blogSlugs = [String(hotel.blogs)]
    }

    if (blogSlugs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          hotelName: hotel.property_name_ko
        }
      })
    }

    // 블로그 데이터 조회
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
        created_at,
        updated_at
      `)
      .in("slug", blogSlugs)
      .order("updated_at", { ascending: false })

    if (blogsError) {
      console.error("Blogs fetch error:", blogsError)
      return NextResponse.json(
        { success: false, error: "블로그 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: blogs || [],
      meta: {
        count: blogs?.length || 0,
        hotelName: hotel.property_name_ko,
        sabreId: sabreId,
        requestedSlugs: blogSlugs
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

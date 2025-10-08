import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> }
) {
  try {
    const supabase = await createClient()
    const { chainId } = await params
    
    console.log(`[ API ] 브랜드 ${chainId}의 아티클 조회 시작`)
    
    // 1. 해당 체인의 브랜드들 조회
    const { data: brands, error: brandsError } = await supabase
      .from('hotel_brands')
      .select('brand_id, brand_name_en, brand_name_kr')
      .eq('chain_id', parseInt(chainId))
    
    if (brandsError) {
      console.error('[ API ] 브랜드 조회 에러:', brandsError)
      return NextResponse.json(
        { success: false, error: "브랜드 정보를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }
    
    if (!brands || brands.length === 0) {
      console.log(`[ API ] 체인 ${chainId}에 브랜드가 없음`)
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          chainId: parseInt(chainId),
          brands: []
        }
      })
    }
    
    const brandIds = brands.map(brand => brand.brand_id)
    console.log(`[ API ] 조회할 브랜드 ID들:`, brandIds)
    
    // 2. 해당 브랜드들의 호텔들 조회
    const { data: hotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('sabre_id, property_name_ko, property_name_en, brand_id, blogs')
      .or('publish.is.null,publish.eq.true')
      .in('brand_id', brandIds)
      .not('blogs', 'is', null)
    
    if (hotelsError) {
      console.error('[ API ] 호텔 조회 에러:', hotelsError)
      return NextResponse.json(
        { success: false, error: "호텔 정보를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }
    
    if (!hotels || hotels.length === 0) {
      console.log(`[ API ] 체인 ${chainId}에 아티클이 있는 호텔이 없음`)
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          chainId: parseInt(chainId),
          brands: brands,
          hotels: []
        }
      })
    }
    
    // 3. 모든 호텔의 blogs 필드에서 slug 추출
    const allBlogSlugs = new Set<string>()
    const hotelBlogMap = new Map<string, string[]>() // 호텔명 -> 블로그 슬러그 배열
    
    hotels.forEach(hotel => {
      if (hotel.blogs) {
        let blogSlugs: string[] = []
        
        if (typeof hotel.blogs === 'string') {
          if (hotel.blogs.startsWith('[') && hotel.blogs.endsWith(']')) {
            try {
              blogSlugs = JSON.parse(hotel.blogs)
            } catch (parseError) {
              blogSlugs = hotel.blogs.split(',').map(slug => slug.trim()).filter(slug => slug.length > 0)
            }
          } else {
            blogSlugs = hotel.blogs.split(',').map(slug => slug.trim()).filter(slug => slug.length > 0)
          }
        } else if (Array.isArray(hotel.blogs)) {
          blogSlugs = hotel.blogs
        }
        
        if (blogSlugs.length > 0) {
          hotelBlogMap.set(`${hotel.property_name_ko || hotel.property_name_en}`, blogSlugs)
          blogSlugs.forEach(slug => allBlogSlugs.add(slug))
        }
      }
    })
    
    const uniqueBlogSlugs = Array.from(allBlogSlugs)
    console.log(`[ API ] 발견된 블로그 슬러그 ${uniqueBlogSlugs.length}개:`, uniqueBlogSlugs.slice(0, 5))
    
    if (uniqueBlogSlugs.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          chainId: parseInt(chainId),
          brands: brands,
          hotels: hotels.length,
          blogSlugs: []
        }
      })
    }
    
    // 4. 블로그 데이터 조회
    const { data: blogs, error: blogsError } = await supabase
      .from('select_hotel_blogs')
      .select(`
        slug,
        main_title,
        main_image,
        sub_title,
        created_at,
        updated_at
      `)
      .in('slug', uniqueBlogSlugs)
      .order('updated_at', { ascending: false })
      .limit(12) // 최대 12개만
    
    if (blogsError) {
      console.error('[ API ] 블로그 조회 에러:', blogsError)
      return NextResponse.json(
        { success: false, error: "블로그 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }
    
    console.log(`[ API ] 브랜드 ${chainId}의 아티클 ${blogs?.length || 0}개 조회 완료`)
    
    return NextResponse.json({
      success: true,
      data: blogs || [],
      meta: {
        count: blogs?.length || 0,
        chainId: parseInt(chainId),
        brands: brands,
        hotels: hotels.length,
        blogSlugs: uniqueBlogSlugs.length,
        requestedSlugs: uniqueBlogSlugs.slice(0, 10) // 디버깅용
      }
    })
  } catch (error) {
    console.error('[ API ] 브랜드 아티클 조회 중 예외 발생:', error)
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

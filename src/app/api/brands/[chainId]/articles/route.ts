import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getCompanyFromSearchParams, isCompanyWithVccFilter } from "@/lib/company-filter"

/**
 * brand_id_connect 컬럼 파싱 함수
 * 콤마로 구분된 brand_id 문자열을 배열로 변환
 * 예: "71,72,73" -> [71, 72, 73]
 */
function parseBrandIdConnect(brandIdConnect: string | null | undefined): number[] {
  if (!brandIdConnect) return []
  
  if (typeof brandIdConnect === 'string') {
    // JSON 배열 형식인 경우
    if (brandIdConnect.startsWith('[') && brandIdConnect.endsWith(']')) {
      try {
        return JSON.parse(brandIdConnect).map((id: any) => parseInt(String(id)))
      } catch {
        // JSON 파싱 실패 시 쉼표로 구분
        return brandIdConnect
          .replace(/[\[\]]/g, '')
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id))
      }
    }
    // 쉼표로 구분된 문자열
    return brandIdConnect
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id))
  }
  
  return []
}

/**
 * 브랜드 ID 배열 중 하나라도 일치하는지 확인
 */
function hasBrandMatch(blogBrandIds: number[], chainBrandIds: number[]): boolean {
  return blogBrandIds.some(blogBrandId => chainBrandIds.includes(blogBrandId))
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string }> }
) {
  try {
    const supabase = await createClient()
    const { chainId } = await params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const company = getCompanyFromSearchParams(searchParams)
    
    console.log(`[ API ] 체인 ${chainId}의 아티클 조회 시작 (brand_id_connect 기반)`)
    
    // 1. 해당 체인의 브랜드들 조회
    const { data: brands, error: brandsError } = await supabase
      .from('hotel_brands')
      .select('brand_id, brand_name_en, brand_name_ko')
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
          brands: [],
          method: 'brand_id_connect'
        }
      })
    }
    
    // 체인에 속한 모든 브랜드 ID 추출
    const chainBrandIds = brands.map(brand => brand.brand_id)
    console.log(`[ API ] 체인 ${chainId}의 브랜드 ID들:`, chainBrandIds)
    
    // 2. select_hotel_blogs 테이블에서 모든 블로그 조회 (brand_id_connect 컬럼 및 sN_sabre_id 포함)
    const { data: allBlogs, error: blogsError } = await supabase
      .from('select_hotel_blogs')
      .select(`
        slug,
        main_title,
        main_image,
        sub_title,
        created_at,
        updated_at,
        brand_id_connect,
        publish,
        s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
        s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
        s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id
      `)
      .eq('publish', true)
      .not('brand_id_connect', 'is', null)
    
    if (blogsError) {
      console.error('[ API ] 블로그 조회 에러:', blogsError)
      return NextResponse.json(
        { success: false, error: "블로그 데이터를 가져오는데 실패했습니다." },
        { status: 500 }
      )
    }
    
    if (!allBlogs || allBlogs.length === 0) {
      console.log(`[ API ] brand_id_connect가 설정된 블로그가 없음`)
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          count: 0,
          chainId: parseInt(chainId),
          brands: brands,
          method: 'brand_id_connect'
        }
      })
    }
    
    // 3. 클라이언트에서 brand_id_connect 필터링
    let matchedBlogs = allBlogs.filter(blog => {
      const blogBrandIds = parseBrandIdConnect(blog.brand_id_connect)
      const hasMatch = hasBrandMatch(blogBrandIds, chainBrandIds)
      
      return hasMatch
    })

    // 4. vcc 필터 적용 company일 때 vcc=true 필터 적용
    if (isCompanyWithVccFilter(company) && matchedBlogs.length > 0) {
      const sabreIds = new Set<number>()
      matchedBlogs.forEach((blog: any) => {
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
          
          matchedBlogs = matchedBlogs.filter((blog: any) => {
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
    
    // 최신순 정렬 및 최대 12개 제한
    const sortedBlogs = matchedBlogs
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at)
        const dateB = new Date(b.updated_at || b.created_at)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 12)
    
    // 불필요한 필드 제거 (sabre_id, brand_id_connect 등)
    const resultBlogs = sortedBlogs.map(blog => {
      const { 
        brand_id_connect, publish, 
        s1_sabre_id, s2_sabre_id, s3_sabre_id, s4_sabre_id, 
        s5_sabre_id, s6_sabre_id, s7_sabre_id, s8_sabre_id, 
        s9_sabre_id, s10_sabre_id, s11_sabre_id, s12_sabre_id,
        ...rest 
      } = blog
      return rest
    })
    
    console.log(`[ API ] 체인 ${chainId}의 아티클 ${resultBlogs.length}개 조회 완료 (brand_id_connect 기반${isCompanyWithVccFilter(company) ? ', vcc=TRUE 필터 적용' : ''})`)
    
    return NextResponse.json({
      success: true,
      data: resultBlogs,
      meta: {
        count: resultBlogs.length,
        chainId: parseInt(chainId),
        brands: brands,
        totalBlogsChecked: allBlogs.length,
        method: 'brand_id_connect'
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

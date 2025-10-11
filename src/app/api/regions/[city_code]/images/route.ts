import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// 캐싱 설정: 1시간마다 재검증
export const revalidate = 3600

/**
 * 특정 도시의 이미지 목록 조회 API
 * GET /api/regions/{city_code}/images
 * 
 * 우선순위: city_code (가장 정확)
 * 캐싱: 1시간 revalidate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ city_code: string }> }
) {
  try {
    const { city_code } = await params
    const supabase = await createClient()

    console.log(`📸 [API] 도시 이미지 조회 시작: city_code=${city_code}`)

    // 1. select_regions에서 도시 정보 조회
    const { data: region, error: regionError } = await supabase
      .from('select_regions')
      .select('city_code, city_ko, city_en')
      .eq('city_code', city_code)
      .eq('region_type', 'city')
      .eq('status', 'active')
      .single()

    if (regionError || !region) {
      console.error(`❌ [API] 도시 정보 조회 실패:`, regionError)
      return NextResponse.json(
        { success: false, error: '지역을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 2. select_city_media에서 이미지 조회 (테이블명 수정)
    const { data: images, error: imagesError } = await supabase
      .from('select_city_media')
      .select('id, city_code, file_name, file_path, public_url, image_seq')
      .eq('city_code', city_code)
      .order('image_seq', { ascending: true })

    if (imagesError) {
      console.error(`❌ [API] 이미지 조회 오류:`, imagesError)
      return NextResponse.json(
        { success: false, error: '이미지 조회 실패' },
        { status: 500 }
      )
    }

    console.log(`✅ [API] 도시 이미지 조회 성공:`, {
      city_code,
      city_ko: region.city_ko,
      imageCount: images?.length || 0,
      샘플이미지: images?.[0] ? {
        file_name: images[0].file_name,
        file_path: images[0].file_path,
        public_url: images[0].public_url
      } : null
    })

    // 이미지 URL 생성 (file_path 사용)
    const processedImages = images?.map(img => {
      const imageUrl = img.public_url || 
                      (img.file_path ? `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/${img.file_path}` : null)
      
      return {
        ...img,
        imageUrl
      }
    }) || []

    console.log(`✅ [API] 이미지 URL 생성 완료:`, {
      processedCount: processedImages.length,
      firstImageUrl: processedImages[0]?.imageUrl || null
    })

    return NextResponse.json({
      success: true,
      data: {
        region: region,
        images: processedImages,
        firstImage: processedImages[0] || null
      }
    })
  } catch (error: any) {
    console.error('❌ [API] 도시 이미지 조회 중 오류:', error)
    return NextResponse.json(
      { success: false, error: error.message || '서버 오류' },
      { status: 500 }
    )
  }
}


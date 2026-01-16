import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/logger'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. 전체 호텔 수 (publish가 true이거나 null인 것만)
    const { count: totalHotels, error: hotelsError } = await supabase
      .from('select_hotels')
      .select('*', { count: 'exact', head: true })
      .or('publish.is.null,publish.eq.true')

    // 2. 브랜드 수
    const { count: totalBrands, error: brandsError } = await supabase
      .from('hotel_brands')
      .select('*', { count: 'exact', head: true })
      .not('brand_slug', 'is', null)
      .not('brand_slug', 'eq', '')

    // 3. 블로그 포스트 수
    const { count: totalBlogs, error: blogsError } = await supabase
      .from('select_hotel_blogs')
      .select('*', { count: 'exact', head: true })
      .eq('publish', true)

    // 4. 도시 수
    const { count: totalCities, error: citiesError } = await supabase
      .from('select_regions')
      .select('*', { count: 'exact', head: true })
      .eq('region_type', 'city')
      .eq('status', 'active')

    // 5. 후기 수 (pick=true인 것만)
    const { count: totalTestimonials, error: testimonialsError } = await supabase
      .from('select_satisfaction_survey')
      .select('*', { count: 'exact', head: true })
      .eq('pick', true)
      .not('review_text', 'is', null)

    // 6. 프로모션 수
    const { count: totalPromotions, error: promotionsError } = await supabase
      .from('select_feature_slots')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    if (hotelsError || brandsError || blogsError || citiesError || testimonialsError || promotionsError) {
      console.error('❌ 통계 조회 오류:', {
        hotelsError: hotelsError ? getErrorMessage(hotelsError) : null,
        brandsError: brandsError ? getErrorMessage(brandsError) : null,
        blogsError: blogsError ? getErrorMessage(blogsError) : null,
        citiesError: citiesError ? getErrorMessage(citiesError) : null,
        testimonialsError: testimonialsError ? getErrorMessage(testimonialsError) : null,
        promotionsError: promotionsError ? getErrorMessage(promotionsError) : null
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalHotels: totalHotels || 0,
        totalBrands: totalBrands || 0,
        totalBlogs: totalBlogs || 0,
        totalCities: totalCities || 0,
        totalTestimonials: totalTestimonials || 0,
        totalPromotions: totalPromotions || 0
      }
    })
  } catch (error) {
    console.error('❌ 통계 API 오류:', getErrorMessage(error))
    return NextResponse.json(
      {
        success: false,
        error: '통계 데이터를 불러올 수 없습니다.'
      },
      { status: 500 }
    )
  }
}


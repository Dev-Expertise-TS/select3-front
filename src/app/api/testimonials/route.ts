import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // 30분마다 재검증

// Fisher-Yates 셔플 알고리즘 (랜덤 순서)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET() {
  try {
    const supabase = await createClient()

    // select_satisfaction_survey와 select_hotels를 조인하여 slug 정보 가져오기
    // 랜딩 페이지용: pick = true인 것만 가져오기
    // 랜덤 순서로 표시 (캐시 시간마다 새로운 순서)
    const { data, error } = await supabase
      .from('select_satisfaction_survey')
      .select(`
        id,
        review_text,
        property_name_kr,
        booking_number,
        sabre_id,
        sort,
        created_at,
        select_hotels!inner(slug)
      `)
      .eq('pick', true)
      .not('review_text', 'is', null)
      .not('property_name_kr', 'is', null)
      .not('booking_number', 'is', null)
      .not('sabre_id', 'is', null)
      .limit(12)

    if (error) {
      console.error('Testimonials fetch error:', error)
      return NextResponse.json(
        { success: false, error: '고객 후기를 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    // slug가 있는 데이터만 필터링하고 랜덤 순서로 섞기
    const validData = shuffleArray(
      (data || [])
        .filter((item: any) => item.select_hotels?.slug)
        .map((item: any) => ({
          id: item.id,
          review_text: item.review_text,
          property_name_kr: item.property_name_kr,
          booking_number: item.booking_number,
          sabre_id: item.sabre_id,
          sort: item.sort,
          created_at: item.created_at,
          slug: item.select_hotels.slug,
        }))
    )

    return NextResponse.json(
      {
        success: true,
        data: validData,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      }
    )
  } catch (err) {
    console.error('Testimonials API error:', err)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}


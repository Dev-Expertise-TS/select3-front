import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface HotelChainFilter {
  chain_id: number
  chain_name_en: string
  chain_name_ko?: string | null
  count: number
}

export async function GET(): Promise<NextResponse<{
  success: boolean
  data?: HotelChainFilter[]
  error?: string
}>> {
  try {
    const supabase = await createClient()
    
    // 호텔 체인 목록과 각 체인별 호텔 수 조회
    const { data: chains, error: chainsError } = await supabase
      .from('hotel_chains')
      .select('chain_id, chain_name_en, chain_name_ko')
      .order('chain_name_en')

    if (chainsError) {
      console.error('[API] 호텔 체인 조회 실패:', chainsError)
      return NextResponse.json({
        success: false,
        error: '호텔 체인 정보를 불러올 수 없습니다.'
      }, { status: 500 })
    }

    if (!chains || chains.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // 각 체인별 호텔 수 조회
    const chainCounts = await Promise.all(
      chains.map(async (chain) => {
        // 모든 호텔 조회 후 클라이언트에서 필터링
        const { data, error } = await supabase
          .from('select_hotels')
          .select('*')
          .eq('chain', chain.chain_name_en)

        // 클라이언트에서 publish 필터링 (false 제외)
        const filteredCount = error ? 0 : (data || []).filter((h: any) => h.publish !== false).length

        return {
          chain_id: chain.chain_id,
          chain_name_en: chain.chain_name_en,
          chain_name_ko: chain.chain_name_ko,
          count: filteredCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: chainCounts
    })

  } catch (error) {
    console.error('[API] 호텔 체인 필터 조회 중 오류:', error)
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

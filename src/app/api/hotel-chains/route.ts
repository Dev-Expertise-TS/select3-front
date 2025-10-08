import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface HotelChainFilter {
  chain_id: number
  chain_name_en: string
  chain_name_kr?: string | null
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
      .select('chain_id, chain_name_en, chain_name_kr')
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
        const { count, error } = await supabase
          .from('select_hotels')
          .select('*', { count: 'exact', head: true })
          .eq('publish', true)
          .eq('chain', chain.chain_name_en)

        return {
          chain_id: chain.chain_id,
          chain_name_en: chain.chain_name_en,
          chain_name_kr: chain.chain_name_kr,
          count: error ? 0 : (count || 0)
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

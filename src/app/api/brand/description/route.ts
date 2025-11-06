import { NextRequest } from 'next/server'

/**
 * 브랜드 AI 설명 스트리밍 API
 * 호텔 객실 설명과 동일한 패턴으로 스트리밍 방식 구현
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'MISSING_API_KEY' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await request.json()
    const { brandNameEn, brandNameKo } = body || {}

    if (!brandNameEn) {
      return new Response(
        JSON.stringify({ error: 'MISSING_BRAND_NAME' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const prompt = `다음 럭셔리 호텔 브랜드에 대한 매력적인 소개 문구를 한국어로 300자 정도로 작성해주세요.

브랜드명: ${brandNameEn}${brandNameKo ? ` (${brandNameKo})` : ''}

요구사항:
- 300자 내외 (5-6문장)
- **반드시 브랜드의 역사와 연혁을 포함** (창립 연도, 주요 이정표, 헤리티지 등)
- 브랜드의 특징과 철학
- 럭셔리하고 품격 있는 어조
- 투어비스 셀렉트 예약 혜택 암시 (마지막 문장)`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 럭셔리 호텔 전문가이자 마케팅 카피라이터입니다. 브랜드의 역사와 연혁을 포함한 매력적인 브랜드 소개를 작성합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 450,
        stream: true, // 스트리밍 활성화
      }),
    })

    if (!response.ok || !response.body) {
      const text = await response.text()
      return new Response(text, { status: response.status })
    }

    // OpenAI SSE 스트림을 그대로 전달
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (e) {
    console.error('브랜드 AI 설명 스트리밍 오류:', e)
    return new Response(
      JSON.stringify({ error: 'STREAM_ERROR' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}



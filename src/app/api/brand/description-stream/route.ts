import { NextRequest } from 'next/server'

// Edge Runtime 제거 - Node.js runtime 사용 (setTimeout 안정성)
// export const runtime = 'edge'

interface BrandInfo {
  brand_name_en: string
  brand_name_ko?: string | null
  brand_description?: string | null
  brand_description_ko?: string | null
}

/**
 * 브랜드 설명 스트리밍 API
 * 호텔 객실 AI와 동일한 패턴: OpenAI response.body를 그대로 프록시
 */
export async function POST(req: NextRequest) {
  try {
    const { brand } = await req.json() as { brand: BrandInfo }

    if (!brand?.brand_name_en) {
      console.error('[Brand AI] 브랜드 정보 누락')
      return new Response('브랜드 정보가 필요합니다', { status: 400 })
    }

    const brandName = brand.brand_name_ko || brand.brand_name_en
    console.log(`[Brand AI] ${brandName} 설명 생성 시작`)

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.error('[Brand AI] OPENAI_API_KEY 환경 변수 누락')
      const fallback = generateFallbackDescription(brand)
      return streamText(fallback)
    }

    console.log(`[Brand AI] API 키 확인 완료 (길이: ${apiKey.length})`)

    // OpenAI API 호출
    const prompt = `다음 럭셔리 호텔 브랜드에 대한 매력적인 소개 문구를 한국어로 300자 정도로 작성해주세요.

브랜드명: ${brand.brand_name_en}${brand.brand_name_ko ? ` (${brand.brand_name_ko})` : ''}

요구사항:
- 300자 내외 (5-6문장)
- **반드시 브랜드의 역사와 연혁을 포함** (창립 연도, 주요 이정표, 헤리티지 등)
- 브랜드의 특징과 철학
- 럭셔리하고 품격 있는 어조
- 투어비스 셀렉트 예약 혜택 암시 (마지막 문장)`

    console.log('[Brand AI] OpenAI API 호출 중...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Brand AI] OpenAI API 오류: ${response.status} ${response.statusText}`)
      console.error(`[Brand AI] 오류 상세: ${errorText}`)
      const fallback = generateFallbackDescription(brand)
      return streamText(fallback)
    }

    if (!response.body) {
      console.error('[Brand AI] OpenAI API 응답 바디 없음')
      const fallback = generateFallbackDescription(brand)
      return streamText(fallback)
    }

    console.log('[Brand AI] OpenAI API 응답 수신, 스트리밍 시작')

    // 호텔 객실 AI와 동일한 방식: OpenAI response.body를 그대로 프록시
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('브랜드 설명 생성 오류:', error)
    return new Response('서버 오류', { status: 500 })
  }
}

/**
 * 폴백 설명 생성
 */
function generateFallbackDescription(brand: BrandInfo): string {
  const brandName = brand.brand_name_ko || brand.brand_name_en
  
  if (brand.brand_description_ko) {
    return brand.brand_description_ko.slice(0, 300)
  }
  if (brand.brand_description) {
    return brand.brand_description.slice(0, 300)
  }

  return `${brandName}는 세계적인 럭셔리 호텔 브랜드로, 오랜 역사와 헤리티지를 바탕으로 전 세계에서 최고의 서비스를 제공하고 있습니다. 탁월한 서비스와 세심한 배려로 잊지 못할 경험을 선사하며, 각 호텔은 현지의 문화와 자연을 반영한 독특한 디자인으로 고객들에게 특별한 순간을 제공합니다. 투어비스 셀렉트를 통해 ${brandName}의 프리미엄 서비스를 특별한 혜택과 함께 경험하실 수 있습니다.`
}

/**
 * 텍스트를 스트리밍 형식으로 반환 (폴백용)
 * OpenAI 원본 형식과 동일하게: choices[0].delta.content
 */
function streamText(text: string): Response {
  console.log('[Brand AI] 폴백 텍스트 스트리밍 시작, 길이:', text.length)
  
  return new Response(
    new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          // 2-3글자씩 묶어서 전송
          const chars = text.split('')
          let i = 0
          
          while (i < chars.length) {
            const chunk = chars.slice(i, i + 2).join('')
            // OpenAI 원본 형식과 동일하게
            const message = `data: ${JSON.stringify({ 
              choices: [{ delta: { content: chunk } }] 
            })}\n\n`
            controller.enqueue(encoder.encode(message))
            i += 2
            
            // Promise 기반 딜레이
            if (i < chars.length) {
              await new Promise(resolve => setTimeout(resolve, 80))
            }
          }
          
          console.log('[Brand AI] 폴백 텍스트 스트리밍 완료')
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('[Brand AI] 폴백 스트리밍 오류:', error)
          controller.close()
        }
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    }
  )
}



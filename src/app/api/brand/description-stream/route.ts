import { NextRequest } from 'next/server'

export const runtime = 'edge'

interface BrandInfo {
  brand_name_en: string
  brand_name_ko?: string | null
  brand_description?: string | null
  brand_description_ko?: string | null
}

/**
 * 브랜드 설명 스트리밍 API
 */
export async function POST(req: NextRequest) {
  try {
    const { brand } = await req.json() as { brand: BrandInfo }

    if (!brand?.brand_name_en) {
      return new Response('브랜드 정보가 필요합니다', { status: 400 })
    }

    // OpenAI API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      // 폴백 설명 반환 (스트리밍 형식)
      const fallback = generateFallbackDescription(brand)
      return streamText(fallback)
    }

    // OpenAI API 호출
    const prompt = `다음 럭셔리 호텔 브랜드에 대한 매력적인 소개 문구를 한국어로 300자 정도로 작성해주세요.

브랜드명: ${brand.brand_name_en}${brand.brand_name_ko ? ` (${brand.brand_name_ko})` : ''}

요구사항:
- 300자 내외 (5-6문장)
- **반드시 브랜드의 역사와 연혁을 포함** (창립 연도, 주요 이정표, 헤리티지 등)
- 브랜드의 특징과 철학
- 럭셔리하고 품격 있는 어조
- 투어비스 셀렉트 예약 혜택 암시 (마지막 문장)`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
      console.error('OpenAI API 오류:', response.status, response.statusText)
      const fallback = generateFallbackDescription(brand)
      return streamText(fallback)
    }

    // OpenAI 스트림을 SSE 형식으로 변환
    return new Response(
      new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          const decoder = new TextDecoder()
          let buffer = ''

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed || trimmed === 'data: [DONE]') continue
                if (trimmed.startsWith('data: ')) {
                  const data = trimmed.slice(6)
                  try {
                    const json = JSON.parse(data)
                    const content = json.choices?.[0]?.delta?.content
                    if (content) {
                      controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`)
                    }
                  } catch (e) {
                    // JSON 파싱 오류 무시
                  }
                }
              }
            }

            controller.enqueue('data: [DONE]\n\n')
            controller.close()
          } catch (error) {
            console.error('스트리밍 오류:', error)
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
 */
function streamText(text: string): Response {
  return new Response(
    new ReadableStream({
      start(controller) {
        // 한 글자씩 천천히 전송
        const chars = text.split('')
        let i = 0
        const interval = setInterval(() => {
          if (i < chars.length) {
            controller.enqueue(`data: ${JSON.stringify({ content: chars[i] })}\n\n`)
            i++
          } else {
            controller.enqueue('data: [DONE]\n\n')
            controller.close()
            clearInterval(interval)
          }
        }, 60) // 60ms 간격 (타이핑 속도 조절)
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


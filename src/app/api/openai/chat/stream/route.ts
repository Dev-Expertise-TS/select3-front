import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'MISSING_API_KEY' }), { status: 500 })
  }

  try {
    const body = await request.json()
    const { messages, model = 'gpt-4o-mini', temperature = 0.4 } = body || {}

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: true,
      }),
    })

    if (!response.ok || !response.body) {
      const text = await response.text()
      return new Response(text, { status: response.status })
    }

    // 프록시: OpenAI SSE를 그대로 전달
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'STREAM_ERROR' }), { status: 500 })
  }
}



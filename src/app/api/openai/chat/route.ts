import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  max_completion_tokens?: number;
  temperature?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model, max_completion_tokens = 200, temperature = 0.7 } = body;

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages,
        max_completion_tokens,
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
      } catch (e) {
        errorData = `응답 파싱 실패: ${e instanceof Error ? e.message : '알 수 없는 오류'}`;
      }
      
      console.error('OpenAI API 오류 상세:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        requestBody: {
          model: model || 'gpt-4o-mini',
          messages: messages,
          max_completion_tokens,
          temperature,
          stream: false
        }
      });
      
      return NextResponse.json(
        { 
          error: `OpenAI API 오류: ${response.status}`,
          details: errorData,
          requestInfo: {
            model: model || 'gpt-4o-mini',
            messageCount: messages?.length || 0
          }
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OpenAI API 호출 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

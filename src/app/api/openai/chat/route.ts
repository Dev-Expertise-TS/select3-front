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
        model: model || 'gpt-4o',
        messages,
        max_completion_tokens,
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      
      console.error('OpenAI API 오류 상세:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
        requestBody: {
          model: model || 'gpt-4o',
          messages: messages,
          max_tokens,
          temperature,
          stream: false
        }
      });
      
      return NextResponse.json(
        { 
          error: `OpenAI API 오류: ${response.status}`,
          details: errorData,
          requestInfo: {
            model: model || 'gpt-4o',
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

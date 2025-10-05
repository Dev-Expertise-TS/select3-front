import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not found',
        hasKey: false 
      }, { status: 400 });
    }

    // API 키 형식 검증
    const isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
    
    // 간단한 API 호출 테스트
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json({
      hasKey: true,
      keyFormat: isValidFormat ? 'valid' : 'invalid',
      keyLength: apiKey.length,
      keyPrefix: apiKey.substring(0, 10) + '...',
      apiStatus: response.status,
      apiResponse: response.ok ? 'success' : data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'API test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

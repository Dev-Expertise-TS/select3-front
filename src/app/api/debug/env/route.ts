import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // 환경 변수 존재 여부 확인 (민감한 값은 마스킹)
    const envCheck = {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      
      // OpenAI
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      
      // Sabre
      SABRE_CLIENT_ID: !!process.env.SABRE_CLIENT_ID,
      SABRE_CLIENT_SECRET: !!process.env.SABRE_CLIENT_SECRET,
      SABRE_BASE_URL: !!process.env.SABRE_BASE_URL,
      
      // 기타
      NODE_ENV: process.env.NODE_ENV,
      SABRE_DEBUG: process.env.SABRE_DEBUG,
    };

    // API 키 형식 검증 (안전한 방식)
    const keyValidation = {
      openai: {
        exists: !!process.env.OPENAI_API_KEY,
        format: process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid' : 'invalid',
        length: process.env.OPENAI_API_KEY?.length || 0,
      },
      sabre: {
        clientId: {
          exists: !!process.env.SABRE_CLIENT_ID,
          format: process.env.SABRE_CLIENT_ID?.startsWith('V1:') ? 'valid' : 'invalid',
        },
        clientSecret: {
          exists: !!process.env.SABRE_CLIENT_SECRET,
          length: process.env.SABRE_CLIENT_SECRET?.length || 0,
        }
      }
    };

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      keyValidation,
      recommendations: {
        openai: process.env.OPENAI_API_KEY?.startsWith('sk-') 
          ? 'API 키 형식이 올바릅니다' 
          : 'API 키가 sk-로 시작하지 않습니다. 새로운 키를 발급받으세요.',
        sabre: process.env.SABRE_CLIENT_ID?.startsWith('V1:') 
          ? 'Sabre 클라이언트 ID 형식이 올바릅니다'
          : 'Sabre 클라이언트 ID가 V1:로 시작하지 않습니다.'
      }
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

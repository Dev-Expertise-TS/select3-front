import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ 
      success: false, 
      error: '이미지 URL이 필요합니다' 
    }, { status: 400 });
  }

  try {
    console.log('🔍 이미지 존재 확인:', imageUrl);
    
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const exists = response.ok;
    const status = response.status;
    const statusText = response.statusText;
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    console.log('📊 이미지 응답 정보:', {
      exists,
      status,
      statusText,
      contentType,
      contentLength
    });

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        exists,
        status,
        statusText,
        contentType,
        contentLength: contentLength ? parseInt(contentLength) : null,
        sizeKB: contentLength ? Math.round(parseInt(contentLength) / 1024) : null
      }
    });
  } catch (error) {
    console.error('❌ 이미지 확인 중 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '이미지 확인 중 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

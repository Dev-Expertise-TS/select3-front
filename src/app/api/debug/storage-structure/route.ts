import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Storage 버킷 구조 확인
    const results: any = {};

    // 1. 루트 폴더 확인
    console.log('🔍 루트 폴더 확인 중...');
    const { data: rootFiles, error: rootError } = await supabase.storage
      .from('hotel-media')
      .list('', { limit: 100 });

    results.root = {
      files: rootFiles || [],
      error: rootError,
      count: rootFiles?.length || 0
    };

    // 2. public 폴더 확인
    console.log('🔍 public 폴더 확인 중...');
    const { data: publicFiles, error: publicError } = await supabase.storage
      .from('hotel-media')
      .list('public', { limit: 100 });

    results.public = {
      files: publicFiles || [],
      error: publicError,
      count: publicFiles?.length || 0
    };

    // 3. mandarin-oriental-taipei 폴더 확인 (여러 경로)
    const mandarinPaths = [
      'mandarin-oriental-taipei',
      'public/mandarin-oriental-taipei',
      'hotels/mandarin-oriental-taipei'
    ];

    results.mandarin = {};

    for (const path of mandarinPaths) {
      console.log(`🔍 ${path} 폴더 확인 중...`);
      const { data: pathFiles, error: pathError } = await supabase.storage
        .from('hotel-media')
        .list(path, { limit: 100 });

      results.mandarin[path] = {
        files: pathFiles || [],
        error: pathError,
        count: pathFiles?.length || 0
      };
    }

    return NextResponse.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Storage 구조 확인 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Storage 구조 확인 중 오류 발생',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

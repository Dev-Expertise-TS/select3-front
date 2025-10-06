import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sabreId: string }> }
) {
  try {
    const { sabreId } = await params;
    const supabase = await createClient();

    // 호텔 정보 조회 (slug 필요)
    const { data: hotel, error: hotelError } = await supabase
      .from('select_hotels')
      .select('slug, property_name_ko, property_name_en')
      .eq('sabre_id', parseInt(sabreId))
      .single();

    if (hotelError || !hotel) {
      return NextResponse.json({
        success: false,
        error: '호텔 정보를 찾을 수 없습니다'
      }, { status: 404 });
    }

    if (!hotel.slug) {
      return NextResponse.json({
        success: false,
        error: '호텔 slug 정보가 없습니다'
      }, { status: 400 });
    }

    const decodedSlug = decodeURIComponent(hotel.slug);

    // Service Role 클라이언트로 Storage list() API 사용
    const adminClient = createAdminClient();
    const { data: files, error: listError } = await adminClient.storage
      .from('hotel-media')
      .list(`public/${decodedSlug}`, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('Storage list 오류:', listError);
      return NextResponse.json({
        success: false,
        error: 'Storage 파일 목록 조회 실패',
        details: listError.message
      }, { status: 500 });
    }

    // 이미지 파일만 필터링
    const imageFiles = (files || []).filter(f => 
      /\.(avif|webp|jpg|jpeg|png)$/i.test(f.name)
    );

    console.log('✅ Storage list() API 호출 완료:', {
      slug: decodedSlug,
      sabreId,
      totalFiles: files?.length || 0,
      imageFiles: imageFiles.length,
      images: imageFiles.map(f => f.name)
    });

    // 이미지 메타데이터 생성
    const images = imageFiles.map((file, idx) => {
      const url = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/${decodedSlug}/${file.name}`;
      return {
        id: `storage-${idx + 1}`,
        filename: file.name,
        sequence: idx + 1,
        media_path: url,
        url,
        alt: `${hotel.property_name_ko} 이미지 ${idx + 1}`,
        isMain: idx === 0,
        size: file.metadata?.size ?? 0,
        lastModified: file.updated_at ?? new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        hotel: {
          sabre_id: parseInt(sabreId),
          slug: hotel.slug,
          property_name_ko: hotel.property_name_ko,
          property_name_en: hotel.property_name_en
        },
        images,
        totalCount: images.length
      }
    });

  } catch (error) {
    console.error('호텔 스토리지 이미지 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

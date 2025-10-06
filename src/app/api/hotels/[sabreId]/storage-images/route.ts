import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // 서버에서 실제 스토리지 파일을 조회하여 존재하는 파일만 반환
    const decodedSlug = decodeURIComponent(hotel.slug);
    const supa = await createClient();
    const listResult = await supa.storage
      .from('hotel-media')
      .list(`public/${decodedSlug}`, { limit: 100, sortBy: { column: 'name', order: 'asc' } });

    if (listResult.error) {
      console.error('스토리지 목록 조회 오류:', listResult.error);
      return NextResponse.json({ success: true, data: { hotel, images: [], totalCount: 0 } });
    }

    const files = listResult.data || [];
    const images = files
      .filter(f => !f.name.endsWith('/') && /(avif|webp|jpg|jpeg|png)$/i.test(f.name))
      .map((f, idx) => {
        const path = `public/${decodedSlug}/${f.name}`;
        const url = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/${path}`;
        return {
          id: `storage-${idx + 1}`,
          filename: f.name,
          sequence: idx + 1,
          media_path: url,
          url,
          alt: `${hotel.property_name_ko} 이미지 ${idx + 1}`,
          isMain: idx === 0,
          size: f.metadata?.size ?? 0,
          lastModified: f.updated_at ?? new Date().toISOString(),
        };
      });

    console.log('📋 스토리지에서 조회된 실제 이미지 목록:', {
      totalImages: images.length,
      files: images.map(img => img.filename),
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

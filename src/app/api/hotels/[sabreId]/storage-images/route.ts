import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateHotelImageUrl } from '@/lib/supabase-image-loader';

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

    // 기존 이미지 갤러리와 동일한 방식으로 이미지 URL 생성 (1~11 시퀀스)
    // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
    const decodedSlug = decodeURIComponent(hotel.slug);
    
    console.log('🔍 기존 방식으로 이미지 URL 생성 중...', {
      originalSlug: hotel.slug,
      decodedSlug: decodedSlug,
      hasSpecialChars: hotel.slug !== decodedSlug,
      sabreId: parseInt(sabreId)
    });

    // 이전 방식: 모든 시퀀스에 대해 URL 생성 (존재 여부 확인은 클라이언트에서)
    const images = [];
    const maxSequence = 11; // 최대 시퀀스 번호
    
    for (let sequence = 1; sequence <= maxSequence; sequence++) {
      // 기본 generateHotelImageUrl 사용 (서버사이드에서 안전)
      const imageUrl = generateHotelImageUrl(hotel.slug, parseInt(sabreId), sequence);
      
      if (imageUrl) {
        // URL에서 파일명 추출
        const fileName = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        
        images.push({
          id: `storage-${sequence}`,
          filename: fileName,
          sequence: sequence,
          media_path: imageUrl, // OptimizedImage에서 사용할 원본 URL
          url: imageUrl, // 호환성을 위해 유지
          alt: `${hotel.property_name_ko} 이미지 ${sequence}`,
          isMain: sequence === 1,
          size: 0,
          lastModified: new Date().toISOString()
        });
        
        console.log(`✅ 이미지 URL 생성: ${fileName}`);
      } else {
        console.log(`⚠️ 이미지 URL 생성 실패: 시퀀스 ${sequence}`);
      }
    }

    console.log('📋 생성된 이미지 목록:', {
      totalImages: images.length,
      sequences: images.map(img => ({ filename: img.filename, sequence: img.sequence }))
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
        images: images,
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

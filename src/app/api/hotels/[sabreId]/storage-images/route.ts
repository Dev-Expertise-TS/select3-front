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

    // 기존 이미지 갤러리와 동일한 방식으로 이미지 URL 생성 (1~11 시퀀스)
    // URL 디코딩 처리 (어퍼스트로피 등 특수문자 처리)
    const decodedSlug = decodeURIComponent(hotel.slug);
    
    console.log('🔍 기존 방식으로 이미지 URL 생성 중...', {
      originalSlug: hotel.slug,
      decodedSlug: decodedSlug,
      hasSpecialChars: hotel.slug !== decodedSlug,
      sabreId: parseInt(sabreId)
    });

    // 실제 존재하는 이미지만 확인하여 반환
    const images = [];
    const maxSequence = 11; // 최대 시퀀스 번호
    
    for (let sequence = 1; sequence <= maxSequence; sequence++) {
      const fileName = `${decodedSlug}_${sabreId}_${sequence.toString().padStart(2, '0')}_1600w.avif`;
      const imageUrl = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/${decodedSlug}/${fileName}`;
      
      try {
        // 이미지 존재 여부 확인 (HEAD 요청)
        const response = await fetch(imageUrl, { method: 'HEAD' });
        
        if (response.ok) {
          console.log(`✅ 이미지 존재 확인: ${fileName}`);
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
        } else {
          console.log(`❌ 이미지 없음 (${response.status}): ${fileName}`);
          // 이미지가 없으면 더 이상 시퀀스를 확인하지 않음 (연속된 시퀀스라고 가정)
          if (sequence > 1) {
            console.log(`🛑 시퀀스 ${sequence}에서 이미지 없음, 더 이상 확인하지 않음`);
            break;
          }
        }
      } catch (error) {
        console.warn(`⚠️ 이미지 확인 오류: ${fileName}`, error);
        // 네트워크 오류 등으로 확인할 수 없는 경우도 더 이상 확인하지 않음
        if (sequence > 1) {
          break;
        }
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

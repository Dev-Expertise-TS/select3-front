import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// 최신 스토리지 상태를 항상 반영
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      .select('*')
      .eq('sabre_id', parseInt(sabreId))
      .maybeSingle();

    if (hotelError || !hotel) {
      return NextResponse.json({
        success: false,
        error: '호텔 정보를 찾을 수 없습니다'
      }, { status: 404 });
    }

    // publish가 false면 404 반환
    if (hotel.publish === false) {
      return NextResponse.json({
        success: false,
        error: '호텔이 공개되지 않았습니다'
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
    
    console.log('🔍 Storage API 호출 시도:', {
      bucket: 'hotel-media',
      path: decodedSlug,
      sabreId,
      slug: hotel.slug
    });
    
    // Timeout 설정 (10초)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Storage API timeout (10s)')), 10000);
    });

    // 여러 경로 시도
    const paths = [
      decodedSlug,                    // 기본 경로
      `public/${decodedSlug}`,        // public 폴더 포함
      `${decodedSlug}`,               // 동일하지만 명시적
    ];

    let files = null;
    let listError = null;
    let successPath = null;

    // 각 경로를 순차적으로 시도
    for (const tryPath of paths) {
      const listPromise = adminClient.storage
        .from('hotel-media')
        .list(tryPath, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' }
        });

      try {
        const result = await Promise.race([listPromise, timeoutPromise]);
        
        if (!result.error && result.data && result.data.length > 0) {
          files = result.data;
          successPath = tryPath;
          console.log(`✅ Storage 경로 찾음: ${tryPath} (파일 ${files.length}개)`);
          break;
        } else if (result.error) {
          console.log(`❌ Storage 경로 실패: ${tryPath} - ${result.error.message}`);
          listError = result.error;
        } else {
          console.log(`📭 Storage 경로 비어있음: ${tryPath}`);
        }
      } catch (err) {
        console.log(`⏱️ Storage 경로 timeout: ${tryPath}`);
        continue;
      }
    }

    // 모든 경로 시도 실패
    if (!files || files.length === 0) {
      console.warn(`⚠️ Storage에서 이미지를 찾을 수 없음 (Sabre ID: ${sabreId}, slug: ${decodedSlug})`);
      // 빈 배열 반환 (fallback 사용)
      return NextResponse.json({
        success: true,
        data: {
          hotel: {
            sabre_id: parseInt(sabreId),
            slug: hotel.slug,
            property_name_ko: hotel.property_name_ko,
            property_name_en: hotel.property_name_en
          },
          images: [],
          totalCount: 0
        }
      });
    }

    // 이미지 파일만 필터링
    const imageFiles = (files || []).filter(f => 
      /\.(avif|webp|jpg|jpeg|png)$/i.test(f.name)
    );

    // 파일명에서 숫자 추출하여 정렬 (예: _01_, _02_, _11_ 등)
    const sortedImageFiles = imageFiles.sort((a, b) => {
      // 파일명에서 숫자 부분 추출 (예: "slug_62024_05_1600w.avif" -> 5)
      const getNumber = (name: string) => {
        const match = name.match(/_(\d+)_/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getNumber(a.name) - getNumber(b.name);
    });

    console.log('✅ Storage API 완료:', {
      successPath,
      slug: decodedSlug,
      sabreId,
      totalFiles: files?.length || 0,
      imageFiles: sortedImageFiles.length,
      firstImage: sortedImageFiles[0]?.name
    });

    // 이미지 메타데이터 생성 (순차적으로 번호 부여)
    const images = sortedImageFiles.map((file, idx) => {
      // successPath를 사용하여 올바른 URL 생성
      const base = `https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/${successPath}/${file.name}`;
      // 캐시 무효화를 위해 파일 수정시각 기반 버전 파라미터 부여
      const version = encodeURIComponent((file.updated_at ?? new Date().toISOString()));
      const url = `${base}?v=${version}`;
      return {
        id: `storage-${idx + 1}`,
        filename: file.name,
        sequence: idx + 1, // 순차 번호 (1, 2, 3, 4, ... 연속)
        media_path: url,
        url,
        alt: `${hotel.property_name_ko} 이미지 ${idx + 1}`,
        isMain: idx === 0,
        size: file.metadata?.size ?? 0,
        lastModified: file.updated_at ?? new Date().toISOString(),
      };
    });

    const res = NextResponse.json({
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
    // 강력 무캐시 헤더로 최신 목록 보장
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.headers.set('Pragma', 'no-cache');
    return res;

  } catch (error) {
    console.error('호텔 스토리지 이미지 조회 오류:', error);
    
    const errRes = NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
    errRes.headers.set('Cache-Control', 'no-store');
    return errRes;
  }
}

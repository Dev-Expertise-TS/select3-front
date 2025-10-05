import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { generateHotelImageUrl } from '@/lib/supabase-image-loader';
import ImageExistsChecker from './ImageExistsChecker';

interface DebugHotelImagesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function DebugHotelImagesPage({ params }: DebugHotelImagesPageProps) {
  const { slug } = await params;
  
  try {
    const supabase = await createClient();

    // 호텔 데이터 조회
    const { data: hotel, error } = await supabase
      .from('select_hotels')
      .select('*, image_1, image_2, image_3, image_4, image_5')
      .eq('slug', slug)
      .single();

    if (error || !hotel) {
      notFound();
    }

    // 호텔 미디어 데이터 조회
    const { data: hotelMedia, error: mediaError } = await supabase
      .from('select_hotel_media')
      .select('*')
      .eq('sabre_id', hotel.sabre_id)
      .order('sequence', { ascending: true });

    // 기존 이미지 데이터 (select_hotels 테이블)
    const existingImages = [
      hotel.image_1,
      hotel.image_2,
      hotel.image_3,
      hotel.image_4,
      hotel.image_5
    ].filter(Boolean);

    // Supabase Storage 이미지 URL 생성
    const storageImages = [];
    for (let i = 1; i <= 5; i++) {
      const url = generateHotelImageUrl(hotel.slug, hotel.sabre_id, i);
      if (url) {
        storageImages.push({
          sequence: i,
          url,
          fileName: `${hotel.slug}_${hotel.sabre_id}_${i.toString().padStart(2, '0')}_1600w.avif`
        });
      }
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔍 호텔 이미지 디버깅</h1>
      
      {/* 호텔 기본 정보 */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">호텔 정보</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">호텔명 (한글):</span> {hotel.property_name_ko || 'N/A'}
          </div>
          <div>
            <span className="font-medium">호텔명 (영문):</span> {hotel.property_name_en || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Slug:</span> {hotel.slug}
          </div>
          <div>
            <span className="font-medium">Sabre ID:</span> {hotel.sabre_id}
          </div>
        </div>
      </div>

      {/* 기존 이미지 데이터 (select_hotels 테이블) */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">기존 이미지 데이터 (select_hotels 테이블)</h2>
        <div className="space-y-4">
          {existingImages.length > 0 ? (
            existingImages.map((imageUrl, index) => (
              <div key={index} className="bg-white p-4 rounded border">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-24 bg-gray-100 rounded border overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={`Existing image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`✅ 기존 이미지 ${index + 1} 로드 성공`)}
                      onError={(e) => {
                        console.log(`❌ 기존 이미지 ${index + 1} 로드 실패:`, imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">이미지 {index + 1}</div>
                    <div className="text-sm text-gray-600 break-all">{imageUrl}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-600">기존 이미지 데이터가 없습니다.</div>
          )}
        </div>
      </div>

      {/* Supabase Storage 이미지 */}
      <div className="bg-purple-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Supabase Storage 이미지</h2>
        <div className="space-y-4">
          {storageImages.length > 0 ? (
            storageImages.map(({ sequence, url, fileName }) => (
              <div key={sequence} className="bg-white p-4 rounded border">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-24 bg-gray-100 rounded border overflow-hidden">
                    <img 
                      src={url} 
                      alt={`Storage image ${sequence}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`✅ Storage 이미지 ${sequence} 로드 성공:`, url)}
                      onError={(e) => {
                        console.log(`❌ Storage 이미지 ${sequence} 로드 실패:`, url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">이미지 {sequence}</div>
                    <div className="text-sm text-gray-600 mb-1">파일명: {fileName}</div>
                    <div className="text-sm text-gray-600 break-all mb-2">{url}</div>
                    <ImageExistsChecker url={url} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-600">Supabase Storage 이미지 URL 생성 실패</div>
          )}
        </div>
      </div>

      {/* 호텔 미디어 테이블 데이터 */}
      <div className="bg-yellow-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">호텔 미디어 테이블 데이터</h2>
        <div className="space-y-4">
          {hotelMedia && hotelMedia.length > 0 ? (
            hotelMedia.map((media: any, index) => (
              <div key={index} className="bg-white p-4 rounded border">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-24 bg-gray-100 rounded border overflow-hidden">
                    <img 
                      src={media.media_path} 
                      alt={`Media image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`✅ 미디어 이미지 ${index + 1} 로드 성공:`, media.media_path)}
                      onError={(e) => {
                        console.log(`❌ 미디어 이미지 ${index + 1} 로드 실패:`, media.media_path);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">미디어 {index + 1}</div>
                    <div className="text-sm text-gray-600 mb-1">Sequence: {media.sequence}</div>
                    <div className="text-sm text-gray-600 mb-1">Type: {media.media_type}</div>
                    <div className="text-sm text-gray-600 break-all mb-2">{media.media_path}</div>
                    <ImageExistsChecker url={media.media_path} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-600">
              호텔 미디어 테이블에 데이터가 없습니다.
              {mediaError && (
                <div className="text-red-600 mt-2">오류: {mediaError.message}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 실제 호텔 상세 페이지 링크 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">실제 호텔 상세 페이지</h2>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            아래 링크에서 실제 이미지 갤러리 동작을 확인할 수 있습니다:
          </div>
          <a 
            href={`/hotel/${slug}`}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            target="_blank"
          >
            호텔 상세 페이지로 이동
          </a>
        </div>
      </div>
    </div>
  );

  } catch (error) {
    console.error('디버깅 페이지 오류:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">❌ 오류 발생</h1>
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Supabase 연결 오류</h2>
          <div className="text-gray-600">
            <p>호텔 데이터를 불러오는 중 오류가 발생했습니다.</p>
            <p className="mt-2 text-sm">오류 내용: {error instanceof Error ? error.message : '알 수 없는 오류'}</p>
          </div>
          <div className="mt-4">
            <a 
              href="/debug"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              디버그 페이지로 돌아가기
            </a>
          </div>
        </div>
      </div>
    );
  }
}

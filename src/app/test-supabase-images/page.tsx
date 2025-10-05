import { HotelHeroImage, HotelThumbnail } from '@/components/ui/optimized-image';
import { generateHotelImageUrl } from '@/lib/supabase-image-loader';

export default function TestSupabaseImagesPage() {
  // 실제 Supabase Storage에 있는 이미지 테스트
  const testImages = [
    {
      slug: 'mandarin-oriental-taipei',
      sabreId: 188152,
      name: 'Mandarin Oriental Taipei'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Supabase Storage 이미지 테스트</h1>
      
      {testImages.map((hotel) => (
        <div key={hotel.slug} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{hotel.name}</h2>
          
          {/* 직접 URL 테스트 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">직접 URL 테스트</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((seq) => {
                const url = generateHotelImageUrl(hotel.slug, hotel.sabreId, seq);
                return (
                  <div key={seq} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">이미지 {seq}:</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {url || 'URL 생성 실패'}
                    </p>
                    {url && (
                      <div className="mt-2">
                        <img 
                          src={url} 
                          alt={`Test ${seq}`}
                          className="w-32 h-24 object-cover rounded border"
                          onLoad={() => console.log(`✅ 이미지 ${seq} 로드 성공`)}
                          onError={(e) => {
                            console.log(`❌ 이미지 ${seq} 로드 실패:`, e);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 컴포넌트 테스트 */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">컴포넌트 테스트</h3>
            
            {/* 히어로 이미지 */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">히어로 이미지:</h4>
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                <HotelHeroImage
                  src={generateHotelImageUrl(hotel.slug, hotel.sabreId, 1) || ''}
                  alt={`${hotel.name} - Hero Image`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 썸네일 이미지들 */}
            <div>
              <h4 className="font-medium mb-2">썸네일 이미지들:</h4>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((seq) => (
                  <HotelThumbnail
                    key={seq}
                    src={generateHotelImageUrl(hotel.slug, hotel.sabreId, seq) || ''}
                    alt={`${hotel.name} - Image ${seq}`}
                    onClick={() => console.log(`Thumbnail ${seq} clicked`)}
                    isActive={seq === 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 브라우저 콘솔에서 확인할 수 있는 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">🔧 디버깅 정보</h4>
            <p className="text-sm text-blue-800">
              브라우저 개발자 도구의 Network 탭에서 이미지 요청 상태를 확인하세요.
              <br />
              Console 탭에서 이미지 로드 성공/실패 로그를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

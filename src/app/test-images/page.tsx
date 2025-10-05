import { HotelHeroImage, HotelThumbnail } from '@/components/ui/optimized-image';
import { generateHotelImageUrl } from '@/lib/supabase-image-loader';

export default function TestImagesPage() {
  // 테스트용 호텔 데이터
  const testHotel = {
    slug: 'mandarin-oriental-taipei',
    sabreId: 188152
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">이미지 최적화 테스트</h1>
      
      <div className="space-y-8">
        {/* 히어로 이미지 테스트 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">히어로 이미지 (LCP 최적화)</h2>
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <HotelHeroImage
              src={generateHotelImageUrl(testHotel.slug, testHotel.sabreId, 1, {
                width: 1920,
                height: 1080,
                quality: 90,
                format: 'avif'
              }) || ''}
              alt="Mandarin Oriental Taipei - Hero Image"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* 썸네일 이미지 테스트 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">썸네일 이미지 (갤러리용)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((seq) => (
              <HotelThumbnail
                key={seq}
                src={generateHotelImageUrl(testHotel.slug, testHotel.sabreId, seq, {
                  width: 400,
                  height: 300,
                  quality: 80,
                  format: 'webp'
                }) || ''}
                alt={`Mandarin Oriental Taipei - Image ${seq}`}
                className="w-full h-24"
                onClick={() => console.log(`Thumbnail ${seq} clicked`)}
                isActive={seq === 1}
              />
            ))}
          </div>
        </section>

        {/* URL 생성 테스트 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">URL 생성 테스트</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">생성된 이미지 URL들:</h3>
            <div className="space-y-2 text-sm">
              {[1, 2, 3].map((seq) => (
                <div key={seq} className="break-all">
                  <strong>이미지 {seq}:</strong><br />
                  <code className="bg-white p-2 rounded border">
                    {generateHotelImageUrl(testHotel.slug, testHotel.sabreId, seq) || 'URL 생성 실패'}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 성능 정보 */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">최적화 설정</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">히어로 이미지</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 포맷: AVIF (자동 폴백)</li>
                <li>• 품질: 90%</li>
                <li>• Priority: true</li>
                <li>• Lazy Loading: false</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">썸네일 이미지</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• 포맷: WebP</li>
                <li>• 품질: 80%</li>
                <li>• Priority: false</li>
                <li>• Lazy Loading: true</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

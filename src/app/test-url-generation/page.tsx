import { generateHotelImageUrl } from '@/lib/supabase-image-loader';

export default function TestUrlGenerationPage() {
  const testCases = [
    {
      slug: 'mandarin-oriental-taipei',
      sabreId: 188152,
      name: 'Mandarin Oriental Taipei'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔗 URL 생성 테스트</h1>
      
      {testCases.map((hotel) => (
        <div key={hotel.slug} className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{hotel.name}</h2>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">생성된 URL들:</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((seq) => {
                const generatedUrl = generateHotelImageUrl(hotel.slug, hotel.sabreId, seq);
                const expectedPattern = `${hotel.slug}_${hotel.sabreId}_${seq.toString().padStart(2, '0')}_1600w.avif`;
                
                return (
                  <div key={seq} className="bg-white p-4 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">이미지 {seq}:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        generatedUrl?.includes(expectedPattern) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {generatedUrl?.includes(expectedPattern) ? '✅ 올바름' : '❌ 틀림'}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium text-gray-600">생성된 URL:</span>
                        <br />
                        <code className="bg-gray-100 p-2 rounded block mt-1 break-all">
                          {generatedUrl || 'URL 생성 실패'}
                        </code>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">예상 파일명:</span>
                        <br />
                        <code className="bg-blue-100 p-2 rounded block mt-1">
                          {expectedPattern}
                        </code>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-600">전체 예상 URL:</span>
                        <br />
                        <code className="bg-green-100 p-2 rounded block mt-1 break-all">
                          https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/{hotel.slug}/{expectedPattern}
                        </code>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 실제 이미지 테스트 */}
          <div className="mt-6 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">실제 이미지 로딩 테스트:</h3>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((seq) => {
                const url = generateHotelImageUrl(hotel.slug, hotel.sabreId, seq);
                return (
                  <div key={seq} className="bg-white p-4 rounded border">
                    <h4 className="font-medium mb-2">이미지 {seq}</h4>
                    {url && (
                      <img 
                        src={url} 
                        alt={`Test ${seq}`}
                        className="w-full h-24 object-cover rounded border"
                        onLoad={() => console.log(`✅ 이미지 ${seq} 로드 성공:`, url)}
                        onError={(e) => {
                          console.log(`❌ 이미지 ${seq} 로드 실패:`, url);
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    )}
                    <div className="hidden text-red-500 text-sm mt-2">
                      ❌ 이미지 로드 실패
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-2">📝 확인사항</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 생성된 URL이 예상 패턴과 일치하는지 확인</li>
          <li>• 브라우저 개발자 도구 → Network 탭에서 이미지 요청 상태 확인</li>
          <li>• Console 탭에서 이미지 로드 성공/실패 로그 확인</li>
          <li>• 404 에러가 발생하면 실제 파일이 Supabase Storage에 존재하는지 확인</li>
        </ul>
      </div>
    </div>
  );
}

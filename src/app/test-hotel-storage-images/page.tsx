import { createClient } from '@/lib/supabase/server';

export default async function TestHotelStorageImagesPage() {
  const supabase = await createClient();

  // 테스트용 호텔 데이터 조회 (slug가 있는 호텔들)
  const { data: hotels, error } = await supabase
    .from('select_hotels')
    .select('sabre_id, slug, property_name_ko, property_name_en, city')
    .not('slug', 'is', null)
    .limit(5);

  if (error || !hotels) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">❌ 오류 발생</h1>
        <div className="bg-red-50 p-6 rounded-lg">
          <p>호텔 데이터를 불러오는 중 오류가 발생했습니다.</p>
          <p className="mt-2 text-sm text-gray-600">오류: {error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🏨 호텔 Storage 이미지 테스트</h1>
      
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">📋 테스트 방법</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>아래 호텔 카드를 클릭하여 상세 페이지로 이동</li>
          <li>상세 페이지에서 "이미지 더 보기" 버튼 클릭</li>
          <li>이미지 갤러리에서 Supabase Storage의 모든 이미지가 표시되는지 확인</li>
          <li>브라우저 개발자 도구의 Network 탭에서 API 호출 확인</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {hotels.map((hotel) => (
          <div key={hotel.sabre_id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hotel.property_name_ko}
            </h3>
            {hotel.property_name_en && (
              <p className="text-gray-600 text-sm mb-3">
                {hotel.property_name_en}
              </p>
            )}
            <div className="space-y-2 text-sm text-gray-500">
              <div><strong>Sabre ID:</strong> {hotel.sabre_id}</div>
              <div><strong>Slug:</strong> {hotel.slug}</div>
              <div><strong>도시:</strong> {hotel.city}</div>
            </div>
            <div className="mt-4">
              <a 
                href={`/hotel/${hotel.slug}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                상세 페이지로 이동
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔍 API 엔드포인트</h2>
        <div className="space-y-2 text-sm">
          <div><strong>Storage 이미지 조회:</strong> <code className="bg-gray-200 px-2 py-1 rounded">GET /api/hotels/[sabreId]/storage-images</code></div>
          <div><strong>Storage 경로:</strong> <code className="bg-gray-200 px-2 py-1 rounded">hotel-media/public/[hotel-slug]/</code></div>
          <div><strong>이미지 URL 패턴:</strong> <code className="bg-gray-200 px-2 py-1 rounded">https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/[hotel-slug]/[filename]</code></div>
        </div>
      </div>

      <div className="mt-8 bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">✅ 확인 사항</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>이미지 갤러리에서 Supabase Storage의 모든 이미지가 표시되는가?</li>
          <li>이미지 로딩 상태가 적절히 표시되는가?</li>
          <li>이미지가 없을 때 적절한 메시지가 표시되는가?</li>
          <li>에러 발생 시 적절한 에러 메시지가 표시되는가?</li>
          <li>이미지 시퀀스 번호가 올바르게 정렬되는가?</li>
        </ul>
      </div>
    </div>
  );
}

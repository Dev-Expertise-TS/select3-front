import { createClient } from '@/lib/supabase/server';
import { HotelCardGrid } from '@/components/shared/hotel-card-grid';
import { HotelCardCta } from '@/components/shared/hotel-card-cta';
import { HotelCardAllView } from '@/components/shared/hotel-card-all-view';

export default async function TestHotelCardsPage() {
  const supabase = await createClient();

  // 테스트용 호텔 데이터 조회
  const { data: hotels, error } = await supabase
    .from('select_hotels')
    .select('*')
    .limit(6);

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

  // 호텔 데이터를 카드 컴포넌트 형식으로 변환
  const hotelCards = hotels.map(hotel => ({
    sabre_id: hotel.sabre_id,
    property_name_ko: hotel.property_name_ko,
    property_name_en: hotel.property_name_en,
    city: hotel.city,
    city_ko: hotel.city_ko,
    property_address: hotel.property_address,
    image: hotel.image_1 || '', // 기존 이미지 필드 사용
    benefits: [], // 혜택은 별도 API에서 가져옴
    slug: hotel.slug,
    rating: hotel.rating,
    price: hotel.price,
    original_price: hotel.original_price,
    badge: hotel.badge,
    isPromotion: hotel.is_promotion,
    // AllView용 추가 필드
    country_ko: hotel.country_ko,
    country_en: hotel.country_en,
    chain: hotel.chain,
    brand_id: hotel.brand_id,
    chain_id: hotel.chain_id,
    brand_name_en: hotel.brand_name_en,
    chain_name_en: hotel.chain_name_en,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🏨 호텔 카드 이미지 테스트</h1>
      
      {/* 일반 호텔 카드 그리드 (3개) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">일반 호텔 카드 그리드 (3개)</h2>
        <HotelCardGrid
          hotels={hotelCards.slice(0, 3)}
          variant="default"
          showBenefits={true}
          showRating={true}
          showPrice={false}
          showBadge={true}
          showPromotionBadge={true}
          hotelCount={3}
          className="mb-8"
        />
      </section>

      {/* 일반 호텔 카드 그리드 (4개) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">일반 호텔 카드 그리드 (4개)</h2>
        <HotelCardGrid
          hotels={hotelCards.slice(0, 4)}
          variant="default"
          showBenefits={true}
          showRating={true}
          showPrice={false}
          showBadge={true}
          showPromotionBadge={true}
          hotelCount={4}
          className="mb-8"
        />
      </section>

      {/* CTA 호텔 카드 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">CTA 호텔 카드</h2>
        <div className="space-y-6">
          {hotelCards.slice(0, 2).map((hotel) => (
            <HotelCardCta
              key={hotel.sabre_id}
              hotel={hotel}
              variant="featured"
              showBenefits={true}
              showRating={true}
              showPrice={true}
              showBadge={true}
            />
          ))}
        </div>
      </section>

      {/* AllView 호텔 카드 그리드 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">전체보기 호텔 카드 그리드</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotelCards.slice(0, 6).map((hotel) => (
            <HotelCardAllView
              key={hotel.sabre_id}
              hotel={hotel}
              variant="default"
              showBenefits={true}
              showRating={true}
              showPrice={false}
              showBadge={true}
              showPromotionBadge={true}
            />
          ))}
        </div>
      </section>

      {/* 이미지 소스 정보 */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔍 이미지 소스 정보</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">이미지 우선순위:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li><strong>Supabase Storage:</strong> hotel.slug이 있는 경우 `generateHotelImageUrl(hotel.slug, hotel.sabre_id, 1)` 사용</li>
              <li><strong>기존 이미지:</strong> Supabase Storage 이미지가 없는 경우 `hotel.image_1` 필드 사용</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">이미지 최적화:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><strong>포맷:</strong> WebP 우선, AVIF 대체</li>
              <li><strong>품질:</strong> Featured/Promotion: 85-90, 기본: 75-80</li>
              <li><strong>크기:</strong> 카드 타입별 최적화된 크기</li>
              <li><strong>Lazy Loading:</strong> Featured/Promotion 제외하고 지연 로딩</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">테스트 호텔 정보:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {hotelCards.slice(0, 3).map((hotel, index) => (
                <div key={hotel.sabre_id} className="flex gap-4">
                  <span className="font-medium">{index + 1}.</span>
                  <div>
                    <div><strong>이름:</strong> {hotel.property_name_ko}</div>
                    <div><strong>Slug:</strong> {hotel.slug || '없음'}</div>
                    <div><strong>Sabre ID:</strong> {hotel.sabre_id}</div>
                    <div><strong>기존 이미지:</strong> {hotel.image ? '있음' : '없음'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

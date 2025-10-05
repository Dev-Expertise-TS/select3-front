import { HotelNotFound } from '@/components/hotel/HotelNotFound';

export default function TestHotelNotFoundPage() {
  return (
    <div>
      <div className="bg-blue-50 p-4 mb-4">
        <h1 className="text-xl font-semibold text-blue-900 mb-2">🧪 호텔 없음 페이지 테스트</h1>
        <p className="text-blue-700">아래는 존재하지 않는 호텔 slug로 테스트하는 HotelNotFound 컴포넌트입니다.</p>
      </div>
      <HotelNotFound slug="non-existent-hotel-slug" />
    </div>
  );
}

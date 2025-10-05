import { HotelCardCta } from "@/components/shared/hotel-card-cta"

// 테스트용 호텔 데이터
const testHotels = [
  {
    sabre_id: 1,
    property_name_ko: "인터컨티넨탈 파타야 리조트",
    property_name_en: "InterContinental Pattaya Resort",
    city: "Pattaya",
    city_ko: "파타야",
    property_address: "437 Phra Tamnak Road, Chonburi : Pattaya ,20150, TH",
    image: "/placeholder.svg",
    benefits: [
      "2인 조식 포함",
      "객실 무료 업그레이드", 
      "레이트 체크아웃",
      "$100 식음료 크레딧",
      "얼리 체크인",
      "무료 Wi-Fi"
    ],
    slug: "intercontinental-pattaya-resort",
    rating: 4.5,
    price: 250000,
    original_price: 300000,
    badge: "프리미엄",
    isPromotion: true
  },
  {
    sabre_id: 2,
    property_name_ko: "그랜드 하얏트 서울",
    property_name_en: "Grand Hyatt Seoul",
    city: "Seoul",
    city_ko: "서울",
    property_address: "서울특별시 용산구 소월로 322",
    image: "/placeholder.svg",
    benefits: [
      "조식 포함",
      "스파 크레딧",
      "무료 주차",
      "컨시어지 서비스",
      "룸서비스",
      "피트니스 센터"
    ],
    slug: "grand-hyatt-seoul",
    rating: 4.8,
    price: 180000,
    badge: "럭셔리",
    isPromotion: false
  }
]

export default function TestHotelCardCtaPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Hotel Card CTA 테스트
          </h1>
          <p className="text-gray-600">
            블로그 본문 중간에 삽입될 CTA 스타일의 호텔 카드 컴포넌트입니다.
          </p>
        </div>

        <div className="space-y-8">
          {/* 기본 스타일 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">기본 스타일</h2>
            <HotelCardCta 
              hotel={testHotels[0]}
              variant="default"
            />
          </div>

          {/* 프로모션 스타일 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">프로모션 스타일</h2>
            <HotelCardCta 
              hotel={testHotels[1]}
              variant="promotion"
              showPrice={true}
              showRating={true}
            />
          </div>

          {/* 피처드 스타일 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">피처드 스타일</h2>
            <HotelCardCta 
              hotel={testHotels[0]}
              variant="featured"
              showPrice={true}
              showRating={true}
              showBadge={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

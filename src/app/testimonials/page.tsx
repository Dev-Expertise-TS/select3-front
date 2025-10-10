import { Metadata } from 'next'
import { Star } from 'lucide-react'
import { Header } from '@/components/header'
import { PromotionBanner } from '@/components/promotion-banner'
import { Footer } from '@/components/footer'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: '고객 후기 | 투어비스 셀렉트',
  description: '투어비스 셀렉트를 이용하신 고객들의 생생한 후기를 만나보세요.',
}

interface Testimonial {
  id: number
  name: string
  location: string
  rating: number
  content: string
  hotel: string
  date: string
  avatar?: string
}

// 전체 목업 데이터 (더 많은 후기 추가)
const allTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "김민수",
    location: "서울",
    rating: 5,
    content: "정말 환상적인 호텔이었습니다! 투어비스 셀렉트를 통해 예약했는데, 일반 예약으로는 절대 받을 수 없는 혜택들을 많이 받았어요. 특히 무료 업그레이드와 조식 서비스가 정말 좋았습니다.",
    hotel: "그랜드 하이엇 서울",
    date: "2024.01.15"
  },
  {
    id: 2,
    name: "이영희",
    location: "부산",
    rating: 5,
    content: "부산 출장 중에 투어비스 셀렉트를 통해 호텔을 예약했는데, 정말 놀라운 서비스였어요. 체크인 시 무료 업그레이드와 함께 환영 선물까지 받았습니다. 다음에도 꼭 이용하겠습니다!",
    hotel: "파크 하이엇 부산",
    date: "2024.01.20"
  },
  {
    id: 3,
    name: "박준호",
    location: "대구",
    rating: 5,
    content: "가족 여행으로 제주도에 갔는데, 투어비스 셀렉트 덕분에 정말 특별한 경험을 했습니다. 호텔 직원분들의 서비스도 최고였고, 추가 혜택들도 정말 만족스러웠어요.",
    hotel: "라군나 제주",
    date: "2024.01.25"
  },
  {
    id: 4,
    name: "최수진",
    location: "인천",
    rating: 5,
    content: "비즈니스 트립으로 싱가포르에 갔는데, 투어비스 셀렉트를 통해 예약한 호텔이 정말 훌륭했습니다. 무료 인터넷과 조식, 그리고 라운지 이용권까지 모든 것이 완벽했어요.",
    hotel: "마리나 베이 샌즈",
    date: "2024.02.01"
  },
  {
    id: 5,
    name: "정민철",
    location: "대전",
    rating: 5,
    content: "일본 여행에서 투어비스 셀렉트를 처음 이용했는데, 정말 후회없는 선택이었습니다. 호텔 서비스와 추가 혜택들이 기대 이상이었고, 다음 여행에서도 꼭 이용하고 싶어요.",
    hotel: "콘래드 도쿄",
    date: "2024.02.05"
  },
  {
    id: 6,
    name: "한소영",
    location: "광주",
    rating: 5,
    content: "태국 휴가를 위해 투어비스 셀렉트를 통해 호텔을 예약했는데, 정말 만족스러운 경험이었습니다. 무료 업그레이드와 스파 크레딧까지 받아서 정말 특별한 휴가가 되었어요.",
    hotel: "반얀 트리 방콕",
    date: "2024.02.10"
  },
  {
    id: 7,
    name: "윤재현",
    location: "수원",
    rating: 5,
    content: "신혼여행으로 몰디브를 다녀왔는데, 투어비스 셀렉트 덕분에 정말 완벽한 여행이었습니다. 허니문 패키지와 함께 받은 다양한 혜택들이 여행을 더욱 특별하게 만들어주었어요.",
    hotel: "콘래드 몰디브 랑갈리 아일랜드",
    date: "2024.02.14"
  },
  {
    id: 8,
    name: "강은지",
    location: "성남",
    rating: 5,
    content: "파리 여행에서 투어비스 셀렉트로 예약한 호텔이 최고였습니다. 에펠탑이 보이는 방으로 무료 업그레이드 받았고, 매일 아침 조식도 정말 훌륭했어요. 강력 추천합니다!",
    hotel: "샹그릴라 파리",
    date: "2024.02.20"
  },
  {
    id: 9,
    name: "조성민",
    location: "용인",
    rating: 5,
    content: "두바이 출장에서 이용했는데, 투어비스 셀렉트의 서비스가 정말 인상적이었습니다. 예약부터 체크아웃까지 모든 과정이 매끄러웠고, 받은 혜택들도 기대 이상이었어요.",
    hotel: "버즈 알 아랍 주메이라",
    date: "2024.03.01"
  },
  {
    id: 10,
    name: "임지혜",
    location: "고양",
    rating: 5,
    content: "하와이 가족 여행에서 투어비스 셀렉트를 이용했는데, 정말 만족스러웠습니다. 아이들을 위한 키즈 프로그램과 함께 받은 다양한 혜택들이 여행을 더욱 즐겁게 만들어주었어요.",
    hotel: "포시즌스 리조트 마우이",
    date: "2024.03.10"
  },
  {
    id: 11,
    name: "신동욱",
    location: "안양",
    rating: 5,
    content: "발리 허니문에서 투어비스 셀렉트로 예약한 리조트가 정말 환상적이었습니다. 프라이빗 풀 빌라 업그레이드와 커플 스파 서비스까지, 모든 것이 완벽했어요.",
    hotel: "불가리 리조트 발리",
    date: "2024.03.15"
  },
  {
    id: 12,
    name: "오민경",
    location: "의정부",
    rating: 5,
    content: "뉴욕 여행에서 투어비스 셀렉트를 통해 예약했는데, 센트럴 파크가 보이는 방으로 업그레이드 받았어요. 위치도 좋고 서비스도 훌륭해서 정말 만족스러운 여행이었습니다.",
    hotel: "더 플라자 뉴욕",
    date: "2024.03.20"
  }
]

// 이름 마스킹 함수
const maskName = (name: string): string => {
  if (name.length <= 2) {
    return name[0] + '*'
  }
  const first = name[0]
  const last = name[name.length - 1]
  const middle = '*'.repeat(name.length - 2)
  return first + middle + last
}

// 별점 렌더링
const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={cn(
        "w-4 h-4",
        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
      )}
    />
  ))
}

export default function TestimonialsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <PromotionBanner />
      
      <main>
        {/* 헤더 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                셀렉트 고객 후기
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                투어비스 셀렉트를 이용하신 고객들의 생생한 후기를 만나보세요.
                <br className="hidden sm:block" />
                <span className="block sm:inline"> 특별한 혜택과 함께한 럭셔리 호텔 경험을 확인하세요.</span>
              </p>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">
                  {allTestimonials.length}+
                </div>
                <div className="text-xs sm:text-sm text-gray-600">고객 후기</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">5.0</div>
                <div className="text-xs sm:text-sm text-gray-600">평균 평점</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">100%</div>
                <div className="text-xs sm:text-sm text-gray-600">만족도</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">98%</div>
                <div className="text-xs sm:text-sm text-gray-600">재이용률</div>
              </div>
            </div>
          </div>
        </div>

        {/* 후기 그리드 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {allTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200"
              >
                {/* 별점 */}
                <div className="flex items-center mb-3 sm:mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* 리뷰 내용 */}
                <blockquote className="text-sm text-gray-700 leading-relaxed mb-3 sm:mb-4">
                  {testimonial.content}
                </blockquote>

                {/* 고객 정보 */}
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {maskName(testimonial.name)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {testimonial.hotel}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {testimonial.location} • {testimonial.date}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 예약 문의 CTA */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-orange-100">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              특별한 혜택과 함께하는 럭셔리 호텔 예약
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto">
              투어비스 셀렉트만의 특별한 혜택을 경험해보세요.
              <br className="hidden sm:block" />
              <span className="block sm:inline"> 호텔 전문 컨시어지 담당자가 최적의 호텔과 요금을 안내해드립니다.</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {/* 전화 상담하기 - 모바일에서만 표시 */}
              <a
                href="tel:02-1234-5678"
                className="inline-flex sm:hidden items-center justify-center px-6 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                전화 상담하기
              </a>
              {/* 카카오톡 상담 - 항상 표시 */}
              <a
                href="http://pf.kakao.com/_xdSExexj/chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-yellow-400 text-gray-900 text-sm sm:text-base font-medium rounded-lg hover:bg-yellow-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.376 1.409 4.5 3.599 5.899-.143.537-.534 2.007-.617 2.33-.096.374.137.369.255.269.092-.078 1.486-1.017 2.07-1.417C8.372 17.844 10.138 18 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                </svg>
                카카오톡 상담
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}


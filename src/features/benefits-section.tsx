import { Coffee, DollarSign, Clock, ArrowUp, Star, Users, CreditCard } from "lucide-react"
import { SectionContainer } from "@/components/shared/section-container"

const benefits = [
  {
    icon: Coffee,
    title: "2인 조식 무료 제공",
    // subtitle: "무료 제공",
    description: "",
  },
  {
    icon: DollarSign,
    title: "100$ 식음료 크레딧",
    // subtitle: "혹은 유사 혜택 제공",
    description: "호텔 내 시설 이용 시 사용 가능한 크레딧",
  },
  {
    icon: Clock,
    title: "얼리 체크인 레이트 체크아웃",
    // subtitle: "레이트 체크아웃",
    description: "현장 가능 시 무료 제공",
  },
  {
    icon: ArrowUp,
    title: "객실 무료 업그레이드",
    // subtitle: "업그레이드",
    description: "현장 가능 시 상위 객실로 업그레이드",
  },
  {
    icon: Star,
    title: "멤버십 포인트 적립",
    // subtitle: "멤버십 포인트 적립",
    description: "글로벌 체인 호텔 체인 멤버십 포인트 적립 가능",
  },
  {
    icon: Users,
    title: "프라이빗 상담 예약",
    // subtitle: "1:1 프라이빗 상담 예약",
    description: "개인 맞춤형  전문 컨시어지 여행 상담 서비스",
  },
  {
    icon: CreditCard,
    title: "체크 아웃시 결제",
    // subtitle: "체크아웃 시 결제",
    description: "안전하고 편리한 투숙 후 호텔에서 현장 결제 시스템",
  },
]

export function BenefitsSection() {
  return (
    <section className="pt-2 sm:py-8 pb-12 sm:pb-16 bg-white">
      <SectionContainer className="px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">
            대한민국 No1. 프리미엄 호텔 전문 예약 컨시어지 서비스
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-tight">
            지금 바로 전화 또는 카카오톡 채팅을 통해 예약하고 <br className="sm:hidden" />
            투숙과 함께 아래의 일곱 가지 혜택을 누려보세요
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-2 md:gap-3">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            const isLastCard = index === benefits.length - 1
            const isOddTotal = benefits.length % 2 === 1
            
            return (
              <div
                key={index}
                className={`bg-gradient-to-br from-white via-gray-50/20 to-gray-100/40 rounded-xl p-2 sm:p-2 md:p-3 shadow-xl border-2 backdrop-blur-sm relative overflow-hidden ${
                  isLastCard && isOddTotal ? 'col-span-2 sm:col-span-1' : ''
                }`}
                style={{ borderColor: '#E6CDB5' }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-gray-200/20 to-gray-300/40 rounded-full flex items-center justify-center mb-3 sm:mb-3 md:mb-4 shadow-lg border"
                    style={{ borderColor: '#E6CDB5' }}>
                    <IconComponent className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-base mb-0.5 sm:mb-0.5 leading-tight">
                    {benefit.title}
                  </h3>
                  {benefit.description && (
                  <p className="text-gray-600 text-xs sm:text-xs leading-snug line-clamp-2">
                    {benefit.description}
                  </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SectionContainer>
    </section>
  )
}

import { Coffee, DollarSign, Clock, ArrowUp, Star, Users, CreditCard } from "lucide-react"

const benefits = [
  {
    icon: Coffee,
    title: "2인 조식",
    subtitle: "무료 제공",
    description: "매일 아침 2인 조식을 무료로 제공합니다",
  },
  {
    icon: DollarSign,
    title: "100$ 식음료 크레딧",
    subtitle: "혹은 유사 혜택 제공",
    description: "호텔 내 시설 이용 시 사용 가능한 크레딧",
  },
  {
    icon: Clock,
    title: "얼리 체크인",
    subtitle: "레이트 체크아웃",
    description: "현장 가능 시 무료 제공",
  },
  {
    icon: ArrowUp,
    title: "객실 무료",
    subtitle: "업그레이드",
    description: "현장 가능 시 상위 객실로 업그레이드",
  },
  {
    icon: Star,
    title: "글로벌 체인인",
    subtitle: "멤버십 포인트 적립",
    description: "호텔 체인 멤버십 포인트 적립 가능",
  },
  {
    icon: Users,
    title: "전문 컨시어지를 통한",
    subtitle: "1:1 프라이빗 상담 예약",
    description: "개인 맞춤형 여행 상담 서비스",
  },
  {
    icon: CreditCard,
    title: "투숙 후 호텔에서",
    subtitle: "체크아웃 시 결제",
    description: "안전하고 편리한 현장 결제 시스템",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-8 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            럭셔리 호텔 & 리조트, <span className="text-amex-blue">특별한 혜택과 함께</span>
          </h2>
          <p className="text-base text-gray-600 mb-2">지금 바로 전화 또는 카카오톡 채팅을 통해 예약하고</p>
          <p className="text-base text-gray-600">투숙과 함께 아래의 일곱 가지 혜택을 누려보세요</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 md:gap-3">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white via-gray-50/20 to-gray-100/40 rounded-xl p-2 md:p-3 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 group hover:scale-105 hover:-translate-y-2 backdrop-blur-sm relative overflow-hidden"
                style={{ borderColor: '#E6CDB5' }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gray-200/20 to-gray-300/40 rounded-full flex items-center justify-center mb-1 md:mb-2 group-hover:from-gray-300/40 group-hover:to-gray-400/60 transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-lg group-hover:shadow-xl border"
                    style={{ borderColor: '#E6CDB5' }}>
                    <IconComponent className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-gray-700 transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs mb-0.5 leading-tight group-hover:text-gray-700 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="font-semibold text-gray-600 text-xs mb-1 leading-tight">{benefit.subtitle}</p>
                  <p className="text-gray-600 text-xs leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {benefit.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"
                  style={{ background: 'linear-gradient(to right, transparent, #C9A227, transparent)' }}></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to bottom right, transparent, transparent, #C9A22710)' }}></div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

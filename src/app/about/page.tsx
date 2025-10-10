import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Check, Sparkles, Crown, Coffee, DollarSign, Clock, ArrowUp, Star, Users, CreditCard, ArrowRight } from "lucide-react"

// 혜택 아이콘 매핑 함수 (랜딩 페이지와 동일)
function getBenefitIcon(index: number) {
  const icons = [
    <Coffee className="w-5 h-5" key={index} />,
    <DollarSign className="w-5 h-5" key={index} />,
    <Clock className="w-5 h-5" key={index} />,
    <Clock className="w-5 h-5" key={index} />,
    <ArrowUp className="w-5 h-5" key={index} />,
    <Star className="w-5 h-5" key={index} />,
    <Users className="w-5 h-5" key={index} />,
    <CreditCard className="w-5 h-5" key={index} />
  ]
  return icons[index] || <Check className="w-5 h-5" key={index} />
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Header />
      <PromotionBanner />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
          {/* 배경 그라데이션 효과 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 opacity-60"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4 shadow-sm border border-blue-100">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                럭셔리 호텔 전문 플랫폼
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2">
                Tourvis Select
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed mb-5 sm:mb-6 px-4">
                세계 최고 럭셔리 호텔의 특별한 혜택을
                <br className="hidden sm:block" />
                <span className="font-semibold text-blue-600"> 전문 컨시어지 </span>
                상담과 함께 경험하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link 
                  href="/hotel"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  전체 호텔 보기
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/testimonials"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 shadow-md hover:shadow-lg active:shadow-sm border border-gray-200 hover:border-gray-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  고객 후기 보기
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-10 sm:py-12 md:py-16">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                예약과 동시에 드리는
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 px-4">
                셀렉트만의 특별한 혜택
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-xl active:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 active:border-blue-300 hover:-translate-y-1 active:translate-y-0 cursor-pointer"
                >
                  {/* 아이콘 배경 그라데이션 */}
                  <div className="absolute top-0 right-0 w-20 sm:w-28 md:w-32 h-20 sm:h-28 md:h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-bl-full opacity-30 group-hover:opacity-60 transition-opacity"></div>
                  
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-blue-600 rounded-lg mb-3 sm:mb-4 group-hover:scale-110 active:scale-105 transition-transform shadow-sm">
                      <div className="text-white">
                        {getBenefitIcon(index)}
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 leading-snug">{benefit.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Brands Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                글로벌 럭셔리 체인의
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-3 sm:mb-4 px-4">
                공식 인증 에이전트
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 max-w-3xl mx-auto px-4 leading-relaxed">
                투어비스 셀렉트는 Virtuoso와 더불어 하얏트 프리베, IHG, 샹그릴라 서클 등
                <br className="hidden sm:block" />
                다수의 글로벌 럭셔리 체인 공식 인증 에이전트로 등록되어 있습니다.
              </p>
            </div>

            {/* Brand Logos Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
              {brandLogos.map((brand, index) => (
                <div 
                  key={index} 
                  className="group relative aspect-square bg-white rounded-lg shadow-sm hover:shadow-md active:shadow-sm transition-all duration-300 border border-gray-100 hover:border-blue-200 active:border-blue-300 overflow-hidden cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Image
                    src={brand.image}
                    alt={brand.name}
                    fill
                    className="object-contain p-1 sm:p-2"
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, (max-width: 1024px) 20vw, 14vw"
                  />
                </div>
              ))}
            </div>

            <div className="text-center px-4">
              <Link 
                href="/brand"
                className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
              >
                전체 파트너 브랜드 보기
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Luxury Network Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-blue-50">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4 shadow-sm border border-blue-100">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                프리미엄 네트워크
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                세계적으로 인정받는
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-3 sm:mb-4 px-4">
                최고급 여행 네트워크
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed px-4">
                아만, 포시즌스, 벨몬드, 리츠칼튼 등<br className="hidden sm:block" />
                세계 최고의 럭셔리 호텔 체인과 함께합니다
              </p>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
                투어비스 셀렉트 예약만으로
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mb-3 sm:mb-4 px-4">
                이 모든 혜택을 누리세요
              </p>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 max-w-3xl mx-auto leading-relaxed px-4">
                2인 조식 제공, $100 F&B 크레딧,<br className="hidden sm:block" />
                객실 무료 업그레이드, 얼리 체크인 & 레이트 체크아웃까지
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {programs.map((program, index) => (
                <div 
                  key={index} 
                  className="group bg-white rounded-xl shadow-lg hover:shadow-xl active:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 active:border-blue-300 hover:-translate-y-1 active:translate-y-0"
                >
                  {/* Logo Section */}
                  <div className="relative bg-gray-50 py-8 sm:py-10 md:py-12 px-6 sm:px-8 flex items-center justify-center min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
                    {program.logo && (
                      <div className="relative w-full h-20 sm:h-24 md:h-28">
                        <Image
                          src={program.logo}
                          alt={program.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 sm:p-6 md:p-8">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{program.title}</h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-5 sm:mb-6">{program.subtitle}</p>

                    <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                      {program.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0 mr-2.5 sm:mr-3 mt-0.5">
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                            </div>
                          </div>
                          <span className="text-xs sm:text-sm md:text-base text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {program.link && (
                      <Link 
                        href={program.link}
                        className="group/btn flex items-center justify-center w-full bg-gray-900 text-white text-center text-sm sm:text-base font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg active:shadow-md"
                      >
                        시설 목록 보기
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
                지금 바로 편하게 상담하세요
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/90 px-4">
                호텔 전문 컨시어지 담당자가<br className="sm:hidden" /> 최적의 호텔과 요금을 안내해드립니다
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <a
                  href="http://pf.kakao.com/_xdSExexj/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-[#FEE500] text-[#191919] text-sm sm:text-base font-semibold rounded-lg hover:bg-[#FAD000] active:bg-[#F5C700] transition-all duration-300 shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.376 1.409 4.5 3.599 5.899-.143.537-.534 2.007-.617 2.33-.096.374.137.369.255.269.092-.078 1.486-1.017 2.07-1.417C8.372 17.844 10.138 18 12 18c5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                  </svg>
                  카카오톡 상담
                </a>
                <Link 
                  href="/hotel"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white text-sm sm:text-base font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 active:bg-gray-100 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  전체 호텔 보기
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

const benefits = [
  {
    title: "2인 조식 포함",
    description: "고급 레스토랑에서 즐기는 여유롭고 풍성한 아침 식사"
  },
  {
    title: "$100 식음료 크레딧",
    description: "호텔 레스토랑, 룸서비스까지 현금처럼 쓸 수 있는 크레딧"
  },
  {
    title: "얼리 체크인",
    description: "조금 더 일찍 만나는 우리만의 편안한 객실"
  },
  {
    title: "레이트 체크아웃",
    description: "호텔을 충분히 누릴 수 있도록 여유로운 일정 제공"
  },
  {
    title: "객실 무료 업그레이드",
    description: "더 고급스럽고 넓은 객실에서 편안한 휴식"
  },
  {
    title: "글로벌 멤버십 포인트 적립",
    description: "본보이, WOH 등 멤버십 포인트 적립"
  },
  {
    title: "컨시어지 상담 및 예약",
    description: "전문 컨시어지와의 상담으로 호텔 & 리조트 맞춤 예약"
  },
  {
    title: "체크아웃 시 결제",
    description: "선결제의 부담 없이 호텔에서 직접 결제"
  }
]

const brandLogos = [
  { name: "Marriott", image: "/brand-image/marriott.avif" },
  { name: "Aman", image: "/brand-image/aman.avif" },
  { name: "Hyatt", image: "/brand-image/hyatt.avif" },
  { name: "IHG", image: "/brand-image/ihg.avif" },
  { name: "Accor", image: "/brand-image/accor.avif" },
  { name: "Hilton", image: "/brand-image/hilton.avif" },
  { name: "Mandarin Oriental", image: "/brand-image/mandarin.avif" },
  { name: "Shangri-La", image: "/brand-image/shangri-la.avif" },
  { name: "Pan Pacific", image: "/brand-image/pacific.avif" },
  { name: "Leading Hotels of the World", image: "/brand-image/lhw-vita.avif" },
  { name: "Virtuoso", image: "/brand-image/virtuoso.avif" },
  { name: "Capella", image: "/brand-image/capella.avif" },
  { name: "Melia", image: "/brand-image/melia.avif" },
  { name: "Platinum", image: "/brand-image/platinum.avif" }
]

const programs = [
  {
    title: "Marriott",
    subtitle: "메리어트 스타스 & 루미너스",
    logo: "/brand-image/marriott.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인",
      "레이트 체크아웃",
      "멤버십 포인트 적립"
    ],
    link: "/brand"
  },
  {
    title: "AMAN",
    subtitle: "아만 그룹",
    logo: "/brand-image/aman.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인",
      "레이트 체크아웃",
      "아만 디스커버리"
    ],
    link: "/brand"
  },
  {
    title: "Hyatt Prive",
    subtitle: "하얏트 프리베",
    logo: "/brand-image/hyatt.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인",
      "레이트 체크아웃",
      "멤버십 포인트 적립"
    ],
    link: "/brand"
  },
  {
    title: "IHG Destined",
    subtitle: "IHG 럭셔리 & 라이프스타일",
    logo: "/brand-image/ihg.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인",
      "레이트 체크아웃",
      "멤버십 포인트 적립"
    ],
    link: "/brand"
  },
  {
    title: "ACCOR Preferred",
    subtitle: "아코르 프리퍼드",
    logo: "/brand-image/accor.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인",
      "레이트 체크아웃",
      "멤버십 포인트 적립"
    ],
    link: "/brand"
  },
  {
    title: "Hilton Impresario",
    subtitle: "힐튼 임프레사리오",
    logo: "/brand-image/hilton.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인",
      "레이트 체크아웃",
      "멤버십 포인트 적립"
    ],
    link: "/brand"
  }
]

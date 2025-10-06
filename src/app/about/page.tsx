import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Check, Users, Gift, TrendingUp, Bell } from "lucide-react"

// 혜택 아이콘 매핑 함수
function getBenefitIcon(benefit: string) {
  if (benefit.includes("조식")) {
    return <Users className="w-6 h-6 text-gray-700" />
  }
  if (benefit.includes("크레딧")) {
    return <Gift className="w-6 h-6 text-gray-700" />
  }
  if (benefit.includes("업그레이드")) {
    return <TrendingUp className="w-6 h-6 text-gray-700" />
  }
  if (benefit.includes("체크인") || benefit.includes("체크아웃")) {
    return <Bell className="w-6 h-6 text-gray-700" />
  }
  return <Check className="w-6 h-6 text-gray-700" />
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PromotionBanner />
      
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto max-w-[1440px] px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Tourvis Select
              </h1>
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                럭셔리 호텔 및 리조트 예약의 새로운 기준, 투어비스 셀렉트에서<br className="hidden md:block" />
                전문 컨시어지와의 상담을 통해 프리미엄 혜택을 만나보세요
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              예약과 동시에 드리는
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-16">
              셀렉트만의 특별한 혜택
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Brands Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              글로벌 럭셔리 체인의
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-8">
              공식 인증 에이전트
            </p>
            <p className="text-center text-gray-700 mb-12 max-w-3xl mx-auto">
              투어비스 셀렉트는 Virtuoso와 더불어 하얏트 프리베, IHG, 샹그릴라 서클 등<br className="hidden md:block" />
              다수의 글로벌 럭셔리 체인 공식 인증 에이전트로 등록되어 있습니다.
            </p>

            {/* Brand Logos Grid */}
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-8 mb-12">
              {brandLogos.map((brand, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="relative w-full aspect-square bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                    <Image
                      src={brand.image}
                      alt={brand.name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 14vw"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link 
                href="/hotel"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                호텔 둘러보기
              </Link>
            </div>
          </div>
        </section>

        {/* Luxury Network Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              세계적으로 인정받는
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-8">
              최고급 여행 네트워크
            </p>
            <p className="text-center text-gray-700 mb-16 max-w-3xl mx-auto leading-relaxed">
              투어비스 셀렉트를 통해 세계 최고의 호텔 & 리조트로 떠나보세요.<br className="hidden md:block" />
              아만, 포 시즌스, 벨몬드, 리츠칼튼 등 럭셔리 호텔 체인의 환대를 직접 경험해보세요.
            </p>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
              투어비스 셀렉트 예약만으로
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-center text-blue-600 mb-8">
              이 모든 혜택을 누리세요
            </p>
            <p className="text-center text-gray-700 mb-16 max-w-3xl mx-auto leading-relaxed">
              2인 조식 제공, 100달러 상당의 F&B 크레딧 제공,<br className="hidden md:block" />
              객실 무료 업그레이드, 얼리 체크인 및 레이트 체크아웃까지.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  {/* Logo Section */}
                  <div className="bg-gray-50 py-16 px-8 flex items-center justify-center min-h-[200px]">
                    {program.logo && (
                      <div className="relative w-full h-32">
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
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{program.title}</h3>
                    <p className="text-base text-gray-600 mb-8">{program.subtitle}</p>

                    <ul className="space-y-4 mb-8">
                      {program.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {getBenefitIcon(benefit)}
                          </div>
                          <span className="text-base text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {program.link && (
                      <Link 
                        href={program.link}
                        className="block w-full bg-black text-white text-center font-semibold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors duration-300"
                      >
                        시설목록
                      </Link>
                    )}
                  </div>
                </div>
              ))}
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
  { name: "Pan Pacific", image: "/brand-image/pan-pacific.avif" },
  { name: "Leading Hotels of the World", image: "/brand-image/LW.avif" },
  { name: "Virtuoso", image: "/brand-image/virtuoso.avif" },
  { name: "Capella", image: "/brand-image/capella.avif" },
  { name: "Bravos", image: "/brand-image/bravos.avif" },
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


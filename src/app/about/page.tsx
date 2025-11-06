import { Metadata } from "next"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Check, Sparkles, Crown, Coffee, DollarSign, Clock, ArrowUp, Star, Users, CreditCard, ArrowRight, Gift, Bell } from "lucide-react"

export const metadata: Metadata = {
  title: '투어비스 셀렉트 소개 | 럭셔리 호텔 전문 플랫폼',
  description: '세계 최고 럭셔리 호텔의 특별한 혜택을 전문 컨시어지 상담과 함께 경험하세요. Virtuoso, 하얏트 프리베, IHG 등 글로벌 럭셔리 체인 공식 인증 에이전트 투어비스 셀렉트.',
  keywords: [
    '투어비스 셀렉트',
    '럭셔리 호텔',
    '프리미엄 호텔',
    '호텔 컨시어지',
    'Virtuoso',
    '하얏트 프리베',
    'IHG',
    '샹그릴라 서클',
    '호텔 혜택',
    '특급 호텔'
  ],
  openGraph: {
    title: '투어비스 셀렉트 소개 | 럭셔리 호텔 전문 플랫폼',
    description: '세계 최고 럭셔리 호텔의 특별한 혜택을 전문 컨시어지 상담과 함께 경험하세요.',
    url: 'https://luxury-select.co.kr/about',
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://luxury-select.co.kr/select_logo.avif',
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '투어비스 셀렉트 소개 | 럭셔리 호텔 전문 플랫폼',
    description: '세계 최고 럭셔리 호텔의 특별한 혜택을 전문 컨시어지 상담과 함께 경험하세요.',
    images: ['https://luxury-select.co.kr/select_logo.avif']
  },
  alternates: {
    canonical: 'https://luxury-select.co.kr/about'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

// 혜택 아이콘 매핑 함수 (랜딩 페이지와 동일)
function getBenefitIcon(index: number) {
  const icons = [
    <Coffee className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <DollarSign className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <Clock className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <Clock className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <ArrowUp className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <Star className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <Users className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />,
    <CreditCard className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />
  ]
  return icons[index] || <Check className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" key={index} />
}

export default function AboutPage() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
  
  // AboutPage Structured Data
  const aboutPageData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: '투어비스 셀렉트 소개',
    description: '세계 최고 럭셔리 호텔의 특별한 혜택을 전문 컨시어지 상담과 함께 경험하세요.',
    url: `${baseUrl}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      alternateName: 'Tourvis Select',
      url: baseUrl,
      logo: `${baseUrl}/select_logo.avif`,
      description: '프리미엄 호텔 & 리조트 전문 컨시어지 서비스'
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '홈',
          item: baseUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '소개',
          item: `${baseUrl}/about`
        }
      ]
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageData) }}
      />
      
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
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 px-4">
                예약과 동시에 드리는
              </h2>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 px-4">
                셀렉트만의 특별한 혜택
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl p-6 sm:p-7 md:p-8 border border-gray-200"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-5 sm:mb-6">
                      <div className="text-gray-900">
                        {getBenefitIcon(index)}
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 leading-snug">{benefit.title}</h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Brands Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
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
        <section className="py-10 sm:py-12 md:py-16 bg-white">
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
        <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {programs.map((program, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-sm transition-shadow duration-200 flex flex-col"
                >
                  {/* Logo Section */}
                  <div className="relative bg-gray-100 flex items-center justify-center min-h-[140px] sm:min-h-[160px]">
                    {program.logo && (
                      <div className="relative w-full h-full min-h-[140px] sm:min-h-[160px]">
                        <Image
                          src={program.logo}
                          alt={program.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">{program.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">{program.subtitle}</p>

                    <ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6 flex-grow">
                      {program.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start">
                          <div className="flex-shrink-0 mr-2 mt-0.5">
                            {benefit.includes("조식") ? (
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            ) : benefit.includes("크레딧") ? (
                              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            ) : benefit.includes("업그레이드") ? (
                              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            ) : benefit.includes("체크인") || benefit.includes("체크아웃") ? (
                              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            ) : benefit.includes("포인트") ? (
                              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            ) : (
                              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto">
                      {program.buttons ? (
                        <div className="flex gap-2">
                          {program.buttons.map((button: any, btnIdx: number) => (
                            <Link 
                              key={btnIdx}
                              href={button.link}
                              className={`flex-1 text-center text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-lg transition-colors duration-200 ${
                                button.secondary 
                                  ? 'bg-white text-gray-900 border border-gray-900 hover:bg-gray-50' 
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              {button.text}
                            </Link>
                          ))}
                        </div>
                      ) : program.link ? (
                        <Link 
                          href={program.link}
                          className="block w-full bg-gray-900 text-white text-center text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-lg hover:bg-gray-800 active:bg-black transition-colors duration-200"
                        >
                          시설목록
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 혜택 안내 문구 */}
            <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                혜택은 시설별로 일부 상이할 수 있습니다.<br />
                자세한 혜택은 호텔 상세 페이지 또는 컨시어지와의 상담을 통해 확인 바랍니다.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-16 sm:py-20 md:py-24 bg-gray-50 overflow-hidden">
          {/* 배경 이미지 */}
          <div className="absolute inset-0">
            <Image
              src="/destination-image/bali.webp"
              alt="Luxury Hotel"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* 내용 */}
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 relative z-10">
            <div className="max-w-xl ml-auto mr-0 md:mr-16 lg:mr-24">
              <div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 shadow-2xl">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-5">
                  Contacts
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                  셀렉트에 대해 궁금한 내용을 문의주시면<br />
                  전문 상담사가 답변해드리겠습니다.
                </p>
                <a
                  href="https://pf.kakao.com/_cxmxgNG/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full px-6 py-4 bg-[#FEE500] text-[#191919] text-base sm:text-lg font-bold rounded-lg hover:bg-[#FAD000] active:bg-[#F5C700] transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  카카오톡 상담
                </a>
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
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)",
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
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    buttons: [
      { text: "시설목록", link: "/brand" },
      { text: "아만 디스커버리", link: "/blog/brand-discovery-aman", secondary: true }
    ]
  },
  {
    title: "Hyatt Prive",
    subtitle: "하얏트 프리베",
    logo: "/brand-image/hyatt.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)",
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
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)",
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
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Mandarin Oriental Fan Club",
    subtitle: "만다린 오리엔탈 팬클럽",
    logo: "/brand-image/mandarin.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Hilton for Luxury",
    subtitle: "힐튼 포 럭셔리",
    logo: "/brand-image/hilton.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)",
      "멤버십 포인트 적립"
    ],
    link: "/brand"
  },
  {
    title: "Shangri-La Group",
    subtitle: "샹그릴라 더 럭셔리 서클",
    logo: "/brand-image/shangri-la.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "BRAVOS",
    subtitle: "멜리아 브라보스",
    logo: "/brand-image/melia.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Virtuoso",
    subtitle: "버츄오소",
    logo: "/brand-image/virtuoso.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "LHW VITA",
    subtitle: "Leading Hotels Of The World 멤버십",
    logo: "/brand-image/lhw-vita.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Heaven's Portfolio",
    subtitle: "헤븐스 포트폴리오",
    logo: "/brand-image/heavens-portfolio.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Pan Pacific",
    subtitle: "팬 퍼시픽 호텔 & 리조트",
    logo: "/brand-image/pacific.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Preferred Hotels & Resorts",
    subtitle: "Preferred Platinum Program",
    logo: "/brand-image/preferred-hotels-resorts.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  },
  {
    title: "Capella Hotels & Resorts",
    subtitle: "Capella Hotels & Resorts",
    logo: "/brand-image/capella.avif",
    benefits: [
      "2인 조식 포함",
      "$100 호텔/리조트 크레딧",
      "객실 무료 업그레이드",
      "얼리 체크인 (현장 가능시)",
      "레이트 체크아웃 (현장 가능시)"
    ],
    link: "/brand"
  }
]

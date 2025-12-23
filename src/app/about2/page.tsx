import { Metadata } from "next"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Crown, Award, Calendar, ArrowRight, Building2, Users, Shield, TrendingUp } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '투어비스 셀렉트 회사 소개 | 신뢰할 수 있는 럭셔리 호텔 전문 플랫폼',
  description: '16년 이상의 여행 업계 경험과 글로벌 럭셔리 호텔 체인 공식 파트너십을 통해 신뢰할 수 있는 럭셔리 호텔 전문 서비스를 제공합니다.',
  keywords: [
    '투어비스 셀렉트',
    '타이드스퀘어',
    '투어비스',
    '회사 연혁',
    '글로벌 파트너십',
    '럭셔리 호텔',
    '신뢰할 수 있는 여행사',
    '공식 인증 에이전트'
  ],
  openGraph: {
    title: '투어비스 셀렉트 회사 소개 | 신뢰할 수 있는 럭셔리 호텔 전문 플랫폼',
    description: '16년 이상의 여행 업계 경험과 글로벌 럭셔리 호텔 체인 공식 파트너십',
    url: `${baseUrl}/about2`,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_logo.avif`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '투어비스 셀렉트 회사 소개 | 신뢰할 수 있는 럭셔리 호텔 전문 플랫폼',
    description: '16년 이상의 여행 업계 경험과 글로벌 럭셔리 호텔 체인 공식 파트너십',
    images: [`${baseUrl}/select_logo.avif`]
  },
  alternates: {
    canonical: `${baseUrl}/about2`
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

interface HistoryItem {
  year: number
  month: string
  content: string
}

const historyData: HistoryItem[] = [
  // 2025
  { year: 2025, month: '01', content: '투어비스, 2025 소비자가 뽑은 가장 신뢰하는 브랜드대상 수상' },
  { year: 2025, month: '03', content: '타이드스퀘어x라이브데이터, 여행 AI Agent 개발 업무협약(MOU) 체결' },
  { year: 2025, month: '04', content: '타이드스퀘어, AWS 파트너 소프트웨어 패스(AWS Partner Software Path) 인증' },
  { year: 2025, month: '11', content: '투어비스, 앱 어워드 코리아 2025 수상' },
  // 2024
  { year: 2024, month: '07', content: '투어비스X에어프랑스-KLM, 아시아 최초로 NDC 연동' },
  { year: 2024, month: '07', content: '럭셔리 호텔 예약 서비스 \'투어비스 셀렉트\' 런칭' },
  { year: 2024, month: '11', content: '타이드스퀘어, 글로벌 여행 기술&마케팅 콘퍼런스 \'WiT Seoul 2024\' 개최' },
  // 2023
  { year: 2023, month: '01', content: '타이드스퀘어, \'2023 근로자 휴가지원사업\' 참여' },
  { year: 2023, month: '03', content: '투어비스, 유니버셜 스튜디오 재팬 공식파트너 선정' },
  { year: 2023, month: '04', content: '타이드스퀘어, 두바이관광청과 2023 프로모션 제휴 진행' },
  { year: 2023, month: '04', content: '타이드스퀘어, \'카카오톡 예약하기\' 운영 대행사 선정 및 서비스 오픈' },
  { year: 2023, month: '09', content: '타이드스퀘어, 일본 법인 설립(도쿄)' },
  { year: 2023, month: '10', content: '투어비스, 여행 서비스 최초 카드/멤버십 포인트 활용 서비스 \'핏콜라보_TV포인트\' 제휴' },
  { year: 2023, month: '11', content: '타이드스퀘어, 글로벌 여행 기술&마케팅 콘퍼런스 \'WiT Seoul 2023\' 개최' },
  // 2022
  { year: 2022, month: '04', content: '투어비스, \'ESG와 함께하는 2022 대한민국 숙박대전\' 진행' },
  { year: 2022, month: '06', content: '투어비스, \'2022 자라섬 재즈페스티벌\' 티켓 단독 판매' },
  { year: 2022, month: '07', content: '타이드스퀘어, 사우디아라비아 관광청과 전략적 업무협약(MOU) 체결' },
  { year: 2022, month: '08', content: '타이드스퀘어, NDC에서 ARM Index로 인증 변경' },
  { year: 2022, month: '11', content: '타이드스퀘어, 글로벌 여행 기술&마케팅 콘퍼런스 \'WiT Seoul 2022\' 국내 공동 주최' },
  // 2021
  { year: 2021, month: '03', content: '타이드스퀘어, 관광벤처 무브와 전략적 업무협약 체결' },
  { year: 2021, month: '03', content: '타이드스퀘어, 대한항공과 마일리지 적립 제휴' },
  { year: 2021, month: '04', content: '타이드스퀘어, NDC Certificate Level 3 & NDC Certificate Level 4 인증' },
  { year: 2021, month: '06', content: '타이드스퀘어, 카카오모빌리티와 카카오 T 항공 서비스 오픈' },
  { year: 2021, month: '10', content: '타이드스퀘어, 북미 최대 TMC \'트래블 리더스 네트워크\' 가입' },
  { year: 2021, month: '11', content: '타이드스퀘어, \'2020 근로자 휴가지원사업 우수 참여기업\' 한국관광공사 사장상 수상' },
  // 2020
  { year: 2020, month: '04', content: '투어비스 호텔 서비스 오픈' },
  { year: 2020, month: '10', content: '투어비스, 교통플랫폼 가지와 숙박서비스 제휴' },
  { year: 2020, month: '10', content: '타이드스퀘어, \'2019 근로자 휴가지원사업 우수 참여기업\' 감사패 수상' },
  { year: 2020, month: '10', content: '타이드스퀘어, 안전여행을 위해 에이치플러스 양지병원과 MOU 체결' },
  { year: 2020, month: '10', content: '타이드스퀘어, \'WiT Seoul Virtual 2020\' 개최' },
  { year: 2020, month: '10', content: '투어비스, 문체부X KATA 주관 국내여행 할인상품 지원사업 플랫폼 운영' },
  // 2019
  { year: 2019, month: '04', content: '7년 연속 대한항공/아시아나항공 선정 우수 여행사' },
  { year: 2019, month: '04', content: '카카오, 두나무, KCA 캐피탈파트너스 투자 유치' },
  { year: 2019, month: '04', content: '여행 기술 마케팅 커뮤니티 \'WiT SEOUL 2019\' 국내 공동 주최' },
  { year: 2019, month: '05', content: '<투어비스> NDC 서비스 연동/독일항공 직접운임 판매 허용' },
  { year: 2019, month: '09', content: '<투어비스>, 영국항공 직접운임 판매 적용' },
  { year: 2019, month: '10', content: '<투어비스>, 카카오페이 간편 결제서비스 시행' },
  { year: 2019, month: '11', content: '투어비스 \'CHAI 결제 서비스\' 시행' },
  { year: 2019, month: '12', content: '투어비스, 티웨이항공/제주항공 직접운임 판매 적용' },
  { year: 2019, month: '12', content: '여성가족부 주관 \'가족친화 우수기업\' 재인증 획득' },
  // 2018
  { year: 2018, month: '01', content: '<투어비스>, 종합여행플랫폼으로 서비스 확장' },
  { year: 2018, month: '02', content: 'BSP 기준, 국내 여행사 순위 5위권 진입' },
  { year: 2018, month: '04', content: '여행 기술 마케팅 커뮤니티 \'WiT SEOUL 2018\' 국내 공동 주최' },
  { year: 2018, month: '07', content: 'B2E 사이트 <베네피아> 여행 전문관 운영 대행' },
  { year: 2018, month: '07', content: '한국관광공사 후원 \'근로자 휴가 지원 사업\' 운영 대행' },
  { year: 2018, month: '10', content: '네이버 \'현지투어 서비스\' 제휴' },
  { year: 2018, month: '11', content: '네이버 \'해외패키지 메타서치 플랫폼 서비스\' 개발 및 운영 대행 계약' },
  // 2017
  { year: 2017, month: '03', content: '일본항공 국제선 우수판매여행사상 수상' },
  { year: 2017, month: '04', content: '여행 기술 마케팅 커뮤니티 국내 공식 파트너' },
  { year: 2017, month: '06', content: '스퀘어랩 <카이트> 앱 런칭/투자 지원' },
  { year: 2017, month: '07', content: '상용출장전문여행사 <투어비스> 인수' },
  // 2016
  { year: 2016, month: '04', content: '2016년 고용노동부 선정 강소기업' },
  { year: 2016, month: '06', content: 'ISLAND + CITY MARKETING 서비스 시작' },
  { year: 2016, month: '12', content: '항공권 검색 앱 <플레이윙즈> 인수' },
  // 2015
  { year: 2015, month: '04', content: '3년 연속 대한항공/아시아나항공 선정 우수 여행사' },
  { year: 2015, month: '06', content: '전 세계 숙박 검색 앱 \'올스테이\' 공동 투자' },
  { year: 2015, month: '06', content: '공간 공유 서비스 플랫폼 \'비앤비히어로\' 투자' },
  { year: 2015, month: '10', content: '스카이스캐너, 이베이코리아, 네이버 제휴' },
  { year: 2015, month: '11', content: '<식당의 발견>시리즈 출간_제주/통영, 진주, 사천/울릉도' },
  { year: 2015, month: '11', content: 'Naver 항공 서비스 제휴' },
  // 2014
  { year: 2014, month: '12', content: '\'가족친화 우수기업\' 인증 획득 (여성가족부 주관)' },
  // 2013
  { year: 2013, month: '04', content: '아시아나항공/대한항공 선정 우수여행사' },
  { year: 2013, month: '11', content: '싱가포르 여행 스타트업 \'비마이게스트\' 투자' },
  // 2011
  { year: 2011, month: '10', content: 'IATA(국제항공운송협회) BSP 에이전시 계약(173-2665-4)' },
  // 2010
  { year: 2010, month: '03', content: '일반 여행업 등록' },
  { year: 2010, month: '11', content: '현대카드 PRIVIA 쇼핑/여행 서비스 계약' },
  // 2009
  { year: 2009, month: '11', content: '㈜타이드스퀘어 법인 설립' },
]

// 연도별로 그룹화
const historyByYear = historyData.reduce((acc, item) => {
  if (!acc[item.year]) {
    acc[item.year] = []
  }
  acc[item.year].push(item)
  return acc
}, {} as Record<number, HistoryItem[]>)

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

export default function About2Page() {
  // AboutPage Structured Data
  const aboutPageData = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: '투어비스 셀렉트 회사 소개',
    description: '16년 이상의 여행 업계 경험과 글로벌 럭셔리 호텔 체인 공식 파트너십',
    url: `${baseUrl}/about2`,
    mainEntity: {
      '@type': 'Organization',
      name: '투어비스 셀렉트',
      alternateName: 'Tourvis Select',
      url: baseUrl,
      logo: `${baseUrl}/select_logo.avif`,
      description: '프리미엄 호텔 & 리조트 전문 컨시어지 서비스',
      foundingDate: '2009-11',
      award: [
        '2025 소비자가 뽑은 가장 신뢰하는 브랜드대상',
        '앱 어워드 코리아 2025',
        '7년 연속 대한항공/아시아나항공 선정 우수 여행사',
        '2016년 고용노동부 선정 강소기업'
      ]
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
          name: '회사 소개',
          item: `${baseUrl}/about2`
        }
      ]
    }
  }

  const sortedYears = Object.keys(historyByYear)
    .map(Number)
    .sort((a, b) => b - a) // 최신순

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
        {/* Achievements Highlight Section */}
        <section className="pt-[100px] pb-10 sm:pt-[100px] sm:pb-12 md:pt-[100px] md:pb-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4 shadow-sm border border-blue-100">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                주요 수상 및 인증
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                인정받은 신뢰와 경험
              </h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 sm:mb-8 px-4 max-w-3xl mx-auto">
                16년 이상의 여행 업계 경험과
                <br className="hidden sm:block" />
                <span className="font-semibold text-blue-600">글로벌 럭셔리 호텔 체인 공식 파트너십</span>
                <br className="hidden sm:block" />
                을 통해 신뢰할 수 있는 서비스를 제공합니다
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">16+ 년 경험</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  여행 업계 16년 이상의 경험과 노하우
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">7년 연속 우수 여행사</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  대한항공/아시아나항공 선정 우수 여행사
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">브랜드 신뢰도</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  2025 소비자가 뽑은 가장 신뢰하는 브랜드대상 수상
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">강소기업</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  2016년 고용노동부 선정 강소기업 인증
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">가족친화 기업</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  여성가족부 주관 가족친화 우수기업 인증
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">앱 어워드</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  앱 어워드 코리아 2025 수상
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 sm:p-8 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">ISO/IEC 27001</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  정보보호경영시스템 인증
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4 shadow-sm border border-blue-100">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                회사 연혁
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                투어비스 서비스 연혁
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-700 max-w-3xl mx-auto px-4 leading-relaxed">
                2009년 설립 이후 지속적인 성장과 혁신을 통해
                <br className="hidden sm:block" />
                국내 여행 업계를 선도하는 기업으로 발전해왔습니다
              </p>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto">
              {sortedYears.map((year, yearIndex) => {
                const items = historyByYear[year]
                return (
                  <div key={year} className="mb-8 sm:mb-10 last:mb-0">
                    {/* Year Header */}
                    <div className="sticky top-20 sm:top-24 z-10 mb-6 sm:mb-8">
                      <div className="inline-flex items-center gap-3 bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-md border-2 border-blue-600">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{year}</span>
                        {yearIndex === 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                            최신
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Year Items */}
                    <div className="relative pl-6 sm:pl-8 md:pl-12">
                      {/* Timeline Line */}
                      <div className="absolute left-2 sm:left-3 md:left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                      {items.map((item, itemIndex) => (
                        <div 
                          key={`${year}-${itemIndex}`}
                          className="relative mb-6 sm:mb-8 last:mb-0"
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-[-2.125rem] sm:left-[-2.25rem] md:left-[-3.125rem] top-1.5 w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>

                          {/* Content Card */}
                          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                              <div className="flex-shrink-0">
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm font-semibold rounded-full">
                                  {item.month}월
                                </span>
                              </div>
                              <p className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1">
                                {item.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Global Brands Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-blue-600 mb-3 sm:mb-4 shadow-sm border border-blue-100">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                공식 파트너십
              </div>
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
                  신뢰할 수 있는 파트너와 함께
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 leading-relaxed">
                  16년 이상의 경험과 글로벌 파트너십으로
                  <br />
                  최고의 럭셔리 호텔 경험을 제공합니다
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://pf.kakao.com/_cxmxgNG/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-4 bg-[#FEE500] text-[#191919] text-base sm:text-lg font-bold rounded-lg hover:bg-[#FAD000] active:bg-[#F5C700] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    카카오톡 상담
                  </a>
                  <Link
                    href="/hotel"
                    className="inline-flex items-center justify-center px-6 py-4 bg-gray-900 text-white text-base sm:text-lg font-bold rounded-lg hover:bg-gray-800 active:bg-black transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    호텔 둘러보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


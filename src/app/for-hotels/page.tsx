import { Metadata } from "next"
import { Header } from "@/components/header"
import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { 
  BarChart3, 
  Users, 
  Hotel, 
  FileText, 
  MapPin, 
  Star, 
  TrendingUp, 
  Search, 
  Calendar,
  MessageCircle,
  Globe,
  CheckCircle2,
  ArrowRight,
  Eye,
  CreditCard,
  Building2,
  Sparkles,
  Target,
  Zap,
  Shield
} from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

export const metadata: Metadata = {
  title: '호텔 시설사 제안 | 투어비스 셀렉트',
  description: '투어비스 셀렉트는 프리미엄 호텔 & 리조트 전문 플랫폼으로, 고품질 트래픽과 전문적인 마케팅을 통해 호텔 시설사의 예약을 증대시킵니다.',
  keywords: [
    '호텔 제안',
    '호텔 파트너십',
    '호텔 마케팅',
    '럭셔리 호텔',
    '프리미엄 호텔',
    '투어비스 셀렉트'
  ],
  openGraph: {
    title: '호텔 시설사 제안 | 투어비스 셀렉트',
    description: '프리미엄 호텔 & 리조트 전문 플랫폼으로 고품질 트래픽과 전문적인 마케팅을 제공합니다.',
    url: `${baseUrl}/for-hotels`,
    siteName: '투어비스 셀렉트',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: `${baseUrl}/select_og_image.jpg`,
        width: 1200,
        height: 630,
        alt: '투어비스 셀렉트 - 호텔 시설사 제안'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: '호텔 시설사 제안 | 투어비스 셀렉트',
    description: '프리미엄 호텔 & 리조트 전문 플랫폼으로 고품질 트래픽과 전문적인 마케팅을 제공합니다.',
    images: [`${baseUrl}/select_og_image.jpg`]
  },
  alternates: {
    canonical: `${baseUrl}/for-hotels`
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

async function getStatistics() {
  try {
    const supabase = await createClient()

    // 통계 데이터 조회
    const [hotelsResult, brandsResult, blogsResult, citiesResult, testimonialsResult, promotionsResult] = await Promise.all([
      supabase
        .from('select_hotels')
        .select('*', { count: 'exact', head: true })
        .or('publish.is.null,publish.eq.true'),
      supabase
        .from('hotel_brands')
        .select('*', { count: 'exact', head: true })
        .not('brand_slug', 'is', null)
        .not('brand_slug', 'eq', ''),
      supabase
        .from('select_hotel_blogs')
        .select('*', { count: 'exact', head: true })
        .eq('publish', true),
      supabase
        .from('select_regions')
        .select('*', { count: 'exact', head: true })
        .eq('region_type', 'city')
        .eq('status', 'active'),
      supabase
        .from('select_satisfaction_survey')
        .select('*', { count: 'exact', head: true })
        .eq('pick', true)
        .not('review_text', 'is', null),
      supabase
        .from('select_feature_slots')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
    ])

    return {
      totalHotels: hotelsResult.count || 0,
      totalBrands: brandsResult.count || 0,
      totalBlogs: blogsResult.count || 0,
      totalCities: citiesResult.count || 0,
      totalTestimonials: testimonialsResult.count || 0,
      totalPromotions: promotionsResult.count || 0
    }
  } catch (error) {
    console.error('❌ 통계 조회 오류:', error)
    return {
      totalHotels: 0,
      totalBrands: 0,
      totalBlogs: 0,
      totalCities: 0,
      totalTestimonials: 0,
      totalPromotions: 0
    }
  }
}

export default async function ForHotelsPage() {
  const statistics = await getStatistics()

  // Structured Data
  const proposalPageData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '호텔 시설사 제안',
    description: '투어비스 셀렉트는 프리미엄 호텔 & 리조트 전문 플랫폼으로, 고품질 트래픽과 전문적인 마케팅을 제공합니다.',
    url: `${baseUrl}/for-hotels`,
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
          name: '호텔 시설사 제안',
          item: `${baseUrl}/for-hotels`
        }
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(proposalPageData) }}
      />
      
      <Header />
      <PromotionBanner />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 opacity-60"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-blue-600 mb-4 sm:mb-6 shadow-sm border border-blue-100">
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                호텔 시설사 제안
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                투어비스 셀렉트와 함께
                <br className="hidden sm:block" />
                <span className="text-blue-600"> 프리미엄 고객을 만나보세요</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8 max-w-2xl mx-auto">
                럭셔리 호텔 & 리조트 전문 플랫폼으로
                <br className="hidden sm:block" />
                고품질 트래픽과 전문적인 마케팅을 통해
                <br className="hidden sm:block" />
                호텔 시설사의 예약을 증대시킵니다
              </p>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                투어비스 셀렉트 현황
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                프리미엄 호텔 & 리조트 전문 플랫폼의 규모와 영향력
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              <StatCard
                icon={<Hotel className="w-6 h-6 sm:w-8 sm:h-8" />}
                value={statistics.totalHotels.toLocaleString()}
                label="등록 호텔"
                color="text-blue-600"
              />
              <StatCard
                icon={<Building2 className="w-6 h-6 sm:w-8 sm:h-8" />}
                value={statistics.totalBrands.toLocaleString()}
                label="파트너 브랜드"
                color="text-purple-600"
              />
              <StatCard
                icon={<FileText className="w-6 h-6 sm:w-8 sm:h-8" />}
                value={statistics.totalBlogs.toLocaleString()}
                label="콘텐츠 블로그"
                color="text-green-600"
              />
              <StatCard
                icon={<MapPin className="w-6 h-6 sm:w-8 sm:h-8" />}
                value={statistics.totalCities.toLocaleString()}
                label="목적지 도시"
                color="text-orange-600"
              />
              <StatCard
                icon={<Star className="w-6 h-6 sm:w-8 sm:h-8" />}
                value={statistics.totalTestimonials.toLocaleString()}
                label="고객 후기"
                color="text-yellow-600"
              />
              <StatCard
                icon={<Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />}
                value={statistics.totalPromotions.toLocaleString()}
                label="프로모션"
                color="text-pink-600"
              />
            </div>
          </div>
        </section>

        {/* Site Content Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                풍부한 사이트 콘텐츠
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                고품질 콘텐츠로 고객의 여행 계획을 지원합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <ContentCard
                icon={<FileText className="w-8 h-8" />}
                title="호텔 상세 정보"
                description="각 호텔의 상세한 정보, 시설, 위치, 혜택 등을 체계적으로 제공하여 고객의 의사결정을 돕습니다."
                features={[
                  "고해상도 이미지 갤러리",
                  "실시간 객실 및 요금 정보",
                  "호텔 시설 및 서비스 상세",
                  "위치 및 교통편 정보"
                ]}
                color="blue"
              />
              <ContentCard
                icon={<FileText className="w-8 h-8" />}
                title="여행 블로그 콘텐츠"
                description="전문적인 여행 가이드와 호텔 리뷰를 통해 고객의 여행 계획을 지원하고 호텔에 대한 관심을 높입니다."
                features={[
                  "목적지별 여행 가이드",
                  "호텔 브랜드 스토리",
                  "실제 고객 후기 및 경험",
                  "시즌별 추천 콘텐츠"
                ]}
                color="green"
              />
              <ContentCard
                icon={<MapPin className="w-8 h-8" />}
                title="목적지 정보"
                description="전 세계 주요 도시와 리조트 지역에 대한 상세한 정보를 제공하여 고객의 여행 계획을 돕습니다."
                features={[
                  "도시별 호텔 추천",
                  "관광 명소 정보",
                  "교통편 가이드",
                  "지역별 특색 소개"
                ]}
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* Traffic & Analytics Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                유입 트래픽 및 분석
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                고품질 트래픽과 데이터 기반 마케팅 인사이트
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
              <TrafficCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="SEO 최적화"
                description="검색 엔진 최적화를 통해 자연 유입 트래픽을 지속적으로 확보합니다."
                features={[
                  "구조화된 데이터 (Schema.org) 적용",
                  "Long-tail 키워드 최적화",
                  "사이트맵 및 메타데이터 관리",
                  "모바일 최적화"
                ]}
              />
              <TrafficCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="데이터 분석"
                description="Google Analytics 4를 통한 상세한 사용자 행동 분석과 전환 추적을 제공합니다."
                features={[
                  "페이지뷰 및 사용자 행동 추적",
                  "호텔 조회 및 검색 이벤트 분석",
                  "카카오톡 상담 전환 추적",
                  "실시간 트래픽 모니터링"
                ]}
              />
            </div>
          </div>
        </section>

        {/* View & Booking Pages Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                조회 및 예약 페이지
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                사용자 친화적인 인터페이스로 예약 전환율을 극대화합니다
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <PageCard
                icon={<Eye className="w-6 h-6" />}
                title="호텔 상세 페이지"
                description="호텔의 모든 정보를 한눈에 볼 수 있는 상세 페이지"
                features={[
                  "고해상도 이미지 갤러리",
                  "실시간 객실 및 요금 정보",
                  "호텔 시설 및 혜택 소개",
                  "고객 후기 및 평점"
                ]}
              />
              <PageCard
                icon={<Search className="w-6 h-6" />}
                title="검색 및 필터링"
                description="다양한 조건으로 원하는 호텔을 빠르게 찾을 수 있는 검색 기능"
                features={[
                  "목적지, 날짜, 인원 검색",
                  "브랜드, 체인, 가격대 필터",
                  "지도 기반 검색",
                  "AI 기반 추천"
                ]}
              />
              <PageCard
                icon={<Calendar className="w-6 h-6" />}
                title="예약 시스템"
                description="간편하고 안전한 예약 프로세스"
                features={[
                  "실시간 객실 가용성 확인",
                  "다양한 요금제 비교",
                  "카카오톡 상담 연동",
                  "안전한 결제 시스템"
                ]}
              />
              <PageCard
                icon={<MessageCircle className="w-6 h-6" />}
                title="컨시어지 상담"
                description="전문 컨시어지와의 1:1 맞춤 상담 서비스"
                features={[
                  "카카오톡 실시간 상담",
                  "맞춤형 호텔 추천",
                  "특별 요청 처리",
                  "예약 후 서비스 지원"
                ]}
              />
            </div>
          </div>
        </section>

        {/* Features & Facilities Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-white">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                주요 기능 및 시설
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                호텔 시설사와 고객 모두를 위한 혁신적인 기능들
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<Zap className="w-6 h-6" />}
                title="빠른 페이지 로딩"
                description="Next.js 16과 최신 기술 스택으로 빠르고 안정적인 사용자 경험 제공"
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="반응형 디자인"
                description="모바일, 태블릿, 데스크톱 모든 기기에서 최적화된 경험"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="보안 및 안정성"
                description="엔터프라이즈급 보안과 안정적인 서버 인프라"
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="실시간 통계"
                description="호텔별 조회수, 검색수, 상담 수 등 실시간 통계 제공"
              />
              <FeatureCard
                icon={<CheckCircle2 className="w-6 h-6" />}
                title="글로벌 인증"
                description="Virtuoso, 하얏트 프리베, IHG 등 글로벌 럭셔리 체인 공식 인증"
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="고객 관리"
                description="전문 컨시어지 팀을 통한 고품질 고객 서비스"
              />
            </div>
          </div>
        </section>

        {/* Proposal Section */}
        <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 to-gray-50">
          <div className="container mx-auto max-w-[1440px] px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 md:p-12">
                <div className="text-center mb-8 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    투어비스 셀렉트와 함께하세요
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                    프리미엄 호텔 & 리조트 전문 플랫폼으로
                    <br className="hidden sm:block" />
                    고품질 트래픽과 전문적인 마케팅을 통해
                    <br className="hidden sm:block" />
                    호텔 시설사의 예약을 증대시킵니다
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10">
                  <ProposalItem
                    title="고품질 트래픽 유입"
                    description="SEO 최적화와 전문 콘텐츠를 통해 프리미엄 고객층을 지속적으로 유입시킵니다."
                  />
                  <ProposalItem
                    title="전문적인 마케팅 지원"
                    description="호텔별 맞춤형 마케팅 전략과 프로모션을 통해 브랜드 가치를 높입니다."
                  />
                  <ProposalItem
                    title="실시간 통계 및 분석"
                    description="호텔별 상세한 통계와 분석 데이터를 제공하여 마케팅 의사결정을 지원합니다."
                  />
                  <ProposalItem
                    title="전문 컨시어지 서비스"
                    description="전문 컨시어지 팀을 통한 고품질 고객 서비스로 고객 만족도를 높입니다."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://pf.kakao.com/_cxmxgNG/chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#FEE500] text-[#191919] text-base sm:text-lg font-bold rounded-lg hover:bg-[#FAD000] active:bg-[#F5C700] transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    카카오톡 상담하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 text-base sm:text-lg font-semibold rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
                  >
                    문의하기
                    <ArrowRight className="w-5 h-5 ml-2" />
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

// Stat Card Component
function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow text-center">
      <div className={`inline-flex items-center justify-center mb-4 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
        {value}
      </div>
      <div className="text-sm sm:text-base text-gray-600">
        {label}
      </div>
    </div>
  )
}

// Content Card Component
function ContentCard({ icon, title, description, features, color }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[];
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600'
  }

  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 ${colorClasses[color]} border-2`}>
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Traffic Card Component
function TrafficCard({ icon, title, description, features }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[]
}) {
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 bg-blue-50 border-2 border-blue-200 text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Page Card Component
function PageCard({ icon, title, description, features }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[]
}) {
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-purple-50 border-2 border-purple-200 text-purple-600">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>
      <ul className="space-y-1.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start text-xs sm:text-sm text-gray-700">
            <CheckCircle2 className="w-3.5 h-3.5 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 bg-orange-50 border-2 border-orange-200 text-orange-600">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// Proposal Item Component
function ProposalItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4">
        <CheckCircle2 className="w-6 h-6 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}


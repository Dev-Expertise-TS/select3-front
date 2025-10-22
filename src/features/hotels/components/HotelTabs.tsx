"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Star, Utensils, MessageCircle, Bed, Shield, FileText } from "lucide-react"
import { BlogContentRenderer } from "@/components/shared"

interface BlogContent {
  slug: string
  main_title: string
  main_image: string | null
  sub_title: string | null
  s1_contents: string | null
  s2_contents: string | null
  s3_contents: string | null
  s4_contents: string | null
  s5_contents: string | null
  s6_contents: string | null
  s7_contents: string | null
  s8_contents: string | null
  s9_contents: string | null
  s10_contents: string | null
  s11_contents: string | null
  s12_contents: string | null
  created_at: string
  s1_sabre_id: number | null
  s2_sabre_id: number | null
  s3_sabre_id: number | null
  s4_sabre_id: number | null
  s5_sabre_id: number | null
  s6_sabre_id: number | null
  s7_sabre_id: number | null
  s8_sabre_id: number | null
  s9_sabre_id: number | null
  s10_sabre_id: number | null
  s11_sabre_id: number | null
  s12_sabre_id: number | null
}

interface HotelTabsProps {
  introHtml: string | null
  locationHtml: string | null
  hotelName: string
  propertyAddress?: string
  propertyDescription?: string
  sabreId?: number
  hotelBlogs?: string | null
}

export function HotelTabs({ introHtml, locationHtml, hotelName, propertyAddress, propertyDescription, sabreId, hotelBlogs }: HotelTabsProps) {
  const [activeTab, setActiveTab] = useState("benefits")
  
  // 접기/펼치기 상태 추가
  const [isIntroExpanded, setIsIntroExpanded] = useState(false)
  const [isLocationExpanded, setIsLocationExpanded] = useState(false)
  const [isArticlesExpanded, setIsArticlesExpanded] = useState(false)
  
  // 탭 메뉴 ref 추가
  const tabMenuRef = useRef<HTMLDivElement>(null)
  
  // HTML 콘텐츠 렌더링용 ref 추가 (크롬 번역 충돌 방지)
  const introContentRef = useRef<HTMLDivElement>(null)
  const locationContentRef = useRef<HTMLDivElement>(null)
  
  // 아티클 관련 상태
  const [articles, setArticles] = useState<BlogContent[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [articlesError, setArticlesError] = useState<string | null>(null)
  
  // 혜택 관련 상태
  const [hotelBenefits, setHotelBenefits] = useState<any[]>([])
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(false)
  const [benefitsError, setBenefitsError] = useState<string | null>(null)
  
  // 중복 호출 방지를 위한 ref
  const benefitsFetchedRef = useRef(false)
  const articlesFetchedRef = useRef(false)
  
  // 탭 메뉴로 스크롤하는 함수
  const scrollToTabMenu = () => {
    if (tabMenuRef.current) {
      tabMenuRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 호텔별 혜택 데이터 가져오기
  const fetchHotelBenefits = useCallback(async () => {
    if (!sabreId || benefitsFetchedRef.current || isLoadingBenefits) {
      return
    }

    try {
      benefitsFetchedRef.current = true
      setIsLoadingBenefits(true)
      setBenefitsError(null)
      
      console.log(`🔍 호텔 ${sabreId}의 혜택 API 호출 시작...`)
      
      const response = await fetch(`/api/hotels/${sabreId}/benefits`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log(`📊 호텔 ${sabreId} 혜택 API 응답:`, data)
      
      if (data.success && data.data) {
        // benefit_description 대신 benefit 컬럼 사용
        const formattedBenefits = data.data.map((item: any, index: number) => ({
          icon: getBenefitIconByIndex(index),
          iconColor: getBenefitIconColorByIndex(index),
          bgColor: getBenefitBgColorByIndex(index),
          text: item.select_hotel_benefits?.benefit || "혜택 정보 없음" // benefit_description 대신 benefit 사용
        }))
        
        setHotelBenefits(formattedBenefits)
        console.log(`✅ 호텔 ${sabreId}의 혜택 ${formattedBenefits.length}개 로드 완료:`, data.meta)
      } else {
        setBenefitsError(data.error || "혜택을 불러오는데 실패했습니다.")
        console.error("혜택 API 응답 오류:", data)
      }
    } catch (error) {
      setBenefitsError("네트워크 오류가 발생했습니다.")
      console.error("Hotel benefits fetch error:", error)
    } finally {
      setIsLoadingBenefits(false)
    }
  }, [sabreId, isLoadingBenefits])

  // 호텔별 아티클 데이터 가져오기
  const fetchHotelArticles = useCallback(async () => {
    if (!sabreId || articlesFetchedRef.current || isLoadingArticles) {
      return
    }

    try {
      articlesFetchedRef.current = true
      setIsLoadingArticles(true)
      setArticlesError(null)
      
      const response = await fetch(`/api/hotels/${sabreId}/blogs`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setArticles(data.data)
        console.log(`✅ 호텔 ${sabreId}의 아티클 ${data.data.length}개 로드 완료:`, data.meta)
      } else {
        setArticlesError(data.error || "아티클을 불러오는데 실패했습니다.")
      }
    } catch (error) {
      setArticlesError("네트워크 오류가 발생했습니다.")
      console.error("Hotel articles fetch error:", error)
    } finally {
      setIsLoadingArticles(false)
    }
  }, [sabreId, isLoadingArticles])

  // 혜택 아이콘 결정 함수들 (인덱스 기반)
  const getBenefitIconByIndex = (index: number) => {
    const icons = [
      Utensils,
      () => <span className="text-green-600 font-semibold text-xs">$</span>,
      MessageCircle,
      Bed,
      Star,
      Shield,
      MessageCircle
    ]
    return icons[index % icons.length]
  }

  const getBenefitIconColorByIndex = (index: number) => {
    const colors = [
      "text-blue-600",
      "text-green-600", 
      "text-purple-600",
      "text-indigo-600",
      "text-amber-600",
      "text-slate-600",
      "text-rose-600"
    ]
    return colors[index % colors.length]
  }

  const getBenefitBgColorByIndex = (index: number) => {
    const bgColors = [
      "bg-blue-50",
      "bg-green-50",
      "bg-purple-50", 
      "bg-indigo-50",
      "bg-amber-50",
      "bg-slate-50",
      "bg-rose-50"
    ]
    return bgColors[index % bgColors.length]
  }

  // 혜택 탭이 활성화될 때 데이터 가져오기
  useEffect(() => {
    if (activeTab === "benefits" && sabreId) {
      fetchHotelBenefits()
    }
  }, [activeTab, sabreId, fetchHotelBenefits])

  // 아티클 탭이 활성화될 때 데이터 가져오기
  useEffect(() => {
    if (activeTab === "articles" && sabreId) {
      fetchHotelArticles()
    }
  }, [activeTab, sabreId, fetchHotelArticles])

  // 사용할 혜택 결정 (데이터베이스에서 가져온 혜택만 사용, 없으면 빈 배열)
  const benefits = hotelBenefits

  // 혜택 텍스트 포맷팅 함수 (괄호 앞에 줄바꿈 추가)
  const formatBenefitText = (text: string) => {
    // 괄호가 있는 경우 괄호 앞에서 줄바꿈
    const parts = text.split(/(\([^)]+\))/g)
    return parts.map((part, index) => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return (
          <span key={index}>
            <br />
            {part}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  // 크롬 번역 충돌 방지를 위한 HTML 콘텐츠 직접 삽입 (useEffect 사용)
  useEffect(() => {
    if (introContentRef.current && introHtml && isIntroExpanded) {
      // 기존 내용 제거 후 새로 삽입
      introContentRef.current.innerHTML = introHtml
    }
  }, [introHtml, isIntroExpanded])

  useEffect(() => {
    if (locationContentRef.current && locationHtml && isLocationExpanded) {
      // 기존 내용 제거 후 새로 삽입
      locationContentRef.current.innerHTML = locationHtml
    }
  }, [locationHtml, isLocationExpanded])

  return (
    <div className="bg-white sm:bg-gray-100 py-0 sm:py-1 min-h-[200px] sm:min-h-[150px]">
      <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
        <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm py-4 px-0 sm:p-6">
          {/* Tab Navigation */}
          <div ref={tabMenuRef} className="grid grid-cols-2 sm:flex sm:items-center gap-0 sm:gap-8 border-b mb-3 sm:mb-6 px-0 sm:px-0">
            <button
              onClick={() => setActiveTab("benefits")}
              className={`py-3 sm:py-0 sm:pb-3 px-2 sm:px-0 font-semibold text-sm sm:text-base text-center sm:text-left whitespace-nowrap transition-all ${
                activeTab === "benefits"
                  ? "text-white sm:text-blue-600 border-b-3 sm:border-b-2 border-blue-600 bg-blue-600 sm:bg-transparent"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              예약시 제공 혜택
            </button>
            <button
              onClick={() => setActiveTab("introduction")}
              className={`py-3 sm:py-0 sm:pb-3 px-2 sm:px-0 font-semibold text-sm sm:text-base text-center sm:text-left whitespace-nowrap transition-all ${
                activeTab === "introduction"
                  ? "text-white sm:text-blue-600 border-b-3 sm:border-b-2 border-blue-600 bg-blue-600 sm:bg-transparent"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              호텔 상세 정보
            </button>
            <button
              onClick={() => setActiveTab("transportation")}
              className={`py-3 sm:py-0 sm:pb-3 px-2 sm:px-0 font-semibold text-sm sm:text-base text-center sm:text-left whitespace-nowrap transition-all ${
                activeTab === "transportation"
                  ? "text-white sm:text-blue-600 border-b-3 sm:border-b-2 border-blue-600 bg-blue-600 sm:bg-transparent"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              위치 및 교통
            </button>
            {hotelBlogs && (
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex items-center justify-center sm:justify-start gap-1 sm:gap-2 py-3 sm:py-0 sm:pb-3 px-2 sm:px-0 font-semibold text-sm sm:text-base whitespace-nowrap transition-all ${
                  activeTab === "articles"
                    ? "text-white sm:text-blue-600 border-b-3 sm:border-b-2 border-blue-600 bg-blue-600 sm:bg-transparent"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <FileText className="h-4 w-4" />
                아티클
              </button>
            )}
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-3 sm:py-0 sm:pb-3 px-2 sm:px-0 font-semibold text-sm sm:text-base text-center sm:text-left whitespace-nowrap transition-all ${
                activeTab === "reviews"
                  ? "text-white sm:text-blue-600 border-b-3 sm:border-b-2 border-blue-600 bg-blue-600 sm:bg-transparent"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              리뷰 평가 분석
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "benefits" && (
            <div className="space-y-6">
              {/* 로딩 상태 */}
              {isLoadingBenefits && (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center gap-3 text-blue-600">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">혜택을 불러오는 중...</span>
                  </div>
                </div>
              )}
              
              {/* 오류 상태 */}
              {benefitsError && (
                <div className="text-center py-8">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
                    <p className="text-red-600 mb-4">{benefitsError}</p>
                    <button
                      onClick={fetchHotelBenefits}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              )}
              
              {/* 혜택 목록 */}
              {!isLoadingBenefits && !benefitsError && (
                <>
                  {benefits.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1.5 px-2 sm:flex sm:flex-wrap sm:gap-2 sm:px-0">
                      {benefits.map((benefit, index) => (
                        <div key={index} className={`flex items-center justify-center px-2 py-2 sm:p-3 bg-gradient-to-br from-white via-gray-50/20 to-gray-100/40 rounded-md h-[42px] sm:h-[56px] sm:flex-1 sm:min-w-[150px] shadow-xl border-2 backdrop-blur-sm relative overflow-hidden ${
                          index % 2 === 0 ? 'mr-1 sm:mr-0' : 'ml-1 sm:ml-0'
                        }`} style={{ borderColor: '#E6CDB5' }}>
                          <div className={`hidden sm:flex w-6 h-6 ${benefit.bgColor} rounded-md items-center justify-center flex-shrink-0 sm:mr-1.5`}>
                            <benefit.icon className={`h-3.5 w-3.5 ${benefit.iconColor}`} />
                          </div>
                          <div className="text-xs sm:text-xs font-medium text-gray-800 leading-tight text-center">
                            {formatBenefitText(benefit.text)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">🏆</div>
                      <p className="text-gray-500">이 호텔의 예약 혜택 정보가 준비 중입니다.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "introduction" && (
            <div className="space-y-4">
              {/* 더보기 버튼 */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsIntroExpanded(!isIntroExpanded)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isIntroExpanded ? '내용 접기' : '펼쳐 보기'}
                </button>
              </div>

              {/* 접기/펼치기 콘텐츠 */}
              {isIntroExpanded && (
                <>
                  <div className="prose max-w-none">
                    {/* Property Details 표시 */}
                    {introHtml ? (
                      <div className="max-w-[95%] sm:max-w-[70%] mx-auto mb-6">
                        <div
                          ref={introContentRef}
                          className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                          suppressHydrationWarning
                        />
                      </div>
                    ) : (
                      <div className="max-w-[95%] sm:max-w-[70%] mx-auto mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          {propertyDescription || `${hotelName}의 상세 정보가 아직 제공되지 않았습니다.`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* 하단 접기 버튼 */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setIsIntroExpanded(false)
                        scrollToTabMenu()
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      내용 접기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "transportation" && (
            <div className="space-y-3 sm:space-y-6">
              {/* 더보기 버튼 */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsLocationExpanded(!isLocationExpanded)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isLocationExpanded ? '내용 접기' : '펼쳐 보기'}
                </button>
              </div>

              {/* 접기/펼치기 콘텐츠 */}
              {isLocationExpanded && (
                <>
                  {locationHtml ? (
                    <div className="prose max-w-none">
                      <div className="max-w-[95%] sm:max-w-[70%] mx-auto mb-3 sm:mb-6">
                        <div
                          ref={locationContentRef}
                          className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                          suppressHydrationWarning
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📍</div>
                      <p className="text-gray-500">위치 및 교통 정보가 준비 중입니다.</p>
                    </div>
                  )}

                  {/* 구글 지도 */}
                  {propertyAddress && (
                    <div className="mt-4 sm:mt-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-4">호텔 위치</h3>
                      <div className="bg-gray-100 rounded-lg p-2 sm:p-4">
                        <div className="mb-2 sm:mb-4">
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">주소:</span> {propertyAddress}
                          </p>
                        </div>
                        <div className="relative w-full h-64 sm:h-96 bg-gray-200 rounded-lg overflow-hidden">
                          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                            <iframe
                              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(propertyAddress)}`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              title={`${hotelName} 위치`}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-gray-100">
                              <div className="text-center">
                                <div className="text-gray-400 text-4xl mb-2">🗺️</div>
                                <p className="text-gray-500 text-sm">구글 맵스 API 키가 설정되지 않았습니다.</p>
                                <p className="text-gray-400 text-xs mt-1">환경 변수에 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY를 추가해주세요.</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propertyAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            구글 지도에서 보기
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 하단 접기 버튼 */}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => {
                        setIsLocationExpanded(false)
                        scrollToTabMenu()
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      내용 접기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "articles" && (
            <div className="space-y-6">
              {/* 더보기 버튼 */}
              <div className="flex justify-center">
                <button
                  onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  {isArticlesExpanded ? '내용 접기' : '펼쳐 보기'}
                </button>
              </div>

              {/* 접기/펼치기 콘텐츠 */}
              {isArticlesExpanded && (
                <>
                  {isLoadingArticles ? (
                    <div className="text-center py-12">
                      <div className="flex items-center justify-center gap-3 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">아티클을 불러오는 중...</span>
                      </div>
                    </div>
                  ) : articlesError ? (
                    <div className="text-center py-12">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">오류가 발생했습니다</h3>
                        <p className="text-red-600 mb-4">{articlesError}</p>
                        <button
                          onClick={fetchHotelArticles}
                          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          다시 시도
                        </button>
                      </div>
                    </div>
                  ) : articles.length > 0 ? (
                    <div className="space-y-8">
                      {articles.map((article, index) => (
                        <div key={article.slug} className="space-y-6">
                          <div className="max-w-[95%] sm:max-w-[70%] mx-auto">
                            <BlogContentRenderer 
                              blog={article}
                              showHeader={true}
                              showImage={true}
                              showDate={true}
                              className="space-y-4"
                              imageClassName="mb-12"
                              contentClassName="prose prose-lg max-w-none"
                            />
                          </div>
                          
                          {/* 아티클 링크 */}
                          <div className="flex justify-center">
                            <a
                              href={`/blog/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              전체 아티클 보기
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📝</div>
                      <p className="text-gray-500">{hotelName}과 관련된 아티클이 없습니다.</p>
                      <p className="text-gray-400 text-sm mt-2">다른 호텔의 아티클을 확인해보세요.</p>
                    </div>
                  )}

                  {/* 하단 접기 버튼 */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setIsArticlesExpanded(false)
                        scrollToTabMenu()
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      내용 접기
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="text-center py-2">
                <div className="text-gray-400 text-lg mb-2">⭐</div>
                <p className="text-gray-500">리뷰 평가 분석이 준비 중입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
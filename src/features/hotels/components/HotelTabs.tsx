"use client"

import { useState, useEffect } from "react"
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
}

interface HotelTabsProps {
  introHtml: string | null
  locationHtml: string | null
  hotelName: string
  propertyAddress?: string
  propertyDescription?: string
  sabreId?: number
}

export function HotelTabs({ introHtml, locationHtml, hotelName, propertyAddress, propertyDescription, sabreId }: HotelTabsProps) {
  const [activeTab, setActiveTab] = useState("benefits")
  const [isHotelInfoExpanded, setIsHotelInfoExpanded] = useState(false)
  
  // 아티클 관련 상태
  const [articles, setArticles] = useState<BlogContent[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [articlesError, setArticlesError] = useState<string | null>(null)

  // 호텔별 아티클 데이터 가져오기
  const fetchHotelArticles = async () => {
    if (!sabreId) {
      setArticlesError("호텔 ID가 없습니다.")
      return
    }

    try {
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
  }

  // 아티클 탭이 활성화될 때 데이터 가져오기
  useEffect(() => {
    if (activeTab === "articles" && articles.length === 0 && !isLoadingArticles && sabreId) {
      fetchHotelArticles()
    }
  }, [activeTab, articles.length, isLoadingArticles, sabreId])

  const benefits = [
    {
      icon: Utensils,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      text: "2인 조식 무료 제공"
    },
    {
      icon: () => <span className="text-green-600 font-semibold text-xs">$</span>,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      text: "100$ 상당의 식음료 크레딧"
    },
    {
      icon: MessageCircle,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50",
      text: "얼리 체크인, 레이트 체크아웃 (현장 가능시)"
    },
    {
      icon: Bed,
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      text: "객실 무료 업그레이드 (현장 가능시)"
    },
    {
      icon: Star,
      iconColor: "text-amber-600",
      bgColor: "bg-amber-50",
      text: "글로벌 체인 멤버십 포인트 적립"
    },
    {
      icon: Shield,
      iconColor: "text-slate-600",
      bgColor: "bg-slate-50",
      text: "투숙 후 호텔에서 체크아웃 시 결제"
    },
    {
      icon: MessageCircle,
      iconColor: "text-rose-600",
      bgColor: "bg-rose-50",
      text: "전문 컨시어지를 통한 1:1 프라이빗 상담 예약"
    }
  ]

  return (
    <div className="bg-gray-100 py-4">
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Tab Navigation */}
          <div className="flex items-center gap-8 border-b mb-6">
            <button
              onClick={() => setActiveTab("benefits")}
              className={`flex items-center gap-2 pb-3 font-semibold ${
                activeTab === "benefits"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <span className="text-xl">🏆</span>
              예약 혜택
            </button>
            <button
              onClick={() => setActiveTab("introduction")}
              className={`pb-3 font-semibold ${
                activeTab === "introduction"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              호텔 상세 정보
            </button>
            <button
              onClick={() => setActiveTab("transportation")}
              className={`pb-3 font-semibold ${
                activeTab === "transportation"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              위치 및 교통
            </button>
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex items-center gap-2 pb-3 font-semibold ${
                activeTab === "articles"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <FileText className="h-4 w-4" />
              아티클
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 pb-3 font-semibold ${
                activeTab === "reviews"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <span className="text-xl">⭐</span>
              리뷰 평가 분석
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "benefits" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-base font-medium text-gray-700 mb-4">예약 시 제공되는 혜택</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border border-gray-100">
                      <div className={`w-6 h-6 ${benefit.bgColor} rounded-md flex items-center justify-center flex-shrink-0`}>
                        <benefit.icon className={`h-3 w-3 ${benefit.iconColor}`} />
                      </div>
                      <div className="text-xs text-gray-700">{benefit.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 호텔 상세 정보 섹션 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="mb-4">
                  <h4 className="text-base font-medium text-gray-700">호텔 상세 정보</h4>
                </div>
                
                {/* 접힌 상태 - 미리보기 */}
                {!isHotelInfoExpanded && introHtml && (
                  <div className="max-w-[70%] mx-auto">
                    <div className="relative h-20 overflow-hidden">
                      <div 
                        className="text-gray-600 text-sm leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: introHtml }}
                      />
                      {/* 그라데이션 오버레이 */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                )}
                
                {/* 펼쳐진 상태 - 전체 내용 */}
                {isHotelInfoExpanded && (
                  <div className="max-w-[70%] mx-auto">
                    {introHtml ? (
                      <div 
                        className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: introHtml }}
                      />
                    ) : (
                      <p className="text-gray-700 leading-relaxed">
                        {propertyDescription || `${hotelName}의 상세 정보가 아직 제공되지 않았습니다.`}
                      </p>
                    )}
                  </div>
                )}
                
                {/* 버튼 - 하단 가운데 */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => setIsHotelInfoExpanded(!isHotelInfoExpanded)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"
                  >
                    {isHotelInfoExpanded ? (
                      <>
                        <span>호텔정보 접기</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>호텔정보 더보기</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "introduction" && (
            <div className="space-y-4">
              <div className="prose max-w-none">
                {/* Property Details 표시 */}
                {introHtml ? (
                  <div className="max-w-[70%] mx-auto mb-6">
                    <div
                      className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: introHtml }}
                    />
                  </div>
                ) : (
                  <div className="max-w-[70%] mx-auto mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {propertyDescription || `${hotelName}의 상세 정보가 아직 제공되지 않았습니다.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "transportation" && (
            <div className="space-y-6">
              {locationHtml ? (
                <div className="prose max-w-none">
                  <div className="max-w-[70%] mx-auto mb-6">
                    <div
                      className="text-gray-700 leading-relaxed prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: locationHtml }}
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
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">호텔 위치</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">주소:</span> {propertyAddress}
                      </p>
                    </div>
                    <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
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
            </div>
          )}

          {activeTab === "articles" && (
            <div className="space-y-6">
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
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">관련 아티클</h3>
                    <p className="text-gray-600">{hotelName}과 관련된 아티클을 확인하세요</p>
                  </div>
                  
                  {articles.map((article, index) => (
                    <div key={article.slug} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="max-w-4xl mx-auto">
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
                      <div className="mt-4 pt-4 border-t border-gray-100">
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
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="text-center py-12">
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
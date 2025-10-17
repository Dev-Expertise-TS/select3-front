import { Metadata } from 'next'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Header } from '@/components/header'
import { PromotionBanner } from '@/components/promotion-banner'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'
import { KakaoChatButton } from '@/components/shared/kakao-chat-button'

export const metadata: Metadata = {
  title: '고객 후기 | 투어비스 셀렉트',
  description: '투어비스 셀렉트를 이용하신 고객들의 생생한 후기를 만나보세요.',
}

export const revalidate = 1800 // 30분마다 재검증

interface Testimonial {
  id: number
  content: string
  hotel: string
  bookingNumber: string
  slug: string
}

// 예약 번호 마스킹 함수 (첫 문자와 마지막 문자만 보이고 중간은 마스킹)
const maskBookingNumber = (bookingNumber: string): string => {
  if (!bookingNumber || bookingNumber.length <= 2) {
    return bookingNumber
  }
  const first = bookingNumber[0]
  const last = bookingNumber[bookingNumber.length - 1]
  const middle = '*'.repeat(bookingNumber.length - 2)
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

export default async function TestimonialsPage() {
  const supabase = await createClient()

  // select_satisfaction_survey와 select_hotels를 조인하여 slug 정보 가져오기
  // testimonials 페이지: pick 값과 무관하게 모든 데이터 가져오기
  const { data, error } = await supabase
    .from('select_satisfaction_survey')
    .select(`
      id,
      review_text,
      property_name_kr,
      booking_number,
      sabre_id,
      created_at,
      select_hotels!inner(slug)
    `)
    .not('review_text', 'is', null)
    .not('property_name_kr', 'is', null)
    .not('booking_number', 'is', null)
    .not('sabre_id', 'is', null)
    .order('created_at', { ascending: false })

  const allTestimonials: Testimonial[] = data
    ? data
        .filter((item: any) => item.select_hotels?.slug)
        .map((item: any) => ({
          id: item.id,
          content: item.review_text,
          hotel: item.property_name_kr,
          bookingNumber: item.booking_number,
          slug: item.select_hotels.slug,
        }))
    : []
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <PromotionBanner />
      {/* 프로모션 베너 아래 여백 */}
      <div style={{ paddingTop: '72px' }}></div>
      
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

        {/* 후기 그리드 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-16 sm:pb-20">
          {allTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {allTestimonials.map((testimonial) => (
                <Link
                  key={testimonial.id}
                  href={`/hotel/${testimonial.slug}`}
                  className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 block cursor-pointer"
                >
                  {/* 별점 */}
                  <div className="flex items-center mb-3 sm:mb-4">
                    {renderStars(5)}
                  </div>

                  {/* 리뷰 내용 - 높이 고정 */}
                  <blockquote className="text-sm text-gray-700 leading-relaxed mb-3 sm:mb-4 line-clamp-4 min-h-[5.5rem]">
                    {testimonial.content}
                  </blockquote>

                  {/* 고객 정보 */}
                  <div className="pt-3 sm:pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {testimonial.hotel}
                    </h4>
                    <p className="text-xs text-gray-500">
                      예약번호: {maskBookingNumber(testimonial.bookingNumber)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              아직 등록된 후기가 없습니다.
            </div>
          )}

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
              <KakaoChatButton text="카카오톡 상담" size="md" />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}


'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SatisfactionSurvey {
  id: number
  review_text: string
  property_name_kr: string
  booking_number: string
  sabre_id: string
  slug: string
  created_at: string
}

interface Testimonial {
  id: number
  content: string
  hotel: string
  bookingNumber: string
  slug: string
}

interface TestimonialsSectionProps {
  className?: string
}

export default function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)

  // 데이터 가져오기
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        const result = await response.json()
        
        if (result.success && result.data) {
          const transformedData: Testimonial[] = result.data.map((item: SatisfactionSurvey) => ({
            id: item.id,
            content: item.review_text,
            hotel: item.property_name_kr,
            bookingNumber: item.booking_number,
            slug: item.slug,
          }))
          setTestimonials(transformedData)
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

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

  // 스크롤 이벤트로 현재 인덱스 업데이트
  const handleScroll = () => {
    if (!scrollContainerRef.current || testimonials.length === 0) return
    const container = scrollContainerRef.current
    const scrollPosition = container.scrollLeft
    const maxScrollLeft = container.scrollWidth - container.clientWidth
    
    // 스크롤이 끝에 거의 도달했으면 마지막 인덱스로 설정
    if (scrollPosition >= maxScrollLeft - 10) {
      setCurrentIndex(testimonials.length - 1)
      return
    }
    
    // 첫 번째와 두 번째 카드 요소로 실제 간격 계산
    const firstCard = container.querySelector('[data-testimonial-card]') as HTMLElement
    const secondCard = container.querySelectorAll('[data-testimonial-card]')[1] as HTMLElement
    if (!firstCard || !secondCard) return
    
    // 두 카드의 offsetLeft 차이로 정확한 간격 계산 (카드 너비 + gap)
    const cardWithGap = secondCard.offsetLeft - firstCard.offsetLeft
    
    const newIndex = Math.round(scrollPosition / cardWithGap)
    setCurrentIndex(Math.min(newIndex, testimonials.length - 1))
  }

  // 마우스/터치 드래그 시작
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setDragDistance(0)
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    setStartX(pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  // 마우스/터치 드래그 중
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    const x = pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
    setDragDistance(Math.abs(walk))
  }

  // 마우스/터치 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // 클릭과 드래그를 구분하는 핸들러
  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    // 드래그 거리가 5px 이상이면 클릭 이벤트 무시
    if (dragDistance > 5) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current || testimonials.length === 0) return
    const container = scrollContainerRef.current
    
    // 마지막 인덱스인 경우 최대 스크롤 위치로 이동
    if (index === testimonials.length - 1) {
      const maxScrollLeft = container.scrollWidth - container.clientWidth
      container.scrollTo({
        left: maxScrollLeft,
        behavior: 'smooth'
      })
      return
    }
    
    // 첫 번째와 두 번째 카드 요소로 실제 간격 계산
    const firstCard = container.querySelector('[data-testimonial-card]') as HTMLElement
    const secondCard = container.querySelectorAll('[data-testimonial-card]')[1] as HTMLElement
    if (!firstCard || !secondCard) return
    
    // 두 카드의 offsetLeft 차이로 정확한 간격 계산 (카드 너비 + gap)
    const cardWithGap = secondCard.offsetLeft - firstCard.offsetLeft
    
    container.scrollTo({
      left: cardWithGap * index,
      behavior: 'smooth'
    })
  }

  // 이전 슬라이드로 이동
  const goToPrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    goToSlide(newIndex)
  }

  // 다음 슬라이드로 이동
  const goToNext = () => {
    const newIndex = Math.min(testimonials.length - 1, currentIndex + 1)
    goToSlide(newIndex)
  }

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

  if (isLoading) {
    return (
      <section className={cn("pt-4 sm:pt-6 pb-12 sm:pb-16 bg-white", className)}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              고객 후기
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              투어비스 셀렉트를 이용하신 고객들의 후기
            </p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return (
      <section className={cn("pt-4 sm:pt-6 pb-12 sm:pb-16 bg-white", className)}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              고객 후기
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              투어비스 셀렉트를 이용하신 고객들의 후기
            </p>
          </div>
          <div className="text-center py-12 text-gray-500">
            아직 등록된 후기가 없습니다.
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn("pt-4 sm:pt-6 pb-12 sm:pb-16 bg-white", className)}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            고객 후기
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            투어비스 셀렉트를 이용하신 고객들의 후기
          </p>
        </div>

        {/* 스크롤 컨테이너 */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
          {/* 이전 버튼 - 데스크탑에서만 표시 */}
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="이전 리뷰로 이동"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* 다음 버튼 - 데스크탑에서만 표시 */}
          <button
            onClick={goToNext}
            disabled={currentIndex === testimonials.length - 1}
            className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="다음 리뷰로 이동"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              paddingLeft: '1rem',
              paddingRight: '1rem',
            }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                data-testimonial-card
                className="flex-shrink-0 w-[85%] sm:w-[80%] md:w-[75%] lg:w-[45%] xl:w-[42%] snap-start"
              >
                <Link
                  href={`/hotel/${testimonial.slug}`}
                  onClick={(e) => handleCardClick(e, testimonial.slug)}
                  className="block bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8 h-full hover:shadow-lg transition-shadow duration-200"
                >
                  {/* 별점 */}
                  <div className="flex items-center mb-4">
                    {renderStars(5)}
                  </div>

                  {/* 리뷰 내용 - 높이 고정 */}
                  <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 line-clamp-4 min-h-[6rem]">
                    {testimonial.content}
                  </blockquote>

                  {/* 고객 정보 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {testimonial.hotel}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        예약번호: {maskBookingNumber(testimonial.bookingNumber)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            {/* 마지막 카드가 완전히 스크롤되도록 오른쪽 공간 확보 */}
            <div className="flex-shrink-0 w-[15%] sm:w-[20%] md:w-[25%] lg:w-[55%] xl:w-[58%]" aria-hidden="true"></div>
          </div>
        </div>

        {/* 인디케이터 도트 */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="p-2"
              aria-label={`리뷰 ${index + 1}로 이동`}
            >
              <span
                className={cn(
                  "block w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-orange-600 w-6"
                    : "bg-gray-400 hover:bg-gray-500"
                )}
              />
            </button>
          ))}
        </div>

        {/* 더 보기 버튼 */}
        <div className="text-center mt-8">
          <Link
            href="/testimonials"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            셀렉트 고객 후기 더 보기
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

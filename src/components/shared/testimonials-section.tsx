'use client'

import { useState, useEffect, useRef } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Testimonial {
  id: number
  name: string
  location: string
  rating: number
  content: string
  hotel: string
  date: string
  avatar?: string
}

interface TestimonialsSectionProps {
  className?: string
}

// 목업 데이터
const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    name: "김민수",
    location: "서울",
    rating: 5,
    content: "정말 환상적인 호텔이었습니다! 투어비스 셀렉트를 통해 예약했는데, 일반 예약으로는 절대 받을 수 없는 혜택들을 많이 받았어요. 특히 무료 업그레이드와 조식 서비스가 정말 좋았습니다.",
    hotel: "그랜드 하이엇 서울",
    date: "2024.01.15"
  },
  {
    id: 2,
    name: "이영희",
    location: "부산",
    rating: 5,
    content: "부산 출장 중에 투어비스 셀렉트를 통해 호텔을 예약했는데, 정말 놀라운 서비스였어요. 체크인 시 무료 업그레이드와 함께 환영 선물까지 받았습니다. 다음에도 꼭 이용하겠습니다!",
    hotel: "파크 하이엇 부산",
    date: "2024.01.20"
  },
  {
    id: 3,
    name: "박준호",
    location: "대구",
    rating: 5,
    content: "가족 여행으로 제주도에 갔는데, 투어비스 셀렉트 덕분에 정말 특별한 경험을 했습니다. 호텔 직원분들의 서비스도 최고였고, 추가 혜택들도 정말 만족스러웠어요.",
    hotel: "라군나 제주",
    date: "2024.01.25"
  },
  {
    id: 4,
    name: "최수진",
    location: "인천",
    rating: 5,
    content: "비즈니스 트립으로 싱가포르에 갔는데, 투어비스 셀렉트를 통해 예약한 호텔이 정말 훌륭했습니다. 무료 인터넷과 조식, 그리고 라운지 이용권까지 모든 것이 완벽했어요.",
    hotel: "마리나 베이 샌즈",
    date: "2024.02.01"
  },
  {
    id: 5,
    name: "정민철",
    location: "대전",
    rating: 5,
    content: "일본 여행에서 투어비스 셀렉트를 처음 이용했는데, 정말 후회없는 선택이었습니다. 호텔 서비스와 추가 혜택들이 기대 이상이었고, 다음 여행에서도 꼭 이용하고 싶어요.",
    hotel: "콘래드 도쿄",
    date: "2024.02.05"
  },
  {
    id: 6,
    name: "한소영",
    location: "광주",
    rating: 5,
    content: "태국 휴가를 위해 투어비스 셀렉트를 통해 호텔을 예약했는데, 정말 만족스러운 경험이었습니다. 무료 업그레이드와 스파 크레딧까지 받아서 정말 특별한 휴가가 되었어요.",
    hotel: "반얀 트리 방콕",
    date: "2024.02.10"
  }
]

export default function TestimonialsSection({ className }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // 이름 마스킹 함수 (중간 글자를 * 로 처리)
  const maskName = (name: string): string => {
    if (name.length <= 2) {
      return name[0] + '*'
    }
    const first = name[0]
    const last = name[name.length - 1]
    const middle = '*'.repeat(name.length - 2)
    return first + middle + last
  }

  // 스크롤 이벤트로 현재 인덱스 업데이트
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const scrollPosition = container.scrollLeft
    const cardWidth = container.offsetWidth * 0.85 // 카드 너비 (85%)
    const newIndex = Math.round(scrollPosition / cardWidth)
    setCurrentIndex(newIndex)
  }

  // 마우스/터치 드래그 시작
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
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
  }

  // 마우스/터치 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const goToSlide = (index: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cardWidth = container.offsetWidth * 0.85
    container.scrollTo({
      left: cardWidth * index,
      behavior: 'smooth'
    })
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
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 sm:px-6 lg:px-8 cursor-grab active:cursor-grabbing"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {mockTestimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="flex-shrink-0 w-[85%] sm:w-[80%] md:w-[75%] lg:w-[70%] snap-start"
              >
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8 h-full">
                  {/* 별점 */}
                  <div className="flex items-center mb-4">
                    {renderStars(testimonial.rating)}
                  </div>

                  {/* 리뷰 내용 */}
                  <blockquote className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                    {testimonial.content}
                  </blockquote>

                  {/* 고객 정보 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {maskName(testimonial.name)}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {testimonial.hotel} • {testimonial.date}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 인디케이터 도트 */}
        <div className="flex justify-center mt-6 space-x-2">
          {mockTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-orange-500 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`리뷰 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

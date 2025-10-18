'use client'

import Image from "next/image"
import { useAnalytics } from "@/hooks/use-analytics"

export function ContactContent() {
  const { trackEvent } = useAnalytics()

  const handleKakaoClick = () => {
    trackEvent('click', 'kakao_consultation', 'contact_page')
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'kakao_click',
        button_location: 'contact_page',
        button_type: 'consultation'
      })
    }
  }

  return (
    <main>
      {/* Hero (배경 이미지 + 카드) */}
      <section className="relative">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-images/contact-bg.jpg"
            alt="Contact Background"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>

        {/* 카드 */}
        <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20 md:py-24">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12">
            <div className="text-center space-y-4 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                문의하기
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                셀렉트에 대해 궁금한 내용을 문의주세요.<br />
                전문 상담사가 답변해드리겠습니다.
              </p>
              <a
                href="https://pf.kakao.com/_cxmxgNG/chat"
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleKakaoClick}
                className="block w-full text-center text-gray-900 font-bold rounded-xl h-12 sm:h-14 leading-[3rem] sm:leading-[3.5rem] shadow-md transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(180deg, #FFE44D 0%, #F4C800 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.08)'
                }}
              >
                카카오톡 상담
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 정보 섹션 */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* 운영 시간 */}
              <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">운영 시간</h2>
                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <p>평일: 09:00 - 18:00</p>
                  <p>주말 및 공휴일: 휴무</p>
                </div>
              </div>

              {/* 위치 */}
              <div className="bg-gray-50 rounded-xl p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">위치</h2>
                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <p>서울특별시 중구 남대문로 78, 8층 에이호</p>
                  <p className="text-xs sm:text-sm text-gray-500">(명동1가, 타임워크명동빌딩)</p>
                </div>
              </div>
            </div>

            {/* 추가 안내 */}
            <div className="mt-8 sm:mt-12 p-6 sm:p-8 bg-blue-50 rounded-xl">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">빠른 상담</h2>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                카카오톡 채널을 통해 빠르게 상담받으실 수 있습니다.<br className="hidden sm:block" />
                <span className="block sm:inline"> 호텔 예약, 혜택 문의 등 궁금하신 사항을 남겨주세요.</span>
              </p>
              <ul className="space-y-2 text-sm sm:text-base text-gray-600 list-disc list-inside">
                <li>호텔 예약 및 가격 문의</li>
                <li>특별 혜택 안내</li>
                <li>프로모션 문의</li>
                <li>기타 문의사항</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}


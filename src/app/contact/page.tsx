import type { Metadata } from "next"
import { Header } from "@/components/header"
// import { PromotionBanner } from "@/components/promotion-banner"
import { Footer } from "@/components/footer"
import Image from "next/image"

export const metadata: Metadata = {
  title: "문의하기 | 투어비스 셀렉트",
  description: "셀렉트에 대해 궁금한 내용을 문의주세요. 전문 상담사가 답변해드립니다.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main>
        {/* Hero (배경 이미지 + 카드) */}
        <section className="relative">
          {/* 배경 이미지 */}
          <Image
            src="/destination-image/bali.webp"
            alt="Contact Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          {/* 오른쪽 정렬 카드 (모바일 중앙) */}
          <div className="relative">
            <div className="container mx-auto max-w-[1440px] px-4 py-10 sm:py-14 md:py-16 flex">
              <div className="w-full sm:max-w-xl bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 ml-auto">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
                  Contacts
                </h1>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">
                  셀렉트에 대해 궁금한 내용을 문의주시면
                  <br className="hidden sm:block" />
                  전문 상담사가 답변해드리겠습니다.
                </p>
                <a
                  href="https://pf.kakao.com/_cxmxgNG/chat"
                  target="_blank"
                  rel="noopener noreferrer"
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

        {/* Actions section removed as requested */}

        {/* Tourvis Select 소개 (스타일 매칭) */}
        <section className="bg-white border-t">
          <div className="container mx-auto max-w-[1200px] px-4 py-14 sm:py-16">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">Tourvis Select</h2>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
                투어비스 셀렉트는 투어비스와 PRIVIA 여행 플랫폼을 개발하고 운영하는 한국 트래블
                <br className="hidden sm:block" />
                테크 기업 타이드스퀘어에서 제공하는 여행 서비스입니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              {/* 투어비스 카드 */}
              <a href="https://tourvis.com" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-gray-200 bg-white p-10 text-center hover:shadow-md transition-all w-full max-w-[520px]">
                <div className="flex items-center justify-center h-28 mb-6">
                  <Image src="/tidesquare/tourvis.webp" alt="투어비스" width={220} height={64} className="object-contain" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900 mb-3">투어비스</div>
                <p className="text-gray-600 leading-7">전 세계 여행 상품을 만날 수 있는 온라인 여행 중개 플랫폼입니다.</p>
                <span className="mt-5 inline-flex items-center text-gray-900 font-semibold">서비스 바로가기 <span className="ml-1">→</span></span>
              </a>

              {/* PRIVIA 카드 (중앙 회색 배경) */}
              <a href="https://www.privia.com" target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-gray-200 bg-white p-10 text-center hover:shadow-md transition-all w-full max-w-[520px]">
                <div className="flex items-center justify-center h-28 mb-6">
                  <Image src="/tidesquare/privia.png" alt="PRIVIA 여행" width={220} height={64} className="object-contain" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900 mb-3">PRIVIA 여행</div>
                <p className="text-gray-600 leading-7">프리미엄 여행 서비스와 카드사 제휴를 통한 혜택을 제공하는 종합 온라인 여행사입니다.</p>
                <span className="mt-5 inline-flex items-center text-gray-900 font-semibold">서비스 바로가기 <span className="ml-1">→</span></span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}



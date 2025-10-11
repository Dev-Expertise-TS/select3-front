import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone, Facebook, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto max-w-[1440px] px-4">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand/Logo Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-light text-gray-300">TOURVIS</div>
                <div className="text-2xl font-serif text-white">SELECT</div>
              </div>
              <p className="text-xs text-gray-400">
                Copyright © TIDESQUARE CO., LTD. All Right Reserved.
              </p>
            </div>

            {/* ALL MENUS Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">ALL MENUS</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <div className="space-y-2">
                  <Link href="/about" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    셀렉트 소개
                  </Link>
                  <Link href="/with-kids" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    아이와 함께
                  </Link>
                  <Link href="/hotel" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    호텔 & 리조트
                  </Link>
                  <Link href="/promotion" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    프로모션
                  </Link>
                  <Link href="/blog" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    블로그
                  </Link>
                  <a href="https://tourvis.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    투어비스
                  </a>
                </div>
                <div className="space-y-2">
                  <Link href="/contact" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    문의하기
                  </Link>
                  <Link href="/terms" className="block text-sm text-gray-300 hover:text-white transition-colors">
                    이용약관
                  </Link>
                </div>
              </div>
            </div>

            {/* SNS Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">SNS</h3>
              <div className="space-y-2">
                <a href="https://blog.naver.com/tourvis-select" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                  TOURVIS SELECT NAVER BLOG
                </a>
                <a href="https://www.instagram.com/luxuryhotel_select/" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                  TOURVIS SELECT INSTAGRAM
                </a>
                <a href="https://www.threads.com/@luxuryhotel_select" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                  TOURVIS SELECT THREADS
                </a>
                <a href="https://www.facebook.com/tourvis.official" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                  TOURVIS FACEBOOK
                </a>
                <a href="https://www.instagram.com/tourvis_official/" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                  TOURVIS INSTAGRAM
                </a>
                <a href="https://blog.naver.com/tourvis_official" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition-colors">
                  TOURVIS BLOG
                </a>
              </div>
            </div>

            {/* CONTACTS Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">CONTACTS</h3>
              <div className="space-y-3">
                <a
                  href="http://pf.kakao.com/_cxmxgNG/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-gray-300 hover:text-white transition-colors leading-relaxed no-underline"
                >
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-current" />
                  <span>카카오톡 전문 컨시어지 상담 연결</span>
                </a>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 leading-relaxed">
                    서울특별시 중구 남대문로 78, 8층 에이호<br />
                    (명동1가, 타임워크명동빌딩)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Side - Detailed Info */}
            <div className="space-y-3 text-xs text-gray-400">
              <p>고객센터 1833-3032 (해외 82-2-1833-3032) 평일 09:00~18:00, 주말·공휴일 휴무</p>
              <p>(주)타이드스퀘어 투어비스 | 대표이사 윤민 | 소재지 서울특별시 중구 남대문로 78, 8층 에이호(명동1가, 타임워크명동빌딩)</p>
              <p>사업자 등록번호 497-85-00706 사업자정보확인 | 관광사업등록증번호 제2015-000033호 | 통신판매업신고번호 제2017-서울중구-1310호</p>
              <p>전자우편주소 info@tidesquare.com | 팩스번호 02-6919-2051 | 여행업인허가 보증보험증 10억 | 기획보증 7억원</p>
              <p>Copyright © TIDESQUARE CO., LTD. All Right Reserved.</p>
            </div>

            {/* Right Side - Social Icons */}
            <div className="flex items-center gap-4">
              <a href="https://tourvis.com" target="_blank" rel="noopener noreferrer" title="투어비스" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <MapPin className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://www.facebook.com/tourvis.official" target="_blank" rel="noopener noreferrer" title="TOURVIS Facebook" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <Facebook className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://www.instagram.com/luxuryhotel_select/" target="_blank" rel="noopener noreferrer" title="TOURVIS SELECT Instagram" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <Instagram className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://blog.naver.com/tourvis-select" target="_blank" rel="noopener noreferrer" title="TOURVIS SELECT Blog" className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <span className="text-gray-400 hover:text-white transition-colors font-bold">B</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

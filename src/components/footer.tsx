import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto max-w-[1200px] px-4">

        {/* Legal & Brand */}
        <div className="py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-xs text-gray-500">
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="hover:text-blue-600 amex-transition">
              Privacy Statement
            </Link>
            <Link href="/terms" className="hover:text-blue-600 amex-transition">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="hover:text-blue-600 amex-transition">
              Accessibility
            </Link>
            <Link href="/security" className="hover:text-blue-600 amex-transition">
              Security Center
            </Link>
            <Link href="/sitemap" className="hover:text-blue-600 amex-transition">
              Site Map
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span>&copy; 2024 Tourvis Select Company. All rights reserved.</span>
          </div>
        </div>

        {/* Brand Statement */}
        <div className="pb-8 text-center">
          <div className="inline-flex items-center space-x-3 text-blue-600">
            <div className="w-9 h-9 bg-blue-600 rounded-sm flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">TS</span>
            </div>
            <div className="text-sm font-bold text-gray-700">Tourvis Select Fine Hotels + Resorts®</div>
          </div>
          <p className="text-xs text-gray-500 mt-2 max-w-2xl mx-auto">
            투어비스 럭셔리 셀렉트는 세계적 명성의 호텔 & 리조트에서만 누릴 수 있는 특별한 혜택과 경험을 제공합니다.
          </p>
        </div>
      </div>
    </footer>
  )
}

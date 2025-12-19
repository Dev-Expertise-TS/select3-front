import { Home, Tag, Building2, FileText, Hotel, LucideIcon, MessageCircle, MapPin, Star, Sparkles } from "lucide-react"
import { TourvisIcon } from "@/components/shared/icons/TourvisIcon"
import { KakaoIconAsLucide } from "@/components/shared/icons/KakaoIcon"

export interface NavigationSubItem {
  href: string
  label: string
  description?: string
}

export interface NavigationItem {
  href: string
  label: string
  mobileLabel?: string // 모바일에서 표시할 짧은 레이블
  icon?: LucideIcon
  mobileOnly?: boolean
  desktopOnly?: boolean
  hasDropdown?: boolean
  subItems?: NavigationSubItem[]
}

/**
 * 전체 네비게이션 아이템 설정
 * - Header와 BottomNav에서 공통으로 사용
 * - mobileLabel: 모바일 하단 네비게이션에서 사용할 짧은 텍스트
 */
export const navigationItems: NavigationItem[] = [
  { href: "/", label: "홈", icon: Home, mobileOnly: true },
  { href: "/about", label: "셀렉트 소개" },
  // 호텔 추천 메뉴 - 임시 숨김
  // { 
  //   href: "/hotel-recommendations", 
  //   label: "호텔 추천", 
  //   mobileLabel: "추천", 
  //   icon: Sparkles,
  //   hasDropdown: true,
  //   subItems: [] // 동적으로 로드됨
  // },
  { href: "/brand", label: "호텔 브랜드", mobileLabel: "브랜드", icon: Building2 },
  { href: "/promotion", label: "프로모션", mobileLabel: "프로모션", icon: Tag },
  { href: "/hotel", label: "전체 호텔", mobileLabel: "전체검색", icon: Hotel },
  // 신규 모바일 전용 메뉴
  { href: "https://pf.kakao.com/_cxmxgNG/chat", label: "예약상담", mobileLabel: "예약상담", icon: MessageCircle, mobileOnly: true },
  { href: "/testimonials", label: "고객 후기", mobileLabel: "고객후기", icon: Star },
  { href: "/hotel/region", label: "지역별 호텔", mobileLabel: "호텔지역", icon: MapPin },
  { href: "/blog", label: "아티클", mobileLabel: "아티클", icon: FileText },
  { href: "https://tourvis.com", label: "투어비스", mobileLabel: "투어비스", icon: (TourvisIcon as unknown as LucideIcon) },
]

/**
 * 모바일 하단 네비게이션용 아이템
 * 순서: 홈 → 프로모션 → 전체검색 → 예약상담 → 아티클 → 고객후기 → 전체메뉴
 */
export const mobileNavItems: NavigationItem[] = [
  { href: "/", label: "홈", mobileLabel: "홈", icon: Home, mobileOnly: true },
  { href: "/promotion", label: "프로모션", mobileLabel: "프로모션", icon: Tag },
  { href: "/hotel", label: "전체 호텔", mobileLabel: "전체검색", icon: Hotel },
  // 호텔 추천 메뉴 - 임시 숨김
  // { href: "/hotel-recommendations", label: "호텔 추천", mobileLabel: "추천", icon: Sparkles },
  { href: "https://pf.kakao.com/_cxmxgNG/chat", label: "예약상담", mobileLabel: "상담 및 예약", icon: KakaoIconAsLucide, mobileOnly: true },
  { href: "/blog", label: "아티클", mobileLabel: "아티클", icon: FileText },
  { href: "/testimonials", label: "고객 후기", mobileLabel: "고객후기", icon: Star },
]

/**
 * 데스크톱 헤더용 아이템 (모바일 전용 제외)
 */
// 데스크탑 전용 순서: 셀렉트 소개 → 고객 후기 → 호텔 추천 → 나머지
export const desktopNavItems = navigationItems
  .filter(item => !item.mobileOnly)
  .sort((a, b) => {
    const order = [
      "/about",                  // 셀렉트 소개
      "/testimonials",           // 고객 후기
      "/hotel-recommendations",  // 호텔 추천 (드롭다운)
      "/brand",
      "/promotion",
      "/hotel",
      "/hotel/region",
      "/blog",
      "https://tourvis.com",
    ]
    const idx = (href: string) => {
      const i = order.indexOf(href)
      return i === -1 ? 999 : i
    }
    return idx(a.href) - idx(b.href)
  })


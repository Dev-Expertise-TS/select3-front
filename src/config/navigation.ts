import { Home, Tag, Building2, FileText, Hotel, LucideIcon, MessageCircle, MapPin, Star } from "lucide-react"
import { TourvisIcon } from "@/components/shared/icons/TourvisIcon"

export interface NavigationItem {
  href: string
  label: string
  mobileLabel?: string // 모바일에서 표시할 짧은 레이블
  icon?: LucideIcon
  mobileOnly?: boolean
  desktopOnly?: boolean
}

/**
 * 전체 네비게이션 아이템 설정
 * - Header와 BottomNav에서 공통으로 사용
 * - mobileLabel: 모바일 하단 네비게이션에서 사용할 짧은 텍스트
 */
export const navigationItems: NavigationItem[] = [
  { href: "/", label: "홈", icon: Home, mobileOnly: true },
  { href: "/about", label: "셀렉트 소개" },
  { href: "/brand", label: "호텔 브랜드", mobileLabel: "브랜드", icon: Building2 },
  { href: "/promotion", label: "프로모션", mobileLabel: "프로모션", icon: Tag },
  { href: "/hotel", label: "전체 호텔", mobileLabel: "호텔검색", icon: Hotel },
  // 신규 모바일 전용 메뉴
  { href: "https://pf.kakao.com/_cxmxgNG/chat", label: "예약상담", mobileLabel: "예약상담", icon: MessageCircle, mobileOnly: true },
  { href: "/testimonials", label: "고객 후기", mobileLabel: "고객후기", icon: Star },
  { href: "/hotel/region", label: "지역별 호텔", mobileLabel: "지역별", icon: MapPin, desktopOnly: true },
  { href: "/blog", label: "아티클", mobileLabel: "아티클", icon: FileText, desktopOnly: true },
  { href: "https://tourvis.com", label: "투어비스", mobileLabel: "투어비스", icon: (TourvisIcon as unknown as LucideIcon) },
]

/**
 * 모바일 하단 네비게이션용 아이템 (브랜드 메뉴 제외, 아이콘이 있는 주요 메뉴만, 데스크톱 전용 제외)
 */
export const mobileNavItems = navigationItems.filter(
  item => item.icon !== undefined && item.href !== "/brand" && !item.desktopOnly
)

/**
 * 데스크톱 헤더용 아이템 (모바일 전용 제외)
 */
// 데스크탑 전용 순서: 셀렉트 소개 오른쪽에 고객 후기 배치
export const desktopNavItems = navigationItems
  .filter(item => !item.mobileOnly)
  .sort((a, b) => {
    const order = [
      "/about",          // 셀렉트 소개
      "/testimonials",   // 고객 후기 (오른쪽 위치)
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


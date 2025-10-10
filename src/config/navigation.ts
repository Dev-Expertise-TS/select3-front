import { Home, Tag, Building2, FileText, Hotel, LucideIcon, MessageCircle } from "lucide-react"
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
  { href: "/testimonials", label: "고객 후기" },
  { href: "/brand", label: "브랜드 & 프로그램", mobileLabel: "브랜드", icon: Building2 },
  { href: "/promotion", label: "프로모션", mobileLabel: "프로모션", icon: Tag },
  // 신규 모바일 전용 메뉴
  { href: "http://pf.kakao.com/_cxmxgNG/chat", label: "예약상담", mobileLabel: "예약상담", icon: MessageCircle, mobileOnly: true },
  { href: "/hotel", label: "호텔 & 리조트 전체보기", mobileLabel: "호텔검색", icon: Hotel },
  { href: "/blog", label: "아티클", mobileLabel: "아티클", icon: FileText },
  { href: "https://tourvis.com", label: "투어비스", mobileLabel: "투어비스", icon: (TourvisIcon as unknown as LucideIcon) },
]

/**
 * 모바일 하단 네비게이션용 아이템 (아이콘이 있는 주요 메뉴만)
 */
export const mobileNavItems = navigationItems.filter(
  item => item.icon !== undefined
)

/**
 * 데스크톱 헤더용 아이템 (모바일 전용 제외)
 */
export const desktopNavItems = navigationItems.filter(
  item => !item.mobileOnly
)


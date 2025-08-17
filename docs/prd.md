# Luxury Select 2.0 – Front Page Design PRD (Tailwind + shadcn/ui 매핑)

> 목적: AI 디자이너/개발자가 바로 시안을 생성·코드로 전환할 수 있도록 **디자인 토큰 → 레이아웃 → 컴포넌트 매핑 → 예시 코드 스켈레톤**까지 일관되게 제공

---

## 0) 브리프 & KPI

* **브랜드 포지션**: 프리미엄/큐레이션/신뢰성 중심의 럭셔리 호텔 셀렉션
* **핵심 행동 흐름**: 홈(검색·탐색) → 호텔 상세 → 예약 문의(카카오/전화/폼)
* **KPI**: 상세페이지 CTR +25%, 예약문의 CTA 클릭 +20%, 구독 +15%

---

## 1) 디자인 토큰 (Design Tokens)

**Color**

* `--ls-bg`: #0B0B0B (배경 다크)
* `--ls-surface`: #141414 (카드/섹션 배경)
* `--ls-text`: #F5F5F5 (본문 텍스트)
* `--ls-muted`: #B8B8B8 (세컨더리 텍스트)
* `--ls-accent`: #C7A14A (골드 포인트)
* `--ls-accent-contrast`: #0E0E0E
* `--ls-line`: #262626 (구분선)

**Typography**

* 타이틀: "Playfair Display" 또는 "Cormorant Garamond" (Fallback: serif)
* 본문: "Inter" 또는 "Pretendard" (Fallback: system-ui, sans-serif)
* 크기 스케일: `xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 4xl 36 / 5xl 48`
* 자간: 타이틀 -0.01em, 본문 0em

**Radius / Shadow**

* `--radius-xl`: 1.25rem (rounded-2xl)
* `--shadow-soft`: 0 8px 28px rgba(0,0,0,.28)

**Spacing**

* 섹션 패딩: `py-16 md:py-20 lg:py-24`
* 컨테이너: `mx-auto max-w-[1200px] px-4 md:px-6`

---

## 2) 레이아웃 그리드 & 반응형

* 모바일: 1열 / 태블릿: 6열 / 데스크탑: 12열 가이드
* 컨테이너: `max-w-[1200px]` (히어로 풀블리드 허용)
* 브레이크포인트: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`

---

## 3) 정보구조(IA) & 섹션 구성

1. **헤더**(고정) – 로고, 글로벌 네비(호텔, 브랜드/프로그램, 프로모션, 블로그), `예약 문의` 버튼
2. **히어로** – 풀스크린 이미지/비디오 + 슬로건 + Primary/Secondary CTA
3. **빠른 검색/탐색 바** – 목적지/호텔명, 날짜(기간), 인원 (초기엔 목적지/날짜만)
4. **추천 호텔 섹션** – 탭: 에디터 추천 / 신규 등록 / 한정 프로모션
5. **브랜드 & 프로그램** – 로고 슬라이더 + 혜택 하이라이트
6. **프로모션** – 카드/배너형 강조 블록
7. **블로그 & 인사이트** – 카드 리스트 3\~6개
8. **구독 & 상담 CTA** – 뉴스레터 구독, 카카오/전화 CTA
9. **푸터** – 카테고리 링크, 약관/정책, SNS

---

## 4) 컴포넌트 매핑 (shadcn/ui + Tailwind)

> 기본 전제: Next.js 15(App Router) + TypeScript + Tailwind + shadcn/ui 사용

### 4.1 헤더/내비게이션

* **구성요소**: Logo, NavigationMenu, Sheet(모바일 메뉴), Button(CTA)
* **shadcn**: `navigation-menu`, `sheet`, `button`
* **Tailwind**: 고정 헤더 `sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/45`

### 4.2 히어로 섹션

* **구성요소**: 배경(이미지/비디오), 타이틀/서브텍스트, CTA 2개
* **shadcn**: `button`, `badge`(혜택 꼬리표가 필요할 경우)
* **Tailwind**: `relative min-h-[72vh] md:min-h-[84vh] text-white` + 오버레이 `after:absolute after:inset-0 after:bg-gradient-to-t after:from-black/60`

### 4.3 검색/탐색 바

* **구성요소**: Combobox(목적지/호텔명), DateRangePicker, Submit CTA
* **shadcn**: `popover + calendar`(기간 선택), `command`(검색 추천), `input`, `button`
* **Tailwind**: 카드 스타일 `rounded-2xl bg-[var(--ls-surface)] p-3 md:p-4 shadow-[var(--shadow-soft)]`

### 4.4 호텔 카드(HotelCard)

* **구성요소**: 이미지(AspectRatio), 타이틀, 위치, 특전 Badge, CTA
* **shadcn**: `card`, `badge`, `aspect-ratio`, `button`
* **Tailwind**: `rounded-2xl overflow-hidden hover:shadow-xl transition hover:-translate-y-0.5`

### 4.5 탭 + 리스트

* **구성요소**: 탭 전환(추천/신규/프로모션), 카드 그리드
* **shadcn**: `tabs`, `card`
* **Tailwind**: 그리드 `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

### 4.6 브랜드 슬라이더

* **구성요소**: 로고 슬라이더, 툴팁(혜택 요약)
* **shadcn**: `tooltip`, `badge`
* **슬라이더 라이브러리**: `embla-carousel-react` 또는 `keen-slider` 권장

### 4.7 프로모션 배너/카드

* **구성요소**: 강조 배너, 타이틀/설명, CTA
* **shadcn**: `card`, `button`
* **Tailwind**: `bg-gradient-to-br from-[#1E1E1E] to-[#0F0F0F] border border-[var(--ls-line)]`

### 4.8 블로그 카드

* **구성요소**: 썸네일, 카테고리, 제목, 발행일
* **shadcn**: `card`, `badge`

### 4.9 구독 & 상담 CTA

* **구성요소**: Input(이메일), Button(구독), Button group(카카오/전화)
* **shadcn**: `input`, `button`, `toast`

### 4.10 푸터

* **구성요소**: 링크 그룹, 약관/정책, SNS
* **shadcn**: `separator`, `button`(아이콘 링크)

---

## 5) 상호작용 & 모션

* 카드 호버: `scale-[1.01]` + 그림자 강화, 이미지 `transition-transform duration-500 will-change-transform`
* 섹션 인뷰: `framer-motion`으로 `opacity/translate` 페이드업
* 버튼 호버: 배경/테두리 반전 (다크에서 골드 하이라이트)

---

## 6) 접근성 & 국제화

* 명도 대비 WCAG AA 준수(텍스트 vs 배경 4.5:1 이상)
* 키보드 포커스 스타일(Outline 커스텀) 유지
* 이미지 대체 텍스트 제공, 비디오에 자막/대체 이미지
* i18n(ko→en 확장 대비): 레이블/날짜포맷 별도 유틸

---

## 7) 데이터 모델(요약)

* `Hotel`: `id, name_ko, name_en, city, country, chain_id, brand_id, hero_image, benefits[]`
* `Benefit`: `id, code, label_ko, label_en`
* `Brand`: `id, name_ko, name_en, chain_id, perks[]`
* `Promotion`: `id, title, subtitle, date_range, hotel_ids[], image, cta`
* `Article`: `id, title, slug, excerpt, cover_image, published_at, tags[]`

---

## 8) 추적 이벤트(예시)

* `click_hero_cta` `{cta_label}`
* `search_submit` `{destination, start, end}`
* `click_hotel_card` `{hotel_id}`
* `click_consult_kakao` `{source_section}`
* `subscribe_newsletter` `{email_domain}`

---

## 9) AI 작업 지침 (v0.dev / Figma / 이미지 모델 공통)

* **고정 규칙**:

  1. 본문 배경은 다크, 골드 포인트는 절제 사용.
  2. 히어로는 풀블리드 사진 or 8\~12초 비디오 루프.
  3. 첫 화면 폴드 내에 ‘검색바’ 노출.
  4. 카드 모서리 큰 라운드(rounded-2xl), 그림자 절제.
* **생성 요청 프롬프트 템플릿**:

  * *“Create a luxury travel homepage hero with full-bleed imagery, elegant serif H1, subtle gold accent buttons, and a compact search bar (destination + date). Keep layout airy, dark background, minimal copy.”*
* **산출물 체크리스트**: 모바일/데스크톱 2종, 라이트/다크 1종 선택, 컴포넌트 상태(hover/focus/disabled)

---

## 10) 코드 스켈레톤 (Next.js 15 + shadcn/ui)

### 10.1 헤더

\`\`\`tsx
// app/(site)/_components/header.tsx
'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/45 border-b border-[var(--ls-line)]">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-[var(--ls-text)] font-semibold tracking-tight">Luxury Select</Link>
        <nav className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList className="text-sm text-[var(--ls-muted)]">
              <NavigationMenuItem><Link href="/hotels">호텔</Link></NavigationMenuItem>
              <NavigationMenuItem><Link href="/brands">브랜드·프로그램</Link></NavigationMenuItem>
              <NavigationMenuItem><Link href="/promotions">프로모션</Link></NavigationMenuItem>
              <NavigationMenuItem><Link href="/blog">블로그</Link></NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
        <div className="hidden md:flex gap-2">
          <Button className="bg-[var(--ls-accent)] text-[var(--ls-accent-contrast)] hover:opacity-90">예약 문의</Button>
        </div>
        <Sheet>
          <SheetTrigger className="md:hidden text-white"><Menu /></SheetTrigger>
          <SheetContent side="right" className="bg-black text-white">
            <div className="flex flex-col gap-4 mt-8">
              <Link href="/hotels">호텔</Link>
              <Link href="/brands">브랜드·프로그램</Link>
              <Link href="/promotions">프로모션</Link>
              <Link href="/blog">블로그</Link>
              <Button className="mt-4 bg-[var(--ls-accent)] text-[var(--ls-accent-contrast)]">예약 문의</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

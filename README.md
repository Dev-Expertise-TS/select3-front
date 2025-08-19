# Select3 Frontend

프리미엄 호텔 선택 플랫폼의 Next.js 15 기반 프론트엔드 애플리케이션입니다.

## 🏗️ 프로젝트 구조

이 프로젝트는 **cursor rules**에 따라 체계적으로 구성되어 있습니다:

```
src/
├── app/                    # Next.js 15 App Router
│   ├── brand/[brand]/     # 브랜드별 호텔 페이지
│   ├── destination/        # 목적지별 호텔 페이지
│   ├── hotel/             # 호텔 상세 페이지
│   ├── search-results/    # 검색 결과 페이지
│   └── test-select-hotels/ # 호텔 데이터 테스트 페이지
├── components/             # 공통 UI 컴포넌트
│   ├── ui/                # shadcn UI 컴포넌트
│   ├── shared/            # 공통 비즈니스 컴포넌트
│   ├── header.tsx         # 헤더 컴포넌트
│   └── footer.tsx         # 푸터 컴포넌트
├── features/               # 도메인별 기능 컴포넌트
│   ├── hotels/            # 호텔 관련 기능
│   ├── search/            # 검색 관련 기능
│   ├── brands/            # 브랜드 관련 기능
│   ├── destinations/      # 목적지 관련 기능
│   ├── hero.tsx           # 히어로 섹션
│   ├── promotion-section.tsx # 프로모션 섹션
│   ├── benefits-section.tsx  # 혜택 섹션
│   └── scroll-to-top.tsx  # 스크롤 탑 버튼
├── lib/                    # 서버 전용 유틸리티
│   ├── supabase/          # Supabase 클라이언트
│   ├── utils.ts           # 공통 유틸리티
│   ├── hotel-utils.ts     # 호텔 관련 유틸리티
│   └── supabase-utils.ts  # Supabase 관련 유틸리티
├── hooks/                  # 커스텀 React 훅
├── types/                  # TypeScript 타입 정의
├── config/                 # 설정 파일
├── providers/              # React Context Provider
├── styles/                 # 전역 스타일
└── scripts/                # 개발/테스트 스크립트
```

## 🎯 주요 기능

- **호텔 검색**: 한국어/영어/도시명으로 호텔 검색
- **브랜드별 호텔**: 마리어트, 하야트, 아만 등 프리미엄 브랜드
- **목적지별 호텔**: 태국, 도쿄 등 지역별 호텔 정보
- **프로모션**: 특별 혜택이 포함된 호텔 패키지
- **반응형 디자인**: 모바일과 데스크톱 최적화

## 🚀 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **State Management**: TanStack Query
- **Package Manager**: pnpm

## 📦 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 🔧 환경 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📋 Cursor Rules 적용 사항

### 1. 폴더 구조 규칙
- ✅ `src/app/`: Next.js 15 App Router 구조
- ✅ `src/components/`: 재사용 가능한 UI 컴포넌트
- ✅ `src/features/`: 도메인별 기능 컴포넌트
- ✅ `src/lib/`: 서버 전용 유틸리티
- ✅ `src/types/`: 전역 TypeScript 타입
- ✅ `src/config/`: 환경 설정 파일

### 2. ShadCN UI 컴포넌트
- ✅ `src/components/ui/`: shadcn 기본 컴포넌트
- ✅ `src/components/shared/`: 공통 비즈니스 컴포넌트
- ✅ Tailwind 기반 커스터마이징

### 3. TypeScript 규칙
- ✅ `.tsx` 파일에 JSX 사용
- ✅ `interface` 또는 `type` 기반 타입 정의
- ✅ Props 타입은 `ComponentNameProps` 명시
- ✅ 유틸 함수 리턴 타입 명시

### 4. 컴포넌트 작성 규칙
- ✅ 함수형 컴포넌트 사용
- ✅ Props는 상단에 정리
- ✅ `cn()` 유틸로 className 병합
- ✅ Named export 사용

## 🗄️ 데이터베이스 스키마

Supabase를 사용하여 다음 테이블들을 관리합니다:

- `select_hotels`: 호텔 기본 정보
- `select_hotel_media`: 호텔 미디어 (이미지)
- `select_feature_slots`: 특별 기능 슬롯
- `select_hotel_benefits`: 호텔 혜택 정보

## 🔍 검색 기능

- **다국어 지원**: 한국어, 영어, 도시명으로 검색
- **실시간 검색**: 타이핑 시 자동 검색 결과 업데이트
- **필터링**: 브랜드, 가격대, 편의시설별 필터링
- **정렬**: 평점, 가격, 거리별 정렬

## 🎨 UI/UX 특징

- **모던한 디자인**: 깔끔하고 직관적인 인터페이스
- **반응형 레이아웃**: 모든 디바이스에서 최적화된 경험
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **성능 최적화**: 이미지 최적화 및 코드 스플리팅

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
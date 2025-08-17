# Select3-Front - 호텔 예약 플랫폼

Next.js 15 기반 투어비스 셀렉트 애플리케이션.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI + Radix UI
- **Package Manager**: pnpm
- **React**: 19.1.1
- **Database**: Supabase
- **State Management**: TanStack Query
- **Authentication**: Supabase Auth

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js 15 App Router
│   ├── [brandName]/       # 브랜드별 호텔 페이지
│   ├── destination/[city]/ # 도시별 목적지 페이지
│   ├── hotel/[id]/        # 호텔 상세 페이지
│   ├── test-select-hotels/ # Supabase 테스트 페이지
│   └── layout.tsx         # 루트 레이아웃
├── components/             # 재사용 가능한 컴포넌트
│   ├── ui/                # ShadCN UI 컴포넌트
│   ├── shared/            # 공통 컴포넌트 (HotelCard, HotelCardGrid)
│   └── *.tsx              # 페이지별 컴포넌트
├── lib/                    # 유틸리티 함수
│   ├── supabase/          # Supabase 클라이언트
│   ├── supabase-utils.ts  # Supabase 유틸리티
│   ├── hotel-utils.ts     # 호텔 데이터 변환 유틸리티
│   └── utils.ts           # 공통 유틸리티
├── hooks/                  # 커스텀 훅
│   ├── use-hotels.ts      # 호텔 데이터 훅
│   └── use-hotel-media.ts # 호텔 미디어 훅
├── providers/              # React Provider
│   └── query-provider.tsx # TanStack Query Provider
├── scripts/                # 유틸리티 스크립트
│   ├── check-table-structure.ts # 테이블 구조 확인
│   ├── check-all-tables.ts      # 모든 테이블 확인
│   └── check-hotel-media.ts     # 호텔 미디어 확인
├── styles/                 # 전역 스타일
│   └── globals.css        # Tailwind CSS 설정
├── types/                  # TypeScript 타입 정의
│   └── env.d.ts           # 환경 변수 타입
└── config/                 # 설정 파일
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **select_hotels**: 호텔 기본 정보 (68개 컬럼)
- **select_hotel_media**: 호텔 미디어 (이미지, 동영상)
- **select_hotel_benefits**: 호텔 혜택 정보
- **select_hotel_benefits_map**: 호텔-혜택 매핑
- **select_feature_slots**: 프로모션 슬롯
- **sabre_rate_plan_codes**: 요금제 코드
- **select_import_rate**: 가격 정보

## 🛠️ 설치 및 실행

### 의존성 설치
```bash
pnpm install
```

### 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 개발 서버 실행
```bash
pnpm dev
```

### 프로덕션 빌드
```bash
pnpm build
```

### 프로덕션 서버 실행
```bash
pnpm start
```

### 테이블 구조 확인
```bash
pnpm check-table
pnpm check-all-tables
```

## 🎨 주요 기능

- 🏨 **호텔 검색 및 예약**: Supabase 기반 실시간 검색
- 🌍 **도시별 여행지 추천**: 동적 라우팅 기반 목적지 페이지
- 🏷️ **브랜드별 프로그램**: 브랜드별 호텔 그룹핑
- 📱 **반응형 디자인**: Tailwind CSS 기반 모던 UI
- 🎯 **프로모션 섹션**: 동적 데이터 기반 프로모션 표시
- 🔍 **실시간 검색**: TanStack Query 기반 데이터 페칭
- 🖼️ **이미지 최적화**: Next.js Image 컴포넌트 활용

## 🏗️ 아키텍처 특징

### 컴포넌트 구조
- **HotelCard**: 재사용 가능한 호텔 카드 컴포넌트
- **HotelCardGrid**: 호텔 카드 그리드 레이아웃
- **HotelCardGridSection**: 완전한 호텔 섹션 (제목, 그리드, 버튼)

### 데이터 페칭
- **TanStack Query**: 서버 상태 관리 및 캐싱
- **Supabase**: 실시간 데이터베이스 연동
- **TypeScript**: 타입 안전성 보장

### 상태 관리
- **React Hooks**: 로컬 상태 관리
- **TanStack Query**: 서버 상태 및 캐싱
- **Context**: 전역 상태 공유

## 📦 주요 라이브러리

- **@supabase/supabase-js**: Supabase 클라이언트
- **@supabase/ssr**: Next.js SSR 지원
- **@tanstack/react-query**: 데이터 페칭 및 캐싱
- **@tanstack/react-query-devtools**: 개발 도구
- **clsx**: 조건부 클래스명
- **tailwind-merge**: Tailwind 클래스 병합
- **lucide-react**: 아이콘 라이브러리

## 🔧 개발 환경

- **Node.js**: 18+
- **pnpm**: 8+
- **TypeScript**: 5.9.2+
- **Next.js**: 15.4.6
- **React**: 19.1.1
- **ESLint**: 코드 품질 관리

## 🚀 배포

### Vercel 배포
```bash
pnpm build
vercel --prod
```

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

## 📝 개발 가이드

### 새로운 컴포넌트 추가
1. `src/components/` 또는 `src/components/shared/`에 생성
2. TypeScript 인터페이스 정의
3. Tailwind CSS 클래스 사용
4. ShadCN UI 컴포넌트 활용

### Supabase 테이블 추가
1. `src/lib/supabase.ts`에 타입 정의
2. `src/lib/supabase-utils.ts`에 유틸리티 함수 추가
3. `src/hooks/`에 커스텀 훅 생성

### 스타일 커스터마이징
1. `src/styles/globals.css`에서 전역 스타일 정의
2. `tailwind.config.ts`에서 테마 확장
3. 컴포넌트별 Tailwind 클래스 사용

## 🤝 프로젝트 참여방법

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항 : CX 김재우

---

**Select3-Front** - Global No. 1 프리미업 호텔 컨시어지 플랫폼 🏨✨
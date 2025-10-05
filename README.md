# 🏨 Select 3.0 - Luxury Hotel Platform

> **프리미엄 호텔 큐레이션 플랫폼** - AI 기반 호텔 추천과 브랜드별 특별 혜택을 제공하는 Next.js 15 기반 웹 애플리케이션

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.12-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.55.0-green?style=flat-square&logo=supabase)](https://supabase.com/)

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [환경 설정](#-환경-설정)
- [개발 가이드](#-개발-가이드)
- [API 문서](#-api-문서)
- [배포](#-배포)
- [기여하기](#-기여하기)

## 🎯 프로젝트 개요

Select 3.0은 프리미엄 호텔 브랜드와 리조트를 큐레이션하여 사용자에게 맞춤형 추천을 제공하는 플랫폼입니다. AI 기반 검색, 브랜드별 특별 혜택, 그리고 상세한 호텔 정보를 통해 사용자의 럭셔리 여행 경험을 향상시킵니다.

### 핵심 가치
- **프리미엄 큐레이션**: 엄선된 럭셔리 호텔 브랜드만을 선별
- **AI 기반 추천**: 사용자 선호도와 여행 스타일에 맞는 맞춤형 추천
- **브랜드 특별 혜택**: 각 호텔 체인별 독점적인 혜택과 프로모션
- **신뢰성**: 검증된 호텔 정보와 투명한 가격 정책

## ✨ 주요 기능

### 🏠 **홈페이지**
- **히어로 섹션**: 동적 이미지 캐러셀과 검색 기능
- **브랜드 쇼케이스**: 주요 호텔 체인 브랜드 소개
- **프로모션 배너**: 특별 혜택과 이벤트 안내
- **목적지별 추천**: 인기 여행지별 호텔 추천

### 🔍 **호텔 검색 & 필터링**
- **다중 검색 옵션**: 호텔명, 도시, 브랜드, 체인별 검색
- **고급 필터**: 가격대, 위치, 브랜드, 체인, 혜택별 필터링
- **실시간 검색**: 타이핑과 동시에 결과 업데이트
- **검색 결과 최적화**: 관련도와 인기도 기반 정렬

### 🏨 **호텔 상세 페이지**
- **풍부한 미디어**: 고화질 이미지 갤러리와 360도 뷰
- **상세 정보**: 객실, 시설, 서비스, 위치 정보
- **브랜드 혜택**: 체인별 특별 혜택과 멤버십 혜택
- **리뷰 & 평점**: 실제 투숙객 리뷰와 평점 시스템
- **예약 문의**: 다양한 예약 채널 (카카오톡, 전화, 온라인 폼)

### 🏢 **브랜드 페이지**
- **체인별 호텔 목록**: 브랜드별 호텔 컬렉션
- **브랜드 스토리**: 각 체인의 역사와 철학
- **관련 아티클**: 브랜드와 연관된 콘텐츠
- **특별 혜택**: 브랜드별 독점 혜택 안내

### 📝 **블로그 & 콘텐츠**
- **여행 가이드**: 목적지별 여행 팁과 가이드
- **호텔 리뷰**: 상세한 호텔 리뷰와 경험담
- **브랜드 스토리**: 호텔 브랜드의 역사와 특별함
- **여행 트렌드**: 최신 여행 트렌드와 인사이트

### 🤖 **AI 기능**
- **스마트 검색**: 자연어 기반 호텔 검색
- **개인화 추천**: 사용자 선호도 기반 호텔 추천
- **가격 예측**: 시즌별 가격 트렌드 분석
- **여행 계획**: AI 기반 여행 일정 제안

## 🛠 기술 스택

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 4.1.12
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### **External APIs**
- **Hotel Data**: Sabre API
- **AI Services**: OpenAI GPT
- **Image Optimization**: Next.js Image Optimization

### **Development Tools**
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js Build System

## 📁 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # 페이지 라우트
│   │   ├── page.tsx             # 홈페이지
│   │   ├── brands/              # 브랜드 페이지
│   │   ├── brand/[chain]/       # 특정 브랜드 페이지
│   │   ├── hotel/[slug]/        # 호텔 상세 페이지
│   │   ├── blog/                # 블로그 페이지
│   │   └── search-results/      # 검색 결과 페이지
│   └── api/                     # API 라우트
│       ├── hotels/              # 호텔 관련 API
│       ├── brands/              # 브랜드 관련 API
│       ├── blogs/               # 블로그 관련 API
│       └── openai/              # AI 관련 API
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                      # shadcn/ui 기본 컴포넌트
│   ├── shared/                  # 공통 컴포넌트
│   ├── header.tsx               # 헤더 컴포넌트
│   └── footer.tsx               # 푸터 컴포넌트
├── features/                    # 도메인별 기능 컴포넌트
│   ├── hotels/                  # 호텔 관련 기능
│   ├── brands/                  # 브랜드 관련 기능
│   ├── blog/                    # 블로그 관련 기능
│   └── search/                  # 검색 관련 기능
├── lib/                         # 유틸리티 및 설정
│   ├── supabase/                # Supabase 클라이언트
│   ├── utils.ts                 # 공통 유틸리티
│   └── hotel-utils.ts           # 호텔 관련 유틸리티
├── hooks/                       # 커스텀 훅
├── types/                       # TypeScript 타입 정의
├── styles/                      # 전역 스타일
└── providers/                   # React Context 프로바이더
```

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: 18.0.0 이상
- **pnpm**: 8.0.0 이상 (권장)
- **Git**: 최신 버전

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone https://github.com/your-org/select3-front.git
   cd select3-front
   ```

2. **의존성 설치**
   ```bash
   pnpm install
   ```

3. **환경 변수 설정**
   ```bash
   cp .env.example .env.local
   # .env.local 파일을 편집하여 필요한 환경 변수 설정
   ```

4. **개발 서버 실행**
   ```bash
   pnpm dev
   ```

5. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 사용 가능한 스크립트

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅 검사
pnpm lint

# 타입 체크
pnpm type-check

# 데이터베이스 테이블 구조 확인
pnpm check-table

# 프로모션 테이블 확인
pnpm check-promotion-tables
```

## ⚙️ 환경 설정

### 환경 변수

`.env.local` 파일에 다음 환경 변수들을 설정해야 합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI 설정 (AI 기능용)
OPENAI_API_KEY=your_openai_api_key

# Sabre API 설정 (호텔 데이터용)
SABRE_CLIENT_ID=your_sabre_client_id
SABRE_CLIENT_SECRET=your_sabre_client_secret

# 기타 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase 설정

1. **Supabase 프로젝트 생성**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - 프로젝트 URL과 API 키 확인

2. **데이터베이스 스키마 설정**
   ```bash
   # 스키마 파일 실행
   psql -h your-db-host -U postgres -d postgres -f supabase-schema.sql
   ```

3. **Storage 버킷 설정**
   - `hotel-images` 버킷 생성
   - 공개 읽기 권한 설정

## 🛠 개발 가이드

### 코딩 컨벤션

#### **TypeScript**
- 엄격한 타입 체크 사용
- `any` 타입 사용 금지
- 인터페이스는 `PascalCase`로 명명
- 함수는 `camelCase`로 명명

#### **React 컴포넌트**
- 함수형 컴포넌트 사용
- Props 인터페이스는 `ComponentNameProps`로 명명
- `export default` 대신 named export 사용

#### **스타일링**
- Tailwind CSS 클래스 사용
- `cn()` 유틸리티로 클래스 병합
- 컴포넌트별 스타일은 해당 파일에 정의

#### **파일 구조**
```
src/
├── components/
│   ├── ui/                    # shadcn/ui 기본 컴포넌트
│   └── shared/                # 공통 컴포넌트
├── features/                  # 도메인별 기능
│   └── [domain]/
│       ├── components/        # 도메인별 컴포넌트
│       ├── hooks/            # 도메인별 훅
│       └── types.ts          # 도메인별 타입
└── lib/                      # 유틸리티
```

### 컴포넌트 개발

#### **새 컴포넌트 생성**
```tsx
// components/shared/MyComponent.tsx
import { cn } from "@/lib/utils"

interface MyComponentProps {
  title: string
  className?: string
}

export function MyComponent({ title, className }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h2>{title}</h2>
    </div>
  )
}
```

#### **shadcn/ui 컴포넌트 추가**
```bash
# 새 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### API 개발

#### **API 라우트 생성**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
```

### 데이터베이스 작업

#### **Supabase 클라이언트 사용**
```typescript
// lib/supabase/server.ts (서버 사이드)
import { createClient } from '@supabase/supabase-js'

export async function createClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// lib/supabase/client.ts (클라이언트 사이드)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

## 📚 API 문서

### 호텔 관련 API

#### **GET /api/hotels**
호텔 목록 조회

**Query Parameters:**
- `q`: 검색어 (선택)
- `city`: 도시 필터 (선택)
- `brand`: 브랜드 필터 (선택)
- `chain`: 체인 필터 (선택)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 12)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sabre_id": 12345,
      "property_name_ko": "호텔명",
      "property_name_en": "Hotel Name",
      "city": "서울",
      "brand_name_en": "Marriott",
      "image_1": "https://...",
      "benefit": "특별 혜택"
    }
  ],
  "meta": {
    "count": 100,
    "page": 1,
    "pageSize": 12
  }
}
```

#### **GET /api/hotels/[sabreId]**
특정 호텔 상세 정보 조회

#### **GET /api/hotels/[sabreId]/blogs**
호텔 관련 아티클 조회

### 브랜드 관련 API

#### **GET /api/brands/[chainId]/articles**
브랜드별 관련 아티클 조회

### 블로그 관련 API

#### **GET /api/blogs**
블로그 목록 조회

#### **GET /api/blogs/[slug]**
특정 블로그 상세 조회

## 🚀 배포

### Vercel 배포 (권장)

1. **Vercel 프로젝트 연결**
   ```bash
   npx vercel
   ```

2. **환경 변수 설정**
   - Vercel 대시보드에서 환경 변수 설정
   - 프로덕션용 Supabase URL과 키 설정

3. **자동 배포 설정**
   - GitHub 저장소와 연결
   - `main` 브랜치 푸시 시 자동 배포

### Docker 배포

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Docker 이미지 빌드 및 실행
docker build -t select3-front .
docker run -p 3000:3000 select3-front
```

## 🤝 기여하기

### 기여 방법

1. **Fork** 저장소
2. **Feature 브랜치** 생성 (`git checkout -b feature/AmazingFeature`)
3. **변경사항 커밋** (`git commit -m 'Add some AmazingFeature'`)
4. **브랜치 푸시** (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

### 커밋 컨벤션

```
type(scope): subject

feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 설정 변경
```

### Pull Request 가이드라인

- 명확한 제목과 설명 작성
- 변경사항에 대한 상세한 설명
- 관련 이슈 번호 링크
- 스크린샷 또는 데모 추가 (UI 변경 시)
- 테스트 완료 확인

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/your-org/select3-front/issues)
- **문서**: [프로젝트 위키](https://github.com/your-org/select3-front/wiki)
- **이메일**: support@select3.com

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받아 만들어졌습니다:

- [Next.js](https://nextjs.org/) - React 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - UI 컴포넌트 라이브러리
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [TanStack Query](https://tanstack.com/query) - 데이터 페칭 라이브러리

---

**Select 3.0** - 프리미엄 호텔 큐레이션의 새로운 기준을 제시합니다. 🏨✨
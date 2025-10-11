# Select 3.0 - Product Requirements Document (PRD)

**문서 버전**: 1.0  
**작성일**: 2025-10-11
**작성자**: 창조자 김재우 
**프로젝트**: Select3 Front 창조
**프로젝트 상태**: ✅ 창조 완료


---

## 📋 목차

1. [개요](#1-개요)
2. [비즈니스 목표](#2-비즈니스-목표)
3. [사용자 페르소나](#3-사용자-페르소나)
4. [핵심 기능](#4-핵심-기능)
5. [기술 스펙](#5-기술-스펙)
6. [UI/UX 가이드](#6-uiux-가이드)
7. [데이터 구조](#7-데이터-구조)
8. [API 명세](#8-api-명세)
9. [성능 요구사항](#9-성능-요구사항)
10. [보안 및 개인정보](#10-보안-및-개인정보)
11. [향후 로드맵](#11-향후-로드맵)

---

## 1. 개요

### 1.1 프로젝트 비전
Select 3.0은 **프리미엄 럭셔리 호텔 큐레이션 플랫폼**으로, AI 기반 검색과 브랜드별 특별 혜택을 통해 사용자에게 최상의 호텔 예약 경험을 제공합니다.

### 1.2 핵심 가치 제안
- 🏆 **엄선된 럭셔리 호텔**: 세계 최고급 호텔 브랜드만 선별
- 🤖 **AI 기반 추천**: GPT-4 기반 맞춤형 호텔 추천
- 🎁 **독점 혜택**: 각 브랜드별 특별 프로모션 제공
- 📱 **완벽한 모바일 경험**: 반응형 디자인과 모바일 최적화

### 1.3 서비스 범위
- **지역**: 전세계 주요 도시 (아시아, 유럽, 북미, 오세아니아)
- **호텔 브랜드**: Marriott, Hilton, IHG, Hyatt, Accor 등 글로벌 체인
- **가격대**: 프리미엄 ~ 울트라 럭셔리 ($200 이상/박)

---

## 2. 비즈니스 목표

### 2.1 주요 KPI
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 월간 활성 사용자 (MAU) | 10,000명 | Google Analytics |
| 평균 세션 시간 | 5분 이상 | GA Session Duration |
| 예약 전환율 | 2.5% | Booking/Visit Ratio |
| AI 검색 사용률 | 30% | Search Type Tracking |
| 모바일 트래픽 비율 | 60% | Device Category |

### 2.2 비즈니스 모델
- **커미션 기반**: 예약 성사 시 호텔/OTA로부터 커미션 수취
- **프로모션 수익**: 브랜드 프로모션 배너 광고
- **프리미엄 멤버십**: (향후) 독점 혜택 제공

---

## 3. 사용자 페르소나

### 3.1 Primary Persona: "프리미엄 여행자 지수"
- **나이**: 35-50세
- **직업**: 기업 임원, 전문직
- **소득**: 연소득 1억 이상
- **여행 빈도**: 연 5-8회 (해외 3-5회)
- **니즈**: 
  - 검증된 럭셔리 호텔 정보
  - 브랜드 멤버십 혜택 최대화
  - 빠르고 신뢰할 수 있는 예약 프로세스

### 3.2 Secondary Persona: "허니문 여행자 민지"
- **나이**: 28-35세
- **상황**: 신혼여행 준비 중
- **예산**: 500-1000만원
- **니즈**:
  - 로맨틱하고 특별한 호텔
  - 자세한 사진과 리뷰
  - 예약 상담 서비스

### 3.3 Tertiary Persona: "비즈니스 여행자 현우"
- **나이**: 30-45세
- **직업**: 외국계 기업 직원
- **여행 빈도**: 월 2-3회 출장
- **니즈**:
  - 비즈니스 편의시설 정보
  - 브랜드 로열티 프로그램 연계
  - 빠른 검색과 예약

---

## 4. 핵심 기능

### 4.1 홈페이지

#### 4.1.1 히어로 캐러셀
**목적**: 시각적 임팩트와 주요 호텔 노출

**기능 명세**:
- 3-4개의 프리미엄 호텔 이미지 자동 슬라이드
- 모바일: 1개씩 슬라이드, 랜덤 순서
- 데스크톱: 3-4개 그리드 뷰
- 각 슬라이드 클릭 시 호텔 상세 페이지로 이동
- 이미지 비율: 모바일 4:2, 데스크톱 4:3
- 자동 전환 간격: 5초 (모바일 6.2초)
- 브랜드 배지 표시 (왼쪽 상단)

**데이터 소스**:
```typescript
// select_hotel_media 테이블에서 image_seq 순으로 조회
// 호텔당 1개 이미지 (대표 이미지)
```

#### 4.1.2 통합 검색바
**목적**: 호텔/아티클 통합 검색 제공

**기능 명세**:
- 입력 시 실시간 추천 리스트 표시
- 추천 리스트 탭: 전체 / 지역 / 호텔 / 아티클
- 검색어 자동완성 (한글/영문 지원)
- 엔터 또는 검색 버튼: `/search?q=...`로 이동
- 추천 항목 클릭: 해당 페이지로 직접 이동
- 모바일: 포커스 시 sticky top
- 클리어 버튼 (X) 제공

**검색 로직**:
```typescript
// 지역 검색: select_regions (city_ko, city_en, country_ko, country_en)
// 호텔 검색: select_hotels (property_name_ko, property_name_en, city_ko)
// 아티클 검색: select_hotel_blogs (main_title, sub_title, slug)
```

#### 4.1.3 프로모션 배너 (띠배너)
**목적**: 현재 진행 중인 호텔 프로모션 노출

**기능 명세**:
- 상단 고정 (스크롤 시 sticky)
- 호텔 이미지 + 호텔명 + 프로모션 내용
- 2개 이상 프로모션: 5초 간격 자동 슬라이드
- 좌우 화살표로 수동 전환
- 클릭 시 해당 호텔 상세 페이지 이동
- 닫기 버튼 (X) 제공

**데이터 로직**:
```typescript
// select_hotels에서 publish=true AND promotion=true
// 현재 날짜가 promotion_start_date ~ promotion_end_date 사이
// KST 기준으로 날짜 비교
```

#### 4.1.4 브랜드 프로그램 섹션
**목적**: 주요 호텔 체인 브랜드 소개

**기능 명세**:
- 그리드 레이아웃 (데스크톱 4열, 모바일 2열)
- 각 브랜드 카드: 로고 이미지 + 브랜드명
- 클릭 시 브랜드별 호텔 리스트 페이지로 이동
- 총 16개 주요 브랜드 표시

**포함 브랜드**:
```
Accor Live Limitless, Aman, Capella, Heavens Portfolio,
Hilton, Hyatt, IHG, Leading Hotels of the World,
Mandarin Oriental, Marriott Bonvoy, Melia Rewards,
Pacific, Platinum, Preferred Hotels & Resorts,
Shangri-La Circle, Virtuoso
```

#### 4.1.5 인기 목적지 섹션
**목적**: 지역별 호텔 추천

**기능 명세**:
- 카드 레이아웃 (이미지 + 도시명 + 호텔 수)
- 클릭 시 `/hotel?city=CITY_CODE&country=COUNTRY_CODE`로 이동
- 주요 12개 도시 표시
- 이미지 소스: `/destination-image/` 또는 `select_city_media`

**주요 도시**:
```
도쿄, 오사카, 교토, 후쿠오카, 방콕, 다낭, 푸켓,
발리, 싱가포르, 홍콩, 하와이, 런던, 로마
```

#### 4.1.6 혜택 안내 섹션
**목적**: Select 플랫폼의 차별화된 혜택 설명

**내용**:
- 업그레이드 혜택
- 조식 서비스
- 얼리 체크인/레이트 체크아웃
- 호텔 크레딧
- 웰컴 어메니티

#### 4.1.7 고객 후기 섹션
**목적**: 신뢰도 향상

**기능 명세**:
- 슬라이드 형식 (3-4개씩 표시)
- 각 후기: 고객명 + 별점 + 후기 내용 + 호텔명

---

### 4.2 호텔 검색 & 필터링

#### 4.2.1 호텔 전체보기 페이지 (`/hotel`)
**목적**: 모든 호텔 목록 조회 및 필터링

**기능 명세**:
- 상단: 필터 영역 (도시, 국가, 브랜드, 체인)
- 호텔 그리드: 카드 레이아웃 (데스크톱 3-4열, 모바일 1열)
- 무한 스크롤 또는 페이지네이션
- 정렬 옵션: 추천순, 가격순, 별점순
- URL 쿼리 파라미터로 필터 상태 관리
  ```
  /hotel?city=TOKYO&brand=MARRIOTT&country=JAPAN
  ```

**호텔 카드 구성**:
- 호텔 이미지 (16:9 비율)
- 호텔명 (한글 + 영문)
- 위치 (도시, 국가)
- 브랜드 배지
- 혜택 목록 (최대 3개)
- 프로모션 배지 (해당 시)
- "자세히 보기" 버튼

**필터 옵션**:
```typescript
{
  city: string[]        // 도시 코드
  country: string[]     // 국가 코드
  brand: string[]       // 브랜드명
  chain: string[]       // 체인 ID
}
```

**데이터 조회**:
```typescript
// select_hotels 테이블
// publish = true인 호텔만 표시
// 필터 조건에 맞게 WHERE 절 구성
```

#### 4.2.2 지역별 호텔 페이지 (`/hotel/region`)
**목적**: 지역 중심으로 호텔 탐색

**기능 명세**:
- 지역 카드 그리드 (이미지 + 지역명 + 호텔 수)
- 클릭 시 해당 지역의 호텔 리스트 페이지로 이동
- 대륙별 그룹핑 (아시아, 유럽, 북미 등)

**데이터 소스**:
```typescript
// select_regions 테이블
// status = 'active', region_type = 'city'
// 호텔 수는 select_hotels에서 COUNT
```

---

### 4.3 호텔 상세 페이지

#### 4.3.1 호텔 상세 페이지 (`/hotel/[slug]`)
**목적**: 호텔의 모든 정보를 상세히 제공

**URL 구조**:
```
/hotel/park-hyatt-tokyo
/hotel/mandarin-oriental-bangkok
```

**페이지 구성**:

##### a) 이미지 갤러리
- 히어로 이미지 (상단 전체 너비)
- 썸네일 그리드 (클릭 시 라이트박스 열림)
- 이미지 소스: `select_hotel_media` 테이블
- 최대 30-50개 이미지 표시
- 모바일: 스와이프 갤러리

##### b) 호텔 기본 정보
```typescript
{
  property_name_ko: string      // 호텔명 (한글)
  property_name_en: string      // 호텔명 (영문)
  city_ko: string               // 도시 (한글)
  city_en: string               // 도시 (영문)
  country_ko: string            // 국가 (한글)
  property_address: string      // 주소
  phone: string                 // 전화번호
  latitude: number              // 위도
  longitude: number             // 경도
}
```

##### c) 브랜드 정보
- 브랜드 로고
- 체인명 (Marriott Bonvoy, Hyatt 등)
- 브랜드 설명

##### d) 호텔 소개
- `property_details` 필드 (HTML 렌더링)
- 호텔 특징, 시설, 서비스 설명

##### e) 혜택 목록
```typescript
// select_hotel_benefits_map 조인으로 조회
benefits: [
  "객실 업그레이드 (가능 시)",
  "2인 조식 서비스",
  "얼리 체크인 / 레이트 체크아웃",
  "호텔 크레딧 $100",
  "웰컴 어메니티",
  "무료 WiFi"
]
```
- 아이콘 + 텍스트 형식
- 최대 6개 표시

##### f) 프로모션 정보
- 현재 진행 중인 프로모션 표시
- 프로모션 타이틀
- 프로모션 설명
- 유효 기간
- 조건 및 혜택

##### g) 객실 & 요금 (Sabre API 연동)
**기능 명세**:
- 날짜 선택 (체크인/체크아웃)
- 인원 선택 (성인/어린이)
- Rate Plan Code 선택 (드롭다운)
- "검색" 버튼 클릭 시 Sabre API 호출
- 결과 테이블:
  ```typescript
  {
    RoomTypeDescription: string    // 객실 타입
    RatePlanName: string          // 요금제명
    AmountBeforeTax: number       // 세전 금액
    TaxAmount: number             // 세금
    AmountAfterTax: number        // 세후 총액
    CurrencyCode: string          // 통화
    RateKey: string               // 예약 키 (JSON)
  }
  ```
- 금액순 정렬
- "JSON 복사" 버튼 (RateKey 복사 기능)

##### h) 지도
- Google Maps 임베드 (또는 Kakao Map)
- 호텔 위치 마커 표시
- 주변 관광지, 레스토랑 정보

##### i) 관련 아티클
- 해당 호텔이 언급된 블로그 아티클 리스트
- 카드 형식 (이미지 + 제목)
- 클릭 시 아티클 상세로 이동

##### j) 예약 문의 (CTA)
```html
1. 카카오톡 상담 버튼
   - 링크: http://pf.kakao.com/_cxmxgNG/chat
   - 노란색 버튼, 카카오 로고

2. 전화 상담 버튼
   - 전화번호 표시
   - 클릭 시 전화 걸기

3. 온라인 문의 폼
   - 이름, 이메일, 전화번호
   - 체크인/체크아웃 날짜
   - 인원
   - 요청사항
   - "문의하기" 버튼
```

**데이터 조회**:
```typescript
// 1. select_hotels 테이블에서 slug로 호텔 정보 조회
// 2. select_hotel_media에서 이미지 목록 조회 (image_seq 순)
// 3. select_hotel_benefits_map 조인으로 혜택 조회
// 4. select_hotel_blogs에서 관련 아티클 조회 (sabre_id 기준)
// 5. Sabre API로 실시간 요금 조회 (선택 사항)
```

---

### 4.4 브랜드 페이지

#### 4.4.1 브랜드 목록 페이지 (`/brand`)
**목적**: 모든 호텔 브랜드 소개

**기능 명세**:
- 브랜드 카드 그리드 (로고 + 브랜드명)
- 클릭 시 브랜드별 호텔 리스트 페이지로 이동
- 알파벳 순 정렬

#### 4.4.2 브랜드별 호텔 리스트 페이지 (`/brand/[chain]`)
**목적**: 특정 브랜드의 모든 호텔 표시

**URL 예시**:
```
/brand/marriott
/brand/hyatt
/brand/ihg
```

**기능 명세**:
- 브랜드 헤더 (로고 + 설명)
- 호텔 그리드 (호텔 카드 형식)
- 국가/도시별 필터
- 관련 아티클 섹션

**데이터 조회**:
```typescript
// select_chain_brand 테이블에서 chain_id로 브랜드 정보 조회
// select_hotels에서 해당 chain_id의 호텔 목록 조회
// publish = true인 호텔만 표시
```

---

### 4.5 블로그 & 아티클

#### 4.5.1 블로그 목록 페이지 (`/blog`)
**목적**: 여행 가이드, 호텔 리뷰, 브랜드 스토리 제공

**기능 명세**:
- 통합 검색바 (상단)
- 아티클 그리드 (카드 형식)
- 각 카드: 대표 이미지 + 제목 + 부제 + 날짜
- 클릭 시 아티클 상세 페이지로 이동
- 무한 스크롤 또는 페이지네이션

**데이터 소스**:
```typescript
// select_hotel_blogs 테이블
// 최신순 정렬 (created_at DESC)
```

#### 4.5.2 블로그 상세 페이지 (`/blog/[slug]`)
**목적**: 아티클 본문 표시

**URL 예시**:
```
/blog/best-hotels-in-tokyo
/blog/marriott-bonvoy-benefits
```

**페이지 구성**:

##### a) 대표 이미지
- 전체 너비 히어로 이미지
- 모바일: 21:9 비율, 데스크톱: 16:9 비율
- 제목 위에 배치 (매거진 스타일)

##### b) 제목 & 메타 정보
```typescript
{
  main_title: string       // 메인 제목
  sub_title: string        // 부제목
  created_at: string       // 작성일
}
```

##### c) 본문 콘텐츠
- `s1_contents` ~ `s12_contents` 필드 (최대 12개 섹션)
- HTML 렌더링 (dangerouslySetInnerHTML)
- 각 섹션 후 호텔 CTA 카드 삽입 가능
  ```typescript
  // s1_sabre_id가 있으면 해당 호텔 카드 표시
  ```

##### d) 호텔 카드 CTA
- 아티클 본문 중간에 삽입
- 해당 호텔의 이미지 + 호텔명 + 도시 + 혜택 목록
- "자세히 보기" 버튼 → 호텔 상세 페이지

##### e) 하단 네비게이션
- "블로그 목록으로 돌아가기" 버튼

**스타일**:
- 최대 너비: 896px (max-w-4xl)
- 가독성을 위한 적절한 여백
- Typography: Prose 스타일 적용

**데이터 조회**:
```typescript
// select_hotel_blogs 테이블에서 slug로 조회
// s1_sabre_id ~ s12_sabre_id가 있으면 해당 호텔 정보 조회
```

---

### 4.6 통합 검색 기능

#### 4.6.1 통합 검색 결과 페이지 (`/search?q=...`)
**목적**: 호텔, 지역, 아티클 통합 검색 결과 제공

**페이지 구성**:

##### a) 검색창
- 상단에 통합 검색바 배치 (재검색 가능)
- 데스크톱: 좌측 컬럼 너비에 맞춤

##### b) AI 답변 섹션 (왼쪽 상단)
**기능 명세**:
- GPT-4 기반 럭셔리 호텔 추천 답변
- 스트리밍 방식으로 토큰 단위 출력
- 접기/펼치기 기능 ("더보기" 버튼)
- 기본 상태: 4줄까지만 표시 (line-clamp-4)
- 생성 중 애니메이션: 깜박이는 커서 + "..." 애니메이션
- 텍스트: "호텔 전문 AI 답변"

**AI 프롬프트**:
```typescript
// src/config/ai-search.ts
{
  system: "당신은 럭셔리 호텔 전문가입니다...",
  user: "'{keyword}'에 대해 다음 항목으로 답변해주세요:
    1. 개요
    2. 추천 시즌
    3. 어디에 묵을까 (Select 사이트 호텔 추천)
    4. 예약 팁 (혜택/프로모션 언급)
    5. 여행 팁
    6. 관련 정보
    7. 요약"
}
```

##### c) 검색 결과 섹션 (왼쪽 하단)
**구성**:
```html
1. 지역 섹션
   - 썸네일 이미지 (96x96) + 도시명 + 국가명
   - 클릭 시 /hotel?city=CITY_CODE&country=COUNTRY_CODE

2. 호텔 섹션
   - 썸네일 이미지 + 호텔명 + 도시
   - 프로모션 태그 (해당 시)
   - 간략 소개 (snippet, 120자)
   - 클릭 시 /hotel/[slug]

3. 아티클 섹션
   - 썸네일 이미지 + 제목
   - 작성일
   - 클릭 시 /blog/[slug]
```

**스타일**:
- Google 검색 결과와 유사한 UI
- 파란색 링크 (#1a0dab)
- 회색 설명 텍스트 (#545454)
- 얇은 구분선 (border-gray-200)

##### d) 지식 패널 (오른쪽)
**기능 명세**:
- 검색 결과가 특정 지역/호텔인 경우 요약 정보 표시
- 지역: 도시명 + 국가명 + 대표 이미지
- 호텔: 호텔명 + 도시 + 브랜드 + 대표 이미지
- 카드 형식, 고정 위치 (sticky)

**데이터 조회**:
```typescript
// useUnifiedSearch 훅 사용
// 1. select_regions 검색
// 2. select_hotels 검색 (병렬 3개 쿼리: property_name_ko, property_name_en, city_ko)
// 3. select_hotel_blogs 검색
// 4. select_city_media에서 지역 이미지 조회
// 5. select_hotel_media에서 호텔 이미지 조회
```

---

### 4.7 프로모션 페이지 (`/promotion`)
**목적**: 현재 진행 중인 모든 프로모션 한눈에 보기

**기능 명세**:
- 프로모션 카드 그리드
- 각 카드: 호텔 이미지 + 호텔명 + 프로모션 내용 + 유효기간
- 클릭 시 호텔 상세 페이지로 이동
- 종료일 임박순 정렬

**데이터 조회**:
```typescript
// select_hotels에서 promotion=true AND publish=true
// promotion_start_date <= 현재 날짜 <= promotion_end_date
// promotion_end_date ASC 정렬
```

---

### 4.8 고객 후기 페이지 (`/testimonials`)
**목적**: 실제 고객 리뷰 전체 보기

**기능 명세**:
- 후기 카드 그리드
- 각 카드: 별점 + 고객명 + 후기 내용 + 호텔명
- 필터: 별점, 호텔, 날짜

---

### 4.9 소개 페이지 (`/about`)
**목적**: Select 서비스 소개

**내용**:
- Select 철학
- 제공 혜택
- 파트너사 소개
- 팀 소개
- 연혁

---

### 4.10 문의 페이지 (`/contact`)
**목적**: 고객 문의 채널 제공

**기능 명세**:
- 카카오톡 상담 버튼
- 전화 상담 안내
- 이메일 문의 폼
- 오시는 길 (지도)

---

### 4.11 약관 페이지 (`/terms`)
**목적**: 이용약관, 개인정보처리방침

**내용**:
- 서비스 이용약관
- 개인정보 처리방침
- 환불 정책
- 쿠키 정책

---

### 4.12 관리자 페이지 (`/admin`)

#### 4.12.1 브랜드 관리 (`/admin/chain-brand`)
**목적**: 브랜드 정보 CRUD

**기능**:
- 브랜드 목록 조회
- 브랜드 추가/수정/삭제
- 로고 이미지 업로드
- 브랜드-체인 매핑

#### 4.12.2 호텔 수정 (`/admin/hotel-update/[sabre]`)
**목적**: 호텔 정보 수정 및 혜택 관리

**기능**:
- 호텔 기본 정보 수정
- 혜택 매핑 관리 (드래그 앤 드롭 정렬)
- 프로모션 설정
- 이미지 관리

#### 4.12.3 광고 관리 (`/admin/advertisements`)
**목적**: 배너 광고 관리

---

## 5. 기술 스펙

### 5.1 프론트엔드

#### 5.1.1 프레임워크 & 라이브러리
```json
{
  "framework": "Next.js 15.5.4",
  "language": "TypeScript 5.9.3",
  "runtime": "React 19.2.0",
  "styling": "Tailwind CSS 4.1.14",
  "ui-library": "shadcn/ui + Radix UI",
  "state-management": "TanStack Query 5.90.2",
  "form": "React Hook Form 7.64 + Zod 4.0.17",
  "icons": "Lucide React 0.539.0"
}
```

#### 5.1.2 디렉토리 구조
```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx             # 홈페이지
│   ├── hotel/               # 호텔 관련 페이지
│   ├── brand/               # 브랜드 페이지
│   ├── blog/                # 블로그 페이지
│   ├── search/              # 통합 검색 결과
│   └── api/                 # API Routes
├── components/
│   ├── ui/                  # shadcn/ui 컴포넌트
│   ├── shared/              # 공통 컴포넌트
│   ├── header.tsx           # 헤더
│   ├── footer.tsx           # 푸터
│   └── bottom-nav.tsx       # 모바일 하단 네비
├── features/
│   ├── hotels/              # 호텔 도메인
│   ├── brands/              # 브랜드 도메인
│   ├── blog/                # 블로그 도메인
│   └── search/              # 검색 도메인
├── lib/
│   ├── supabase/            # Supabase 클라이언트
│   ├── utils.ts             # 유틸리티
│   └── sabre.ts             # Sabre API 클라이언트
├── hooks/                   # 커스텀 훅
├── types/                   # 타입 정의
├── config/                  # 설정 파일
└── providers/               # Context Providers
```

#### 5.1.3 주요 커스텀 훅
```typescript
// 호텔 관련
useHotels()                      // 호텔 목록 조회
useHotelDetail(slug)             // 호텔 상세 조회
useHotelMedia(sabreId)           // 호텔 이미지 조회
useHotelPromotionDetails(id)     // 프로모션 상세

// 검색 관련
useUnifiedSearch(q)              // 통합 검색
useSearchResults(q)              // 호텔 검색
useFilterOptions()               // 필터 옵션

// 기타
useHeroImages()                  // 히어로 이미지
useTopBannerHotels()             // 프로모션 배너 호텔
useIsMobile()                    // 모바일 감지
```

### 5.2 백엔드

#### 5.2.1 데이터베이스: Supabase (PostgreSQL)
**주요 테이블**:

```sql
-- 호텔 정보
select_hotels
  - sabre_id (PK)
  - property_name_ko, property_name_en
  - city, city_ko, city_en
  - country_ko, country_en
  - chain_id, brand_name_en
  - property_details (HTML)
  - publish (boolean)
  - promotion (boolean)
  - promotion_start_date, promotion_end_date
  - latitude, longitude
  - slug (unique)

-- 호텔 이미지
select_hotel_media
  - id (PK)
  - sabre_id (FK)
  - public_url
  - storage_path
  - image_seq (정렬 순서)
  - slug

-- 호텔 혜택 마스터
select_hotel_benefits
  - id (PK)
  - benefit_name_ko
  - benefit_name_en
  - description

-- 호텔 혜택 매핑
select_hotel_benefits_map
  - sabre_id (FK)
  - benefit_id (FK)
  - sort (정렬 순서)

-- 블로그 아티클
select_hotel_blogs
  - id (PK)
  - slug (unique)
  - main_title, sub_title
  - main_image
  - s1_contents ~ s12_contents (섹션 본문)
  - s1_sabre_id ~ s12_sabre_id (호텔 연결)
  - created_at

-- 지역 정보
select_regions
  - city_code (PK)
  - city_ko, city_en
  - city_slug
  - country_code
  - country_ko, country_en
  - status (active/inactive)
  - region_type (city/country)

-- 도시 이미지
select_city_media
  - id (PK)
  - city_code (FK)
  - public_url
  - storage_path
  - image_seq

-- 브랜드 정보
select_chain_brand
  - chain_id (PK)
  - chain_name_en, chain_name_ko
  - brand_program_name
  - brand_logo_url
  - description
```

#### 5.2.2 API Routes (Next.js)

**호텔 관련**:
```
GET  /api/filter-options        # 필터 옵션 (도시/국가/브랜드/체인)
GET  /api/hotel-details         # 호텔 상세
GET  /api/hotels/[sabreId]/benefits      # 호텔 혜택
GET  /api/hotels/[sabreId]/blogs         # 호텔 관련 아티클
GET  /api/hotels/[sabreId]/storage-images # 호텔 이미지
```

**브랜드 관련**:
```
GET  /api/hotel-chains          # 체인 목록
GET  /api/brands/[chainId]/articles # 브랜드 관련 아티클
GET  /api/chain-brand/list      # 브랜드 목록 (관리자용)
POST /api/chain-brand/brand/save # 브랜드 저장 (관리자용)
GET  /api/chain-brand/schema    # 스키마 정보
```

**블로그 관련**:
```
GET  /api/blogs                 # 아티클 목록
GET  /api/blogs/[slug]          # 아티클 상세
```

**지역 관련**:
```
GET  /api/regions/[city_code]/images # 도시 이미지
```

**검색 관련**:
```
GET  /api/sabre-id/search       # Sabre ID로 호텔 검색
POST /api/sabre-id/openai-search # AI 기반 호텔 검색
```

**OpenAI 관련**:
```
POST /api/openai/chat           # AI 채팅 (일반)
POST /api/openai/chat/stream    # AI 채팅 (스트리밍)
GET  /api/openai/health         # OpenAI 상태 확인
POST /api/openai/test           # OpenAI 테스트
```

**Sabre API 관련**:
```
GET  /api/sabre/token           # Sabre 인증 토큰
POST /api/sabre                 # Sabre 호텔 검색/요금 조회
GET  /api/rate-plan-codes       # Rate Plan Code 목록
```

#### 5.2.3 외부 API

**Sabre API**:
```typescript
// 호텔 검색 & 요금 조회
{
  baseURL: "https://api.sabre.com",
  endpoints: [
    "POST /v2/auth/token",           // 인증
    "POST /v2/shop/hotels/rate",     // 요금 조회
    "POST /v2/shop/hotels/search"    // 호텔 검색
  ],
  credentials: {
    clientId: process.env.SABRE_CLIENT_ID,
    clientSecret: process.env.SABRE_CLIENT_SECRET
  }
}
```

**OpenAI API**:
```typescript
// AI 검색 및 추천
{
  baseURL: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  endpoints: [
    "POST /chat/completions"         // 채팅 완성
  ],
  apiKey: process.env.OPENAI_API_KEY
}
```

### 5.3 인프라

#### 5.3.1 호스팅
- **Vercel**: 프론트엔드 & API Routes
- **Edge Runtime**: API Routes (일부)
- **CDN**: Vercel Edge Network

#### 5.3.2 스토리지
- **Supabase Storage**: 호텔 이미지, 브랜드 로고
- **Public Bucket**: `select-media`

#### 5.3.3 환경 변수
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Sabre
SABRE_CLIENT_ID=
SABRE_CLIENT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 6. UI/UX 가이드

### 6.1 디자인 시스템

#### 6.1.1 컬러 팔레트
```css
/* Primary */
--primary: #1a0dab;           /* 파란색 (링크) */
--primary-hover: #1558d6;

/* Secondary */
--secondary: #70757a;         /* 회색 (설명 텍스트) */

/* Accent */
--accent: #f59e0b;            /* 주황색 (배지, 프로모션) */

/* Background */
--bg-white: #ffffff;
--bg-gray-50: #f9fafb;
--bg-gray-100: #f3f4f6;

/* Text */
--text-gray-900: #111827;
--text-gray-600: #4b5563;
--text-gray-500: #6b7280;

/* Border */
--border-gray-200: #e5e7eb;
--border-gray-300: #d1d5db;
```

#### 6.1.2 타이포그래피
```css
/* Headings */
h1: text-3xl sm:text-4xl font-bold      /* 30px/36px, 굵게 */
h2: text-2xl sm:text-3xl font-semibold  /* 24px/30px, 중간굵게 */
h3: text-xl sm:text-2xl font-medium     /* 20px/24px, 중간 */

/* Body */
body: text-base                          /* 16px */
body-sm: text-sm                         /* 14px */
body-xs: text-xs                         /* 12px */

/* Links */
link: text-blue-600 hover:text-blue-800 underline
```

#### 6.1.3 간격 (Spacing)
```css
/* Container */
container: max-w-7xl mx-auto px-4

/* Sections */
py-8 sm:py-12 md:py-16

/* Cards */
p-4 sm:p-6

/* Gaps */
gap-2, gap-4, gap-6, gap-8
```

### 6.2 반응형 브레이크포인트
```css
/* Tailwind 기본 */
sm: 640px   /* 모바일 가로, 작은 태블릿 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 작은 데스크톱 */
xl: 1280px  /* 데스크톱 */
2xl: 1536px /* 큰 데스크톱 */
```

### 6.3 컴포넌트 가이드

#### 6.3.1 버튼
```tsx
<Button variant="default">기본 버튼</Button>
<Button variant="outline">외곽선 버튼</Button>
<Button variant="ghost">고스트 버튼</Button>
<Button variant="destructive">삭제 버튼</Button>
```

#### 6.3.2 카드
```tsx
<Card className="overflow-hidden">
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
  <CardContent>내용</CardContent>
</Card>
```

#### 6.3.3 이미지
```tsx
<Image
  src={imageUrl}
  alt={alt}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isPriority}
/>
```

### 6.4 애니메이션
```css
/* 페이드 인 */
animate-fade-in: opacity-0 → opacity-100

/* 슬라이드 업 */
animate-slide-up: translateY(20px) → translateY(0)

/* 스피너 */
animate-spin: rotate(0deg) → rotate(360deg)

/* 펄스 */
animate-pulse: opacity 변화
```

### 6.5 접근성 (Accessibility)

#### 6.5.1 키보드 네비게이션
- Tab: 다음 요소로 이동
- Shift+Tab: 이전 요소로 이동
- Enter/Space: 버튼/링크 활성화
- Escape: 모달/오버레이 닫기
- Arrow Keys: 리스트 네비게이션 (검색 추천)

#### 6.5.2 ARIA 속성
```tsx
// 검색 폼
<form role="search" aria-label="통합 검색">
  <input aria-label="검색어 입력" />
</form>

// 버튼
<button aria-label="이전 슬라이드">
  <ChevronLeft />
</button>

// 로딩 상태
<div aria-busy="true" aria-live="polite">
  로딩 중...
</div>
```

#### 6.5.3 시맨틱 HTML
```html
<header>
  <nav>
    <a href="/">홈</a>
  </nav>
</header>

<main>
  <section aria-labelledby="hotels-heading">
    <h2 id="hotels-heading">추천 호텔</h2>
  </section>
</main>

<footer>
  <address>연락처 정보</address>
</footer>
```

---

## 7. 데이터 구조

### 7.1 호텔 데이터 스키마

```typescript
interface Hotel {
  // 기본 정보
  sabre_id: number                    // PK
  slug: string                        // URL용 (unique)
  property_name_ko: string
  property_name_en: string
  
  // 위치 정보
  city: string
  city_ko: string
  city_en: string
  country_ko: string
  country_en: string
  property_address: string
  latitude: number
  longitude: number
  
  // 브랜드 정보
  chain_id: number
  chain_name_en: string
  chain_name_ko: string
  brand_name_en: string
  brand_program_name: string
  
  // 상세 정보
  property_details: string            // HTML
  phone: string
  email: string
  website: string
  
  // 프로모션
  promotion: boolean
  promotion_title: string
  promotion_description: string
  promotion_start_date: string        // YYYY-MM-DD
  promotion_end_date: string          // YYYY-MM-DD
  
  // 기타
  publish: boolean
  created_at: string
  updated_at: string
}
```

### 7.2 이미지 데이터 스키마

```typescript
interface HotelMedia {
  id: number
  sabre_id: number
  file_name: string
  public_url: string
  storage_path: string
  image_seq: number                   // 정렬 순서
  slug: string
  uploaded_at: string
}
```

### 7.3 혜택 데이터 스키마

```typescript
interface Benefit {
  id: number
  benefit_name_ko: string
  benefit_name_en: string
  description: string
  icon: string                        // 아이콘 이름 또는 URL
}

interface HotelBenefitMap {
  sabre_id: number
  benefit_id: number
  sort: number                        // 정렬 순서
}
```

### 7.4 블로그 데이터 스키마

```typescript
interface Blog {
  id: number
  slug: string                        // unique
  main_title: string
  sub_title: string
  main_image: string
  
  // 12개 섹션
  s1_contents: string                 // HTML
  s1_sabre_id: number | null          // 호텔 연결
  s2_contents: string
  s2_sabre_id: number | null
  // ... s3 ~ s12
  
  created_at: string
  updated_at: string
}
```

### 7.5 지역 데이터 스키마

```typescript
interface Region {
  city_code: string                   // PK (e.g., "TOKYO", "SEOUL")
  city_ko: string
  city_en: string
  city_slug: string
  country_code: string
  country_ko: string
  country_en: string
  status: 'active' | 'inactive'
  region_type: 'city' | 'country'
  latitude: number
  longitude: number
  description: string
}
```

---

## 8. API 명세

### 8.1 RESTful API 설계 원칙

#### 8.1.1 응답 형식
```json
// 성공
{
  "success": true,
  "data": { ... },
  "meta": {
    "count": 100,
    "page": 1,
    "pageSize": 12
  }
}

// 실패
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

#### 8.1.2 HTTP 상태 코드
```
200 OK              - 성공
201 Created         - 리소스 생성 성공
204 No Content      - 성공 (응답 본문 없음)
400 Bad Request     - 잘못된 요청
401 Unauthorized    - 인증 필요
403 Forbidden       - 권한 없음
404 Not Found       - 리소스 없음
409 Conflict        - 중복/충돌
422 Unprocessable   - 검증 실패
429 Too Many Requests - 요청 제한 초과
500 Internal Error  - 서버 오류
```

### 8.2 주요 API 엔드포인트

#### 8.2.1 필터 옵션 조회
```http
GET /api/filter-options
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cities": [
      { "code": "TOKYO", "name_ko": "도쿄", "name_en": "Tokyo" }
    ],
    "countries": [
      { "code": "JP", "name_ko": "일본", "name_en": "Japan" }
    ],
    "brands": [
      { "id": 1, "name": "Marriott Bonvoy" }
    ],
    "chains": [
      { "id": 101, "name": "The Ritz-Carlton" }
    ]
  }
}
```

#### 8.2.2 호텔 상세 조회
```http
GET /api/hotel-details?slug=park-hyatt-tokyo
```

**Response**:
```json
{
  "success": true,
  "data": {
    "sabre_id": 12345,
    "slug": "park-hyatt-tokyo",
    "property_name_ko": "파크 하얏트 도쿄",
    "property_name_en": "Park Hyatt Tokyo",
    "city_ko": "도쿄",
    "brand_name_en": "Park Hyatt",
    "property_details": "<p>...</p>",
    "images": [
      {
        "id": 1,
        "public_url": "https://...",
        "image_seq": 1
      }
    ],
    "benefits": [
      {
        "id": 1,
        "benefit_name_ko": "객실 업그레이드",
        "sort": 0
      }
    ],
    "promotion": {
      "active": true,
      "title": "봄 시즌 스페셜",
      "description": "...",
      "start_date": "2025-03-01",
      "end_date": "2025-05-31"
    }
  }
}
```

#### 8.2.3 블로그 목록 조회
```http
GET /api/blogs?page=1&limit=12
```

**Query Parameters**:
- `page`: 페이지 번호 (default: 1)
- `limit`: 페이지당 항목 수 (default: 12)
- `q`: 검색어 (optional)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "best-hotels-tokyo",
      "main_title": "도쿄 최고의 호텔 10선",
      "sub_title": "럭셔리 여행을 위한 완벽한 선택",
      "main_image": "https://...",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "count": 100,
    "page": 1,
    "pageSize": 12,
    "totalPages": 9
  }
}
```

#### 8.2.4 통합 검색 (클라이언트 사이드)
```typescript
// useUnifiedSearch 훅 사용
const { data, isLoading } = useUnifiedSearch(query)

// 반환 데이터 구조
type UnifiedSearchResult = Array<
  | UnifiedRegion
  | UnifiedHotel
  | UnifiedBlog
>

interface UnifiedRegion {
  type: 'region'
  id: string
  city_code: string
  city_ko: string
  city_en: string
  country_code: string
  country_ko: string
  image_url: string
}

interface UnifiedHotel {
  type: 'hotel'
  id: string
  sabre_id: number
  slug: string
  property_name_ko: string
  property_name_en: string
  city_ko: string
  image_url: string
  snippet: string
  promotions: string[]
}

interface UnifiedBlog {
  type: 'blog'
  id: string
  slug: string
  main_title: string
  sub_title: string
  image_url: string
  created_at: string
}
```

#### 8.2.5 AI 채팅 스트리밍
```http
POST /api/openai/chat/stream
Content-Type: application/json

{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "당신은 럭셔리 호텔 전문가입니다..."
    },
    {
      "role": "user",
      "content": "도쿄에서 추천하는 호텔은?"
    }
  ],
  "temperature": 0.4,
  "stream": true
}
```

**Response** (Server-Sent Events):
```
data: {"choices":[{"delta":{"content":"도쿄"}}]}
data: {"choices":[{"delta":{"content":"에서"}}]}
data: {"choices":[{"delta":{"content":" 추천"}}]}
...
data: [DONE]
```

---

## 9. 성능 요구사항

### 9.1 페이지 로딩 성능

| 페이지 | 목표 LCP | 목표 FCP | 목표 TTI |
|--------|----------|----------|----------|
| 홈페이지 | < 2.5s | < 1.8s | < 3.5s |
| 호텔 목록 | < 2.5s | < 1.8s | < 3.5s |
| 호텔 상세 | < 2.5s | < 1.8s | < 4.0s |
| 블로그 목록 | < 2.5s | < 1.8s | < 3.0s |
| 블로그 상세 | < 2.5s | < 1.8s | < 3.5s |
| 검색 결과 | < 3.0s | < 2.0s | < 4.0s |

**측정 지표**:
- **LCP** (Largest Contentful Paint): 주요 콘텐츠 로딩 시간
- **FCP** (First Contentful Paint): 첫 콘텐츠 표시 시간
- **TTI** (Time to Interactive): 인터랙션 가능 시간

### 9.2 Core Web Vitals 목표

```
LCP: < 2.5초 (Good)
FID: < 100ms (Good)
CLS: < 0.1 (Good)
```

### 9.3 최적화 전략

#### 9.3.1 이미지 최적화
- Next.js Image 컴포넌트 사용
- WebP/AVIF 포맷 우선
- 적절한 `sizes` 속성 설정
- Lazy loading 적용
- Priority 속성으로 LCP 이미지 우선 로딩

#### 9.3.2 코드 스플리팅
- 페이지별 자동 코드 스플리팅 (Next.js)
- Dynamic import로 컴포넌트 지연 로딩
- Route-based splitting

#### 9.3.3 데이터 페칭 최적화
- React Query로 데이터 캐싱
- Stale-while-revalidate 전략
- Prefetching으로 사전 로딩
- Debounce로 불필요한 요청 방지

#### 9.3.4 캐싱 전략
```typescript
// React Query 설정
{
  staleTime: 5 * 60 * 1000,      // 5분
  cacheTime: 30 * 60 * 1000,     // 30분
  refetchOnWindowFocus: false
}

// Next.js 캐싱
export const revalidate = 3600   // 1시간
```

### 9.4 모니터링

#### 9.4.1 성능 모니터링 도구
- Google Analytics 4
- Vercel Analytics
- Web Vitals 측정

#### 9.4.2 에러 추적
- Console 로깅
- Sentry (향후 도입 예정)

---

## 10. 보안 및 개인정보

### 10.1 보안 요구사항

#### 10.1.1 인증 & 권한
- Supabase Auth 사용
- JWT 토큰 기반 인증
- Row Level Security (RLS) 적용

#### 10.1.2 API 보안
- CORS 설정
- Rate limiting (API Routes)
- Input validation (Zod)
- SQL Injection 방지 (Supabase ORM)
- XSS 방지 (React 자동 이스케이핑)

#### 10.1.3 환경 변수 관리
- `.env.local`에 민감 정보 저장
- `.gitignore`에 환경 변수 파일 추가
- Vercel에서 환경 변수 암호화 저장

### 10.2 개인정보 처리

#### 10.2.1 수집하는 정보
- 이름, 이메일, 전화번호 (문의 시)
- 쿠키 (Google Analytics)
- IP 주소, 브라우저 정보 (로그)

#### 10.2.2 개인정보 보호
- HTTPS 강제 (TLS 1.3)
- 개인정보 암호화 저장
- 최소 수집 원칙
- 보관 기간 준수 (3년)

#### 10.2.3 준수 규정
- 개인정보보호법 (한국)
- GDPR (유럽 - 향후)
- 쿠키 동의 배너 (향후)

---

## 11. 향후 로드맵

### 11.1 Phase 2 (Q2 2025)

#### 11.1.1 회원 시스템
- 회원 가입/로그인
- 소셜 로그인 (Google, Kakao)
- 마이페이지
- 즐겨찾기 기능
- 예약 내역 관리

#### 11.1.2 예약 시스템
- 실시간 예약 가능 여부 확인
- 온라인 결제 연동
- 예약 확인/취소
- 이메일/SMS 알림

#### 11.1.3 리뷰 시스템
- 호텔 리뷰 작성
- 별점 평가
- 리뷰 필터/정렬
- 관리자 승인 프로세스

### 11.2 Phase 3 (Q3 2025)

#### 11.2.1 고급 AI 기능
- 맞춤형 호텔 추천 알고리즘
- 가격 예측 모델
- 여행 일정 자동 생성
- 챗봇 상담

#### 11.2.2 모바일 앱
- React Native 앱 개발
- 푸시 알림
- 오프라인 모드
- 앱 전용 혜택

#### 11.2.3 파트너 프로그램
- 호텔 직접 연동 API
- 어필리에이트 프로그램
- B2B 기업 예약 시스템

### 11.3 Phase 4 (Q4 2025)

#### 11.3.1 글로벌 확장
- 다국어 지원 (영어, 중국어, 일본어)
- 다중 통화 지원
- 지역별 결제 수단
- 현지 법규 준수

#### 11.3.2 프리미엄 멤버십
- 월/연간 구독 모델
- 독점 혜택 제공
- 우선 예약 서비스
- 전담 컨시어지

---

## 12. 부록

### 12.1 용어 정의

| 용어 | 설명 |
|------|------|
| Sabre ID | Sabre 시스템의 호텔 고유 ID |
| Slug | URL에 사용되는 호텔/아티클 고유 식별자 |
| Rate Plan | 호텔 요금제 (BAR, AAA, Government 등) |
| Chain | 호텔 체인 (Marriott International, Hyatt Corporation) |
| Brand | 호텔 브랜드 (The Ritz-Carlton, Park Hyatt) |
| LCP | Largest Contentful Paint (주요 콘텐츠 표시 시간) |
| SSR | Server-Side Rendering (서버 사이드 렌더링) |
| CSR | Client-Side Rendering (클라이언트 사이드 렌더링) |
| RLS | Row Level Security (행 수준 보안) |

### 12.2 참고 문서

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Sabre API Documentation](https://developer.sabre.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### 12.3 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| 1.0 | 2025-01-11 | 초기 PRD 작성 | 김재우 |


## 문서 작성자자

| 역할 | 이름 | 서명 | 날짜 |
|------|------|------|------|
| 창조자 | 김재우 | | 2025-10-10 |


---

**문서 끝**

© 2025 Select 3.0. All rights reserved.

# Select3 Front - 비즈니스 로직 설명서

이 문서는 Select3 Front 프로젝트의 **핵심 비즈니스 로직**, 도메인 규칙, 데이터 흐름을 상세히 설명합니다.

---

## 목차

1. [도메인 개요](#1-도메인-개요)
2. [식별자 및 키](#2-식별자-및-키)
3. [Company/VCC 필터링](#3-companyvcc-필터링)
4. [호텔 검색 비즈니스 로직](#4-호텔-검색-비즈니스-로직)
5. [호텔 필터링 로직](#5-호텔-필터링-로직)
6. [혜택(Benefits) 매핑 로직](#6-혜택benefits-매핑-로직)
7. [블로그-호텔 매핑 로직](#7-블로그-호텔-매핑-로직)
8. [브랜드-체인 아티클 로직](#8-브랜드-체인-아티클-로직)
9. [지도/지역 해석 로직](#9-지도지역-해석-로직)
10. [AI 검색 로직](#10-ai-검색-로직)
11. [Sabre 통합 로직](#11-sabre-통합-로직)
12. [데이터 검증 규칙](#12-데이터-검증-규칙)
13. [에러 및 UX 규칙](#13-에러-및-ux-규칙)

---

## 1. 도메인 개요

### 1.1 핵심 엔티티

| 엔티티 | 설명 | 식별자 |
|--------|------|--------|
| **Hotel** | 숙박 시설, Sabre GDS와 연동 | sabre_id (정수) |
| **Benefit (Master)** | 고객용 혜택 카탈로그 (이름/설명) | benefit_id |
| **Benefit Mapping** | 호텔 ↔ 혜택 매핑, 정렬 순서 포함 | (sabre_id, benefit_id), sort |
| **Brand** | 호텔 브랜드 (예: Park Hyatt) | brand_id |
| **Chain** | 호텔 체인 (예: Hyatt) | chain_id |
| **Blog** | 호텔 관련 에디토리얼 | slug |
| **Region** | 도시/국가/지역 | city_code, country_code 등 |

### 1.2 주요 테이블

| 테이블 | 용도 |
|--------|------|
| select_hotels | 호텔 마스터 (publish, vcc, city_code, brand_id 등) |
| select_hotel_benefits | 혜택 마스터 |
| select_hotel_benefits_map | 호텔별 혜택 매핑 (sort) |
| select_hotel_blogs | 블로그 (s1~s12_sabre_id, brand_id_connect) |
| hotel_brands | 브랜드 마스터 |
| hotel_chains | 체인 마스터 |
| select_regions | 도시/국가/지역 |
| select_satisfaction_survey | 고객 후기 (pick=true) |
| select_feature_slots | 프로모션 슬롯 |
| select_tag_categories, select_tags | 추천 필터 태그 |

---

## 2. 식별자 및 키

### 2.1 Sabre ID

- **canonical hotel key**: UI 라우팅, 매핑 연산 모두 `sabre_id` 사용
- **Paragon ID**: deprecated, UI에서 사용하지 않음 (읽기 전용 유지 가능)
- **라우팅 예**: `/hotel/[slug]` (slug는 select_hotels.slug)

### 2.2 Benefit Mapping

- **유일성**: `(sabre_id, benefit_id)` 조합 유일
- **정렬**: `sort` 0..N-1 연속 값
- **업데이트 규칙**: 전체 매핑 덮어쓰기 (delete + insert)로 일관성 보장

### 2.3 날짜 및 기본값

- **날짜 형식**: ISO `YYYY-MM-DD`
- **Tester UI**: End Date = Start Date + 1일 기본
- **빈 값**: DB가 nullable이면 `null` 저장, `[]` 대신 `null` 사용

---

## 3. Company/VCC 필터링

### 3.1 개념

- **company 파라미터**: URL `?company=sk` 또는 쿠키 `company=sk`
- **VCC (VVIP Contract)**: SK 전용 콘텐츠 구분용 플래그
- **동작**: `company=sk`일 때 **vcc=TRUE**인 호텔/체인/블로그만 노출

### 3.2 적용 범위

| API/기능 | 적용 내용 |
|----------|----------|
| filter-options | 호텔 vcc=TRUE, 체인 vcc=TRUE, 해당 체인 소속 브랜드만 |
| blogs | 블로그에 언급된 모든 호텔(s1~s12)이 vcc=TRUE여야 노출 |
| blogs/[slug] | 동일, 미충족 시 403 |
| brands/[chainId]/articles | 동일 |
| hotels/[sabreId]/blogs | 호텔 vcc !== true이면 빈 배열, 블로그 내 호텔들 vcc 검증 |

### 3.3 company 값 추출 순서

1. **서버**: 쿠키 `company` → searchParams `company`
2. **클라이언트**: URL `?company=` → 쿠키 `company`
3. **값**: `sk` (소문자)일 때만 필터 적용

---

## 4. 호텔 검색 비즈니스 로직

### 4.1 검색 입력 소스

- **자동완성/검색**: 한글/영문 호텔명, Sabre ID (숫자)
- **키보드**: Arrow Up/Down 선택, Enter 제출, Escape 닫기
- **검색 후**: 자동완성 패널 숨김

### 4.2 검색 플로우 (Sabre ID 검색)

1. **숫자만 입력**
   - Sabre hotel-details API로 해당 코드 직접 조회
   - 결과 있으면 반환

2. **문자열 입력**
   - `EXPANDED_HOTEL_CODES` 목록 배치(15개 단위)로 hotel-details 호출
   - `isPartialMatch(searchKeyword, hotelName)`로 부분 매칭
   - 매칭 방식: 포함 검색, 단어별 매칭(30% 이상), 연속 문자, 첫 단어 강화, 약어 매칭

### 4.3 AI 검색 (OpenAI + Sabre)

1. GPT-4o에 "호텔명의 Sabre Hotel Code 숫자만 알려줘" 요청
2. 응답에서 3자리 이상 숫자 추출
3. Sabre hotel-details로 각 후보 검증
4. 입력명과 검증된 호텔명 정확 일치 → `verified`
5. 후보 없으면 `/api/sabre-id/search` 폴백

---

## 5. 호텔 필터링 로직

### 5.1 필터 구조

```ts
interface HotelFilters {
  city: string      // city_code
  country: string   // country_code
  brand: string     // brand_id
  chain: string     // chain_id (체인 선택 시 해당 체인 소속 브랜드 ID들로 매칭)
}
```

### 5.2 필터 적용 순서

1. **도시**: `hotel.city_code === filters.city`
2. **국가**: `hotel.country_code === filters.country`
3. **체인**: `filters.chain` → `getChainBrandIds(chainId, brands)`로 해당 체인 브랜드 ID 목록 생성 → 호텔의 `brand_id`, `brand_id_2`, `brand_id_3` 중 하나라도 포함되면 통과
4. **브랜드**: `hotel.brand_id` 등이 `filters.brand`와 일치

### 5.3 다중 브랜드

- 호텔은 `brand_id`, `brand_id_2`, `brand_id_3` 보유 가능
- 체인 필터: 해당 체인 소속 **모든 브랜드 ID**와 교집합이 있으면 통과

---

## 6. 혜택(Benefits) 매핑 로직

### 6.1 조회

- **API**: `GET /api/hotels/[sabreId]/benefits`
- **테이블**: `select_hotel_benefits_map` + `select_hotel_benefits` 조인
- **정렬**: `sort` 오름차순
- **컬럼**: benefit, benefit_description, start_date, end_date (benefit_description 대신 benefit 사용)

### 6.2 비즈니스 규칙

- 혜택 마스터(`select_hotel_benefits`)는 읽기 전용
- 매핑은 반드시 존재하는 `benefit_id` 참조
- 업데이트 시: 기존 매핑 전체 삭제 후 새 매핑 일괄 삽입

---

## 7. 블로그-호텔 매핑 로직

### 7.1 구조

- 블로그는 최대 12개 호텔 슬롯: `s1_sabre_id` ~ `s12_sabre_id`
- 각 슬롯에 해당 섹션 내용: `s1_contents` ~ `s12_contents`

### 7.2 호텔별 블로그 조회

- 조건: `s1_sabre_id.eq.X OR s2_sabre_id.eq.X OR ... OR s12_sabre_id.eq.X`
- company=sk: 블로그 내 **모든** 언급 호텔이 vcc=TRUE여야 노출
- sabre_id 필드는 응답에서 제거

### 7.3 블로그 목록/상세

- publish=true
- company=sk: 동일 vcc 규칙

---

## 8. 브랜드-체인 아티클 로직

### 8.1 brand_id_connect

- **컬럼**: `select_hotel_blogs.brand_id_connect`
- **형식**: 쉼표 구분 문자열 `"71,72,73"` 또는 JSON 배열 `"[71,72,73]"`
- **의미**: 해당 블로그가 어떤 브랜드와 연관되는지

### 8.2 매칭 규칙

1. `chainId`로 `hotel_brands`에서 해당 체인 소속 브랜드 ID 목록 조회
2. `brand_id_connect` 파싱 → 블로그의 브랜드 ID 배열
3. **교집합** 존재 시 해당 블로그 포함
4. company=sk: vcc 필터 추가
5. 최신순, 최대 12개

---

## 9. 지도/지역 해석 로직

### 9.1 resolveDestination

`destination` 문자열을 `select_regions` 기반으로 해석:

| 순서 | 매칭 대상 | kind |
|------|----------|------|
| 1 | city_code (대문자) | city |
| 2 | city_slug | city |
| 3 | country_slug | country |
| 4 | area_slug | area |
| 5 | city_ko, city_en, country_ko, country_en, area_ko, area_en (eq) | city/country/area |
| 6 | 매칭 없음 | unknown |

### 9.2 hotel-map-markers

- **destination=all**: publish=true 전체 호텔
- **destination=bali**: `city_ko='발리'` (특수 처리)
- **city**: city_code 또는 city_ko로 필터
- **country**: country_code로 필터
- **fallback**: city_ko/en, area_ko/en, country_en 정확/부분(ilike) 일치
- **좌표**: Google Geocoding (주소 + 국가)
- **지역 목록**: select_regions(area) + 실제 호텔 area_ko 병합

---

## 10. AI 검색 로직

### 10.1 통합 검색 (Luxury Search)

- **시스템 프롬프트**: 럭셔리 호텔 큐레이터 역할
- **출력**: 키워드 관련 호텔/목적지, 투어비스 셀렉트 호텔 추천, 시즌/혜택/멤버십, 커플/가족/호캉스 등
- **제약**: 추측 금지, 확인 불가 시 "페이지에서 확인하세요" 안내

### 10.2 브랜드 AI 설명

- **모델**: gpt-4o-mini
- **요구사항**: 300자 내외, 브랜드 역사/연혁 포함, 럭셔리 어조, 투어비스 셀렉트 혜택 암시
- **폴백**: API 키 없으면 기존 brand_description_ko/description 또는 기본 문구 스트리밍

---

## 11. Sabre 통합 로직

### 11.1 Hotel Details

- **엔드포인트**: `SABRE_PROXY_BASE_URL/hotel-details`
- **요청**: HotelCode, StartDate, EndDate, CurrencyCode=KRW, Adults, Children, Rooms, RatePlanCode(선택)
- **RatePlanCode**: 있으면 ExactMatchOnly=true
- **날짜 검증**: StartDate는 오늘 이후 (Sabre 규칙)

### 11.2 Rate Plan Codes

- 정적 목록: API, ZP3, VMC, TLC, H01, S72, XLO, PPR, FAN, WMP, HPM, TID, STP, BAR, RAC, PKG
- DB `sabre_rate_plan_codes` (is_active)와 별도로 API는 정적 값 반환

### 11.3 Autocomplete 주의사항

- Supabase `or(...)`에 **쉼표 포함 입력** 사용 금지
- 별도 쿼리 실행 후 결과 병합

---

## 12. 데이터 검증 규칙

### 12.1 Input

- **defaultValue**: `String(value ?? '')` (항상 문자열)
- **날짜**: `string | number | Date`만 허용, 그 외는 가드 후 처리

### 12.2 타입 안전성

- `any` 금지, `unknown` + type guard 사용
- JSON 경로 접근 시 safe helper 사용

### 12.3 정규화

- 빈 배열 → DB가 nullable이면 `null`
- enum/특수 타입에 맞게 정규화

---

## 13. 에러 및 UX 규칙

### 13.1 API 에러

- **형식**: `{ success: false, error: string, code?: string, details?: object }`
- **사용자 메시지**: DB 내부 오류 노출 금지
- **날짜 관련**: "체크인 날짜는 오늘 이후 날짜이어야 합니다" 등 친화적 메시지

### 13.2 UX 규칙

- **저장 확인**: "변경 사항을 저장하였습니다" 모달, OK만 (취소 없음)
- **Benefits Manager**: 드래그 시 분홍, 드롭 시 파란, 저장 성공 시 노란 강조
- **혜택만 변경**: 다른 필드 변경 없이도 제출/저장 가능

### 13.3 접근성

- 자동완성/매니저: 키보드 네비게이션 (Arrow, Enter, Escape)
- 포커스 링 명시

---

## 14. 데이터 흐름 요약

```
[사용자 검색]
    → filter-options (도시/국가/브랜드/체인 옵션)
    → Unified Search / Sabre Search / OpenAI Search
    → 검색 결과 필터링 (filterHotel, filterHotels)
    → 호텔 상세 페이지

[호텔 상세]
    → hotel-details (Sabre 객실/요금)
    → hotels/[sabreId]/benefits
    → hotels/[sabreId]/blogs
    → hotels/[sabreId]/storage-images

[블로그]
    → blogs (목록), blogs/[slug] (상세)
    → brands/[chainId]/articles (체인별 아티클)
    → company=sk 시 vcc 필터

[지도]
    → resolveDestination(destination)
    → hotel-map-markers (Geocoding, 마커)
    → poi-hotels (Google Places)
```

---

## 15. 변경 이력 시 주의사항

- **테이블 변경** (예: select_basic_benefits → select_hotel_benefits): API, UI, 가드 전반 일관 적용
- **라우팅 변경** (예: [sabre_paragon] → [sabre]): deprecated 파라미터 무시 또는 리다이렉트

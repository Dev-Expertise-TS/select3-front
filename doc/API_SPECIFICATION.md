# Select3 Front - API 명세서

이 문서는 Select3 Front 프로젝트에서 사용하는 **모든 API**에 대한 상세 명세를 담고 있습니다.

---

## 목차

1. [공통 사항](#1-공통-사항)
2. [블로그 API](#2-블로그-api)
3. [브랜드 API](#3-브랜드-api)
4. [체인/브랜드 관리 API](#4-체인브랜드-관리-api)
5. [도시/체인/슬러그 조회 API](#5-도시체인슬러그-조회-api)
6. [호텔 API](#6-호텔-api)
7. [필터 및 검색 API](#7-필터-및-검색-api)
8. [지도 및 POI API](#8-지도-및-poi-api)
9. [지역/이미지 API](#9-지역이미지-api)
10. [Sabre 통합 API](#10-sabre-통합-api)
11. [OpenAI API](#11-openai-api)
12. [기타 API](#12-기타-api)
13. [디버그 API](#13-디버그-api)

---

## 1. 공통 사항

### 응답 형식

**성공 응답**
```json
{
  "success": true,
  "data": <payload>,
  "meta": { "count": number, ... }
}
```

**에러 응답**
```json
{
  "success": false,
  "error": "<message>",
  "code": "<app_error_code>",
  "details": { ... }
}
```

### HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 성공 (GET) |
| 201 | 리소스 생성 성공 |
| 204 | 성공 (본문 없음) |
| 400 | 잘못된 요청 (필수 파라미터 누락 등) |
| 401 | 인증 필요 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 422 | 유효성 검증 실패 |
| 500 | 서버 내부 오류 |
| 502 | 업스트림 서비스 오류 |
| 503 | 서비스 이용 불가 |

### Company 파라미터 (VCC 필터)

일부 API는 `company=sk` 파라미터(URL 또는 쿠키)를 지원합니다.

- `company=sk`인 경우: `vcc=TRUE`인 호텔/체인/블로그만 노출
- VCC(VVIP Contract)는 SK 전용 컨텐츠 구분용

---

## 2. 블로그 API

### 2.1 블로그 목록 조회

**`GET /api/blogs`**

게시된 블로그 목록을 최신순으로 반환합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| company | string | N | `sk`일 때 vcc=true 필터 적용 |

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "slug": string,
      "main_image": string,
      "main_title": string,
      "sub_title": string,
      "created_at": string,
      "updated_at": string
    }
  ],
  "meta": { "count": number }
}
```

**비즈니스 로직**
- `select_hotel_blogs` 테이블에서 `publish=true` 조회
- company=sk일 때 블로그에 언급된 호텔(s1~s12_sabre_id)의 vcc가 모두 TRUE여야 노출
- sabre_id 필드는 응답에서 제거 (보안)

---

### 2.2 블로그 상세 조회

**`GET /api/blogs/[slug]`**

슬러그로 블로그 상세를 조회합니다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| slug | string | 블로그 슬러그 |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| company | string | N | `sk`일 때 vcc 검증 |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "slug": string,
    "main_title": string,
    "main_image": string,
    "sub_title": string,
    "s1_contents": string,
    "s2_contents": string,
    "...": "...",
    "s12_contents": string,
    "created_at": string
  }
}
```

**에러**
- 404: 블로그 없음, publish=false, company=sk에서 vcc 미충족
- 403: company=sk에서 접근 권한 없는 블로그

---

## 3. 브랜드 API

### 3.1 브랜드 slug 조회

**`GET /api/brands/slug`**

브랜드 영문명으로 slug를 조회합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| brandName | string | Y | hotel_brands.brand_name_en |

**Response (200)**
```json
{
  "success": true,
  "brandSlug": string
}
```

**에러**
- 400: brandName 누락
- 404: 브랜드/슬러그 없음

---

### 3.2 브랜드별 아티클(블로그) 조회

**`GET /api/brands/[chainId]/articles`**

특정 체인(chainId)에 속한 브랜드들의 블로그 아티클을 조회합니다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| chainId | string | hotel_chains.chain_id |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| company | string | N | `sk`일 때 vcc 필터 |

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "slug": string,
      "main_title": string,
      "main_image": string,
      "sub_title": string,
      "created_at": string,
      "updated_at": string
    }
  ],
  "meta": {
    "count": number,
    "chainId": number,
    "brands": [...],
    "method": "brand_id_connect"
  }
}
```

**비즈니스 로직**
- `brand_id_connect` 컬럼(쉼표/JSON 배열)으로 블로그-브랜드 매핑
- 체인에 속한 브랜드 ID와 교집합이 있는 블로그만 반환
- 최신순 정렬, 최대 12개
- company=sk일 때 vcc=true 필터 적용

---

### 3.3 브랜드 AI 설명 (비스트리밍)

**`POST /api/brand/description`**

브랜드명을 받아 OpenAI로 300자 내외 소개 문구를 생성합니다.

**Request Body**
```json
{
  "brandNameEn": string,
  "brandNameKo": string | null
}
```

**Response**
- Content-Type: `text/event-stream` (SSE 스트리밍)
- OpenAI `choices[0].delta.content` 형식

**에러**
- 400: brandNameEn 누락
- 500: MISSING_API_KEY, STREAM_ERROR

---

### 3.4 브랜드 AI 설명 (스트리밍)

**`POST /api/brand/description-stream`**

브랜드 객체를 받아 OpenAI로 설명을 스트리밍 생성합니다.

**Request Body**
```json
{
  "brand": {
    "brand_name_en": string,
    "brand_name_ko": string | null,
    "brand_description": string | null,
    "brand_description_ko": string | null
  }
}
```

**Response**
- Content-Type: `text/event-stream`
- API 키 없으면 폴백 텍스트(기존 설명 또는 기본 문구)를 스트리밍

---

## 4. 체인/브랜드 관리 API

### 4.1 체인-브랜드 목록

**`GET /api/chain-brand/list`**

**Query Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| type | string | `chain` 또는 `brand` |
| parentId | string | brand일 때 상위 chain ID |

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": string,
      "name": string,
      "type": "chain" | "brand",
      "parentId": string | undefined,
      "description": string | undefined
    }
  ]
}
```

**비고**: 현재 샘플 데이터 반환 (DB 연동 미구현)

---

### 4.2 체인-브랜드 스키마

**`GET /api/chain-brand/schema`**

**Response (200)**
```json
{
  "success": true,
  "data": {
    "chains": [{ "id": string, "name": string, "fields": [...] }],
    "brands": [{ "id": string, "name": string, "chainId": string, "fields": [...] }]
  }
}
```

---

### 4.3 브랜드 저장

**`POST /api/chain-brand/brand/save`**

**Request Body**
```json
{
  "id": string | undefined,
  "name": string,
  "chainId": string,
  "description": string | undefined
}
```

**Response (200)**
```json
{
  "success": true,
  "data": { "id": string, "name": string, "chainId": string, "description": string }
}
```

**비고**: 현재 메모리 저장만 (DB 미연동)

---

## 5. 도시/체인/슬러그 조회 API

### 5.1 chains slug

**`GET /api/chains/slug`**

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| chainId | string | Y | hotel_chains.chain_id |

**Response (200)**
```json
{
  "success": true,
  "chainSlug": string
}
```

**에러**
- 400: chainId 누락
- 404: 체인/슬러그 없음

---

### 5.2 cities slug

**`GET /api/cities/slug`**

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| cityCode | string | Y | select_regions.city_code |

**Response (200)**
```json
{
  "success": true,
  "citySlug": string
}
```

**조건**: `region_type=city`, `status=active`

---

## 6. 호텔 API

### 6.1 hotel-chains

**`GET /api/hotel-chains`**

호텔 체인 목록과 각 체인별 호텔 수를 반환합니다.

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "chain_id": number,
      "chain_name_en": string,
      "chain_name_ko": string | null,
      "count": number
    }
  ]
}
```

**비즈니스 로직**
- hotel_chains + select_hotels 조인 (chain = chain_name_en)
- publish !== false인 호텔만 카운트

---

### 6.2 hotel-details (Sabre 프록시)

**`POST /api/hotel-details`**

Sabre Hotel Details API를 프록시하여 객실/요금 정보를 조회합니다.

**Request Body**
```json
{
  "hotelCode": string,
  "startDate": string,
  "endDate": string,
  "adults": number,
  "children": number,
  "rooms": number,
  "ratePlanCodes": string[]
}
```

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|------|--------|------|
| hotelCode | string | Y | - | Sabre 호텔 코드 |
| startDate | string | Y | - | YYYY-MM-DD |
| endDate | string | Y | - | YYYY-MM-DD |
| adults | number | N | 2 | 객실당 성인 수 |
| children | number | N | 0 | 어린이 수 |
| rooms | number | N | 1 | 객실 수 |
| ratePlanCodes | string[] | N | - | Rate Plan 코드 (ExactMatchOnly) |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "GetHotelDetailsRS": { ... },
    "descriptiveData": null,
    "availableData": null
  },
  "meta": {
    "pricingSourceAttempted": string,
    "hasAvailableData": boolean
  }
}
```

**에러**
- 400: hotelCode, startDate, endDate 누락
- 503: 네트워크 연결 불가
- 기타: Sabre API 에러 전달

**외부 의존**: `SABRE_PROXY_BASE_URL` (기본: sabre-nodejs-9tia3.ondigitalocean.app)

---

### 6.3 호텔 혜택 조회

**`GET /api/hotels/[sabreId]/benefits`**

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| sabreId | string | select_hotels.sabre_id |

**Response (200)**
```json
{
  "success": true,
  "data": [
    { "benefit_id": number, "benefit_name_ko": string, "sort": number, ... }
  ],
  "meta": { "sabreId": number, "count": number }
}
```

**비즈니스 로직**
- `select_hotel_benefits_map` + `select_hotel_benefits` 조인
- sort 기준 정렬

---

### 6.4 호텔 블로그 조회

**`GET /api/hotels/[sabreId]/blogs`**

특정 호텔이 s1~s12_sabre_id 중 하나로 언급된 블로그 목록을 반환합니다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| sabreId | string | sabre_id |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| company | string | N | `sk`일 때 vcc 필터 |

**Response (200)**
```json
{
  "success": true,
  "data": [ { "slug": string, "main_title": string, "main_image": string, ... } ],
  "meta": { "count": number, "hotelName": string, "sabreId": string }
}
```

**비즈니스 로직**
- company=sk이고 호텔 vcc !== true이면 빈 배열
- 블로그 내 모든 언급 호텔이 vcc=true여야 노출

---

### 6.5 호텔 스토리지 이미지

**`GET /api/hotels/[sabreId]/storage-images`**

Supabase Storage `hotel-media` 버킷에서 호텔별 이미지 목록을 조회합니다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| sabreId | string | sabre_id |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "hotel": { "sabre_id": number, "slug": string, "property_name_ko": string, "property_name_en": string },
    "images": [
      {
        "id": string,
        "filename": string,
        "sequence": number,
        "media_path": string,
        "url": string,
        "alt": string,
        "isMain": boolean,
        "size": number,
        "lastModified": string
      }
    ],
    "totalCount": number
  }
}
```

**비즈니스 로직**
- select_hotels에서 slug 조회
- 경로 시도: `public/{slug}`, `{slug}`, `originals/{slug}`
- 파일명에서 seq 추출하여 정렬
- publish=false 호텔은 404

---

## 7. 필터 및 검색 API

### 7.1 filter-options

**`GET /api/filter-options`**

검색 필터용 도시/국가/브랜드/체인 옵션을 반환합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| company | string | N | 쿠키/URL, `sk`일 때 vcc 필터 |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "cities": [ { "id": string, "label": string, "country_code": string, "country_ko": string } ],
    "countries": [ { "id": string, "label": string } ],
    "brands": [ { "id": string, "label": string, "brand_name": string, "chain_id": number, "chain_name_ko": string, "sort_order": number } ],
    "chains": [ { "id": string, "label": string, "name_en": string, "sort_order": number } ]
  }
}
```

**비즈니스 로직**
- select_regions: 도시(city_sort_order), 국가(country_sort_order)
- select_hotels + hotel_brands + hotel_chains: 브랜드/체인
- company=sk: vcc=TRUE 호텔/체인만

---

### 7.2 recommendation-filters

**`GET /api/recommendation-filters`**

추천 페이지 필터용 태그 카테고리/태그 목록을 반환합니다.

**Response (200)**
```json
{
  "success": true,
  "categories": [
    {
      "id": number,
      "name": string,
      "sort_order": number,
      "tags": [ { "id": number, "name": string, "active": boolean, "sort_order": number } ]
    }
  ]
}
```

**테이블**: select_tag_categories, select_tags

---

### 7.3 rate-plan-codes

**`GET /api/rate-plan-codes`**

Sabre Rate Plan 코드 목록을 반환합니다.

**Response (200)**
```json
{
  "success": true,
  "data": [ "API", "ZP3", "VMC", "TLC", "H01", "S72", "XLO", "PPR", "FAN", "WMP", "HPM", "TID", "STP", "BAR", "RAC", "PKG" ],
  "count": 16
}
```

**캐시**: 1시간 (Cache-Control)

---

## 8. 지도 및 POI API

### 8.1 hotel-map-markers

**`GET /api/hotel-map-markers`**

지정한 destination(도시/국가/지역)의 호텔 마커 목록과 지도 중심 좌표를 반환합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| destination | string | N | all | 도시코드/슬러그/이름 (예: bali, TPE, 타이베이) |
| limit | number | N | 200 | 최대 호텔 수 (1~500) |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "destination": string,
    "resolved": { "kind": "city"|"country"|"area"|"unknown", "label": string, "queryText": string, "city_code": string, ... },
    "center": { "lat": number, "lng": number },
    "count": number,
    "requested": number,
    "markers": [
      {
        "sabre_id": number,
        "slug": string,
        "name": string,
        "property_name_ko": string,
        "property_name_en": string,
        "property_address": string,
        "location": { "lat": number, "lng": number },
        "badges": string[],
        "image": string,
        "area_ko": string,
        "city_ko": string,
        "country_ko": string
      }
    ],
    "areas": [ { "id": string, "area_ko": string, "area_en": string } ],
    "cache": { "hits": number, "misses": number, "hitRate": number }
  }
}
```

**비즈니스 로직**
- resolveDestination(destination): city_code, city_slug, country_slug, area_slug, city_ko/en 등으로 지역 해석
- destination=all: publish=true 전체 호텔
- destination=bali: city_ko='발리'
- 각 호텔 주소 Geocoding(Google Maps)으로 좌표 계산
- select_hotel_media로 이미지 매핑

**의존**: GOOGLE_MAPS_API_KEY

---

### 8.2 poi-hotels

**`GET /api/poi-hotels`**

Google Places Nearby Search로 특정 destination 주변 숙소(Lodging)를 조회합니다.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| destination | string | Y | - | 지오코딩할 주소/지역명 |
| q | string | N | hotel | Places 검색 키워드 |
| radius | number | N | 6000 | 반경(m), 500~30000 |
| pageToken | string | N | - | Places 페이지 토큰 |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "destination": string,
    "keyword": string,
    "radius": number,
    "center": { "lat": number, "lng": number },
    "results": [
      {
        "place_id": string,
        "name": string,
        "formatted_address": string,
        "rating": number,
        "user_ratings_total": number,
        "location": { "lat": number, "lng": number },
        "photo_reference": string
      }
    ],
    "nextPageToken": string | null
  }
}
```

**의존**: GOOGLE_MAPS_API_KEY

---

## 9. 지역/이미지 API

### 9.1 regions/[city_code]/images

**`GET /api/regions/[city_code]/images`**

특정 도시의 이미지 목록을 반환합니다.

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| city_code | string | select_regions.city_code |

**Response (200)**
```json
{
  "success": true,
  "data": {
    "region": { "city_code": string, "city_ko": string, "city_en": string },
    "images": [ { "id": number, "city_code": string, "file_name": string, "file_path": string, "public_url": string, "image_seq": number, "imageUrl": string } ],
    "firstImage": { ... }
  }
}
```

**캐시**: revalidate 3600 (1시간)

---

## 10. Sabre 통합 API

### 10.1 sabre/token

**`GET /api/sabre/token`**

Sabre API 토큰 유효성 확인 (마스킹된 프리뷰 반환).

**Response (200)**
```json
{
  "ok": true,
  "token_preview": "xxxxxxxx...xxxxxxxx"
}
```

---

### 10.2 sabre-id/search

**`POST /api/sabre-id/search`**

호텔명 또는 Sabre 호텔 코드로 호텔 검색 (Sabre API 기반).

**Request Body**
```json
{
  "hotelName": string
}
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "hotelCode": string,
      "hotelName": string,
      "address": string,
      "city": string,
      "country": string
    }
  ]
}
```

**비즈니스 로직**
- 숫자만 입력: 해당 코드로 hotel-details 직접 조회
- 문자열: EXPANDED_HOTEL_CODES 배치 조회 후 부분 매칭(isPartialMatch)

---

### 10.3 sabre-id/openai-search

**`POST /api/sabre-id/openai-search`**

OpenAI(GPT-4o)로 호텔명 → Sabre 코드 추출 후 Sabre API로 검증합니다.

**Request Body**
```json
{
  "hotelName": string
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "sabreHotelCode": string,
    "hotelName": string,
    "confidence": number,
    "reasoning": string,
    "verificationStatus": "verified" | "partial_match" | "no_match" | "verification_failed",
    "verificationDetails": {
      "inputHotelName": string,
      "verifiedHotelName": string,
      "matchScore": number,
      "address": string,
      "city": string,
      "country": string
    },
    "aiRaw": string
  }
}
```

**비즈니스 로직**
1. GPT에게 "호텔명의 Sabre Hotel Code 숫자만 알려줘" 요청
2. 응답에서 3자리 이상 숫자 추출
3. Sabre hotel-details로 검증
4. 입력명과 검증된 호텔명 정확 일치 시 verified, 아니면 첫 후보 반환
5. 후보 없으면 /api/sabre-id/search 폴백

---

## 11. OpenAI API

### 11.1 openai/chat

**`POST /api/openai/chat`**

OpenAI Chat Completions 프록시 (비스트리밍).

**Request Body**
```json
{
  "messages": [ { "role": "system"|"user"|"assistant", "content": string } ],
  "model": string,
  "max_completion_tokens": number,
  "temperature": number
}
```

**Response**: OpenAI API 원본 JSON

**에러**
- 500: MISSING_API_KEY, INVALID_API_KEY_FORMAT

---

### 11.2 openai/chat/stream

**`POST /api/openai/chat/stream`**

OpenAI Chat Completions 스트리밍 프록시.

**Request Body**
```json
{
  "messages": [...],
  "model": string,
  "temperature": number
}
```

**Response**: Content-Type: text/event-stream (SSE)

---

## 12. 기타 API

### 12.1 statistics

**`GET /api/statistics`**

대시보드용 통계를 반환합니다.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "totalHotels": number,
    "totalBrands": number,
    "totalBlogs": number,
    "totalCities": number,
    "totalTestimonials": number,
    "totalPromotions": number
  }
}
```

**테이블**
- select_hotels (publish null/true)
- hotel_brands (brand_slug 있음)
- select_hotel_blogs (publish true)
- select_regions (city, active)
- select_satisfaction_survey (pick true, review_text 있음)
- select_feature_slots (active true)

---

### 12.2 testimonials

**`GET /api/testimonials`**

랜딩용 고객 후기(pick=true)를 랜덤 순서로 반환합니다.

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "review_text": string,
      "property_name_kr": string,
      "booking_number": string,
      "sabre_id": number,
      "slug": string
    }
  ]
}
```

**캐시**: 30분 (s-maxage=1800, stale-while-revalidate=3600)

---

### 12.3 topic-pages/list

**`GET /api/topic-pages/list`**

**Response (200)**
```json
{
  "success": true,
  "pages": [ { "slug": string, "title_ko": string } ]
}
```

**테이블**: select_recommendation_pages (publish true)

---

### 12.4 revalidate

**`POST /api/revalidate`**

Next.js 캐시 무효화 (ISR).

**Request Body**
```json
{
  "secret": string,
  "path": string | string[],
  "tags": string | string[]
}
```

**인증**: `secret` === `REVALIDATE_SECRET`

**Response (200)**
```json
{
  "success": true,
  "revalidated": true,
  "message": "Cache revalidated successfully",
  "timestamp": string
}
```

---

**`DELETE /api/revalidate?secret=...&type=all`**

전체 캐시 클리어. 주요 태그/경로 일괄 revalidate.

---

## 13. 디버그 API

다음 API는 개발/운영 점검용이며, 프로덕션에서는 접근 제한 권장:

- `GET /api/debug/env` - 환경변수 노출 여부 확인
- `GET /api/debug/sabre-status` - Sabre 엔드포인트 상태
- `GET /api/debug/sabre` - Sabre 토큰/요청 테스트
- `GET /api/debug/accor-banner` - Accor 배너 디버깅
- `GET /api/debug/og-tags` - OG 태그 검증
- `GET /api/debug/storage-structure` - Storage 구조 확인
- `GET /api/openai/health` - OpenAI 연결 확인
- `GET /api/openai/test` - OpenAI 테스트

---

## 외부 API 의존성

| 서비스 | 용도 |
|--------|------|
| Supabase | DB, Storage, Auth |
| Sabre (sabre-nodejs Proxy) | 호텔 상세/검색 |
| OpenAI | 채팅, 브랜드 설명, 호텔 코드 추출 |
| Google Maps (Geocoding, Places) | 지도 마커, POI 호텔 |

---

## 환경 변수

| 변수 | 용도 |
|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase Anon Key |
| OPENAI_API_KEY | OpenAI API |
| GOOGLE_MAPS_API_KEY / NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | 지도/POI |
| SABRE_PROXY_BASE_URL | Sabre 프록시 Base URL |
| REVALIDATE_SECRET | 캐시 무효화 인증 |

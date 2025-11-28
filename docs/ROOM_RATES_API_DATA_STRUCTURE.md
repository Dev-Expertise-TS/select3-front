# 객실 타입별 요금 API 데이터 구조

## 📋 개요

호텔 상세 페이지의 "객실 타입별 요금" 섹션에서 표시되는 데이터 구조를 설명합니다.

## 🔗 API 엔드포인트

### 호텔 상세 정보 및 요금 조회
```
POST /api/hotel-details
```

**요청 본문 (Request Body):**
```json
{
  "hotelCode": "12345",           // 호텔 Sabre ID
  "startDate": "2024-12-25",       // 체크인 날짜 (YYYY-MM-DD)
  "endDate": "2024-12-27",        // 체크아웃 날짜 (YYYY-MM-DD)
  "adults": 2,                     // 성인 수
  "rooms": 1,                      // 객실 수
  "children": 0,                   // 아동 수 (선택)
  "ratePlanCodes": ["API", "VMC"]  // 요금제 코드 배열 (선택, 없으면 모든 Rate Plan 조회)
}
```

**응답 구조 (Response):**
```json
{
  "success": true,
  "data": {
    "GetHotelDetailsRS": {
      "RoomStays": {
        "RoomStay": [
          {
            "RoomRates": {
              "RoomRate": [
                {
                  "RateKey": "string",
                  "RoomType": "string",
                  "RoomName": "string",
                  "Description": "string",
                  "RoomViewDescription": "string",
                  "Total": {
                    "AmountAfterTax": 150000,
                    "CurrencyCode": "KRW"
                  },
                  "RatePlanDescription": "string",
                  "CancellationPolicy": "string"
                }
              ]
            }
          }
        ]
      }
    }
  },
  "meta": {
    "pricingSourceAttempted": "details",
    "hasAvailableData": false
  }
}
```

## 📊 클라이언트에서 사용하는 데이터 구조

### RatePlanCode 인터페이스

```typescript
interface RatePlanCode {
  // 기본 식별자
  RateKey: string                    // 요금제 고유 키 (예: "ABC123XYZ")
  
  // 객실 정보
  RoomType: string                   // 객실 타입 (예: "Classic Room")
  RoomName: string                    // 객실명 (예: "Deluxe Room")
  Description: string                  // 객실 설명 (베드 타입, 수용 인원 포함)
  RoomViewDescription?: string        // 전망 설명 (예: "Harbor view")
  
  // 가격 정보
  Currency: string                    // 통화 코드 (예: "KRW")
  AmountAfterTax: number             // 세금 포함 총액
  AmountBeforeTax: number            // 세금 제외 금액
  AverageNightlyRate: number         // 1박 평균 요금
  
  // 날짜 정보
  StartDate: string                   // 체크인 날짜 (YYYY-MM-DD)
  EndDate: string                     // 체크아웃 날짜 (YYYY-MM-DD)
  
  // 요금제 정보
  RoomTypeCode: string                // 객실 타입 코드
  BookingCode: string                 // 예약 코드
  RatePlanDescription: string        // 요금제 설명
  RatePlanType: string               // 요금제 타입
  RateDescription: string             // 요금 설명
  PlanDescription: string             // 플랜 설명
  CancellationPolicy: string          // 취소 정책
  
  // 선택적 필드
  DiscountAmount?: number             // 할인 금액
  _original?: any                     // 원본 데이터 (디버깅용)
}
```

## 🎨 UI에서 표시되는 필드 매핑

### RoomCard 컴포넌트에 전달되는 데이터

```typescript
// RoomCardList.tsx에서 변환
const roomType = rp.RoomType || rp.RoomName || ''        // "Classic Room"
const roomName = rp.RoomName || ''                       // "Deluxe Room"
const description = rp.Description || ''                 // "KING BED 기준 2인 / 최대 2인"
const view = rp.RoomViewDescription || rp.RoomView || null  // "Harbor view"
const amount = rp.AmountAfterTax || rp.Amount || rp.Total || 0  // 150000
const currency = rp.Currency || 'KRW'                    // "KRW"
const rateKey = rp.RateKey || ''                        // "ABC123XYZ"

// 추출된 정보
const bedType = extractBedTypeFromDescription(description)  // "킹 베드"
const occupancy = extractOccupancy(description)              // "기준 2인 / 최대 2인"

// AI 생성 객실 소개 (선택적)
const roomIntroduction = roomIntroductions.get(introKey)   // "38제곱미터의 넓은 공간..."
```

### UI 표시 예시

```
객실 타입별 요금
┌─────────────────────────────────────┐
│ Classic Room Harbor view            │
│ 킹 베드  기준 2인 / 최대 2인        │
│                                     │
│ 38제곱미터의 넓은 공간을 갖춘 이    │
│ 객실은 킹 침대가 마련되어 있어      │
│ 편안한 휴식을 제공합니다...         │
│                                     │
│ 2박 세금 포함                       │
│ ₩300,000                            │
│ (1실 ₩150,000 × 1실)                │
│                                     │
│ [예약하기]                          │
└─────────────────────────────────────┘
```

## 🔍 데이터 추출 로직

### 베드 타입 추출
```typescript
function extractBedTypeFromDescription(description: string): string {
  // Description에서 "KING BED", "TWIN BED" 등을 찾아서
  // "킹 베드", "트윈 베드"로 변환
  // 예: "KING BED 기준 2인" → "킹 베드"
}
```

### 수용 인원 추출
```typescript
function extractOccupancy(description: string): string {
  // Description에서 "기준 2인 / 최대 2인" 패턴 추출
  // 예: "KING BED 기준 2인 / 최대 2인" → "기준 2인 / 최대 2인"
}
```

## 🤖 AI 생성 객실 소개

### 키 생성 방식
```typescript
const introKey = `${roomType}-${roomName}-${rateKey}`
// 예: "Classic Room-Deluxe Room-ABC123XYZ"
```

### AI 소개 데이터 구조
```typescript
// Map<string, string> 형태로 저장
roomIntroductions.get(introKey)
// 반환값: "38제곱미터의 넓은 공간을 갖춘 이 객실은..."
```

## 📝 실제 데이터 예시

### Sabre API 원본 응답
```json
{
  "GetHotelDetailsRS": {
    "RoomStays": {
      "RoomStay": [
        {
          "RoomRates": {
            "RoomRate": [
              {
                "RateKey": "ABC123XYZ",
                "RoomType": "Classic Room",
                "RoomName": "Classic Room",
                "Description": "KING BED 기준 2인 / 최대 2인",
                "RoomViewDescription": "Harbor view",
                "Total": {
                  "AmountAfterTax": 150000,
                  "CurrencyCode": "KRW"
                },
                "RatePlanDescription": "Best Available Rate",
                "CancellationPolicy": "Free cancellation until 24 hours before check-in"
              }
            ]
          }
        }
      ]
    }
  }
}
```

### 클라이언트에서 변환된 데이터
```typescript
{
  RateKey: "ABC123XYZ",
  RoomType: "Classic Room",
  RoomName: "Classic Room",
  Description: "KING BED 기준 2인 / 최대 2인",
  RoomViewDescription: "Harbor view",
  Currency: "KRW",
  AmountAfterTax: 150000,
  AmountBeforeTax: 140000,
  AverageNightlyRate: 75000,
  StartDate: "2024-12-25",
  EndDate: "2024-12-27",
  RoomTypeCode: "CLS",
  BookingCode: "BAR",
  RatePlanDescription: "Best Available Rate",
  RatePlanType: "Standard",
  RateDescription: "Best Available Rate",
  PlanDescription: "Best Available Rate",
  CancellationPolicy: "Free cancellation until 24 hours before check-in"
}
```

### UI에 표시되는 최종 데이터
```typescript
{
  roomType: "Classic Room",
  roomName: "Classic Room",
  description: "KING BED 기준 2인 / 최대 2인",
  view: "Harbor view",
  bedType: "킹 베드",
  occupancy: "기준 2인 / 최대 2인",
  amount: 150000,
  currency: "KRW",
  rateKey: "ABC123XYZ",
  roomIntroduction: "38제곱미터의 넓은 공간을 갖춘 이 객실은 킹 침대가 마련되어 있어 편안한 휴식을 제공합니다..."
}
```

## 🔄 데이터 흐름

1. **API 요청**
   - 클라이언트 → `/api/hotel-details` (POST)
   - 요청: 호텔 코드, 체크인/아웃 날짜, 인원 수

2. **Sabre API 호출**
   - 서버 → Sabre Hotel Details API
   - 응답: XML/JSON 형태의 호텔 상세 정보

3. **데이터 변환**
   - 서버에서 RatePlanCode 형태로 변환
   - 클라이언트로 전달

4. **클라이언트 처리**
   - `RoomCardList` 컴포넌트에서 데이터 매핑
   - 베드 타입, 수용 인원 추출
   - AI 생성 객실 소개 조회

5. **UI 렌더링**
   - `RoomCard` 컴포넌트로 개별 카드 렌더링
   - TranslationErrorBoundary로 감싸서 번역 오류 방지

## 📌 주요 파일 위치

- **타입 정의**: `src/types/hotel.ts` (RatePlanCode 인터페이스)
- **API 엔드포인트**: `src/app/api/hotel-details/route.ts`
- **컴포넌트**: 
  - `src/features/hotels/components/RoomCardList.tsx` (리스트)
  - `src/features/hotels/components/RoomCard.tsx` (개별 카드)
- **데이터 처리**: `src/features/hotels/hotel-detail.tsx` (메인 로직)

## ⚠️ 주의사항

1. **Description 필드 파싱**
   - 베드 타입과 수용 인원은 Description에서 추출
   - 형식이 일정하지 않을 수 있으므로 유연한 파싱 필요

2. **AI 객실 소개**
   - `roomIntroduction`은 선택적 필드
   - 없으면 "객실 설명 AI 설명 보기" 버튼 표시
   - AI 생성 중이면 로딩 상태 표시

3. **가격 계산**
   - `AmountAfterTax`는 세금 포함 총액
   - 여러 객실 예약 시: `amount * rooms`
   - 1박 평균: `AmountAfterTax / (체크아웃 - 체크인 일수)`

4. **TranslationErrorBoundary**
   - 브라우저 번역 기능으로 인한 오류 방지
   - `suppressHydrationWarning` 및 `translate="no"` 속성 사용


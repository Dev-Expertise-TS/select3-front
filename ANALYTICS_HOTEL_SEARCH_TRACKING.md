# 호텔 검색 이벤트 추적 가이드

## 📊 GA4에서 확인하는 방법

### 1. 실시간 확인 (Realtime) - 추천!

**경로:** `Reports` → `Realtime` → `Event count by Event name`

1. Google Analytics에 접속: https://analytics.google.com/
2. 왼쪽 메뉴에서 **"Reports"** 클릭
3. **"Realtime"** 선택
4. **"이벤트 이름 별 이벤트 수"** (Event count by Event name) 섹션에서 **`hotel_search`** 이벤트 확인
5. 이벤트 클릭 시 상세 정보에서:
   - `event_category`: `search`
   - `event_label`: 검색어
   - `search_term`: 검색어
   - `check_in`, `check_out`: 체크인/아웃 날짜
   - `nights`: 숙박일
   - `rooms`, `adults`, `children`: 객실/인원 정보
   - `hotel_id`, `hotel_name`: 특정 호텔 검색 시
   - `search_type`: `hotel_specific` 또는 `keyword_search`
   - `search_location`: 검색 위치 (`landing`, `hotel-detail`, `destination`)

### 2. 이벤트 상세 분석

**경로:** `Reports` → `Engagement` → `Events`

1. 왼쪽 메뉴에서 **"Reports"** 클릭
2. **"Engagement"** → **"Events"** 선택
3. **"Event name"** 목록에서 **`hotel_search`** 검색
4. **`hotel_search`** 이벤트 클릭
5. **"Parameters"** 탭에서 확인:
   - `search_term`: 검색어
   - `check_in`: 체크인 날짜
   - `check_out`: 체크아웃 날짜
   - `nights`: 숙박일
   - `rooms`: 룸 수
   - `adults`: 성인 수
   - `children`: 어린이 수
   - `total_guests`: 총 인원
   - `search_type`: 검색 타입
   - `search_location`: 검색 위치
   - `hotel_id`: 호텔 ID (특정 호텔 검색 시)
   - `hotel_name`: 호텔명 (특정 호텔 검색 시)

### 3. DebugView로 테스트 (가장 정확!)

**경로:** `Configure` → `DebugView`

1. 왼쪽 메뉴에서 **"Configure"** 클릭
2. **"DebugView"** 선택
3. 브라우저에서 호텔 검색 수행
4. 실시간으로 이벤트 발생 확인:
   - **Event name:** `hotel_search`
   - Parameters: 모든 검색 파라미터 확인

### 4. 커스텀 보고서 생성

**경로:** `Explore` → `Free Form`

1. 왼쪽 메뉴에서 **"Explore"** 클릭
2. **"Free form"** 선택
3. 측정기준 추가:
   - Event name
   - search_term
   - search_type
   - search_location
   - hotel_id
   - hotel_name
   - check_in
   - check_out
   - nights
   - rooms
4. 측정항목 추가:
   - Event count
5. 필터 추가:
   - Event name = `hotel_search`

---

## 🔍 GTM에서 확인하는 방법

### 1. Preview 모드

1. Google Tag Manager 접속
2. 우측 상단 **"Preview"** 클릭
3. 사이트 URL 입력
4. 호텔 검색 수행
5. **"dataLayer"** 확인:
   ```javascript
   {
     event: 'hotel_search',
     search_term: '파리',
     check_in_date: '2024-12-01',
     check_out_date: '2024-12-03',
     nights: 2,
     rooms: 1,
     adults: 2,
     children: 0,
     total_guests: 2,
     search_type: 'keyword_search',
     search_location: 'landing',
     selected_hotel_id: null,
     selected_hotel_name: null,
     timestamp: '2024-11-20T...'
   }
   ```

---

## 🧪 브라우저 콘솔에서 테스트

### 개발자 도구 열기

1. `F12` 또는 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. **Console** 탭 선택

### 이벤트 확인

호텔 검색 버튼 클릭 시 콘솔에 출력:

```
✅ [GA4] 호텔 검색 이벤트 전송 완료: hotel_search
✅ [GTM] dataLayer push 완료
🔍 [Analytics] 호텔 검색: {
  검색어: '파리',
  체크인: '2024-12-01',
  체크아웃: '2024-12-03',
  숙박일: 2,
  룸: 1,
  성인: 2,
  어린이: 0,
  검색위치: 'landing',
  호텔ID: null,
  호텔명: null,
  검색타입: '키워드 검색',
  gtag_로드: true,
  dataLayer_로드: true
}
```

### dataLayer 직접 확인

```javascript
// 브라우저 콘솔에서 실행
window.dataLayer.filter(item => item.event === 'hotel_search')
```

---

## 📈 주요 지표

### 검색 타입별 분석

**키워드 검색 vs 특정 호텔 검색:**
- `search_type = 'keyword_search'`: 일반 검색
- `search_type = 'hotel_specific'`: 특정 호텔 검색

### 검색 위치별 분석

**`search_location` 값:**
- `landing`: 메인 페이지
- `hotel-detail`: 호텔 상세 페이지
- `destination`: 목적지 페이지

### 인기 검색어

`search_term` 파라미터를 기준으로:
1. **"Explore"** → **"Free form"**
2. 측정기준: `search_term`
3. 측정항목: `Event count`
4. 필터: `Event name = hotel_search`
5. 정렬: `Event count` 내림차순

### 평균 숙박일

`nights` 파라미터를 기준으로:
1. **"Explore"** → **"Free form"**
2. 측정기준: `nights`
3. 측정항목: `Average nights` (계산)

---

## 🐛 문제 해결

### 이벤트가 보이지 않을 때

#### 1단계: 브라우저 콘솔 확인

호텔 검색 버튼 클릭 후 브라우저 콘솔(F12)에서 다음 로그 확인:

```
✅ [GA4] 호텔 검색 이벤트 전송 완료: hotel_search
✅ [GTM] dataLayer push 완료
🔍 [Analytics] 호텔 검색: { ... }
```

**만약 다음 경고가 보이면:**
```
⚠️ [GA4] gtag 함수가 로드되지 않았습니다.
⚠️ [GTM] dataLayer가 없습니다.
```
→ GA4 스크립트가 로드되지 않은 것입니다.

#### 2단계: gtag 함수 확인

브라우저 콘솔에서 직접 확인:

```javascript
// gtag 함수 확인
console.log(typeof window.gtag) // 'function' 이어야 함

// 수동으로 이벤트 전송 테스트
window.gtag('event', 'hotel_search', {
  event_category: 'search',
  search_term: '테스트',
  check_in: '2024-12-01',
  check_out: '2024-12-03'
})
```

#### 3단계: 검색어 유효성 확인

검색어가 비어있으면 이벤트가 전송되지 않을 수 있습니다:

```javascript
// common-search-bar.tsx에서 확인
const trimmed = searchQuery.trim()
if (!trimmed && !selectedHotel) {
  // 경고 메시지 표시 후 중단
  return
}
```

#### 4단계: Network 탭 확인

1. F12 → Network 탭
2. `collect?v=2&tid=G-6Y4X23JB12...` 요청 확인
3. Payload에서 `en=hotel_search` 확인

---

## 📝 추적되는 검색 시나리오

### 1. 메인 페이지 검색
- **위치:** 랜딩 페이지 상단 검색바
- **`search_location`:** `landing`
- **`variant`:** `"landing"`

### 2. 호텔 상세 페이지 검색
- **위치:** 호텔 상세 페이지 내 검색바
- **`search_location`:** `hotel-detail`
- **`variant`:** `"hotel-detail"`

### 3. 목적지 페이지 검색
- **위치:** 목적지 페이지 검색바
- **`search_location`:** `destination`
- **`variant`:** `"destination"`

### 4. 특정 호텔 검색
- **자동완성에서 호텔 선택 시:**
  - `hotel_id`: 선택된 호텔 ID
  - `hotel_name`: 선택된 호텔명
  - `search_type`: `"hotel_specific"`

### 5. 키워드 검색
- **검색어만 입력 시:**
  - `search_term`: 입력한 검색어
  - `search_type`: `"keyword_search"`

---

## 🎯 주요 분석 목표

### 1. 검색 전환율
```
호텔 검색 수행 → 호텔 상세 페이지 조회
─────────────────────────────────────
           호텔 검색 수
```

### 2. 검색어 인기도
- 가장 많이 검색되는 키워드
- 계절별 인기 검색어
- 지역별 인기 검색어

### 3. 검색 패턴 분석
- 평균 숙박일
- 평균 룸 수
- 평균 인원수
- 체크인 날짜 패턴

### 4. 특정 호텔 검색 비율
- 특정 호텔 검색 vs 일반 검색 비율
- 어떤 호텔이 자주 검색되는지

---

## 📚 참고 자료

- [GA4 Search Events](https://support.google.com/analytics/answer/9267735)
- [GA4 Custom Parameters](https://support.google.com/analytics/answer/9267735)
- [GTM Preview Mode](https://support.google.com/tagmanager/answer/6107056)


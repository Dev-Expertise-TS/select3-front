# 카카오 친구 추가 이벤트 추적 가이드

## 🎯 변경 사항 (2024년 업데이트)

**중요:** 이벤트명이 `click`에서 **`kakao_friend_add`**로 변경되었습니다!

이제 GA4에서 **`kakao_friend_add`** 이벤트를 직접 확인할 수 있습니다.

## 📊 GA4에서 확인하는 방법

### 1. 실시간 확인 (Realtime) - 추천!

**경로:** `Reports` → `Realtime` → `Event count by Event name`

1. Google Analytics에 접속: https://analytics.google.com/
2. 왼쪽 메뉴에서 **"Reports"** 클릭
3. **"Realtime"** 선택
4. **"이벤트 이름 별 이벤트 수"** (Event count by Event name) 섹션에서 **`kakao_friend_add`** 이벤트 확인
5. 이벤트 클릭 시 상세 정보에서:
   - `event_category`: `engagement`
   - `event_label`: `hotel_detail_room_rates`
   - `hotel_id`, `hotel_name`, `check_in`, `check_out`, `rooms` 등 커스텀 파라미터 확인

### 2. 이벤트 상세 분석

**경로:** `Reports` → `Engagement` → `Events`

1. 왼쪽 메뉴에서 **"Reports"** 클릭
2. **"Engagement"** → **"Events"** 선택
3. **"Event name"** 목록에서 **`kakao_friend_add`** 검색
4. **`kakao_friend_add`** 이벤트 클릭
5. **"Parameters"** 탭에서 확인:
   - `event_category`: `engagement`
   - `event_label`: `hotel_detail_room_rates`
   - `hotel_id`: 호텔 ID
   - `hotel_name`: 호텔명
   - `check_in`: 체크인 날짜
   - `check_out`: 체크아웃 날짜
   - `rooms`: 룸 수
   - `button_location`: 버튼 위치

### 3. DebugView로 테스트 (가장 정확!)

**경로:** `Configure` → `DebugView`

1. 왼쪽 메뉴에서 **"Configure"** 클릭
2. **"DebugView"** 선택
3. 브라우저에서 카카오 친구 추가 버튼 클릭
4. 실시간으로 이벤트 발생 확인:
   - **Event name:** `kakao_friend_add` ← 이제 여기서 바로 확인 가능!
   - Parameters:
     - `event_category`: `engagement`
     - `event_label`: `hotel_detail_room_rates`
     - `hotel_id`: 호텔 ID
     - `hotel_name`: 호텔명
     - `check_in`, `check_out`, `rooms` 등

### 4. 커스텀 보고서 생성

**경로:** `Explore` → `Free Form`

1. 왼쪽 메뉴에서 **"Explore"** 클릭
2. **"Free form"** 선택
3. 측정기준 추가:
   - Event name
   - hotel_id
   - hotel_name
   - check_in
   - check_out
   - rooms
4. 측정항목 추가:
   - Event count
5. 필터 추가:
   - Event name = `kakao_friend_add`

---

## 🔍 GTM에서 확인하는 방법

### 1. Preview 모드

1. Google Tag Manager 접속
2. 우측 상단 **"Preview"** 클릭
3. 사이트 URL 입력
4. 카카오 친구 추가 버튼 클릭
5. **"dataLayer"** 확인:
   ```javascript
   {
     event: 'kakao_friend_add',
     button_location: 'hotel_detail_room_rates',
     hotel_id: 12345,
     hotel_name: '소피텔 파리',
     check_in: '2024-12-01',
     check_out: '2024-12-03',
     rooms: 1,
     timestamp: '2024-11-20T...'
   }
   ```

### 2. dataLayer 자동 트리거 생성

**Tag Manager** → **Triggers** → **New**:

- **Trigger Type:** Custom Event
- **Event name:** `kakao_friend_add`
- **Tag 설정:**
  - Tag Type: Google Analytics: GA4 Event
  - Configuration Tag: GA4 Configuration
  - Event Name: `kakao_friend_add`
  - Event Parameters:
    - `button_location`: {{dlv button_location}}
    - `hotel_id`: {{dlv hotel_id}}
    - `hotel_name`: {{dlv hotel_name}}
    - `check_in`: {{dlv check_in}}
    - `check_out`: {{dlv check_out}}
    - `rooms`: {{dlv rooms}}

---

## 🧪 브라우저 콘솔에서 테스트

### 개발자 도구 열기

1. `F12` 또는 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. **Console** 탭 선택

### 이벤트 확인

카카오 친구 추가 버튼 클릭 시 콘솔에 출력:

```
🎯 [Analytics] 카카오 친구 추가 클릭: {
  호텔ID: 12345,
  호텔명: '소피텔 파리',
  체크인: '2024-12-01',
  체크아웃: '2024-12-03',
  룸수: 1
}
```

### dataLayer 직접 확인

```javascript
// 브라우저 콘솔에서 실행
window.dataLayer.filter(item => item.event === 'kakao_friend_add')
```

---

## 📈 주요 지표

### 전환율 계산

```
카카오 친구 추가 클릭 수
───────────────────────────── × 100
객실 요금 확인 페이지 조회 수
```

### GA4에서 확인하는 법

1. **"Explore"** → **"Free form"**
2. 측정기준: Event name
3. 측정항목: 
   - Event count
4. 필터:
   - Event name = `click`
   - event_category = `kakao_friend_add`
5. 페이지 경로 추가하여 전환율 계산

---

## 🐛 문제 해결

### 이벤트가 보이지 않을 때

#### 1단계: 브라우저 콘솔 확인

카카오 친구 추가 버튼 클릭 후 브라우저 콘솔(F12)에서 다음 로그 확인:

```
✅ [GA4] 이벤트 전송 완료: kakao_friend_add
✅ [GTM] dataLayer push 완료
🎯 [Analytics] 카카오 친구 추가 클릭: { ... }
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
window.gtag('event', 'kakao_friend_add', {
  event_category: 'engagement',
  event_label: 'test'
})
```

#### 3단계: GA4 Tracking ID 확인

```bash
# .env.local 파일
NEXT_PUBLIC_GA_ID=G-6Y4X23JB12
```

#### 4단계: Ad Blocker 확인
- GA4 차단 확장 프로그램 비활성화
- 시크릿 모드에서 테스트

#### 5단계: Network 탭 확인
- F12 → Network 탭
- `collect?v=2&tid=G-6Y4X23JB12...` 요청 확인
- Payload에서 `en=kakao_friend_add` 확인

#### 6단계: GA4 DebugView 확인
- `Configure` → `DebugView`
- 브라우저에서 이벤트 발생
- 실시간으로 이벤트 확인

### 이벤트는 보이지만 파라미터가 없는 경우

GA4에서 파라미터를 등록해야 할 수 있습니다:

1. **"Configure"** → **"Custom definitions"**
2. **"Create custom dimension"** 클릭
3. 다음 파라미터 등록:
   - `hotel_id` (Text)
   - `hotel_name` (Text)
   - `check_in` (Text)
   - `check_out` (Text)
   - `rooms` (Number)
   - `button_location` (Text)

---

## 📚 참고 자료

- [GA4 Event Parameters](https://support.google.com/analytics/answer/9267735)
- [GA4 DebugView 가이드](https://support.google.com/analytics/answer/7201382)
- [GTM Preview Mode](https://support.google.com/tagmanager/answer/6107056)


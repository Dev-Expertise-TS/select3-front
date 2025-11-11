# 카카오톡 상담 버튼 클릭 이벤트 추적 가이드

## 📊 GA4에서 확인하는 방법

### 1. 실시간 확인 (Realtime) - 추천!

**경로:** `Reports` → `Realtime` → `Event count by Event name`

1. Google Analytics에 접속: https://analytics.google.com/
2. 왼쪽 메뉴에서 **"Reports"** 클릭
3. **"Realtime"** 선택
4. **"이벤트 이름 별 이벤트 수"** (Event count by Event name) 섹션에서 **`kakao_consultation`** 이벤트 확인
5. 이벤트 클릭 시 상세 정보에서:
   - `event_category`: `engagement`
   - `event_label`: 버튼 위치 (예: `floating_button`, `room_card`, `no_rooms_available`, `error_state`)
   - `button_location`: 버튼 위치
   - `button_type`: 버튼 타입 (`consultation`, `reservation`)
   - 추가 파라미터: 버튼별 상세 정보

### 2. 이벤트 상세 분석

**경로:** `Reports` → `Engagement` → `Events`

1. 왼쪽 메뉴에서 **"Reports"** 클릭
2. **"Engagement"** → **"Events"** 선택
3. **"Event name"** 목록에서 **`kakao_consultation`** 검색
4. **`kakao_consultation`** 이벤트 클릭
5. **"Parameters"** 탭에서 확인:
   - `button_location`: 버튼 위치
   - `button_type`: 버튼 타입
   - `button_text`: 버튼 텍스트 (일부 버튼)
   - `button_style`: 버튼 스타일 (플로팅 버튼)
   - `room_type`, `room_name`, `amount`, `currency`: 객실 카드 버튼
   - `error_context`: 에러 상태 버튼

### 3. DebugView로 테스트 (가장 정확!)

**경로:** `Configure` → `DebugView`

1. 왼쪽 메뉴에서 **"Configure"** 클릭
2. **"DebugView"** 선택
3. 브라우저에서 카카오톡 상담 버튼 클릭
4. 실시간으로 이벤트 발생 확인:
   - **Event name:** `kakao_consultation`
   - Parameters: 버튼 위치별 상세 정보

### 4. 커스텀 보고서 생성

**경로:** `Explore` → `Free Form`

1. 왼쪽 메뉴에서 **"Explore"** 클릭
2. **"Free form"** 선택
3. 측정기준 추가:
   - Event name
   - button_location
   - button_type
   - room_type (객실 카드 버튼)
4. 측정항목 추가:
   - Event count
5. 필터 추가:
   - Event name = `kakao_consultation`

---

## 📍 추적되는 버튼 위치

### 1. 플로팅 버튼 (`floating_button`)
- **위치:** 페이지 하단 우측 고정 버튼
- **스타일:** 플로팅 버튼
- **파라미터:**
  - `button_location`: `floating_button`
  - `button_style`: `floating`
  - `button_type`: `consultation`

### 2. 공통 상담 버튼 (`KakaoChatButton`)
- **위치:** 여러 페이지에서 사용되는 공통 버튼
- **파라미터:**
  - `button_location`: 전달된 location 값
  - `button_text`: 버튼 텍스트
  - `button_type`: `consultation`

**사용 위치 예시:**
- `no_rooms_available`: 객실이 없을 때
- `hotel_detail`: 호텔 상세 페이지
- 기타 커스텀 location 값

### 3. 객실 카드 버튼 (`room_card`)
- **위치:** 객실 카드 내 "예약 컨시어지" 버튼
- **파라미터:**
  - `button_location`: `room_card`
  - `button_type`: `reservation`
  - `room_type`: 객실 타입
  - `room_name`: 객실명
  - `amount`: 객실 금액
  - `currency`: 통화

### 4. 에러 상태 버튼 (`error_state`)
- **위치:** 요금 조회 에러 시 표시되는 버튼
- **파라미터:**
  - `button_location`: `error_state`
  - `button_type`: `consultation`
  - `error_context`: `no_rates_available`

---

## 🔍 GTM에서 확인하는 방법

### 1. Preview 모드

1. Google Tag Manager 접속
2. 우측 상단 **"Preview"** 클릭
3. 사이트 URL 입력
4. 카카오톡 상담 버튼 클릭
5. **"dataLayer"** 확인:
   ```javascript
   {
     event: 'kakao_consultation',
     button_location: 'floating_button',
     button_type: 'consultation',
     button_style: 'floating',
     timestamp: '2024-11-20T...'
   }
   ```

---

## 🧪 브라우저 콘솔에서 테스트

### 개발자 도구 열기

1. `F12` 또는 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. **Console** 탭 선택

### 이벤트 확인

카카오톡 상담 버튼 클릭 시 콘솔에 출력:

```
✅ [GA4] 카카오톡 상담 이벤트 전송 완료: kakao_consultation
✅ [GTM] dataLayer push 완료
💬 [Analytics] 카카오톡 상담 클릭: {
  위치: 'floating_button',
  버튼타입: 'consultation',
  버튼스타일: 'floating',
  gtag_로드: true,
  dataLayer_로드: true
}
```

### dataLayer 직접 확인

```javascript
// 브라우저 콘솔에서 실행
window.dataLayer.filter(item => item.event === 'kakao_consultation')
```

---

## 📈 주요 지표

### 버튼 위치별 클릭 분석

**가장 많이 클릭되는 버튼 위치:**
1. **"Explore"** → **"Free form"**
2. 측정기준: `button_location`
3. 측정항목: `Event count`
4. 필터: `Event name = kakao_consultation`
5. 정렬: `Event count` 내림차순

### 버튼 타입별 분석

- `consultation`: 일반 상담 버튼
- `reservation`: 객실 예약 관련 버튼

### 객실별 클릭 분석 (객실 카드 버튼)

**객실 타입별 클릭률:**
- `room_type` 파라미터 기준
- 인기 객실 타입 파악 가능

### 에러 상태 분석

**에러 발생 시 상담 요청:**
- `error_context = no_rates_available`
- 요금 조회 실패 시 사용자 행동 분석

---

## 🐛 문제 해결

### 이벤트가 보이지 않을 때

#### 1단계: 브라우저 콘솔 확인

카카오톡 상담 버튼 클릭 후 브라우저 콘솔(F12)에서 다음 로그 확인:

```
✅ [GA4] 카카오톡 상담 이벤트 전송 완료: kakao_consultation
✅ [GTM] dataLayer push 완료
💬 [Analytics] 카카오톡 상담 클릭: { ... }
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
window.gtag('event', 'kakao_consultation', {
  event_category: 'engagement',
  button_location: 'test'
})
```

#### 3단계: Network 탭 확인

1. F12 → Network 탭
2. `collect?v=2&tid=G-6Y4X23JB12...` 요청 확인
3. Payload에서 `en=kakao_consultation` 확인

#### 4단계: 버튼 위치 확인

각 버튼의 `location` prop이 올바르게 전달되었는지 확인:
- 플로팅 버튼: 자동으로 `floating_button` 설정
- 공통 버튼: `location` prop 확인 필요
- 객실 카드: 자동으로 `room_card` 설정
- 에러 상태: 자동으로 `error_state` 설정

---

## 🎯 주요 분석 목표

### 1. 버튼 위치별 클릭률
```
특정 위치 버튼 클릭 수
───────────────────────────── × 100
해당 위치 페이지 조회 수
```

### 2. 전환율 추적
- 카카오톡 상담 클릭 → 실제 상담 완료
- 객실 카드 버튼 클릭 → 예약으로 이어지는지

### 3. 에러 상태 대응 분석
- 요금 조회 실패 시 상담 요청 비율
- 사용자 불편 해소 여부 확인

### 4. 인기 객실 타입 분석
- 객실 카드 버튼 클릭 기준
- 어떤 객실이 자주 문의되는지

---

## 📚 참고 자료

- [GA4 Engagement Events](https://support.google.com/analytics/answer/9267735)
- [GA4 Custom Parameters](https://support.google.com/analytics/answer/9267735)
- [GTM Preview Mode](https://support.google.com/tagmanager/answer/6107056)


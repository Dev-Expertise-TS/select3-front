# GTM/GA4 디버그 가이드

## 🎯 개요

개발 환경에서 GTM(Google Tag Manager)와 GA4(Google Analytics 4) 이벤트를 쉽게 모니터링하고 디버그할 수 있는 도구입니다.

## 📦 설치 완료

- ✅ `src/components/analytics/gtm-debug.tsx` 생성
- ✅ `src/app/layout.tsx`에 자동 추가
- ✅ **개발 환경에서만** 자동으로 활성화됩니다 (프로덕션에는 영향 없음)

---

## 🚀 사용 방법

### 1️⃣ 개발 서버 실행

```bash
pnpm dev
```

### 2️⃣ 브라우저 열기

```
http://localhost:3000
```

### 3️⃣ 브라우저 개발자 도구 열기

- **Windows/Linux**: `F12` 또는 `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`

### 4️⃣ Console 탭 확인

페이지 로드 시 자동으로 다음과 같은 메시지가 표시됩니다:

```
🔍 GTM 디버그 모드 활성화
GTM 로드: ✅
GA4 로드: ✅
현재 dataLayer: [...]

💡 Tip: window.gtmDebug.help() 를 입력하면 사용 가능한 함수를 볼 수 있습니다
```

---

## 🛠️ 사용 가능한 함수

콘솔에서 다음 함수들을 실행할 수 있습니다:

### ✅ `window.gtmDebug.check()`
GTM 상태를 확인합니다.

```javascript
window.gtmDebug.check()
```

**출력 예시:**
```
=== GTM 상태 확인 ===
GTM 로드: true
GA4 로드: true
dataLayer 길이: 12
최근 3개 이벤트: [{...}, {...}, {...}]
```

---

### 📊 `window.gtmDebug.events()`
전체 이벤트 목록을 확인합니다.

```javascript
window.gtmDebug.events()
```

**출력 예시:**
```
=== 전체 이벤트 목록 ===
1. gtm.js {event: 'gtm.js', gtm.start: 1234567890}
2. kakao_click {event: 'kakao_click', button_location: 'floating_button', ...}
3. view_item {event: 'view_item', ...}
```

---

### 💬 `window.gtmDebug.kakao()`
카카오톡 클릭 이벤트만 조회합니다 (테이블 형식).

```javascript
window.gtmDebug.kakao()
```

**출력 예시:**
```
=== 카카오톡 클릭 이벤트 ===
┌─────────┬──────────────┬────────────────────┬──────────────────┐
│ (index) │ event        │ button_location    │ button_type      │
├─────────┼──────────────┼────────────────────┼──────────────────┤
│ 0       │ kakao_click  │ floating_button    │ consultation     │
│ 1       │ kakao_click  │ room_card          │ reservation      │
│ 2       │ kakao_click  │ footer             │ consultation     │
└─────────┴──────────────┴────────────────────┴──────────────────┘
```

---

### 🧹 `window.gtmDebug.clear()`
콘솔을 클리어합니다.

```javascript
window.gtmDebug.clear()
```

---

### ❓ `window.gtmDebug.help()`
도움말을 표시합니다.

```javascript
window.gtmDebug.help()
```

---

## 🎨 자동 이벤트 모니터링

카카오톡 버튼을 클릭하면 콘솔에 자동으로 로그가 출력됩니다:

```
📊 GTM 이벤트 발생
이벤트 데이터: {
  event: 'kakao_click',
  button_location: 'floating_button',
  button_type: 'consultation'
}
전체 dataLayer: [...]
```

---

## 📋 실전 사용 예시

### 예시 1: 카카오톡 버튼 클릭 추적 확인

1. 페이지를 새로고침
2. 카카오톡 버튼 클릭 (플로팅 버튼, 객실 카드 등)
3. 콘솔에서 자동으로 이벤트 로그 확인
4. 또는 다음 명령어 실행:

```javascript
window.gtmDebug.kakao()
```

---

### 예시 2: 호텔 상세 페이지 view_item 이벤트 확인

1. 호텔 상세 페이지 방문
2. 콘솔에서 이벤트 확인:

```javascript
window.gtmDebug.events()
```

3. `view_item` 이벤트 찾기

---

### 예시 3: 특정 위치의 클릭만 필터링

```javascript
// 카카오톡 이벤트 가져오기
const kakaoEvents = window.gtmDebug.kakao()

// 플로팅 버튼 클릭만 필터링
const floatingClicks = kakaoEvents.filter(e => e.button_location === 'floating_button')
console.log('플로팅 버튼 클릭 횟수:', floatingClicks.length)
```

---

## 🔍 GTM Preview 모드와 함께 사용

GTM Preview 모드와 함께 사용하면 더욱 강력합니다:

### 1. GTM 대시보드에서 Preview 모드 실행

```
https://tagmanager.google.com/
→ 컨테이너 GTM-W4D9SSJB 선택
→ "미리보기" 클릭
→ https://localhost:3000 입력
```

### 2. 브라우저 콘솔에서 디버그

```javascript
// GTM 상태 확인
window.gtmDebug.check()

// 카카오톡 버튼 클릭
// (자동으로 콘솔에 로그 출력됨)

// 클릭 이벤트 테이블로 확인
window.gtmDebug.kakao()
```

### 3. GTM Debug 패널과 비교

- GTM Debug 패널: 태그 실행 여부, 변수 값 확인
- 브라우저 콘솔: dataLayer 원본 데이터 확인

---

## 🎯 추적 중인 카카오톡 버튼 위치

| 위치 | button_location 값 |
|------|-------------------|
| 플로팅 버튼 (우측 하단) | `floating_button` |
| 객실 카드 예약 버튼 | `room_card` |
| 에러 상태 상담 버튼 | `error_state` |
| 객실 없을 때 | `no_rooms_available` |
| 푸터 연락처 | `footer` |
| Contact 페이지 | `contact_page` |
| About 페이지 | `about_page` |
| Testimonials 페이지 | `testimonials_cta` |

---

## 🚨 문제 해결

### GTM 로드가 ❌로 표시되는 경우

1. **GTM 스크립트 로딩 대기**
   ```javascript
   // 1초 후 다시 확인
   setTimeout(() => window.gtmDebug.check(), 2000)
   ```

2. **GTM 컨테이너 ID 확인**
   - `src/app/layout.tsx`에서 `GTM-W4D9SSJB` 확인

3. **네트워크 탭 확인**
   - `gtm.js` 로드 여부 확인
   - 광고 차단기 비활성화

---

### dataLayer가 비어있는 경우

```javascript
// GTM 초기화 여부 확인
console.log('window.dataLayer:', window.dataLayer)

// 페이지 새로고침 후 다시 확인
location.reload()
```

---

### 이벤트가 기록되지 않는 경우

1. **버튼을 실제로 클릭했는지 확인**
2. **네트워크 연결 확인**
3. **콘솔 에러 확인**
4. **다음 명령어로 직접 확인:**

```javascript
// 수동으로 이벤트 발생
window.dataLayer.push({
  event: 'test_event',
  test: 'manual_test'
})

// 확인
window.gtmDebug.events()
```

---

## 📱 모바일 디버깅

### Android (Chrome)

1. PC에서 Chrome 열기 → `chrome://inspect`
2. Android 기기를 USB로 연결
3. 기기에서 사이트 열기
4. PC에서 "inspect" 클릭
5. Console 탭에서 `window.gtmDebug.check()` 실행

### iOS (Safari)

1. Mac에서 Safari → 환경설정 → 고급 → "메뉴 막대에서 개발자용 메뉴 보기" 체크
2. iPhone 설정 → Safari → 고급 → 웹 속성 → "웹 검사기" 활성화
3. Mac Safari → 개발자용 → [iPhone 이름] → 사이트 선택
4. Console에서 `window.gtmDebug.help()` 실행

---

## ⚙️ 고급 사용법

### 특정 이벤트만 모니터링

```javascript
// 원본 push 함수 저장
const originalPush = window.dataLayer.push

// 카카오톡 이벤트만 콘솔에 출력
window.dataLayer.push = function(...args) {
  const event = args[0]
  if (event.event === 'kakao_click') {
    console.log('🎯 카카오톡 클릭!', event)
  }
  return originalPush.apply(this, args)
}
```

### CSV로 내보내기

```javascript
// 카카오톡 이벤트를 CSV 형식으로 변환
const kakaoEvents = window.gtmDebug.kakao()
const csv = kakaoEvents.map(e => 
  `${e.event},${e.button_location},${e.button_type}`
).join('\n')

console.log('CSV:\n', csv)
// 복사 후 Excel에 붙여넣기
```

---

## 🎓 학습 자료

- [GTM 공식 문서](https://developers.google.com/tag-manager)
- [GA4 이벤트 가이드](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [dataLayer 사용법](https://developers.google.com/tag-platform/tag-manager/datalayer)

---

## 💡 Tip

**자주 사용하는 명령어를 스니펫으로 저장:**

Chrome DevTools → Sources → Snippets → New snippet
```javascript
// GTM 빠른 체크
window.gtmDebug.check()
window.gtmDebug.kakao()
```

저장 후 `Ctrl+Enter`로 실행!

---

## 🔒 프로덕션 환경

- ✅ **프로덕션에서는 자동으로 비활성화**됩니다
- ✅ 빌드 크기에 영향 없음 (tree-shaking)
- ✅ `window.gtmDebug` 함수도 자동으로 제거됨

확인:
```bash
pnpm build
# GTMDebug 컴포넌트는 빌드에서 제외됨
```

---

## 📞 도움이 필요하신가요?

문제가 발생하면 다음을 확인해주세요:

1. ✅ 개발 서버가 실행 중인지 (`pnpm dev`)
2. ✅ 브라우저 개발자 도구가 열려있는지
3. ✅ 콘솔에 에러가 없는지
4. ✅ `window.gtmDebug.help()` 실행해보기

---

**Happy Debugging! 🎉**


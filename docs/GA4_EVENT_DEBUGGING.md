# GA4 이벤트 전송 문제 해결 가이드

## 🔴 문제: 콘솔에는 로그가 보이지만 GA4 실시간 보고서에 이벤트가 나타나지 않음

### 증상
- 브라우저 콘솔: `✅ [GA4] 이벤트 전송 완료` 메시지 표시
- GA4 실시간 보고서: 이벤트가 나타나지 않음

### 원인
**가장 흔한 원인: `gtag` 함수가 실제 Google 함수가 아닌 임시 함수를 사용하고 있음**

`google-analytics.tsx`에서 임시 `gtag` 함수가 실제 Google `gtag.js`를 덮어쓰는 경우가 발생할 수 있습니다.

---

## ✅ 해결 방법

### 1단계: Network 탭에서 확인 (가장 중요!)

**브라우저 개발자 도구 → Network 탭**

1. **필터 설정:**
   - Network 탭에서 필터에 `collect` 또는 `google-analytics.com` 입력
   
2. **이벤트 발생:**
   - 카카오톡 상담 버튼 클릭
   - 호텔 검색 실행
   - 카카오 친구 추가 버튼 클릭

3. **요청 확인:**
   - `collect?v=2&tid=G-6Y4X23JB12...` 형태의 요청이 나타나야 함
   - **요청이 없다면:** `gtag` 함수가 실제 함수가 아닐 가능성 높음

4. **요청이 있는 경우:**
   - Payload 탭 클릭
   - `en=kakao_consultation` 또는 `en=hotel_search` 확인
   - 파라미터들이 올바르게 전송되는지 확인

### 2단계: gtag 함수 확인

**브라우저 콘솔에서 실행:**

```javascript
// 1. gtag 함수 존재 확인
console.log('gtag 존재:', typeof window.gtag !== 'undefined')
console.log('gtag 타입:', typeof window.gtag)

// 2. gtag 함수 코드 확인
console.log('gtag 함수 코드:', window.gtag.toString())

// 3. 실제 Google 함수인지 확인
const gtagStr = window.gtag.toString()
const isRealGtag = gtagStr.length > 50 || gtagStr.includes('gtag/js')
console.log('실제 Google 함수 여부:', isRealGtag)

// 4. 수동으로 이벤트 전송 테스트
window.gtag('event', 'test_event', {
  event_category: 'test',
  event_label: 'manual_test'
})

// 5. Network 탭에서 collect 요청 확인
```

**예상 결과:**
- `실제 Google 함수 여부: true` → 정상
- `실제 Google 함수 여부: false` → 문제! 임시 함수 사용 중

### 3단계: GA4 초기화 확인

**브라우저 콘솔에서 실행:**

```javascript
// GA4 초기화 상태 확인
console.log('dataLayer:', window.dataLayer)
console.log('최근 이벤트들:', window.dataLayer?.filter(item => item.event))
```

**개발 환경에서 확인할 로그:**
```
✅ [GA4] gtag.js 로드 완료 및 초기화: G-6Y4X23JB12
✅ [GA4] 이벤트 전송 가능 상태
✅ [GA4] 실제 gtag 함수 여부: 예
```

만약 `실제 gtag 함수 여부: 아니오`가 나오면 문제입니다.

### 4단계: GA4 DebugView 확인 (가장 확실!)

1. **Chrome 확장 프로그램 설치:**
   - "Google Analytics Debugger" 설치 및 활성화
   - 또는 URL에 `?_dbg=1` 추가

2. **GA4 DebugView 접속:**
   - Google Analytics → `Configure` → `DebugView`
   
3. **이벤트 발생:**
   - 브라우저에서 카카오톡 상담 버튼 클릭

4. **DebugView 확인:**
   - 실시간으로 `kakao_consultation` 이벤트가 나타나는지 확인
   - 나타나면: 이벤트는 전송되고 있지만 Realtime 보고서 설정 문제일 수 있음
   - 나타나지 않으면: 이벤트가 실제로 전송되지 않음

---

## 🔧 코드 수정 사항 (이미 적용됨)

### 변경 전 (문제):
```typescript
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', measurementId, {...});
```

### 변경 후 (해결):
```typescript
// gtag.js 로드 전 임시 함수만 정의
window.gtag = window.gtag || function() {
  window.dataLayer.push(arguments);
};

// gtag.js 로드 후 실제 함수 확인 및 초기화
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
  onLoad={() => {
    // 실제 Google 함수로 교체되었는지 확인
    // window.gtag('config', ...) 호출
  }}
/>
```

---

## 🧪 테스트 방법

### 1. 개발 서버 재시작

```bash
# .next 폴더 삭제
rm -rf .next

# 개발 서버 재시작
pnpm dev
```

### 2. 브라우저 콘솔 확인

페이지 로드 시:
```
✅ [GA4] gtag.js 로드 완료 및 초기화: G-6Y4X23JB12
✅ [GA4] 이벤트 전송 가능 상태
✅ [GA4] 실제 gtag 함수 여부: 예
```

### 3. 이벤트 발생 후 확인

**카카오톡 상담 버튼 클릭 시:**
```
✅ [GA4] 카카오톡 상담 이벤트 전송 완료: kakao_consultation
✅ [GTM] dataLayer push 완료
💬 [Analytics] 카카오톡 상담 클릭: { ... }
```

**Network 탭에서:**
- `collect?v=2&tid=G-6Y4X23JB12...` 요청 확인
- Payload에 `en=kakao_consultation` 확인

### 4. GA4 실시간 보고서 확인

**Reports → Realtime → Event count by Event name**

- `kakao_consultation` 이벤트 확인
- `hotel_search` 이벤트 확인
- `kakao_friend_add` 이벤트 확인

---

## 🐛 여전히 문제가 있는 경우

### 추가 확인 사항

1. **광고 차단기 확인:**
   - Ad Blocker, uBlock Origin 등 비활성화
   - 시크릿 모드에서 테스트

2. **GA4 Measurement ID 확인:**
   ```bash
   # .env.local 파일
   NEXT_PUBLIC_GA_ID=G-6Y4X23JB12
   ```

3. **GTM 컨테이너 확인:**
   - `src/app/layout.tsx`에서 `GTM-W4D9SSJB` 확인
   - GTM이 GA4 태그를 제대로 설정했는지 확인

4. **브라우저 캐시 삭제:**
   - 하드 리프레시: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)

5. **다른 브라우저에서 테스트:**
   - Chrome, Firefox, Safari에서 각각 테스트

---

## 📊 예상 결과

### 정상 작동 시:

**브라우저 콘솔:**
```
✅ [GA4] gtag.js 로드 완료 및 초기화: G-6Y4X23JB12
✅ [GA4] 이벤트 전송 가능 상태
✅ [GA4] 실제 gtag 함수 여부: 예
✅ [GA4] 카카오톡 상담 이벤트 전송 완료: kakao_consultation
```

**Network 탭:**
- `collect?v=2&tid=G-6Y4X23JB12...` 요청 발생
- Payload에 이벤트 파라미터 포함

**GA4 실시간 보고서:**
- `kakao_consultation` 이벤트 표시
- `hotel_search` 이벤트 표시
- `kakao_friend_add` 이벤트 표시

---

## 📚 참고 자료

- [GA4 gtag.js 문서](https://developers.google.com/analytics/devguides/collection/ga4)
- [GA4 DebugView 가이드](https://support.google.com/analytics/answer/7201382)
- [Next.js Script 컴포넌트](https://nextjs.org/docs/app/api-reference/components/script)


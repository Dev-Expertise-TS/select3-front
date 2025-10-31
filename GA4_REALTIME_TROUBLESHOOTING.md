# GA4 실시간 보고서에 이벤트가 나타나지 않는 경우 해결 가이드

## 현재 상황
- ✅ 브라우저 콘솔: 이벤트 전송 성공 로그 확인
- ✅ Network 탭: `collect` 요청 204 응답 확인
- ❌ GA4 실시간 보고서: 이벤트 미표시

## 해결 방법

### 1. GA4 DebugView 사용 (가장 확실한 방법)

실시간 보고서보다 **DebugView**가 더 정확하게 이벤트를 확인할 수 있습니다.

#### 설정 방법:
1. **Chrome Extension 설치**
   - [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) 설치
   - 또는 [GA Debugger](https://chrome.google.com/webstore/detail/ga-debugger/ihcnkbnejdcmjplhkbcgeefomfccahpe) 설치

2. **GA4 DebugView 활성화**
   - GA4 관리 화면 → **구성** → **디버그 뷰**
   - 브라우저에서 Extension 활성화
   - 사이트에서 이벤트 트리거 (카카오톡 상담 버튼 클릭 등)
   - DebugView에서 **실시간으로 이벤트 확인 가능**

#### DebugView 확인 항목:
- 이벤트 이름: `kakao_consultation`, `hotel_search`, `kakao_friend_add`
- 이벤트 파라미터: `button_location`, `button_type`, `search_term` 등
- 사용자 속성 및 측정 ID: `G-6Y4X23JB12`

---

### 2. GA4 속성에서 커스텀 이벤트 등록 확인

일부 GA4 속성에서는 커스텀 이벤트를 등록해야 실시간 보고서에 나타납니다.

#### 등록 방법:
1. GA4 관리 화면 → **이벤트**
2. **이벤트 만들기** 클릭
3. 다음 이벤트들을 등록:
   - `kakao_consultation`
   - `hotel_search`
   - `kakao_friend_add`

**참고**: 이벤트가 이미 전송되고 있다면 자동으로 "최근 이벤트" 목록에 나타날 수 있습니다.

---

### 3. GA4 측정 ID 확인

현재 설정된 측정 ID: `G-6Y4X23JB12`

#### 확인 방법:
1. GA4 관리 화면 → **관리** → **데이터 스트림**
2. 웹 스트림 선택
3. **측정 ID**가 `G-6Y4X23JB12`인지 확인

#### Network 탭에서 확인:
- `collect` 요청의 URL에 `tid=G-6Y4X23JB12`가 포함되어 있는지 확인
- 예: `collect?v=2&tid=G-6Y4X23JB12&...`

---

### 4. Google Tag Manager (GTM) 설정 확인

GTM 컨테이너 ID: `GTM-W4D9SSJB`

#### GTM에서 GA4 태그 설정 확인:
1. [Google Tag Manager](https://tagmanager.google.com) 접속
2. 컨테이너 `GTM-W4D9SSJB` 선택
3. **태그** 섹션 확인:
   - GA4 Configuration 태그가 있는지 확인
   - 측정 ID가 `G-6Y4X23JB12`로 설정되어 있는지 확인
   - 트리거가 올바르게 설정되어 있는지 확인

#### GTM Preview 모드로 확인:
1. GTM에서 **미리보기** 클릭
2. 사이트 URL 입력
3. 이벤트 트리거 시 GTM에서 태그 발화 여부 확인

---

### 5. 실시간 보고서 확인 방법

실시간 보고서는 **몇 초 지연**이 있을 수 있으며, 특정 조건에서만 표시될 수 있습니다.

#### 확인 위치:
1. GA4 → **보고서** → **실시간**
2. **이벤트 이름 별 이벤트 수** 섹션 확인
3. **이벤트 이름으로 필터링**: `kakao_consultation`, `hotel_search`, `kakao_friend_add`

#### 참고 사항:
- 실시간 보고서는 최근 30분 이내 데이터만 표시
- 동시 접속자가 많지 않으면 표시되지 않을 수 있음
- DebugView가 더 정확한 실시간 확인 방법

---

### 6. 브라우저 Network 탭에서 상세 확인

#### 확인 방법:
1. F12 → Network 탭
2. 필터: `collect` 또는 `google-analytics.com`
3. 이벤트 트리거 (버튼 클릭 등)
4. `collect` 요청 클릭 → **Payload** 탭 확인:
   ```
   en=kakao_consultation
   ep.button_location=floating_button
   tid=G-6Y4X23JB12
   ```
   - `en`: 이벤트 이름
   - `ep.*`: 이벤트 파라미터
   - `tid`: 측정 ID

#### Status 확인:
- **204 No Content**: 정상 (GA4는 응답 본문 없이 204로 성공 응답)
- **200 OK**: 정상
- **400/403**: 오류 (측정 ID 또는 권한 문제)

---

### 7. 추가 확인 사항

#### 환경 변수 확인:
```bash
# .env.local 파일 확인
NEXT_PUBLIC_GA_ID=G-6Y4X23JB12
```

#### 콘솔 로그 확인:
개발 환경에서 다음 로그가 표시되어야 합니다:
```
✅ [GA4] gtag.js 로드 완료 및 초기화: G-6Y4X23JB12
✅ [GA4] 이벤트 전송 가능 상태
✅ [GA4] 실제 gtag 함수 여부: 예
✔ [GA4] 카카오톡 상담 이벤트 전송 완료: kakao_consultation
```

---

## 권장 확인 순서

1. ✅ **GA4 DebugView 사용** (가장 확실)
   - Chrome Extension 설치 → DebugView 확인

2. ✅ **Network 탭에서 Payload 확인**
   - `collect` 요청의 Payload에 이벤트 정보 포함 여부 확인

3. ✅ **GTM Preview 모드 확인**
   - GTM에서 태그 발화 여부 확인

4. ✅ **GA4 커스텀 이벤트 등록**
   - 관리 → 이벤트 → 이벤트 만들기

5. ✅ **측정 ID 확인**
   - GA4 관리 화면에서 측정 ID 일치 여부 확인

---

## 문제가 계속되는 경우

### 가능한 원인:
1. **GA4 속성 필터**: 특정 필터가 이벤트를 제외하고 있을 수 있음
2. **GTM 설정**: GTM 태그가 GA4로 데이터를 전달하지 않고 있을 수 있음
3. **측정 ID 불일치**: 환경 변수와 GA4 속성의 측정 ID가 다를 수 있음

### 추가 디버깅:
1. GA4 → **관리** → **데이터 스트림** → **디버그 뷰** 활성화
2. GTM → **미리보기 모드**로 태그 발화 확인
3. 브라우저 콘솔에서 `window.dataLayer` 확인:
   ```javascript
   console.log(window.dataLayer)
   ```

---

## 성공 확인 기준

✅ 다음 중 하나라도 확인되면 정상 작동:
- GA4 DebugView에서 이벤트 표시
- Network 탭에서 `collect` 요청 204 응답
- GTM Preview 모드에서 태그 발화 확인

❌ 실시간 보고서만 확인하는 것은 권장하지 않음:
- 실시간 보고서는 지연 및 필터링의 영향이 있음
- DebugView가 더 정확한 확인 방법


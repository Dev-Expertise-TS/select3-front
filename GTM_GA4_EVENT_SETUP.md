# GTM에서 GA4 이벤트 전송 설정 가이드

## 📋 현재 상황

- ✅ **코드**: `dataLayer.push({ event: 'kakao_consultation', ... })`로 이벤트 전송 중
- ✅ **GA4**: "이벤트 만들기"로 `kakao_consultation`, `hotel_search`, `kakao_friend_add` 등록 완료
- ❓ **GTM**: `dataLayer` 이벤트를 감지하여 GA4로 전달하는 태그 설정 필요

## ⚠️ 중요 포인트

### 1. GA4의 "이벤트 만들기"는 영향 없음

GA4의 "이벤트 만들기"는 단순히 **이벤트를 정의/등록**하는 기능입니다:
- 이벤트 이름을 GA4에 등록
- 주요 이벤트로 표시 여부 설정
- 측정 방식 설정 (이벤트당 한 번, 세션당 한 번)

**이것만으로는 실제 이벤트가 전송되지 않습니다!**

### 2. GTM 태그 설정이 필수

코드에서 `dataLayer.push()`로 전송된 이벤트는:
1. GTM의 `dataLayer`에 저장됨
2. GTM의 **트리거**가 이를 감지
3. GTM의 **태그**가 GA4로 전달

**따라서 GTM에서 태그 설정이 필요합니다!**

---

## 🔧 GTM 설정 방법

### 1단계: GTM 접속 및 컨테이너 선택

1. [Google Tag Manager](https://tagmanager.google.com) 접속
2. 컨테이너 `GTM-W4D9SSJB` 선택

### 2단계: GA4 Configuration 태그 확인 (기본 설정)

**이미 있다면**: 확인만 하면 됨  
**없다면**: 생성 필요

#### GA4 Configuration 태그 생성 (없는 경우):

1. **태그** → **만들기** 클릭
2. **태그 구성** 클릭 → **Google Analytics: GA4 Configuration** 선택
3. 설정:
   - **측정 ID**: `G-6Y4X23JB12`
   - **트리거**: "All Pages" (모든 페이지)
4. **저장** → **게시**

---

### 3단계: 커스텀 이벤트 태그 생성 (중요!)

각 커스텀 이벤트마다 태그를 생성해야 합니다.

#### 예시: `kakao_consultation` 이벤트 태그

1. **태그** → **만들기** 클릭
2. **태그 구성** 클릭 → **Google Analytics: GA4 Event** 선택
3. 설정:
   - **측정 ID**: `G-6Y4X23JB12` (Configuration 태그에서 가져오기)
   - **이벤트 이름**: `kakao_consultation`
   - **이벤트 파라미터** (선택사항):
     - `button_location` → `{{DLV - button_location}}`
     - `button_type` → `{{DLV - button_type}}`
     - `button_style` → `{{DLV - button_style}}`
     - 기타 파라미터들...
4. **트리거** 설정:
   - **+** 클릭 → **새 트리거 만들기**
   - **트리거 이름**: `kakao_consultation - Trigger`
   - **트리거 유형**: **맞춤 이벤트**
   - **이벤트 이름**: `kakao_consultation`
   - **저장**
5. **저장** → 태그 이름: `GA4 - kakao_consultation`
6. **게시**

#### 동일한 방식으로 다른 이벤트도 생성:

- `hotel_search`
- `kakao_friend_add`
- `hotel_detail_view`
- `select_brand`
- `hotel_inquiry`

---

### 4단계: DataLayer 변수 설정 (선택사항)

이벤트 파라미터를 사용하려면 DataLayer 변수를 설정해야 합니다.

1. **변수** → **사용자 정의 변수** → **만들기**
2. **변수 유형**: **데이터 레이어 변수**
3. 변수 생성:
   - **변수 이름**: `DLV - button_location`
   - **데이터 레이어 변수 이름**: `button_location`
   - **저장**

필요한 모든 파라미터에 대해 반복:
- `DLV - button_type`
- `DLV - button_style`
- `DLV - search_term`
- `DLV - hotel_id`
- 등등...

---

## 📊 설정 확인 방법

### 1. GTM Preview 모드

1. GTM → **미리보기** 클릭
2. 사이트 URL 입력: `http://localhost:3000` 또는 실제 도메인
3. 사이트에서 이벤트 트리거 (카카오톡 상담 버튼 클릭 등)
4. GTM Preview에서 확인:
   - `kakao_consultation` 이벤트가 `dataLayer`에 나타나는지
   - 해당 트리거가 발화하는지
   - GA4 Event 태그가 발화하는지

### 2. GA4 DebugView

1. Chrome Extension: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) 설치 및 활성화
2. GA4 → **구성** → **디버그 뷰**
3. 사이트에서 이벤트 트리거
4. DebugView에서 `kakao_consultation` 이벤트 확인:
   - 이벤트 이름: `kakao_consultation`
   - 파라미터: `button_location`, `button_type` 등

### 3. Network 탭

1. F12 → Network 탭
2. 필터: `collect` 또는 `google-analytics.com`
3. 이벤트 트리거
4. `collect` 요청 확인:
   - `en=kakao_consultation`
   - `ep.button_location=floating_button`
   - `tid=G-6Y4X23JB12`

---

## 🎯 요약

### GA4 "이벤트 만들기"의 역할

- ✅ 이벤트 이름을 GA4에 등록
- ✅ 주요 이벤트 표시 여부 설정
- ✅ 측정 방식 설정
- ❌ **실제 이벤트 전송과는 무관**

### GTM 태그 설정의 역할

- ✅ `dataLayer`의 이벤트를 감지
- ✅ GA4로 이벤트 전송
- ✅ 이벤트 파라미터 전달
- **이것이 실제로 이벤트를 GA4로 보내는 역할!**

---

## ⚙️ 간단한 설정 방법 (권장)

모든 커스텀 이벤트를 자동으로 GA4로 전송하려면:

### 방법 1: GA4 Configuration 태그의 "향상된 측정" 사용

1. GA4 Configuration 태그 편집
2. **향상된 측정** → **켜기**
3. **이벤트 설정**에서 커스텀 이벤트 자동 전송 활성화

하지만 이 방법은 모든 이벤트를 자동 전송하므로 파라미터 설정이 제한적일 수 있습니다.

### 방법 2: 각 이벤트별로 태그 생성 (권장)

위의 3단계에서 설명한 대로 각 이벤트마다 태그를 생성하는 것이 가장 정확하고 파라미터 전달도 가능합니다.

---

## ✅ 확인 체크리스트

- [ ] GTM에서 GA4 Configuration 태그 확인/생성
- [ ] `kakao_consultation` 이벤트 태그 생성
- [ ] `hotel_search` 이벤트 태그 생성
- [ ] `kakao_friend_add` 이벤트 태그 생성
- [ ] 필요한 DataLayer 변수 생성
- [ ] GTM Preview 모드로 테스트
- [ ] GA4 DebugView에서 이벤트 확인
- [ ] GTM 버전 게시

---

## 🔍 문제 해결

### 문제: GTM Preview에서 이벤트가 감지되지 않음

**원인**: `dataLayer`에 이벤트가 푸시되지 않음

**해결**:
1. 브라우저 콘솔에서 확인:
   ```javascript
   console.log(window.dataLayer)
   ```
2. 코드에서 `dataLayer.push()` 호출 확인
3. 콘솔에서 수동 테스트:
   ```javascript
   window.dataLayer.push({ event: 'kakao_consultation', button_location: 'test' })
   ```

### 문제: 이벤트는 감지되지만 GA4로 전송되지 않음

**원인**: GTM 태그가 제대로 설정되지 않음

**해결**:
1. GTM Preview에서 태그 발화 여부 확인
2. 태그 설정 확인:
   - 측정 ID가 올바른지 (`G-6Y4X23JB12`)
   - 트리거가 올바른지
   - 이벤트 이름이 일치하는지
3. 태그 상태 확인 (비활성화되지 않았는지)

### 문제: 이벤트는 전송되지만 파라미터가 누락됨

**원인**: DataLayer 변수가 설정되지 않음

**해결**:
1. 변수 섹션에서 필요한 DataLayer 변수 생성
2. 태그의 이벤트 파라미터에 변수 참조 추가

---

## 📝 참고

- GA4의 "이벤트 만들기"는 단순 등록일 뿐, 실제 전송은 GTM 태그가 담당
- 코드에서는 `dataLayer.push()`로만 전송하면 됨
- GTM에서 태그 설정이 완료되면 자동으로 GA4로 전달됨


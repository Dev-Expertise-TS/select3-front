# GTM에서 GA4 이벤트 전송 설정 가이드

## 📋 현재 상황

- ✅ **코드**: `dataLayer.push({ event: 'kakao_consultation', ... })`로 이벤트 전송 중
- ✅ **GA4**: "이벤트 만들기"로 `kakao_consultation`, `hotel_search`, `kakao_friend_add` 등록 완료
- ❓ **GTM**: `dataLayer` 이벤트를 감지하여 GA4로 전달하는 태그 설정 필요

### 🔄 신규 코드 연동(중요)
다음 이벤트가 코드에서 자동으로 전송됩니다. GTM에서 각각에 대한 트리거/태그 설정이 필요합니다.

- 페이지 진입/경로 변경:
  - `page_view_custom` (공통) — 파라미터: `page_path`, `page_type`
  - 주요 섹션 진입 시 보조 이벤트: `view_testimonials`, `view_promotion`, `view_hotel_list`, `view_hotel_region`, `view_blog`
- 내비게이션 클릭:
  - `nav_click` — 파라미터: `nav_location`(`header`/`bottom_nav`/`bottom_nav_menu`), `nav_href`, `event_label`
- 기존 버튼/행동:
  - `kakao_consultation`, `kakao_friend_add`, `hotel_search`, `select_brand`, `hotel_detail_view`, `hotel_inquiry`

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

모든 커스텀 이벤트는 다음 **공통 순서**로 생성합니다:

1. **데이터 레이어 변수 생성** (파라미터 사용 시 필수)
2. **트리거 생성** (각 이벤트마다 별도 생성)
3. **GA4 이벤트 태그 생성** (구성 태그 선택 방식)

#### 📌 핵심 원칙

- ✅ **구성 태그 선택 방식**: 측정 ID를 직접 입력하지 않고 기존 GA4 설정 태그 재사용
- ✅ **트리거 먼저 생성**: 태그 설정 중에 트리거를 만들지 말고, 트리거를 먼저 생성 후 재사용
- ✅ **변수 먼저 생성**: 데이터 레이어 파라미터를 사용하려면 변수를 먼저 생성
- ✅ **이름 규칙**: 변수는 `DLV - 파라미터명`, 트리거는 `TRG - 이벤트명`, 태그는 `GA4 - 이벤트명`

**💡 접두사 설명:**
- **DLV** = **D**ata **L**ayer **V**ariable (데이터 레이어 변수)
- **TRG** = **Tr**i**g**ger (트리거)
- **GA4** = **GA4** Event Tag (GA4 이벤트 태그)

이 접두사는 GTM 내에서 요소를 쉽게 구분하기 위한 네이밍 규칙입니다. **GTM에서 필수 사항은 아니지만**, 규칙적으로 사용하면 관리가 쉬워집니다.

---

#### 3-1. 데이터 레이어 변수 생성

**변수** → **사용자 정의 변수** → **만들기** → **변수 유형**: **데이터 레이어 변수**

각 파라미터마다 변수를 생성합니다 (코드에서 전송하는 모든 파라미터):

**기본 버튼/상담 이벤트용:**
- `DLV - button_location` → 데이터 레이어 변수 이름: `button_location`
- `DLV - button_type` → `button_type`
- `DLV - button_style` → `button_style`
- `DLV - error_context` → `error_context`

**호텔 검색/상세 이벤트용:**

각 변수마다 다음 순서로 생성합니다. 예시: `DLV - search_term` 변수 생성

1. **변수** 메뉴 클릭 (좌측 메뉴)
2. **사용자 정의 변수** 섹션에서 **만들기** 클릭 (또는 기존 변수 클릭하여 편집)
3. **변수 구성** 클릭
4. **변수 유형** 선택: **데이터 레이어 변수** (목록에서 선택)
5. 설정 항목 입력:
   - **변수 이름**: `DLV - search_term` (GTM에서 보여질 이름)
   - **데이터 레이어 변수 이름**: `search_term` (코드에서 `dataLayer.push({ search_term: '...' })`로 전송하는 키 이름과 **정확히 일치**해야 함)
6. **저장** 클릭

**전체 목록 (동일한 방식으로 각각 생성):**

| 변수 이름 (GTM) | 데이터 레이어 변수 이름 (코드 키) | 용도 |
|----------------|----------------------------|------|
| `DLV - search_term` | `search_term` | 검색어 |
| `DLV - hotel_id` | `hotel_id` | 호텔 ID |
| `DLV - hotel_name` | `hotel_name` | 호텔명 |
| `DLV - check_in` | `check_in` | 체크인 날짜 |
| `DLV - check_out` | `check_out` | 체크아웃 날짜 |
| `DLV - rooms` | `rooms` | 객실 수 |
| `DLV - adults` | `adults` | 성인 수 |
| `DLV - children` | `children` | 어린이 수 |
| `DLV - nights` | `nights` | 숙박일 수 |
| `DLV - city` | `city` | 도시 |
| `DLV - country` | `country` | 국가 |
| `DLV - brand_id` | `brand_id` | 브랜드 ID |
| `DLV - chain_id` | `chain_id` | 체인 ID |
| `DLV - star_rating` | `star_rating` | 별점 |

**⚠️ 중요 사항:**
- **데이터 레이어 변수 이름**은 코드에서 `dataLayer.push({ search_term: '서울' })` 형태로 전송하는 키 이름과 **정확히 일치**해야 합니다 (대소문자 포함)
- 변수 이름(`DLV - search_term`)은 GTM 내에서만 보이는 이름이므로 자유롭게 변경 가능합니다
- 변수를 생성하지 않으면 태그에서 해당 파라미터를 사용할 수 없습니다

**페이지/내비 이벤트용:**
- `DLV - page_path` → `page_path`
- `DLV - page_type` → `page_type`
- `DLV - event_label` → `event_label`
- `DLV - nav_location` → `nav_location`
- `DLV - nav_href` → `nav_href`

**공통:**
- `DLV - timestamp` → `timestamp`

---

#### 3-2. 트리거 생성 (각 이벤트별로)

**트리거** → **새로 만들기** → **트리거 유형**: **맞춤 이벤트**

**설정 방법:**
- **이벤트 이름**: 코드에서 전송하는 이벤트 이름 정확히 입력
- **이 트리거가 발생할 때**: **모든 맞춤 이벤트** (기본 권장)

**전체 이벤트 목록:**

| 이벤트 이름 | 트리거 이름 | 트리거 유형 |
|------------|-----------|-----------|
| `kakao_consultation` | `TRG - kakao_consultation` | 맞춤 이벤트 (모든) |
| `kakao_friend_add` | `TRG - kakao_friend_add` | 맞춤 이벤트 (모든) |
| `hotel_search` | `TRG - hotel_search` | 맞춤 이벤트 (모든) |
| `hotel_detail_view` | `TRG - hotel_detail_view` | 맞춤 이벤트 (모든) |
| `select_brand` | `TRG - select_brand` | 맞춤 이벤트 (모든) |
| `hotel_inquiry` | `TRG - hotel_inquiry` | 맞춤 이벤트 (모든) |
| `page_view_custom` | `TRG - page_view_custom` | 맞춤 이벤트 (모든) |
| `view_testimonials` | `TRG - view_testimonials` | 맞춤 이벤트 (모든) |
| `view_promotion` | `TRG - view_promotion` | 맞춤 이벤트 (모든) |
| `view_hotel_list` | `TRG - view_hotel_list` | 맞춤 이벤트 (모든) |
| `view_hotel_region` | `TRG - view_hotel_region` | 맞춤 이벤트 (모든) |
| `view_blog` | `TRG - view_blog` | 맞춤 이벤트 (모든) |
| `nav_click` | `TRG - nav_click` | 맞춤 이벤트 (모든) |

**⚠️ 참고**: 특정 조건에서만 발화하려면 "일부 맞춤 이벤트"로 전환 후 조건 추가 가능 (일반적으로는 불필요)

---

#### 3-3. GA4 이벤트 태그 생성

**태그** → **새로 만들기** → **태그 유형**: **Google 애널리틱스: GA4 이벤트**

**공통 설정:**
1. **구성 태그**: 기존 GA4 설정 태그 선택 (측정 ID `G-6Y4X23JB12`가 설정된 태그)
2. **이벤트 이름**: 코드에서 전송하는 이벤트 이름과 정확히 일치
3. **이벤트 매개변수**: 필요시 변수를 사용하여 매핑 (변수를 생성한 경우에만 가능)
4. **트리거**: 해당 이벤트의 트리거 선택
5. **태그 이름**: `GA4 - 이벤트명` 형식

**이벤트별 상세 설정:**

<details>
<summary><b>카카오톡 상담 이벤트: `GA4 - kakao_consultation`</b></summary>

- **이벤트 이름**: `kakao_consultation`
- **이벤트 매개변수**:
  - `button_location` → `{{DLV - button_location}}`
  - `button_type` → `{{DLV - button_type}}`
  - `button_style` → `{{DLV - button_style}}`
  - `timestamp` → `{{DLV - timestamp}}`
- **트리거**: `TRG - kakao_consultation`

</details>

<details>
<summary><b>카카오 친구 추가 이벤트: `GA4 - kakao_friend_add`</b></summary>

- **이벤트 이름**: `kakao_friend_add`
- **이벤트 매개변수**:
  - `hotel_id` → `{{DLV - hotel_id}}`
  - `hotel_name` → `{{DLV - hotel_name}}`
  - `check_in` → `{{DLV - check_in}}`
  - `check_out` → `{{DLV - check_out}}`
  - `rooms` → `{{DLV - rooms}}`
  - `button_location` → `{{DLV - button_location}}`
  - `timestamp` → `{{DLV - timestamp}}`
- **트리거**: `TRG - kakao_friend_add`

</details>

<details>
<summary><b>호텔 검색 이벤트: `GA4 - hotel_search`</b></summary>

- **이벤트 이름**: `hotel_search`
- **이벤트 매개변수**:
  - `search_term` → `{{DLV - search_term}}`
  - `check_in` → `{{DLV - check_in}}`
  - `check_out` → `{{DLV - check_out}}`
  - `nights` → `{{DLV - nights}}`
  - `rooms` → `{{DLV - rooms}}`
  - `adults` → `{{DLV - adults}}`
  - `children` → `{{DLV - children}}`
  - `hotel_id` → `{{DLV - hotel_id}}` (특정 호텔 검색 시)
  - `hotel_name` → `{{DLV - hotel_name}}` (특정 호텔 검색 시)
  - `timestamp` → `{{DLV - timestamp}}`
- **트리거**: `TRG - hotel_search`

</details>

<details>
<summary><b>호텔 상세 뷰 이벤트: `GA4 - hotel_detail_view`</b></summary>

- **이벤트 이름**: `hotel_detail_view`
- **이벤트 매개변수**:
  - `hotel_id` → `{{DLV - hotel_id}}`
  - `hotel_name` → `{{DLV - hotel_name}}`
  - `city` → `{{DLV - city}}`
  - `country` → `{{DLV - country}}`
  - `brand_id` → `{{DLV - brand_id}}`
  - `chain_id` → `{{DLV - chain_id}}`
  - `star_rating` → `{{DLV - star_rating}}`
- **트리거**: `TRG - hotel_detail_view`

</details>

<details>
<summary><b>브랜드 선택 이벤트: `GA4 - select_brand`</b></summary>

- **이벤트 이름**: `select_brand`
- **이벤트 매개변수**:
  - `brand_id` → `{{DLV - brand_id}}`
  - `chain_id` → `{{DLV - chain_id}}`
  - `event_label` → `{{DLV - event_label}}`
  - `timestamp` → `{{DLV - timestamp}}`
- **트리거**: `TRG - select_brand`

</details>

<details>
<summary><b>호텔 문의 이벤트: `GA4 - hotel_inquiry`</b></summary>

- **이벤트 이름**: `hotel_inquiry`
- **이벤트 매개변수**:
  - `inquiry_type` → `{{DLV - inquiry_type}}` (예: `kakao`, `phone`, `email`)
  - `contact_method` → `{{DLV - contact_method}}`
  - `hotel_id` → `{{DLV - hotel_id}}` (해당 시)
  - `hotel_name` → `{{DLV - hotel_name}}` (해당 시)
  - `button_location` → `{{DLV - button_location}}` (해당 시)
  - `error_context` → `{{DLV - error_context}}` (에러 상태 시)
  - `timestamp` → `{{DLV - timestamp}}`
- **트리거**: `TRG - hotel_inquiry`

</details>

<details>
<summary><b>페이지 뷰 커스텀 이벤트: `GA4 - page_view_custom`</b></summary>

- **이벤트 이름**: `page_view_custom`
- **이벤트 매개변수**:
  - `page_path` → `{{DLV - page_path}}`
  - `page_type` → `{{DLV - page_type}}`
  - `timestamp` → `{{DLV - timestamp}}` (선택)
- **트리거**: `TRG - page_view_custom`

</details>

<details>
<summary><b>섹션 보조 이벤트: `GA4 - view_*` (예: `GA4 - view_blog`)</b></summary>

각 섹션 이벤트마다 별도 태그 생성:
- `GA4 - view_testimonials` (트리거: `TRG - view_testimonials`)
- `GA4 - view_promotion` (트리거: `TRG - view_promotion`)
- `GA4 - view_hotel_list` (트리거: `TRG - view_hotel_list`)
- `GA4 - view_hotel_region` (트리거: `TRG - view_hotel_region`)
- `GA4 - view_blog` (트리거: `TRG - view_blog`)

**공통 설정:**
- **이벤트 이름**: 각각 `view_testimonials`, `view_promotion` 등
- **이벤트 매개변수** (선택, 권장):
  - `page_path` → `{{DLV - page_path}}`
  - `page_type` → `{{DLV - page_type}}`
- **트리거**: 해당 이벤트의 트리거

</details>

<details>
<summary><b>내비게이션 클릭 이벤트: `GA4 - nav_click`</b></summary>

- **이벤트 이름**: `nav_click`
- **이벤트 매개변수**:
  - `event_label` → `{{DLV - event_label}}` (메뉴명)
  - `nav_location` → `{{DLV - nav_location}}` (`header`, `bottom_nav`, `bottom_nav_menu`)
  - `nav_href` → `{{DLV - nav_href}}` (링크 URL)
  - `page_path` → `{{DLV - page_path}}` (선택)
  - `timestamp` → `{{DLV - timestamp}}` (선택)
- **트리거**: `TRG - nav_click`

</details>

---

#### 3-4. 검증 절차

**GTM Preview 모드:**
1. GTM → **미리보기** 클릭
2. 사이트 URL 입력 후 연결
3. 실제 화면에서 이벤트 트리거 (버튼 클릭, 페이지 이동 등)
4. GTM Preview에서 확인:
   - `dataLayer`에 이벤트가 나타나는지
   - 해당 트리거가 발화하는지
   - GA4 Event 태그가 발화하는지

**GA4 DebugView:**
1. Chrome Extension: [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) 설치 및 활성화
2. GA4 → **구성** → **디버그 뷰**
3. 사이트에서 이벤트 트리거
4. DebugView에서 이벤트와 매개변수 확인

---

#### 3-5. 문제 해결 체크리스트

- ✅ 이벤트 이름이 정확히 일치하는가? (대소문자 포함)
- ✅ 데이터 레이어 변수명이 데이터 레이어 키와 동일한가? (예: 변수명 `nav_href`, 키 `nav_href`)
- ✅ GA4 설정 태그가 모든 페이지에서 동작하는가? (All Pages 트리거 적용 확인)
- ✅ 태그 상태가 일시 중지/비활성화되어 있지 않은가?
- ✅ 트리거를 "일부 맞춤 이벤트"로 두었다면 조건이 실제 값과 일치하는가?
- ✅ 구성 태그가 올바르게 선택되었는가? (측정 ID `G-6Y4X23JB12`)

---

## 📊 추가 검증 방법 (Network 탭)

GTM Preview와 GA4 DebugView 외에 브라우저 Network 탭에서도 확인 가능합니다:

1. F12 → **Network** 탭
2. 필터: `collect` 또는 `google-analytics.com`
3. 사이트에서 이벤트 트리거 (버튼 클릭 등)
4. `collect` 요청 확인:
   - `en=이벤트명` (예: `en=kakao_consultation`)
   - `ep.파라미터명=값` (예: `ep.button_location=floating_button`)
   - `tid=G-6Y4X23JB12` (측정 ID)
5. Status 확인: **204 No Content** 또는 **200 OK** = 정상

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

## ✅ 전체 설정 체크리스트

- [ ] GA4 Configuration 태그 확인/생성 (측정 ID `G-6Y4X23JB12`, 트리거: All Pages)
- [ ] 필요한 데이터 레이어 변수 생성 (3-1 참조)
- [ ] 모든 이벤트 트리거 생성 (3-2 참조)
- [ ] 모든 이벤트 태그 생성 (3-3 참조)
- [ ] GTM Preview 모드로 테스트 (3-4 참조)
- [ ] GA4 DebugView에서 이벤트 확인 (3-4 참조)
- [ ] GTM 버전 게시

---

## 🔍 추가 문제 해결

### 문제: GTM Preview에서 이벤트가 감지되지 않음

**원인**: `dataLayer`에 이벤트가 푸시되지 않음

**해결**:
- 브라우저 콘솔에서 `window.dataLayer` 확인
- 코드에서 `dataLayer.push()` 호출 확인
- 콘솔에서 수동 테스트: `window.dataLayer.push({ event: '이벤트명', ... })`

### 문제: 이벤트는 감지되지만 GA4로 전송되지 않음

**원인**: GTM 태그 설정 문제

**해결**: 3-5 체크리스트 참조 (이벤트 이름 일치, 트리거 설정, 태그 상태 등)

### 문제: 이벤트는 전송되지만 파라미터가 누락됨

**원인**: 데이터 레이어 변수가 미생성 또는 매핑 누락

**해결**:
- 3-1에서 필요한 변수 생성 확인
- 태그의 이벤트 매개변수에 변수 참조 추가 확인 (예: `{{DLV - 파라미터명}}`)


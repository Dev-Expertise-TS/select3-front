# 구글 서치콘솔 사이트맵 제출 체크리스트

## ✅ 사전 준비 체크리스트

### 1. 사이트맵 접근성 확인
- [ ] `https://luxury-select.co.kr/sitemap-index` 접속 가능
- [ ] 모든 개별 사이트맵 접근 가능
- [ ] XML 형식이 올바르게 표시됨

### 2. 사이트맵 내용 확인
- [ ] 호텔 상세 페이지가 포함되어 있음 (`/sitemap-hotel`)
- [ ] 공개되지 않은 호텔(`publish=false`)은 제외됨
- [ ] 모든 URL이 `https://luxury-select.co.kr` 도메인 사용
- [ ] 리디렉션되는 URL은 제외됨

### 3. robots.txt 확인
- [ ] `robots.txt`에 사이트맵 위치가 명시되어 있음
- [ ] 모든 사이트맵이 등록되어 있음

### 4. 사이트맵 크기 확인
- [ ] 단일 사이트맵이 50,000개 URL 이하
- [ ] 단일 사이트맵 파일 크기가 50MB 이하

## 📤 제출 단계

### Step 1: Google Search Console 접속
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 선택: `luxury-select.co.kr`

### Step 2: 사이트맵 제출
1. 왼쪽 메뉴: **"색인 생성"** → **"Sitemaps"** 클릭
2. **"새 사이트맵 추가"** 입력란에 입력:
   ```
   sitemap-index
   ```
   또는 전체 URL:
   ```
   https://luxury-select.co.kr/sitemap-index
   ```
3. **"제출"** 버튼 클릭

### Step 3: 제출 확인
- [ ] 제출 후 "성공" 상태 확인
- [ ] 발견된 URL 수 확인
- [ ] 오류 메시지가 없는지 확인

## 📊 제출 후 모니터링

### 24시간 후 확인
- [ ] Search Console → 색인 생성 → Sitemaps
- [ ] 제출된 URL 수 확인
- [ ] 처리 상태 확인

### 1주일 후 확인
- [ ] Search Console → 색인 생성 → 페이지
- [ ] 실제 색인된 URL 수 확인
- [ ] 색인 생성 비율 확인

### 1개월 후 확인
- [ ] Search Console → 성능
- [ ] 노출 수 증가 확인
- [ ] 클릭 수 증가 확인

## 🔧 문제 해결

### 사이트맵 제출 실패 시
1. **XML 형식 오류**
   - 사이트맵 XML 형식 확인
   - XML 유효성 검사 도구 사용

2. **접근 불가 오류**
   - 사이트맵 URL이 공개적으로 접근 가능한지 확인
   - 로그인 없이 접근 가능해야 함

3. **URL 형식 오류**
   - 모든 URL이 절대 URL인지 확인
   - `https://luxury-select.co.kr` 도메인 사용 확인

### 색인 생성이 느릴 때
- 정상적인 현상입니다
- 대량의 페이지는 며칠~몇 주 소요될 수 있음
- Search Console에서 처리 상태 모니터링

## 📝 제출 기록

### 제출 정보
- **제출 날짜**: ___________
- **제출한 사이트맵**: `sitemap-index`
- **제출 URL**: `https://luxury-select.co.kr/sitemap-index`
- **제출자**: ___________

### 제출 결과
- **상태**: ___________
- **발견된 URL 수**: ___________
- **처리 완료 날짜**: ___________

## 🎯 최종 확인

제출 전 최종 확인:
- [ ] 모든 사이트맵이 정상 작동
- [ ] robots.txt에 사이트맵 등록됨
- [ ] 공개되지 않은 페이지는 제외됨
- [ ] 모든 URL이 올바른 형식
- [ ] 사이트맵 크기가 제한 내

**준비 완료! 이제 Google Search Console에 제출하세요!** 🚀


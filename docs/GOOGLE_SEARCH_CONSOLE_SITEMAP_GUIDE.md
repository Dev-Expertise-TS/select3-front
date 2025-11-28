# Google Search Console 사이트맵 제출 가이드

## 📋 개요

Canonical URL을 수정한 후 Google Search Console에 사이트맵을 제출하여 변경사항을 빠르게 인덱싱하도록 합니다.

## 🎯 제출할 사이트맵

### 방법 1: Sitemap Index 제출 (권장)

**하나의 사이트맵 인덱스만 제출하면 모든 하위 사이트맵이 자동으로 포함됩니다.**

```
https://luxury-select.co.kr/sitemap-index
```

**장점:**
- 한 번만 제출하면 모든 사이트맵이 자동으로 포함됨
- 새로운 사이트맵이 추가되어도 자동으로 인식됨
- 관리가 간편함

### 방법 2: 개별 사이트맵 제출 (선택사항)

개별 사이트맵을 직접 제출할 수도 있습니다:

1. **정적 페이지 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap.xml
   ```

2. **호텔 페이지 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap-hotel
   ```

3. **호텔 목록 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap-hotel-lists
   ```

4. **브랜드 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap-brands
   ```

5. **목적지 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap-destinations
   ```

6. **블로그 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap-blog
   ```

7. **토픽 페이지 사이트맵**
   ```
   https://luxury-select.co.kr/sitemap-topic-pages
   ```

## 📝 Google Search Console 제출 방법

### 1단계: Google Search Console 접속
1. [Google Search Console](https://search.google.com/search-console)에 접속
2. 속성(Property) 선택: `luxury-select.co.kr`

### 2단계: 사이트맵 제출
1. 왼쪽 메뉴에서 **"색인 생성"** → **"Sitemaps"** 클릭
2. **"새 사이트맵 추가"** 입력란에 다음 URL 입력:
   ```
   sitemap-index
   ```
   또는 전체 URL:
   ```
   https://luxury-select.co.kr/sitemap-index
   ```
3. **"제출"** 버튼 클릭

### 3단계: 확인
- 제출 후 몇 분 내에 상태가 표시됩니다
- **"성공"** 상태가 표시되면 정상적으로 제출된 것입니다
- Google이 사이트맵을 처리하는 데 몇 시간에서 며칠이 걸릴 수 있습니다

## 🔍 사이트맵 검증

제출 전에 사이트맵이 정상적으로 작동하는지 확인하세요:

### 브라우저에서 확인
```
https://luxury-select.co.kr/sitemap-index
https://luxury-select.co.kr/sitemap.xml
https://luxury-select.co.kr/sitemap-hotel
```

### 사이트맵 인덱스 구조
Sitemap Index는 다음 사이트맵들을 포함합니다:
- `/sitemap.xml` - 정적 페이지 (홈, About, Brand 등)
- `/sitemap-hotel` - 개별 호텔 페이지
- `/sitemap-hotel-lists` - 호텔 목록 페이지
- `/sitemap-brands` - 브랜드 페이지
- `/sitemap-destinations` - 목적지 페이지
- `/sitemap-blog` - 블로그 포스트
- `/sitemap-topic-pages` - 토픽 페이지

## ⚠️ 주의사항

1. **중복 제출 방지**
   - Sitemap Index를 제출했다면 개별 사이트맵은 제출하지 마세요
   - 중복 제출은 불필요하며 혼란을 야기할 수 있습니다

2. **업데이트 주기**
   - 사이트맵은 24시간마다 자동으로 재검증됩니다 (`revalidate: 86400`)
   - 새로운 페이지가 추가되면 자동으로 반영됩니다

3. **Canonical URL 확인**
   - 모든 페이지의 canonical URL이 올바르게 설정되었는지 확인하세요
   - `https://luxury-select.co.kr` 도메인을 사용해야 합니다

## 📊 제출 후 모니터링

### 확인할 항목
1. **색인 생성 상태**
   - Search Console → 색인 생성 → 페이지
   - 제출된 페이지 수 확인

2. **사이트맵 상태**
   - Search Console → 색인 생성 → Sitemaps
   - 제출된 URL 수와 발견된 URL 수 확인

3. **검색 성능**
   - Search Console → 성능
   - 노출 수와 클릭 수 모니터링

## 🚀 빠른 제출 (권장)

**가장 간단한 방법:**
1. Google Search Console 접속
2. Sitemaps 메뉴로 이동
3. `sitemap-index` 입력 후 제출

이것만으로 모든 페이지가 Google에 제출됩니다!

## 📅 업데이트 일정

- **사이트맵 재검증**: 24시간마다 자동
- **Google 크롤링**: 사이트맵 제출 후 몇 시간~며칠 내
- **색인 생성**: 크롤링 후 즉시 또는 며칠 내

## 🔗 관련 문서

- [Google Search Console 도움말](https://support.google.com/webmasters/answer/183668)
- [사이트맵 프로토콜](https://www.sitemaps.org/protocol.html)
- [Canonical URL 설정 가이드](./SEO_OPTIMIZATION_SUMMARY.md)


# 배포 후 검증 체크리스트

## 1. URL 정규화 테스트

### 1.1 Trailing Slash 리다이렉트 확인
```bash
# trailing slash 있는 URL → 없는 URL로 301 리다이렉트 확인
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
# 예상: HTTP/1.1 308 Permanent Redirect
# Location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# trailing slash 없는 URL은 200 응답
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: HTTP/1.1 200 OK
```

### 1.2 주요 페이지 응답 코드 확인
```bash
# 홈페이지
curl -I https://luxury-select.co.kr
# 예상: 200 OK

# 호텔 목록
curl -I https://luxury-select.co.kr/hotel
# 예상: 200 OK

# 브랜드 목록
curl -I https://luxury-select.co.kr/brand
# 예상: 200 OK

# 블로그
curl -I https://luxury-select.co.kr/blog
# 예상: 200 OK
```

## 2. Sitemap 검증

### 2.1 Sitemap Index 확인
```bash
curl https://luxury-select.co.kr/sitemap.xml
```
**확인 사항**:
- [ ] 모든 URL이 `https://luxury-select.co.kr`로 시작
- [ ] trailing slash 없음
- [ ] XML 형식 유효성

### 2.2 개별 Sitemap 확인
```bash
# 호텔 sitemap
curl https://luxury-select.co.kr/sitemap-hotel

# 체인 sitemap
curl https://luxury-select.co.kr/sitemap-chains

# 블로그 sitemap
curl https://luxury-select.co.kr/sitemap-blog

# 목적지 sitemap
curl https://luxury-select.co.kr/sitemap-destinations
```

## 3. 메타데이터 검증 (샘플 호텔)

### 3.1 Canonical URL 확인
```bash
curl -s https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay | grep canonical
# 예상: <link rel="canonical" href="https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay" />
```

### 3.2 OG URL 확인
```bash
curl -s https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay | grep "og:url"
# 예상: <meta property="og:url" content="https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay" />
```

### 3.3 사이트명 확인
```bash
curl -s https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay | grep "og:site_name"
# 예상: <meta property="og:site_name" content="투어비스 셀렉트" />
```

## 4. 리다이렉트 체인 확인

### 도구 사용 (선택)
- **Screaming Frog SEO Spider**: 대량 URL 크롤 및 리다이렉트 체인 감지
- **Redirect Path (Chrome 확장)**: 브라우저에서 리다이렉트 확인
- **Online 도구**: https://httpstatus.io/

### 확인 항목
- [ ] 단일 리다이렉트만 존재 (예: trailing slash 정규화)
- [ ] 리다이렉트 체인 없음 (2단계 이상)
- [ ] 리다이렉트 루프 없음

## 5. Google Search Console

### 5.1 Sitemap 재제출
1. GSC → 색인 생성 → Sitemap
2. 기존 sitemap 제거 (있다면)
3. 새 sitemap 제출: `https://luxury-select.co.kr/sitemap.xml`

### 5.2 주요 페이지 색인 요청
주요 호텔 페이지 5-10개 선택하여:
1. URL 검사
2. "라이브 URL 테스트"
3. "색인 생성 요청"

### 5.3 모니터링 설정
- [ ] 크롤 통계 모니터링 시작
- [ ] 페이지 색인 보고서 북마크
- [ ] 주간 리포트 이메일 설정

## 6. Core Web Vitals 확인

### PageSpeed Insights
주요 페이지 테스트:
- https://pagespeed.web.dev/
  - 홈페이지
  - 호텔 상세 (샘플 3개)
  - 브랜드 페이지

**목표**:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

## 7. Mobile & Desktop Googlebot 접근 확인

### User-Agent 테스트
```bash
# Desktop Googlebot
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: 200 OK

# Mobile Googlebot
curl -A "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
# 예상: 200 OK
```

## 8. Robots.txt 확인

```bash
curl https://luxury-select.co.kr/robots.txt
```

**확인 사항**:
- [ ] Sitemap 경로 포함
- [ ] 크롤 차단 규칙 적절성
- [ ] User-agent: * 설정
- [ ] 불필요한 Disallow 없음

## 9. 내부 링크 일관성 (샘플 확인)

### 랜덤 호텔 카드 10개 확인
브라우저 개발자 도구에서:
```javascript
// 호텔 카드 링크 추출
Array.from(document.querySelectorAll('a[href^="/hotel/"]'))
  .slice(0, 10)
  .map(a => a.href)
  .forEach(url => console.log(url))
```

**확인 사항**:
- [ ] 모든 링크가 trailing slash 없음
- [ ] 절대 URL이 아닌 상대 경로 사용
- [ ] 도메인 일관성 (`luxury-select.co.kr`)

## 10. 주간 모니터링 (첫 4주)

### Week 1-2
- [ ] GSC 크롤 오류 확인 (매일)
- [ ] 리다이렉트 오류 감소 추이
- [ ] 색인 페이지 수 변화

### Week 3-4
- [ ] 검색 노출 회복 여부
- [ ] 클릭 수 증가 여부
- [ ] 평균 게재 순위 변화

### Month 2-3
- [ ] 장기 색인 안정성
- [ ] 신규 페이지 색인 속도
- [ ] 전반적인 검색 성과

## 자동화 스크립트

### URL 응답 코드 일괄 체크
```bash
#!/bin/bash
# check-urls.sh

urls=(
  "https://luxury-select.co.kr"
  "https://luxury-select.co.kr/hotel"
  "https://luxury-select.co.kr/brand"
  "https://luxury-select.co.kr/blog"
  "https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay"
)

for url in "${urls[@]}"; do
  status=$(curl -o /dev/null -s -w "%{http_code}" "$url")
  echo "$url → $status"
done
```

### Trailing Slash 리다이렉트 체크
```bash
#!/bin/bash
# check-trailing-slash.sh

test_urls=(
  "https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay"
  "https://luxury-select.co.kr/brand/hyatt"
  "https://luxury-select.co.kr/blog/sample-post"
)

for base_url in "${test_urls[@]}"; do
  echo "Testing: $base_url"
  
  # trailing slash 없음 → 200 예상
  status_no_slash=$(curl -o /dev/null -s -w "%{http_code}" "$base_url")
  echo "  No slash: $status_no_slash"
  
  # trailing slash 있음 → 308 예상
  status_with_slash=$(curl -o /dev/null -s -w "%{http_code}" "$base_url/")
  echo "  With slash: $status_with_slash"
  
  echo ""
done
```

## 문제 발생 시 대응

### 여전히 리다이렉트 오류 발생
1. Vercel 배포 로그 확인
2. `next.config.mjs`의 `trailingSlash` 설정 재확인
3. 캐시 클리어 후 재배포
4. Vercel 프로젝트 설정 → Redirects 확인

### 색인 회복 느림
1. GSC에서 수동 색인 요청 (주요 페이지)
2. Sitemap 재제출
3. 사이트 전반 크롤 가능성 확인 (robots.txt, noindex)
4. 서버 응답 속도 개선

### 리다이렉트 체인 발견
1. 체인 경로 파악
2. 중간 리다이렉트 제거
3. 최종 URL로 직접 연결되도록 수정

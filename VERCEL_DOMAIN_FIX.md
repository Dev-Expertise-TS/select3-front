# Vercel 도메인 설정 수정 가이드

## 현재 상태 (문제)

### luxury-select.co.kr
- ❌ **307 Temporary Redirect** → www.luxury-select.co.kr
- 문제: Google이 임시 리다이렉트로 인식
- 영향: 색인 분산, 크롤 예산 낭비, SEO 저하

### www.luxury-select.co.kr
- ✅ Production 환경 연결 (정상)

## 수정 방법

### 1단계: luxury-select.co.kr 설정 변경

#### 현재 설정
```
Domain: luxury-select.co.kr
○ Connect to an environment
● Redirect to Another Domain
  [307 Temporary Redirect ▼] → www.luxury-select.co.kr
```

#### 변경할 설정
```
Domain: luxury-select.co.kr
○ Connect to an environment
● Redirect to Another Domain
  [308 Permanent Redirect ▼] → www.luxury-select.co.kr
```

#### 구체적 단계
1. `luxury-select.co.kr` 섹션에서 드롭다운 클릭
   - 현재: "307 Temporary Redirect"
2. 옵션에서 **"308 Permanent Redirect"** 선택
3. **"Save"** 버튼 클릭
4. 변경사항 적용 대기 (1-2분)

### 2단계: 검증

#### 명령어
```bash
# non-www → www (308 예상)
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 예상 결과
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

#### 추가 테스트
```bash
# trailing slash 있는 경우
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상 결과 (2단계 리다이렉트)
# 1단계: 308 → www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
# 2단계: 308 → www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 최종 URL 확인 (200 예상)
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 예상 결과
HTTP/2 200
```

## 307 vs 308 차이점

### 307 Temporary Redirect
- **의미**: 임시 리다이렉트
- **Google 동작**:
  - 원본 URL 계속 크롤
  - 색인 분산 (non-www와 www 모두)
  - PageRank 전달 불완전
  - 캐싱 짧음
- **사용 시기**: 진짜 임시 리다이렉트 (이벤트, A/B 테스트)

### 308 Permanent Redirect
- **의미**: 영구 리다이렉트
- **Google 동작**:
  - 최종 URL만 크롤
  - 색인 통합 (www로 통일)
  - PageRank 완전 전달
  - 캐싱 길음
- **사용 시기**: 도메인 정규화 (www/non-www 통일)

## 예상 효과

### 즉시 (수정 후 1-2주)
- ✅ 리다이렉트 상태 코드 308로 통일
- ✅ 크롤러가 최종 URL 인식
- ✅ 불필요한 크롤 감소

### 단기 (2-4주)
- ✅ GSC "리다이렉트" 오류 감소
- ✅ www 색인 증가, non-www 색인 감소
- ✅ 크롤 효율 개선

### 중기 (1-3개월)
- ✅ 색인 완전 통합 (www로)
- ✅ 검색 노출 회복
- ✅ 클릭 수 증가

## 리다이렉트 체인 최적화

### 현재 (문제)
```
사용자 요청: https://luxury-select.co.kr/hotel/slug/

1단계: 307 → https://www.luxury-select.co.kr/hotel/slug/  (Vercel, 임시)
2단계: 308 → https://www.luxury-select.co.kr/hotel/slug   (Next.js, 영구)

최종: 200 OK
```

**문제점**:
- 2단계 리다이렉트 (느림)
- 307 임시 리다이렉트 (SEO 불리)
- 크롤 예산 낭비

### 수정 후 (개선)
```
사용자 요청: https://luxury-select.co.kr/hotel/slug/

1단계: 308 → https://www.luxury-select.co.kr/hotel/slug/  (Vercel, 영구)
2단계: 308 → https://www.luxury-select.co.kr/hotel/slug   (Next.js, 영구)

최종: 200 OK
```

**개선점**:
- ✅ 모두 308 영구 리다이렉트
- ✅ Google이 최종 URL 빠르게 인식
- ✅ 색인 통합 가속화

### 이상적 (장기 목표)
```
사용자 요청: https://www.luxury-select.co.kr/hotel/slug

직접: 200 OK (리다이렉트 없음)
```

**달성 방법**:
- 모든 외부 링크를 www로 업데이트
- 소셜 미디어 링크 www로 변경
- 명함/인쇄물 www로 통일

## GSC 대응

### 수정 직후
1. **Sitemap 재제출**
   ```
   GSC → 색인 생성 → Sitemaps
   → 기존 sitemap 제거
   → https://www.luxury-select.co.kr/sitemap.xml 추가
   ```

2. **주요 페이지 색인 요청**
   - 호텔 상세 페이지 10개 선택
   - URL 검사 → "색인 생성 요청"

3. **도메인 속성 확인**
   - 주 속성: `https://www.luxury-select.co.kr`
   - 보조 속성: `https://luxury-select.co.kr` (리다이렉트 모니터링)

### 주간 모니터링
- [ ] Week 1: 리다이렉트 오류 감소 확인
- [ ] Week 2: www 색인 증가 추이
- [ ] Week 3-4: non-www 색인 감소 추이
- [ ] Month 2: 검색 노출/클릭 회복

## 체크리스트

### 즉시 (지금)
- [ ] Vercel에서 307 → 308 변경
- [ ] Save 클릭
- [ ] 1-2분 대기 (전파 시간)

### 5분 후
- [ ] curl 테스트 (308 확인)
- [ ] 여러 URL 패턴 테스트
- [ ] trailing slash 동작 확인

### 오늘 중
- [ ] GSC sitemap 재제출
- [ ] 주요 페이지 색인 요청
- [ ] 리다이렉트 체인 문서화

### 이번 주
- [ ] GSC 크롤 오류 모니터링
- [ ] 색인 페이지 수 추적
- [ ] 리다이렉트 오류 감소 확인

## 추가 최적화 (선택)

### vercel.json에 명시적 설정 (불필요, 참고용)
```json
{
  "regions": ["icn1"],
  "redirects": [
    {
      "source": "https://luxury-select.co.kr/:path*",
      "destination": "https://www.luxury-select.co.kr/:path*",
      "permanent": true,
      "statusCode": 308
    }
  ]
}
```

**주의**: Vercel UI 설정이 우선하므로 이 설정은 불필요합니다.

## 문제 해결

### 308로 변경했는데 여전히 307 응답
- 원인: 브라우저/CDN 캐시
- 해결: 5-10분 대기 후 재테스트
- 확인: `curl -I` (캐시 우회)

### trailing slash 불일치 지속
- 원인: Next.js와 Vercel 리다이렉트 순서
- 해결: 정상 동작 (2단계 리다이렉트)
- 최종 URL만 중요 (200 OK)

### GSC 색인 회복 느림
- 정상: 2-4주 소요
- 가속: 수동 색인 요청
- 모니터링: 주간 리포트 확인

## 참고 자료

- Vercel Redirects: https://vercel.com/docs/edge-network/redirects
- Google 308 가이드: https://developers.google.com/search/docs/crawling-indexing/301-redirects
- HTTP 상태 코드: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308

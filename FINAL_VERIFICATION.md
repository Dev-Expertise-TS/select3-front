# 최종 검증 가이드 (308 Permanent Redirect 적용 후)

## Vercel 설정 확인 ✅

### luxury-select.co.kr
- ✅ **308 Permanent Redirect** → www.luxury-select.co.kr
- 상태: Valid Configuration

### www.luxury-select.co.kr
- ✅ **Connect to Production**
- 상태: Valid Configuration

## 검증 단계

### 1단계: Save 클릭 후 대기
- Save 버튼 클릭
- 1-2분 대기 (설정 전파 시간)
- Vercel Edge Network 업데이트 대기

### 2단계: 기본 리다이렉트 테스트

#### Test 1: non-www → www (308 예상)
```bash
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

**예상 결과**:
```
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
server: Vercel
```

**확인 사항**:
- [ ] Status code가 308인가?
- [ ] Location이 www로 시작하는가?
- [ ] trailing slash가 유지되는가?

#### Test 2: non-www + trailing slash (308 예상)
```bash
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

**예상 결과**:
```
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
server: Vercel
```

#### Test 3: www + trailing slash → no trailing slash (308 예상)
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

**예상 결과**:
```
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
server: Vercel
```

**확인**: Next.js의 trailingSlash: false가 작동

#### Test 4: 최종 URL (200 예상)
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

**예상 결과**:
```
HTTP/2 200
content-type: text/html
server: Vercel
x-vercel-cache: HIT (또는 MISS)
```

### 3단계: 다양한 URL 패턴 테스트

#### 홈페이지
```bash
# non-www
curl -I https://luxury-select.co.kr
# 예상: 308 → https://www.luxury-select.co.kr

# www
curl -I https://www.luxury-select.co.kr
# 예상: 200 OK
```

#### 호텔 목록
```bash
# non-www
curl -I https://luxury-select.co.kr/hotel
# 예상: 308 → https://www.luxury-select.co.kr/hotel

# www
curl -I https://www.luxury-select.co.kr/hotel
# 예상: 200 OK
```

#### 브랜드 페이지
```bash
# non-www
curl -I https://luxury-select.co.kr/brand
# 예상: 308 → https://www.luxury-select.co.kr/brand

# www
curl -I https://www.luxury-select.co.kr/brand
# 예상: 200 OK
```

#### 블로그
```bash
# non-www
curl -I https://luxury-select.co.kr/blog
# 예상: 308 → https://www.luxury-select.co.kr/blog

# www
curl -I https://www.luxury-select.co.kr/blog
# 예상: 200 OK
```

### 4단계: 리다이렉트 체인 확인

#### 최악의 시나리오 (2단계 리다이렉트)
```bash
curl -IL https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

**예상 결과**:
```
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

HTTP/2 200
```

**확인**:
- [ ] 최대 2단계 리다이렉트
- [ ] 모두 308 Permanent
- [ ] 최종 200 OK

### 5단계: 브라우저 테스트

#### Chrome DevTools
1. 개발자 도구 열기 (F12)
2. Network 탭 선택
3. "Preserve log" 체크
4. "Disable cache" 체크
5. URL 입력: `https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay`

**확인 사항**:
- [ ] 첫 요청: 308 Redirect
- [ ] Location: www.luxury-select.co.kr
- [ ] 최종: 200 OK (HTML 문서)

### 6단계: Googlebot 시뮬레이션

#### Desktop Googlebot
```bash
curl -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -IL https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

**예상**: 308 → 200 OK

#### Mobile Googlebot
```bash
curl -A "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" \
  -IL https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

**예상**: 308 → 200 OK

## 검증 결과 체크리스트

### ✅ 성공 기준
- [ ] non-www → www: 308 Permanent
- [ ] trailing slash 정규화: 308 Permanent
- [ ] 최종 URL: 200 OK
- [ ] 리다이렉트 체인: 최대 2단계
- [ ] 모든 페이지 타입 동일 동작
- [ ] Googlebot 접근 정상

### ❌ 문제 발생 시

#### 여전히 307 응답
**원인**: 캐시 또는 설정 전파 지연
**해결**:
```bash
# 5분 대기 후 재시도
sleep 300
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

#### 3단계 이상 리다이렉트
**원인**: 설정 충돌
**해결**: vercel.json에 중복 리다이렉트 규칙 확인

#### 200 응답하지만 내용 없음
**원인**: Next.js 렌더링 문제
**해결**: 
```bash
# HTML 내용 확인
curl -L https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay | grep "<title>"
```

## GSC 대응 (검증 완료 후)

### 즉시 수행
1. **Sitemap 재제출**
   ```
   GSC → 색인 생성 → Sitemaps
   → https://www.luxury-select.co.kr/sitemap.xml 제출
   ```

2. **주요 페이지 색인 요청** (10-20개)
   - 호텔 상세 페이지
   - 브랜드 페이지
   - 블로그 포스트
   - URL 검사 → "색인 생성 요청"

3. **도메인 속성 확인**
   - 주 속성: `https://www.luxury-select.co.kr`
   - 보조 속성: `https://luxury-select.co.kr` (모니터링용)

### 주간 모니터링

#### Week 1
- [ ] 리다이렉트 오류 감소 추이
- [ ] 크롤 통계 개선 확인
- [ ] 308 응답 안정성

#### Week 2-3
- [ ] www 색인 증가
- [ ] non-www 색인 감소
- [ ] 크롤 예산 효율화

#### Week 4+
- [ ] 검색 노출 회복
- [ ] 클릭 수 증가
- [ ] 평균 게재 순위 개선

## 자동 검증 스크립트

### 전체 URL 테스트
```bash
#!/bin/bash
# verify-redirects.sh

echo "=== 308 Redirect 검증 시작 ==="
echo ""

# 테스트 URL 목록
urls=(
  "https://luxury-select.co.kr"
  "https://luxury-select.co.kr/hotel"
  "https://luxury-select.co.kr/brand"
  "https://luxury-select.co.kr/blog"
  "https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay"
)

for url in "${urls[@]}"; do
  echo "Testing: $url"
  status=$(curl -o /dev/null -s -w "%{http_code}" "$url")
  location=$(curl -s -I "$url" | grep -i "^location:" | cut -d' ' -f2 | tr -d '\r')
  
  if [ "$status" = "308" ]; then
    echo "  ✅ Status: 308 Permanent Redirect"
    echo "  → Location: $location"
  elif [ "$status" = "307" ]; then
    echo "  ❌ Status: 307 Temporary Redirect (문제!)"
    echo "  → Location: $location"
  else
    echo "  ⚠️  Status: $status"
  fi
  echo ""
done

echo "=== 검증 완료 ==="
```

### 실행 방법
```bash
chmod +x verify-redirects.sh
./verify-redirects.sh
```

## 성공 지표

### 기술적 지표
- ✅ 모든 non-www → www: 308
- ✅ trailing slash 정규화: 308
- ✅ 리다이렉트 체인: ≤ 2단계
- ✅ 최종 응답: 200 OK
- ✅ 응답 시간: < 500ms

### SEO 지표 (1-3개월)
- ✅ GSC 리다이렉트 오류: 90% 감소
- ✅ www 색인 페이지: 증가
- ✅ non-www 색인 페이지: 감소
- ✅ 검색 노출: 회복
- ✅ 클릭 수: 증가

## 다음 단계

### 단기 (이번 주)
1. ✅ Vercel 308 설정 완료
2. ✅ 검증 테스트 통과
3. 🔄 GSC sitemap 재제출
4. 🔄 주요 페이지 색인 요청

### 중기 (이번 달)
1. 🔄 GSC 크롤 오류 모니터링
2. 🔄 색인 페이지 수 추적
3. 🔄 검색 성과 분석

### 장기 (3개월)
1. 🔄 색인 완전 통합 확인
2. 🔄 검색 트래픽 회복 확인
3. 🔄 Core Web Vitals 최적화

## 참고 문서
- `REDIRECT_OPTIMIZATION.md` - 초기 분석
- `REDIRECT_FIX_URGENT.md` - 긴급 수정 사항
- `VERCEL_DOMAIN_FIX.md` - Vercel 설정 가이드
- `POST_DEPLOYMENT_CHECKLIST.md` - 배포 후 체크리스트

# 🚨 긴급: Vercel 도메인 설정 반대로 되어 있음

## 검증 결과 (문제 확인)

```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

HTTP/2 308
location: https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
refresh: 0;url=https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

## 발견된 문제

### 1. 리다이렉트 방향이 반대
- ❌ **현재**: `www` → `non-www`
- ✅ **필요**: `non-www` → `www`

### 2. Trailing slash 유지
- ❌ `/path/` → `/path/` (제거 안됨)
- ✅ `/path/` → `/path` (제거 필요)

### 3. Meta refresh 사용
- ❌ `refresh: 0;url=...` (SEO 불리)
- ✅ 순수 308 리다이렉트 필요

## Vercel 설정 수정 방법

### 현재 잘못된 설정 (추정)

#### www.luxury-select.co.kr
```
● Redirect to Another Domain
  [308 Permanent Redirect] → luxury-select.co.kr
```

#### luxury-select.co.kr
```
● Connect to an environment
  [Production]
```

### 올바른 설정으로 변경

#### Step 1: www.luxury-select.co.kr 수정
1. Vercel Dashboard → Domains
2. `www.luxury-select.co.kr` 클릭
3. **"Connect to an environment" 선택**
4. **"Production" 선택**
5. **Save** 클릭

#### Step 2: luxury-select.co.kr 수정
1. `luxury-select.co.kr` 클릭
2. **"Redirect to Another Domain" 선택**
3. **"308 Permanent Redirect" 선택**
4. 입력 필드에 **"www.luxury-select.co.kr"** 입력
5. **Save** 클릭

### 최종 설정 (목표)

```
┌─────────────────────────┐
│ luxury-select.co.kr     │
│ ● Redirect to Another   │
│   [308 Permanent ▼]     │
│   → www.luxury-select   │
└─────────────────────────┘

┌─────────────────────────┐
│ www.luxury-select.co.kr │
│ ● Connect to environment│
│   [Production ▼]        │
└─────────────────────────┘
```

## 예상 동작 (수정 후)

### Test 1: non-www → www
```bash
curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상 결과
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/
```

### Test 2: www + trailing slash → www (no slash)
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/

# 예상 결과
HTTP/2 308
location: https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay
```

### Test 3: 최종 URL (200 OK)
```bash
curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay

# 예상 결과
HTTP/2 200
content-type: text/html
```

## Trailing Slash 문제 해결

### 원인
`trailingSlash: false`가 작동하지 않는 이유:
1. **Vercel 리다이렉트가 먼저 실행**됨
2. Next.js 설정에 도달하기 전에 리다이렉트
3. 잘못된 도메인으로 리다이렉트되어 Next.js 처리 안됨

### 해결
Vercel 도메인 설정을 올바르게 수정하면:
```
1. luxury-select.co.kr/path/ 
   → 308 → www.luxury-select.co.kr/path/ (Vercel)
   
2. www.luxury-select.co.kr/path/
   → 308 → www.luxury-select.co.kr/path (Next.js trailingSlash: false)
   
3. www.luxury-select.co.kr/path
   → 200 OK
```

## 체크리스트

### 즉시 수행
- [ ] Vercel → Domains 접속
- [ ] `www.luxury-select.co.kr` → "Connect to Production"으로 변경
- [ ] `luxury-select.co.kr` → "Redirect to www.luxury-select.co.kr"로 변경
- [ ] 둘 다 Save 클릭
- [ ] 2-3분 대기 (전파 시간)

### 검증 (5분 후)
- [ ] `curl -I https://luxury-select.co.kr/hotel/six-senses-ninh-van-bay` → 308 to www
- [ ] `curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay/` → 308 (slash 제거)
- [ ] `curl -I https://www.luxury-select.co.kr/hotel/six-senses-ninh-van-bay` → 200 OK
- [ ] meta refresh 헤더 없음 확인

## 왜 이렇게 되었나?

### 가능한 원인
1. **Vercel UI에서 실수로 반대로 설정**
2. **이전 설정이 남아있음**
3. **도메인 추가 순서 문제**

### 교훈
- Vercel 도메인 설정 시 방향 주의
- Primary domain이 Production 연결
- 다른 도메인이 Primary로 리다이렉트

## 참고: 올바른 설정 스크린샷 예시

```
Domains
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Valid Configuration
luxury-select.co.kr → 308 → www.luxury-select.co.kr

Domain: luxury-select.co.kr
○ Connect to an environment
● Redirect to Another Domain
  [308 Permanent Redirect ▼]
  www.luxury-select.co.kr

[Remove] [Cancel] [Save]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Valid Configuration
www.luxury-select.co.kr

Domain: www.luxury-select.co.kr
● Connect to an environment
  [Production ▼]
○ Redirect to Another Domain
  [No Redirect]

[Remove] [Cancel] [Save]
```

## 수정 후 전체 플로우

### 사용자 시나리오 1: non-www 입력
```
1. 사용자: luxury-select.co.kr/hotel/slug
2. Vercel: 308 → www.luxury-select.co.kr/hotel/slug
3. Next.js: 200 OK (HTML 반환)
```

### 사용자 시나리오 2: non-www + trailing slash
```
1. 사용자: luxury-select.co.kr/hotel/slug/
2. Vercel: 308 → www.luxury-select.co.kr/hotel/slug/
3. Next.js: 308 → www.luxury-select.co.kr/hotel/slug (trailingSlash: false)
4. Next.js: 200 OK (HTML 반환)
```

### 사용자 시나리오 3: www + trailing slash
```
1. 사용자: www.luxury-select.co.kr/hotel/slug/
2. Next.js: 308 → www.luxury-select.co.kr/hotel/slug (trailingSlash: false)
3. Next.js: 200 OK (HTML 반환)
```

### 사용자 시나리오 4: www (최적)
```
1. 사용자: www.luxury-select.co.kr/hotel/slug
2. Next.js: 200 OK (HTML 반환, 리다이렉트 없음)
```

## 긴급도: 🔴 최우선

이 문제는 **즉시 수정**해야 합니다:
- 현재 모든 www 트래픽이 non-www로 리다이렉트
- 환경변수와 설정이 불일치
- SEO 악영향 지속
- 색인 혼란 가중

**지금 바로 Vercel 설정을 수정하세요!**

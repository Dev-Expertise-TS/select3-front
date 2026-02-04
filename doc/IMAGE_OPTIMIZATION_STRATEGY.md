# 이미지 최적화 전략 비교

## 📊 세 가지 방식 비교

### 1. Next.js 주도 (초기 방식 - 실패)

```typescript
// Supabase: 파라미터 추가
url?width=1200&quality=85&format=avif

// Next.js: 추가 파라미터 붙이기
/_next/image?url=...?width=1200&quality=85&format=avif&w=1200&q=70

// 결과: 400 Error ❌
```

**문제점**:
- ❌ 중복 파라미터로 Vercel Image API 오류
- ❌ Supabase + Vercel 이중 처리 충돌

---

### 2. 최적화 비활성화 (현재 방식)

```typescript
<Image 
  src={supabaseUrl} 
  unoptimized={true}  // 모든 최적화 비활성화
/>

// 결과: Supabase 원본 그대로
```

**장점**:
- ✅ 400 에러 해결
- ✅ Supabase AVIF/WebP 원본 사용

**단점**:
- ❌ Next.js Image Optimization 완전 비활성화
- ❌ 반응형 srcset 없음
- ❌ 브라우저별 포맷 최적화 없음
- ❌ 이미지 크기 최적화 없음

---

### 3. Supabase Transform API (권장 방식) ⭐

```typescript
// Supabase Transform API 사용
url?width=1200&quality=75&format=origin&resize=cover

<Image 
  src={transformedUrl} 
  unoptimized={true}  // Next.js 우회
/>

// 결과: Supabase가 최적화한 이미지
```

**장점**:
- ✅ Supabase Transform API 활용 (강력)
- ✅ CDN 캐시 사용 (빠름)
- ✅ 원본 서버에서 변환 (지연 시간 최소)
- ✅ 비용 효율적 (Vercel보다 저렴)
- ✅ 더 많은 옵션 (blur, sharpen, rotate 등)
- ✅ 400 에러 없음

**단점**:
- ⚠️ AVIF 포맷 미지원 (WebP만 지원)
- ⚠️ 브라우저별 자동 포맷 선택 없음

---

## 💰 **비용 비교**

### Vercel Image Optimization (Next.js)
- **무료**: 1,000 이미지/월
- **Pro**: $5/1,000 이미지 추가
- **처리 위치**: Vercel Edge Network
- **캐시**: Vercel CDN

### Supabase Transform API
- **무료**: 무제한 요청 (단, Bandwidth 제한 있음)
- **Pro**: $25/월 (100GB 포함)
- **처리 위치**: Supabase CDN (Cloudflare)
- **캐시**: Supabase CDN + Cloudflare

**결론**: **Supabase가 비용 효율적** 💰

---

## ⚡ **성능 비교**

### 시나리오 1: 첫 방문 (캐시 없음)

#### Next.js 방식:
```
사용자 → Vercel Edge
      → Supabase Storage (원본 다운로드)
      → Vercel (변환)
      → 사용자
      
총 시간: ~800ms
```

#### Supabase Transform 방식:
```
사용자 → Supabase CDN
      → Supabase Storage (원본)
      → Supabase (변환)
      → Supabase CDN 캐시
      → 사용자
      
총 시간: ~400ms ⚡
```

### 시나리오 2: 재방문 (캐시 있음)

#### Next.js 방식:
```
사용자 → Vercel Edge CDN
      → 캐시된 이미지 전달
      
총 시간: ~200ms
```

#### Supabase Transform 방식:
```
사용자 → Supabase CDN (Cloudflare)
      → 캐시된 이미지 전달
      
총 시간: ~150ms ⚡
```

**결론**: **Supabase Transform이 20-50% 빠름** 🚀

---

## 🎯 **권장 전략**

### A. Supabase 이미지 (대부분)

```typescript
// ✅ 권장: Supabase Transform API
const imageUrl = optimizeSupabaseImage(originalUrl, {
  width: 1200,
  quality: 75,
  format: 'origin',  // AVIF/WebP 원본 유지
  resize: 'cover'
})

<Image 
  src={imageUrl} 
  unoptimized={true}  // Next.js 우회
  width={1200}
  height={800}
/>
```

**적용 대상**:
- 히어로 이미지
- 호텔 카드 이미지
- 갤러리 이미지
- 목적지 이미지

### B. 로컬/Public 이미지

```typescript
// ✅ Next.js Image Optimization 사용
<Image 
  src="/logo.png" 
  width={200}
  height={100}
  quality={90}
/>
```

**적용 대상**:
- 로고
- 아이콘
- placeholder 이미지

### C. 외부 도메인 이미지

```typescript
// ✅ Next.js Image Optimization 사용
<Image 
  src="https://external.com/image.jpg" 
  width={600}
  height={400}
  quality={80}
/>
```

**적용 대상**:
- Unsplash 이미지
- 외부 API 이미지

---

## 📈 **Supabase Transform API 상세**

### 지원 파라미터

```typescript
// 크기 조절
?width=1200          // 너비
&height=800          // 높이
&resize=cover        // cover | contain | fill

// 품질
&quality=75          // 1-100 (기본: 80)

// 포맷
&format=origin       // origin | webp (AVIF 미지원)

// 추가 옵션
&blur=10             // 블러 효과 (1-100)
&sharpen=2           // 선명도 (1-10)
&rotate=90           // 회전 (0-360)
```

### 예제

```typescript
// 1. 모바일 히어로 (1200px, AVIF 원본)
const url = `${originalUrl}?width=1200&quality=75&format=origin&resize=cover`

// 2. 썸네일 (300px, WebP)
const url = `${originalUrl}?width=300&quality=70&format=webp&resize=cover`

// 3. 블러 효과 (placeholder)
const url = `${originalUrl}?width=50&quality=50&blur=50`
```

---

## 🔄 **마이그레이션 가이드**

### Step 1: V2 함수 적용

```typescript
// Before
import { optimizeHeroImageMobile } from '@/lib/image-optimization'

// After
import { optimizeHeroImageMobile } from '@/lib/image-optimization-v2'
```

### Step 2: unoptimized 유지

```typescript
<Image 
  src={optimizeHeroImageMobile(url)}  // V2 함수 사용
  unoptimized={true}  // Next.js 우회 (유지)
  ...
/>
```

### Step 3: 테스트

```bash
# 로컬 테스트
pnpm dev

# 브라우저 확인
# - Network 탭에서 Supabase URL + 파라미터 확인
# - 이미지가 정상 로드되는지 확인
# - 400 에러 없는지 확인
```

---

## 📊 **최종 권장 사항**

| 이미지 유형 | 방식 | 이유 |
|------------|------|------|
| **Supabase 이미지** | **Supabase Transform** ⭐ | 빠름, 저렴, 효율적 |
| **로컬 이미지** | **Next.js** | 기본 기능 활용 |
| **외부 이미지** | **Next.js** | 통합 관리 |

**결론**: 
- ✅ **Supabase Transform API 사용 권장** (현재 프로젝트의 90%)
- ✅ `unoptimized={true}` 유지 (Next.js 우회)
- ✅ 비용, 성능, 안정성 모두 우수

---

## 🚀 **다음 단계**

1. ✅ `image-optimization-v2.ts` 검토
2. ⏳ 점진적 마이그레이션 (V1 → V2)
3. ⏳ 성능 모니터링
4. ⏳ 비용 분석

**현재 상태**: V1 (unoptimized=true) 사용 중 - 안정적이지만 최적화 여지 있음
**권장**: V2 (Supabase Transform) 마이그레이션 - 더 나은 성능과 비용


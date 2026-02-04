# Supabase 설정 가이드

이 프로젝트는 Supabase를 백엔드 데이터베이스로 사용합니다.

## 🚀 빠른 시작

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 로그인
2. "New Project" 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 지역 선택 (가까운 지역 선택 권장)
5. 프로젝트 생성 완료까지 대기

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 선택사항 (서버 사이드에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**환경변수 찾는 방법:**
1. Supabase 대시보드 → Settings → API
2. Project URL과 anon public key 복사

### 3. 데이터베이스 스키마 설정

1. Supabase 대시보드 → SQL Editor
2. `supabase-schema.sql` 파일의 내용을 복사하여 실행
3. 또는 각 테이블을 개별적으로 생성

### 4. 인증 설정

1. Supabase 대시보드 → Authentication → Settings
2. Site URL 설정: `http://localhost:3000` (개발용)
3. Redirect URLs 설정: `http://localhost:3000/auth/callback`

## 📊 데이터베이스 구조

### 테이블 목록

- **hotels**: 호텔 정보
- **brands**: 브랜드 정보  
- **destinations**: 목적지 정보
- **user_profiles**: 사용자 프로필
- **bookings**: 예약 정보
- **reviews**: 리뷰 정보

### 주요 관계

```
users → user_profiles
hotels ← bookings → user_profiles
hotels ← reviews → user_profiles
```

## 🔐 보안 설정

### Row Level Security (RLS)

모든 테이블에 RLS가 활성화되어 있습니다:

- **공개 읽기**: 호텔, 브랜드, 목적지 정보
- **인증 필요**: 예약, 리뷰 생성/수정
- **사용자별 접근**: 개인 프로필, 예약, 리뷰

### 정책 예시

```sql
-- 호텔은 모든 사용자가 조회 가능
CREATE POLICY "Hotels are viewable by everyone" ON hotels FOR SELECT USING (true);

-- 예약은 본인만 접근 가능
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
```

## 🛠️ 개발 도구

### Supabase CLI (선택사항)

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 개발 환경 설정
supabase init
supabase start

# 마이그레이션 적용
supabase db push
```

### TypeScript 타입 생성

```bash
# 데이터베이스 타입 자동 생성 (CLI 사용 시)
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

## 📱 사용법

### 기본 사용법

```typescript
import { supabase } from '@/lib/supabase'
import { hotelUtils } from '@/lib/supabase-utils'

// 모든 호텔 조회
const hotels = await hotelUtils.getAllHotels()

// 특정 호텔 조회
const hotel = await hotelUtils.getHotelById(1)

// 호텔 검색
const searchResults = await hotelUtils.searchHotels('Bali')
```

### 인증 사용법

```typescript
import { authUtils } from '@/lib/supabase-utils'

// 로그인
await authUtils.signInWithEmail('user@example.com', 'password')

// 회원가입
await authUtils.signUpWithEmail('user@example.com', 'password')

// 로그아웃
await authUtils.signOut()

// 현재 사용자 정보
const user = await authUtils.getCurrentUser()
```

## 🔍 모니터링

### Supabase 대시보드

- **Database**: 테이블, 쿼리, 성능 모니터링
- **Authentication**: 사용자 관리, 세션 모니터링
- **Storage**: 파일 업로드/다운로드 관리
- **Edge Functions**: 서버리스 함수 실행

### 로그 확인

- **Database Logs**: SQL 쿼리 실행 로그
- **Auth Logs**: 인증 관련 이벤트
- **API Logs**: API 호출 로그

## 🚨 문제 해결

### 일반적인 문제들

1. **환경변수 오류**
   - `.env.local` 파일이 프로젝트 루트에 있는지 확인
   - 환경변수 이름이 정확한지 확인
   - 개발 서버 재시작

2. **RLS 정책 오류**
   - 사용자가 인증되었는지 확인
   - 정책이 올바르게 설정되었는지 확인

3. **타입 오류**
   - `src/types/env.d.ts` 파일 확인
   - Supabase 클라이언트 타입 확인

### 디버깅 팁

```typescript
// Supabase 응답 디버깅
const { data, error } = await supabase.from('hotels').select('*')
console.log('Data:', data)
console.log('Error:', error)

// 인증 상태 확인
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

## 📚 추가 리소스

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 지원

문제가 발생하면 다음을 확인하세요:

1. Supabase 대시보드의 로그
2. 브라우저 개발자 도구의 콘솔
3. 네트워크 탭의 API 호출 상태
4. [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)

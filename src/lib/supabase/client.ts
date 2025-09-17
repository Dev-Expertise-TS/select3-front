import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // 환경 변수 검증
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.')
  }

  // 브라우저 환경에서만 싱글톤 패턴 적용
  if (typeof window !== 'undefined' && supabaseClient) {
    return supabaseClient
  }

  const client = createBrowserClient(supabaseUrl, supabaseAnonKey)

  // 브라우저 환경에서만 클라이언트 캐싱
  if (typeof window !== 'undefined') {
    supabaseClient = client
  }

  return client
}

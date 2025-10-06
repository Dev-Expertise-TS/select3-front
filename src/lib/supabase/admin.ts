import { createClient } from '@supabase/supabase-js';

/**
 * Service Role 클라이언트 (서버 전용)
 * - Storage list() API 사용 가능
 * - 모든 RLS 정책 무시
 * - 절대 클라이언트 측에 노출하지 말 것
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


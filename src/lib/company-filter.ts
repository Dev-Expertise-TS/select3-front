/**
 * company 파라미터 기반 필터링 유틸리티
 * company=sk일 때 vcc=true인 호텔만 필터링
 */

/**
 * URL 파라미터에서 company 값 추출 (서버 사이드)
 */
export function getCompanyFromSearchParams(
  searchParams: { [key: string]: string | string[] | undefined }
): string | null {
  const company = searchParams.company
  if (!company) return null
  
  if (typeof company === 'string') {
    return company.toLowerCase() === 'sk' ? 'sk' : null
  }
  
  if (Array.isArray(company) && company.length > 0) {
    return company[0].toLowerCase() === 'sk' ? 'sk' : null
  }
  
  return null
}

/**
 * URL 파라미터에서 company 값 추출 (클라이언트 사이드)
 * URL 우선, 없으면 쿠키 확인
 */
export function getCompanyFromURL(): string | null {
  if (typeof window === 'undefined') return null
  
  // 1. URL 파라미터 우선 확인
  const urlParams = new URLSearchParams(window.location.search)
  const companyParam = urlParams.get('company')
  if (companyParam?.toLowerCase() === 'sk') return 'sk'
  
  // 2. 쿠키 확인 (fallback)
  const cookies = document.cookie.split(';')
  const companyCookie = cookies.find(c => c.trim().startsWith('company='))
  if (companyCookie?.split('=')[1]?.trim() === 'sk') return 'sk'
  
  return null
}

/**
 * company=sk 여부 확인
 */
export function isCompanySK(company: string | null): boolean {
  return company === 'sk'
}

/**
 * Supabase 쿼리에 vcc 필터 적용 (company=sk일 때만)
 * vcc는 TRUE일 때만 노출 (NULL은 제외)
 */
export function applyVccFilter<T extends { eq: (column: string, value: any) => T }>(
  query: T,
  company: string | null
): T {
  if (isCompanySK(company)) {
    // vcc는 TRUE일 때만 노출
    return query.eq('vcc', true)
  }
  return query
}

/**
 * 서버 사이드에서 company 값 추출 (쿠키 우선, 없으면 searchParams)
 */
export async function getCompanyFromServer(
  searchParams?: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>
): Promise<string | null> {
  // 쿠키에서 읽기 (우선순위 1)
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const companyCookie = cookieStore.get('company')?.value
    if (companyCookie === 'sk') return 'sk'
  } catch (error) {
    // cookies()가 사용 불가능한 환경에서는 무시
  }
  
  // searchParams에서 읽기 (우선순위 2)
  if (searchParams) {
    const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams
    return getCompanyFromSearchParams(resolvedParams)
  }
  
  return null
}

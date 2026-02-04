import {
  normalizeCompany,
  isCompanyWithVccFilter
} from '@/config/company'

/**
 * company 파라미터 기반 필터링 유틸리티
 * 설정(config/company.ts)에 정의된 company일 때 vcc=true 필터 적용
 */

/**
 * URL 파라미터에서 company 값 추출 (서버 사이드)
 * 허용 목록에 있는 값만 반환
 */
export function getCompanyFromSearchParams(
  searchParams: { [key: string]: string | string[] | undefined }
): string | null {
  const company = searchParams.company
  if (!company) return null

  if (typeof company === 'string') {
    return normalizeCompany(company)
  }

  if (Array.isArray(company) && company.length > 0) {
    return normalizeCompany(company[0])
  }

  return null
}

/**
 * URL 파라미터에서 company 값 추출 (클라이언트 사이드)
 * URL 우선, 없으면 쿠키 확인. 허용 목록에 있는 값만 반환
 */
export function getCompanyFromURL(): string | null {
  if (typeof window === 'undefined') return null

  const urlParams = new URLSearchParams(window.location.search)
  const companyParam = urlParams.get('company')
  if (companyParam) {
    const normalized = normalizeCompany(companyParam)
    if (normalized) return normalized
  }

  const cookies = document.cookie.split(';')
  const companyCookie = cookies.find(c => c.trim().startsWith('company='))
  const cookieValue = companyCookie?.split('=')[1]?.trim()
  return normalizeCompany(cookieValue ?? null)
}

/**
 * company=sk 여부 확인 (vcc 필터 적용 대상 여부와 동일)
 * @deprecated vcc 관련 판단은 isCompanyWithVccFilter 사용 권장
 */
export function isCompanySK(company: string | null): boolean {
  return isCompanyWithVccFilter(company)
}

/**
 * vcc 필터 적용 대상 company인지 확인
 */
export { isCompanyWithVccFilter } from '@/config/company'

/**
 * Supabase 쿼리에 vcc 필터 적용 (설정에 정의된 company일 때만)
 * vcc는 TRUE일 때만 노출 (NULL은 제외)
 */
export function applyVccFilter<T extends { eq: (column: string, value: unknown) => T }>(
  query: T,
  company: string | null
): T {
  if (isCompanyWithVccFilter(company)) {
    return query.eq('vcc', true)
  }
  return query
}

/**
 * 서버 사이드에서 company 값 추출 (쿠키 우선, 없으면 searchParams)
 * 허용 목록에 있는 값만 반환
 */
export async function getCompanyFromServer(
  searchParams?: { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>
): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const companyCookie = cookieStore.get('company')?.value
    if (companyCookie) {
      const normalized = normalizeCompany(companyCookie)
      if (normalized) return normalized
    }
  } catch {
    // cookies()가 사용 불가능한 환경에서는 무시
  }

  if (searchParams) {
    const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams
    return getCompanyFromSearchParams(resolvedParams)
  }

  return null
}

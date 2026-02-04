import { normalizeCompany } from '@/config/company'

/**
 * URL 유틸리티 함수
 * company 파라미터를 자동으로 추가/유지 (허용 목록: config/company.ts)
 */

/**
 * company 파라미터를 URL에 추가하는 헬퍼 함수
 * 허용 목록에 있는 company만 추가
 */
export function addCompanyParam(url: string, company: string | null | undefined): string {
  const normalized = normalizeCompany(company)
  if (!normalized) return url

  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://luxury-select.co.kr')
    urlObj.searchParams.set('company', normalized)
    return urlObj.pathname + urlObj.search
  } catch {
    // 상대 경로인 경우
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}company=${normalized}`
  }
}

/**
 * 클라이언트 사이드에서 company 파라미터 가져오기 (허용 목록에 있는 값만 반환)
 */
function getCompanyFromClient(): string | null {
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
 * URL에 company 파라미터 자동 추가 (클라이언트 사이드)
 */
export function withCompanyParam(url: string): string {
  const company = getCompanyFromClient()
  return addCompanyParam(url, company)
}

/**
 * router.push용 URL 생성 (company 파라미터 자동 추가)
 */
export function createNavigationUrl(path: string, params?: Record<string, string>): string {
  const urlParams = new URLSearchParams(params)
  const company = getCompanyFromClient()

  if (company) {
    urlParams.set('company', company)
  }

  const queryString = urlParams.toString()
  return queryString ? `${path}?${queryString}` : path
}

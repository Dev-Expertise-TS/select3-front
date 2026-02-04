/**
 * company 파라미터 허용 값 및 동작 설정
 * URL/쿠키의 company 값을 한 곳에서 관리합니다.
 */

/** 허용되는 company 코드 목록 (소문자로 비교) */
export const ALLOWED_COMPANIES = ['benepia'] as const

export type CompanyCode = (typeof ALLOWED_COMPANIES)[number]

/** vcc=TRUE 필터를 적용할 company 코드 목록 (이 목록에 있는 경우에만 vcc 필터 적용) */
export const COMPANIES_WITH_VCC_FILTER: readonly string[] = ['benepia']

/**
 * 문자열이 허용된 company 코드인지 검사 후 정규화된 값 반환
 */
export function normalizeCompany(value: string | null | undefined): CompanyCode | null {
  if (value == null || typeof value !== 'string') return null
  const lower = value.toLowerCase().trim()
  return ALLOWED_COMPANIES.includes(lower as CompanyCode) ? (lower as CompanyCode) : null
}

/**
 * 허용된 company 코드인지 여부
 */
export function isValidCompany(value: string | null | undefined): boolean {
  return normalizeCompany(value) !== null
}

/**
 * vcc=TRUE 필터를 적용해야 하는 company인지 여부
 */
export function isCompanyWithVccFilter(company: string | null | undefined): boolean {
  if (company == null || typeof company !== 'string') return false
  return COMPANIES_WITH_VCC_FILTER.includes(company.toLowerCase().trim())
}

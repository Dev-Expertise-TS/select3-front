/**
 * URL 유틸리티 함수
 * company 파라미터를 자동으로 추가/유지
 */

/**
 * company 파라미터를 URL에 추가하는 헬퍼 함수
 */
export function addCompanyParam(url: string, company: string | null | undefined): string {
  // company가 유효한 문자열이 아니면 원본 URL 반환
  if (!company || typeof company !== 'string' || company !== 'sk') {
    return url
  }
  
  try {
    const urlObj = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://luxury-select.co.kr')
    urlObj.searchParams.set('company', 'sk')
    return urlObj.pathname + urlObj.search
  } catch (e) {
    // 상대 경로인 경우
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}company=sk`
  }
}

/**
 * 클라이언트 사이드에서 company 파라미터 가져오기
 */
function getCompanyFromClient(): string | null {
  if (typeof window === 'undefined') return null
  
  // URL 파라미터 우선
  const urlParams = new URLSearchParams(window.location.search)
  const companyParam = urlParams.get('company')
  if (companyParam === 'sk') return 'sk'
  
  // 쿠키 확인
  const cookies = document.cookie.split(';')
  const companyCookie = cookies.find(c => c.trim().startsWith('company='))
  if (companyCookie?.split('=')[1]?.trim() === 'sk') return 'sk'
  
  return null
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
  
  if (company === 'sk') {
    urlParams.set('company', 'sk')
  }
  
  const queryString = urlParams.toString()
  return queryString ? `${path}?${queryString}` : path
}

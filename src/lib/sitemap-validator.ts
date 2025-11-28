/**
 * 사이트맵 URL 검증 유틸리티
 * 리디렉션되는 URL을 필터링하고 최종 목적지 URL만 반환
 */

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'

/**
 * URL이 최종 목적지 URL인지 검증
 * 리디렉션 규칙에 맞지 않는 URL은 제외
 */
export function isValidSitemapUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    
    // 1. www 도메인 제외 (non-www로 리디렉션됨)
    if (urlObj.hostname.startsWith('www.')) {
      return false
    }
    
    // 2. trailing slash 제외 (trailing slash 없는 URL로 리디렉션됨)
    if (urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
      return false
    }
    
    // 3. 쿼리 파라미터가 있는 URL 제외 (리디렉션될 수 있음)
    // 단, 검색 결과 페이지 등 쿼리 파라미터가 필요한 페이지는 예외
    const queryParamAllowedPaths = ['/search-results']
    const hasQueryParams = urlObj.search.length > 0
    const isQueryParamAllowed = queryParamAllowedPaths.some(path => 
      urlObj.pathname.startsWith(path)
    )
    
    if (hasQueryParams && !isQueryParamAllowed) {
      return false
    }
    
    // 4. baseUrl과 일치하는지 확인
    if (!url.startsWith(baseUrl)) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * URL 배열에서 유효한 URL만 필터링
 */
export function filterValidSitemapUrls(urls: string[]): string[] {
  return urls.filter(isValidSitemapUrl)
}

/**
 * URL을 정규화 (최종 목적지 URL로 변환)
 */
export function normalizeSitemapUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // www 제거
    if (urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = urlObj.hostname.replace(/^www\./, '')
    }
    
    // trailing slash 제거 (루트 경로 제외)
    if (urlObj.pathname.endsWith('/') && urlObj.pathname !== '/') {
      urlObj.pathname = urlObj.pathname.slice(0, -1)
    }
    
    // 쿼리 파라미터 제거 (리디렉션되는 쿼리 파라미터)
    // /hotel?city=... 같은 경우는 이미 리디렉션되므로 제거
    const redirectQueryParams = ['city']
    redirectQueryParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * MetadataRoute.Sitemap 형식의 URL 검증 및 정규화
 */
export function validateSitemapEntry(
  entry: { url: string; lastModified?: Date | string; changeFrequency?: string; priority?: number }
): { url: string; lastModified?: Date | string; changeFrequency?: string; priority?: number } | null {
  const normalizedUrl = normalizeSitemapUrl(entry.url)
  
  if (!isValidSitemapUrl(normalizedUrl)) {
    return null
  }
  
  return {
    ...entry,
    url: normalizedUrl,
  }
}


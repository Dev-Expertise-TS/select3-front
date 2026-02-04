import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { normalizeCompany } from '@/config/company'

// city_code → city_slug 매핑
// ⚠️ 중요: select_regions 테이블의 city_slug 값과 정확히 일치해야 함!
const CITY_CODE_TO_SLUG: Record<string, string> = {
  'DAN': 'da-nang',       // 다낭 (city_code: DAN)
  'DANANG': 'da-nang',    // 레거시 호환
  'BANGKOK': 'bangkok',
  'BALI': 'bali',
  'TOKYO': 'tokyo',
  'OSAKA': 'osaka',
  'HONG_KONG': 'hong-kong',
  'SINGAPORE': 'singapore',
  'PHUKET': 'phuket',
  'SAMUI': 'ko-samui',
  'SEOUL': 'seoul',
  'BUSAN': 'busan',
  'PARIS': 'paris',
  'LONDON': 'london',
  'NEW_YORK': 'new-york',
  'LOS_ANGELES': 'los-angeles',
  'DUBAI': 'dubai',
  'MALDIVES': 'maldives',
  'KYOTO': 'kyoto',
  'HOIAN': 'hoi-an',
  'CONDAO': 'con-dao',
  'SANYA': 'sanya',
  'NINHOA': 'ninh-hoa',
  'PHUQUOC': 'phu-quoc',
  'UBUD': 'ubud',
  'DENPASAR': 'denpasar',
  'MANILA': 'manila',
  'CEBU': 'cebu',
  'BORACAY': 'boracay',
  'KUALA_LUMPUR': 'kuala-lumpur',
  'LANGKAWI': 'langkawi',
  'PENANG': 'penang',
  'HANOI': 'hanoi',
  'HO_CHI_MINH': 'ho-chi-minh',
  'JAKARTA': 'jakarta',
  'YOGYAKARTA': 'yogyakarta',
  'TAIPEI': 'taipei',
  'KAOHSIUNG': 'kaohsiung',
  'MACAU': 'macau',
  'SHANGHAI': 'shanghai',
  'BEIJING': 'beijing',
  'GUANGZHOU': 'guangzhou',
  'SHENZHEN': 'shenzhen',
  'HANGZHOU': 'hangzhou',
  'CHENGDU': 'chengdu',
  'XIAN': 'xian',
  'SAPPORO': 'sapporo',
  'FUKUOKA': 'fukuoka',
  'OKINAWA': 'okinawa',
  'NAGOYA': 'nagoya',
  'KOBE': 'kobe',
  'HIROSHIMA': 'hiroshima',
  'SENDAI': 'sendai',
}

// Next.js 16: proxy.ts는 middleware.ts를 대체합니다
// 네트워크 경계를 명확히 하고 Node.js 런타임에서 실행됩니다
export default function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const response = NextResponse.next()
  
  // company 파라미터 감지 및 쿠키 저장 (허용 목록: config/company.ts)
  const companyParam = normalizeCompany(searchParams.get('company'))
  const companyCookie = normalizeCompany(request.cookies.get('company')?.value)

  if (companyParam) {
    // URL에 허용된 company가 있으면 쿠키에 저장 (30일 유지)
    response.cookies.set('company', companyParam, {
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false // 클라이언트에서도 읽을 수 있도록
    })
  } else if (companyCookie && !searchParams.has('company')) {
    // 쿠키에 허용된 company가 있지만 URL에 없으면 URL에 추가
    const newUrl = new URL(request.url)
    newUrl.searchParams.set('company', companyCookie)
    return NextResponse.redirect(newUrl)
  }
  
  // /hotel?city=DANANG → /hotel/danang 리다이렉트
  if (pathname === '/hotel' && searchParams.has('city')) {
    const cityCode = searchParams.get('city')?.toUpperCase()
    
    if (cityCode) {
      const citySlug = CITY_CODE_TO_SLUG[cityCode] || cityCode.toLowerCase().replace(/_/g, '-')
      const newUrl = new URL(`/hotel/${citySlug}`, request.url)
      
      // company 파라미터 유지
      searchParams.forEach((value, key) => {
        if (key !== 'city') {
          newUrl.searchParams.set(key, value)
        }
      })
      
      // 쿠키에 허용된 company가 있으면 URL에도 추가
      if (companyCookie && !newUrl.searchParams.has('company')) {
        newUrl.searchParams.set('company', companyCookie)
      }
      
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * 모든 경로에 매칭 (company 파라미터 처리용)
     * 단, 정적 파일과 API 라우트는 제외
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)).*)',
  ],
}


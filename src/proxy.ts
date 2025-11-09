import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// city_code → city_slug 매핑
const CITY_CODE_TO_SLUG: Record<string, string> = {
  'DANANG': 'danang',
  'BANGKOK': 'bangkok',
  'BALI': 'bali',
  'TOKYO': 'tokyo',
  'OSAKA': 'osaka',
  'HONG_KONG': 'hong-kong',
  'SINGAPORE': 'singapore',
  'PHUKET': 'phuket',
  'SAMUI': 'samui',
  'SEOUL': 'seoul',
  'BUSAN': 'busan',
  'PARIS': 'paris',
  'LONDON': 'london',
  'NEW_YORK': 'new-york',
  'LOS_ANGELES': 'los-angeles',
  'DUBAI': 'dubai',
  'MALDIVES': 'maldives',
  'KYOTO': 'kyoto',
  'HOIAN': 'hoian',
  'CONDAO': 'condao',
  'SANYA': 'sanya',
  'NINHOA': 'ninhoa',
  'PHUQUOC': 'phuquoc',
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
  
  // /hotel?city=DANANG → /hotel/danang 리다이렉트
  if (pathname === '/hotel' && searchParams.has('city')) {
    const cityCode = searchParams.get('city')?.toUpperCase()
    
    if (cityCode) {
      const citySlug = CITY_CODE_TO_SLUG[cityCode] || cityCode.toLowerCase().replace(/_/g, '-')
      const newUrl = new URL(`/hotel/${citySlug}`, request.url)
      
      searchParams.forEach((value, key) => {
        if (key !== 'city') {
          newUrl.searchParams.set(key, value)
        }
      })
      
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/hotel',
    '/brand/:path*',
  ],
}


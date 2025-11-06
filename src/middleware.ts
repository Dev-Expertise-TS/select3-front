import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// city_code → city_slug 매핑 (대표적인 도시들)
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

// brand_name → brand_slug 매핑
const BRAND_NAME_TO_SLUG: Record<string, string> = {
  'Aman': 'aman',
  'Four Seasons': 'four-seasons',
  'Ritz-Carlton': 'ritz-carlton',
  'St. Regis': 'st-regis',
  'Park Hyatt': 'park-hyatt',
  'Grand Hyatt': 'grand-hyatt',
  'Andaz': 'andaz',
  'Conrad': 'conrad',
  'Waldorf Astoria': 'waldorf-astoria',
  'InterContinental': 'intercontinental',
  'Sofitel': 'sofitel',
  'Raffles': 'raffles',
  'Fairmont': 'fairmont',
  'Marriott': 'marriott',
  'JW Marriott': 'jw-marriott',
  'W Hotels': 'w-hotels',
  'Alila': 'alila',
  'Banyan Tree': 'banyan-tree',
  'Anantara': 'anantara',
  'Rosewood': 'rosewood',
  'Mandarin Oriental': 'mandarin-oriental',
  'Peninsula': 'peninsula',
  'Shangri-La': 'shangri-la',
  'Capella': 'capella',
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  
  // /hotel?city=DANANG 형태의 요청을 /hotel/danang으로 리다이렉트
  if (pathname === '/hotel' && searchParams.has('city')) {
    const cityCode = searchParams.get('city')?.toUpperCase()
    
    if (cityCode) {
      const citySlug = CITY_CODE_TO_SLUG[cityCode] || cityCode.toLowerCase().replace(/_/g, '-')
      
      // 새 URL 생성 (다른 쿼리 파라미터는 유지)
      const newUrl = new URL(`/hotel/${citySlug}`, request.url)
      
      // city 파라미터 제외한 나머지 쿼리 파라미터 복사
      searchParams.forEach((value, key) => {
        if (key !== 'city') {
          newUrl.searchParams.set(key, value)
        }
      })
      
      // 301 영구 리다이렉트
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }
  
  // /hotel?brand=Aman 형태의 요청을 /hotel/brand/aman으로 리다이렉트
  if (pathname === '/hotel' && searchParams.has('brand')) {
    const brandName = searchParams.get('brand')
    
    if (brandName) {
      const brandSlug = BRAND_NAME_TO_SLUG[brandName] || brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      // 새 URL 생성
      const newUrl = new URL(`/hotel/brand/${brandSlug}`, request.url)
      
      // brand 파라미터 제외한 나머지 쿼리 파라미터 복사
      searchParams.forEach((value, key) => {
        if (key !== 'brand') {
          newUrl.searchParams.set(key, value)
        }
      })
      
      // 301 영구 리다이렉트
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }
  
  return NextResponse.next()
}

// 미들웨어 적용 경로
export const config = {
  matcher: [
    '/hotel',
    '/brand/:path*',
  ],
}


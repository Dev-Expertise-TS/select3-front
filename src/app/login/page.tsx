import { Metadata } from 'next'
import { LoginContent } from './login-content'

export const metadata: Metadata = {
  title: '로그인 | 투어비스 셀렉트',
  description: '투어비스 셀렉트에 로그인하여 특별한 호텔 혜택과 서비스를 이용해보세요. 프리미엄 호텔 컨시어지 서비스를 경험하실 수 있습니다.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginPage() {
  return <LoginContent />
}

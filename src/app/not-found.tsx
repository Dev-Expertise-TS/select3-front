'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Not Found 페이지는 동적으로 렌더링
export const dynamic = 'force-dynamic'

export default function NotFound() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(2)

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/')
    }, 2000)

    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => {
      clearTimeout(redirectTimer)
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <p className="text-center text-base text-gray-700 leading-relaxed space-y-4">
        <span className="block">죄송합니다. 찾으시는 페이지가 수정되었네요.</span>
        <span className="block">시작 페이지에서 원하는 호텔과 콘텐츠를 찾아보세요.</span>
        <span className="block text-gray-500 mt-6">
          {countdown}초 후 시작 페이지로 자동 이동합니다.
        </span>
      </p>
    </div>
  )
}

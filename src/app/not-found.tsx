'use client'

import { useEffect, useState, useRef } from "react"
import Image from "next/image"

// Not Found 페이지는 동적으로 렌더링
export const dynamic = 'force-dynamic'

export default function NotFound() {
  const [countdown, setCountdown] = useState(0)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // 이미 리다이렉트했으면 중복 실행 방지
    if (hasRedirected.current) return

    // 카운트다운 시작
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 1초 후 자동 리다이렉트
    const redirectTimer = setTimeout(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true
        window.location.href = '/'
      }
    }, 1000)

    return () => {
      clearTimeout(redirectTimer)
      clearInterval(interval)
    }
  }, [])

  // countdown이 0이 되면 리다이렉트 (렌더링 후 실행)
  useEffect(() => {
    if (countdown === 0 && !hasRedirected.current) {
      hasRedirected.current = true
      window.location.href = '/'
    }
  }, [countdown])

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-b from-gray-50 to-white px-4 pt-32 sm:pt-40">
      <div className="max-w-2xl w-full text-center">
        {/* 셀렉트 로고 영역 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <Image
              src="/select_logo.avif"
              alt="투어비스 셀렉트 로고"
              width={200}
              height={100}
              className="w-32 h-16 sm:w-40 sm:h-20 md:w-48 md:h-24 object-contain"
              priority
            />
          </div>
        </div>

        {/* 메인 메시지 */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            페이지가 변경이 되었습니다.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
            호텔 검색 페이지로 이동합니다.
          </p>
        </div>

        {/* 카운트다운 메시지 */}
        <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 animate-spin" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          <span className="text-xs sm:text-sm md:text-base text-blue-700 font-medium">
            <span className="font-bold text-blue-800">{countdown}</span>초 후 시작 페이지로 자동 이동합니다.
          </span>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const HYATT_POPUP_KEY_HIDE_UNTIL = 'tourvis_hyatt_popup_hide_until'
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// Hyatt 브랜드 대표 이미지 (Park Hyatt Tokyo / 아시아 태평양)
const HYATT_REPRESENTATIVE_IMAGE = '/destination-image/tokyo.jpg'
const HYATT_LOGO = '/brand-image/hyatt.avif'
const HYATT_BRAND_URL = 'https://luxury-select.co.kr/brand/hyatt'

export function HyattPrivePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [hideForDay, setHideForDay] = useState(false)
  const [hideForWeek, setHideForWeek] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return

    try {
      const hideUntil = localStorage.getItem(HYATT_POPUP_KEY_HIDE_UNTIL)
      if (hideUntil) {
        const until = Number(hideUntil)
        if (!Number.isNaN(until) && Date.now() < until) {
          setIsVisible(false)
          return
        }
      }

      setIsVisible(true)
    } catch {
      setIsVisible(true)
    }
  }, [isMounted])

  const handleClose = () => {
    try {
      if (hideForWeek) {
        localStorage.setItem(HYATT_POPUP_KEY_HIDE_UNTIL, String(Date.now() + SEVEN_DAYS_MS))
      } else if (hideForDay) {
        localStorage.setItem(HYATT_POPUP_KEY_HIDE_UNTIL, String(Date.now() + ONE_DAY_MS))
      }
    } catch {
      // ignore
    }
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hyatt-popup-title"
    >
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* 팝업 카드 */}
      <div
        className={cn(
          'relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-300'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 z-20 rounded-full p-2 bg-black/40 text-white hover:bg-black/60 transition-colors"
          aria-label="팝업 닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* 대표 이미지 영역 */}
        <Link
          href={HYATT_BRAND_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block relative aspect-[16/10] w-full"
        >
          <Image
            src={HYATT_REPRESENTATIVE_IMAGE}
            alt="Hyatt Privé 아시아 태평양 지역 럭셔리 호텔"
            fill
            sizes="(max-width: 480px) 100vw, 440px"
            className="object-cover"
            priority
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          {/* Hyatt 로고 뱃지 */}
          <div className="absolute left-4 top-4 h-8 w-24">
            <Image
              src={HYATT_LOGO}
              alt="Hyatt"
              fill
              className="object-contain object-left"
              sizes="80px"
            />
          </div>
          {/* 텍스트 오버레이 */}
          <div className="absolute inset-x-4 bottom-4 text-left">
            <h2
              id="hyatt-popup-title"
              className="text-xl font-bold text-white drop-shadow-lg"
            >
              Hyatt Privé 특가 오픈
            </h2>
            <p className="mt-1 text-sm text-white/95">
              최대 <span className="font-bold text-white">15%</span> 추가할인, 아시아 태평양 지역
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-white">
              자세히 보기
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* 하단 CTA 버튼 (모바일 터치 친화) */}
        <Link
          href={HYATT_BRAND_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-6 py-4 bg-gray-900 text-white text-center font-medium hover:bg-gray-800 transition-colors"
          onClick={handleClose}
        >
          Hyatt 호텔 둘러보기
        </Link>

        {/* 보지 않기 체크박스 및 닫기 버튼 영역 */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideForDay}
                onChange={(e) => setHideForDay(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">오늘 하루 보지 않기</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideForWeek}
                onChange={(e) => setHideForWeek(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">7일 동안 보지 않기</span>
            </label>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

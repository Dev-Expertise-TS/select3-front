import { useEffect, useState } from "react"

/**
 * useIsMobile
 * - sm 브레이크포인트(640px) 미만일 때 true
 * - 리사이즈에 반응하여 상태 갱신
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 640px)')
    const update = () => setIsMobile(mq.matches)
    update()
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    window.addEventListener('resize', update)
    return () => {
      mq.removeEventListener('change', handler)
      window.removeEventListener('resize', update)
    }
  }, [])

  return isMobile
}

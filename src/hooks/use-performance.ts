// 성능 최적화 유틸리티 함수들
import { useCallback, useMemo, useRef, useEffect } from 'react'

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 쓰로틀 훅
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, delay)

      return () => clearTimeout(timer)
    }
  }, [value, delay])

  return throttledValue
}

// 메모이제이션된 콜백 훅
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, deps)

  return useCallback((...args: any[]) => {
    return callbackRef.current(...args)
  }, []) as T
}

// 메모이제이션된 값 훅
export function useStableValue<T>(value: T, deps: React.DependencyList): T {
  const valueRef = useRef(value)
  
  useEffect(() => {
    valueRef.current = value
  }, deps)

  return useMemo(() => valueRef.current, [])
}

// 이전 값 추적 훅
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// 깊은 비교 훅
export function useDeepCompareMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>()
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { deps, value: factory() }
  }
  
  return ref.current.value
}

// 깊은 비교 함수
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  
  if (typeof a === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    
    if (keysA.length !== keysB.length) return false
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false
      if (!deepEqual(a[key], b[key])) return false
    }
    
    return true
  }
  
  return false
}

// 인터섹션 옵저버 훅
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      options
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

// 가상화 훅
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    )
    
    return {
      start: Math.max(0, start - overscan),
      end
    }
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }))
  }, [items, visibleRange])

  const totalHeight = items.length * itemHeight
  const offsetY = visibleRange.start * itemHeight

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  }
}

// 성능 측정 훅
export function usePerformanceMeasure(name: string) {
  const startTime = useRef<number>()
  const endTime = useRef<number>()

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    endTime.current = performance.now()
    if (startTime.current) {
      const duration = endTime.current - startTime.current
      console.log(`${name}: ${duration.toFixed(2)}ms`)
    }
  }, [name])

  const measure = useCallback((fn: () => void) => {
    start()
    fn()
    end()
  }, [start, end])

  return { start, end, measure }
}

// 메모리 사용량 추적 훅
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        })
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 1000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

// 번들 크기 최적화를 위한 동적 임포트 훅
export function useDynamicImport<T>(
  importFn: () => Promise<{ default: T }>,
  deps: React.DependencyList = []
) {
  const [component, setComponent] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    
    importFn()
      .then(module => {
        setComponent(module.default)
      })
      .catch(err => {
        setError(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, deps)

  return { component, loading, error }
}

// 코드 스플리팅을 위한 컴포넌트 래퍼
export function withCodeSplitting<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  return React.lazy(importFn)
}

// 이미지 최적화 훅
export function useImageOptimization(src: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
} = {}) {
  const [optimizedSrc, setOptimizedSrc] = useState(src)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!src) return

    setLoading(true)
    setError(null)

    // 이미지 최적화 로직 구현
    const optimizeImage = async () => {
      try {
        // 실제 구현에서는 이미지 최적화 서비스 사용
        const optimized = await optimizeImageUrl(src, options)
        setOptimizedSrc(optimized)
      } catch (err) {
        setError(err as Error)
        setOptimizedSrc(src) // 폴백으로 원본 사용
      } finally {
        setLoading(false)
      }
    }

    optimizeImage()
  }, [src, options.width, options.height, options.quality, options.format])

  return { optimizedSrc, loading, error }
}

// 이미지 최적화 함수 (실제 구현 필요)
async function optimizeImageUrl(
  src: string, 
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'avif' | 'jpeg' | 'png'
  }
): Promise<string> {
  // 실제 구현에서는 이미지 최적화 서비스 사용
  // 예: Cloudinary, ImageKit, Next.js Image Optimization 등
  return src
}

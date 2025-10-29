// 코드 정리 및 최적화 유틸리티 함수들
import { useMemo, useCallback } from 'react'

// 불필요한 console.log 제거를 위한 개발 환경 체크
export const isDevelopment = process.env.NODE_ENV === 'development'

// 조건부 로깅 함수
export const devLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args)
  }
}

export const devWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn(...args)
  }
}

export const devError = (...args: any[]) => {
  if (isDevelopment) {
    console.error(...args)
  }
}

// 프로덕션 환경에서 로그 제거
export const prodLog = () => {}
export const prodWarn = () => {}
export const prodError = () => {}

// 환경에 따른 로깅 함수
export const log = isDevelopment ? devLog : prodLog
export const warn = isDevelopment ? devWarn : prodWarn
export const error = isDevelopment ? devError : prodError

// 메모리 누수 방지를 위한 정리 함수
export const cleanup = (cleanupFn: () => void) => {
  return () => {
    try {
      cleanupFn()
    } catch (err) {
      error('Cleanup error:', err)
    }
  }
}

// 안전한 객체 접근을 위한 헬퍼 함수
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue
  } catch {
    return defaultValue
  }
}

// 안전한 배열 접근을 위한 헬퍼 함수
export const safeArray = <T>(value: any): T[] => {
  return Array.isArray(value) ? value : []
}

// 안전한 문자열 접근을 위한 헬퍼 함수
export const safeString = (value: any): string => {
  return typeof value === 'string' ? value : ''
}

// 안전한 숫자 접근을 위한 헬퍼 함수
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

// 안전한 불린 접근을 위한 헬퍼 함수
export const safeBoolean = (value: any): boolean => {
  return Boolean(value)
}

// 객체 깊은 복사 함수
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  
  return obj
}

// 객체 깊은 병합 함수
export const deepMerge = <T>(target: T, source: Partial<T>): T => {
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = result[key]
      
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }
  
  return result
}

// 배열 중복 제거 함수
export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

// 배열 그룹화 함수
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

// 배열 정렬 함수
export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

// 배열 필터링 함수
export const filterBy = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
  return array.filter(predicate)
}

// 배열 매핑 함수
export const mapBy = <T, U>(array: T[], mapper: (item: T) => U): U[] => {
  return array.map(mapper)
}

// 배열 리듀스 함수
export const reduceBy = <T, U>(array: T[], reducer: (acc: U, item: T) => U, initial: U): U => {
  return array.reduce(reducer, initial)
}

// 문자열 유틸리티 함수들
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const camelCase = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const kebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

export const snakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// 숫자 유틸리티 함수들
export const formatNumber = (num: number, locale: string = 'ko-KR'): string => {
  return new Intl.NumberFormat(locale).format(num)
}

export const formatCurrency = (num: number, currency: string = 'KRW', locale: string = 'ko-KR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(num)
}

export const formatPercent = (num: number, locale: string = 'ko-KR'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num / 100)
}

// 날짜 유틸리티 함수들
export const formatDate = (date: Date | string, locale: string = 'ko-KR'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale).format(d)
}

export const formatDateTime = (date: Date | string, locale: string = 'ko-KR'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export const formatRelativeTime = (date: Date | string, locale: string = 'ko-KR'): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(months / 12)
  
  if (years > 0) return rtf.format(-years, 'year')
  if (months > 0) return rtf.format(-months, 'month')
  if (days > 0) return rtf.format(-days, 'day')
  if (hours > 0) return rtf.format(-hours, 'hour')
  if (minutes > 0) return rtf.format(-minutes, 'minute')
  return rtf.format(-seconds, 'second')
}

// 성능 측정 함수
export const measurePerformance = <T>(name: string, fn: () => T): T => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  if (isDevelopment) {
    console.log(`${name}: ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}

// 비동기 성능 측정 함수
export const measureAsyncPerformance = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  if (isDevelopment) {
    console.log(`${name}: ${(end - start).toFixed(2)}ms`)
  }
  
  return result
}

// 메모리 사용량 측정 함수
export const measureMemory = (name: string) => {
  if (isDevelopment && 'memory' in performance) {
    const memory = (performance as any).memory
    console.log(`${name} - Memory:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// 쓰로틀 함수
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// 재시도 함수
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// 타임아웃 함수
export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms)
    })
  ])
}

// 조건부 실행 함수
export const when = <T>(condition: boolean, fn: () => T): T | undefined => {
  return condition ? fn() : undefined
}

// 안전한 실행 함수
export const safeExecute = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

// 비동기 안전한 실행 함수
export const safeExecuteAsync = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

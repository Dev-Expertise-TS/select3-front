/**
 * 환경별 로깅 유틸리티
 * 프로덕션에서는 불필요한 로그를 제거하여 성능 최적화
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args)
  }

  error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${message}`, ...args)
  }

  // 성능 관련 로그 (개발 환경에서만)
  perf(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[PERF] ${message}`, ...args)
    }
  }

  // 호텔 카드 관련 디버그 로그 (개발 환경에서만)
  hotelCard(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[HotelCard] ${message}`, data)
    }
  }

  // Analytics 관련 로그 (개발 환경에서만)
  analytics(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[Analytics] ${message}`, data)
    }
  }

  // 안전한 에러 로깅 (객체를 문자열로 변환하여 "[object Object]" 방지)
  safeError(message: string, error: unknown) {
    const errorInfo = {
      message: error instanceof Error 
        ? error.message 
        : (error && typeof error === 'object' && 'message' in error)
          ? String((error as any).message)
          : JSON.stringify(error),
      name: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      // Supabase 에러의 경우 추가 정보 추출
      ...(error && typeof error === 'object' && 'code' in error ? { code: (error as any).code } : {}),
      ...(error && typeof error === 'object' && 'details' in error ? { details: (error as any).details } : {}),
      ...(error && typeof error === 'object' && 'hint' in error ? { hint: (error as any).hint } : {})
    }
    console.error(`[ERROR] ${message}`, errorInfo)
  }
}

/**
 * 에러 객체에서 안전하게 메시지를 추출하는 유틸리티
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  
  if (error && typeof error === 'object') {
    // Supabase 에러 또는 일반 객체 에러
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
    if ('error_description' in error && typeof error.error_description === 'string') {
      return error.error_description
    }
    // 객체 자체를 문자열화 ( [object Object] 방지 )
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }
  
  return String(error)
}

export const logger = new Logger()

// 기존 console.log를 대체하는 함수들
export const debugLog = logger.debug.bind(logger)
export const infoLog = logger.info.bind(logger)
export const warnLog = logger.warn.bind(logger)
export const errorLog = logger.error.bind(logger)
export const perfLog = logger.perf.bind(logger)
export const hotelCardLog = logger.hotelCard.bind(logger)
export const analyticsLog = logger.analytics.bind(logger)
export const safeErrorLog = logger.safeError.bind(logger)
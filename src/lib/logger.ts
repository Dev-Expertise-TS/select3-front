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

// API 관련 타입 정의
export interface ApiConfig {
  baseUrl: string
  timeout: number
  retries: number
  retryDelay: number
  headers: Record<string, string>
}

// API 요청 타입
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status: number
  headers: Record<string, string>
  timestamp: string
}

// API 에러 타입
export interface ApiError {
  code: string
  message: string
  details?: any
  status: number
  timestamp: string
}

// API 클라이언트 타입
export interface ApiClient {
  get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>
  patch<T = any>(url: string, data?: any): Promise<ApiResponse<T>>
  delete<T = any>(url: string): Promise<ApiResponse<T>>
}

// API 훅 반환 타입
export interface UseApiReturn<T = any> {
  data: T | null
  loading: boolean
  error: ApiError | null
  execute: (request?: Partial<ApiRequest>) => Promise<ApiResponse<T>>
  reset: () => void
}

// API 캐시 타입
export interface ApiCache {
  get: (key: string) => any
  set: (key: string, value: any, ttl?: number) => void
  delete: (key: string) => void
  clear: () => void
  has: (key: string) => boolean
}

// API 미들웨어 타입
export interface ApiMiddleware {
  request?: (request: ApiRequest) => ApiRequest | Promise<ApiRequest>
  response?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  error?: (error: ApiError) => ApiError | Promise<ApiError>
}

// API 인터셉터 타입
export interface ApiInterceptor {
  onRequest?: (request: ApiRequest) => void
  onResponse?: (response: ApiResponse) => void
  onError?: (error: ApiError) => void
}

// API 인증 타입
export interface ApiAuth {
  token?: string
  refreshToken?: string
  expiresAt?: number
  type?: 'Bearer' | 'Basic' | 'ApiKey'
}

// API 레이트 리미팅 타입
export interface ApiRateLimit {
  limit: number
  remaining: number
  reset: number
  retryAfter?: number
}

// API 메트릭 타입
export interface ApiMetrics {
  requestCount: number
  successCount: number
  errorCount: number
  averageResponseTime: number
  lastRequestTime: string
  lastErrorTime?: string
}

// API 설정 타입
export interface ApiSettings {
  config: ApiConfig
  auth?: ApiAuth
  cache?: ApiCache
  middlewares?: ApiMiddleware[]
  interceptors?: ApiInterceptor[]
  retryPolicy?: {
    maxRetries: number
    retryDelay: number
    retryCondition: (error: ApiError) => boolean
  }
  timeoutPolicy?: {
    defaultTimeout: number
    perRequestTimeout?: Record<string, number>
  }
}

// API 상태 타입
export interface ApiState {
  loading: boolean
  error: ApiError | null
  lastRequestTime: string | null
  metrics: ApiMetrics
  rateLimit: ApiRateLimit | null
}

// API 액션 타입
export interface ApiAction {
  type: 'REQUEST_START' | 'REQUEST_SUCCESS' | 'REQUEST_ERROR' | 'RESET' | 'CLEAR_CACHE'
  payload?: any
  error?: ApiError
}

// API 컨텍스트 타입
export interface ApiContextType {
  state: ApiState
  dispatch: (action: ApiAction) => void
  client: ApiClient
  settings: ApiSettings
}

// API 훅 옵션 타입
export interface UseApiOptions {
  immediate?: boolean
  cache?: boolean
  cacheKey?: string
  cacheTtl?: number
  retry?: boolean
  retryCount?: number
  retryDelay?: number
  timeout?: number
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  onFinally?: () => void
}

// API 쿼리 옵션 타입
export interface UseApiQueryOptions extends UseApiOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchOnReconnect?: boolean
  refetchInterval?: number
  staleTime?: number
  cacheTime?: number
}

// API 뮤테이션 옵션 타입
export interface UseApiMutationOptions extends UseApiOptions {
  onMutate?: (variables: any) => void
  onSettled?: (data: any, error: ApiError | null) => void
}

// API 쿼리 반환 타입
export interface UseApiQueryReturn<T = any> extends UseApiReturn<T> {
  refetch: () => Promise<ApiResponse<T>>
  isStale: boolean
  isFetching: boolean
  isRefetching: boolean
}

// API 뮤테이션 반환 타입
export interface UseApiMutationReturn<T = any> extends UseApiReturn<T> {
  mutate: (variables?: any) => Promise<ApiResponse<T>>
  mutateAsync: (variables?: any) => Promise<ApiResponse<T>>
  isMutating: boolean
}

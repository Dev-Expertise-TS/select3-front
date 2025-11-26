// 메인 타입 인덱스 파일
// 모든 타입 정의를 한 곳에서 관리하고 재사용 가능하도록 구성

// Hotel 관련 타입들
export * from './hotel'

// 검색 관련 타입들
export * from './search'

// UI 컴포넌트 관련 타입들
export * from './ui'

// API 관련 타입들
export * from './api'

// 호텔 필터 관련 타입들
export * from './hotel-filter'

// 지역 관련 타입들
export * from './region'

// 분석 관련 타입들
export * from './analytics'

// 환경 변수 타입들
export * from './env'

// 공통 유틸리티 타입들
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// 상태 관리 타입들
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface PaginationState {
  page: number
  pageSize: number
  totalCount: number
  hasMore: boolean
}

export interface FilterState {
  filters: Record<string, any>
  appliedFilters: Record<string, any>
  hasActiveFilters: boolean
}

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

// 폼 관련 타입들
export interface FormState<T = any> {
  values: T
  errors: Record<keyof T, string>
  touched: Record<keyof T, boolean>
  isSubmitting: boolean
  isValid: boolean
}

export interface FormFieldProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
}

// 이벤트 핸들러 타입들
export type EventHandler<T = any> = (event: T) => void
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>
export type ChangeHandler<T = any> = (value: T) => void
export type ClickHandler = () => void
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>

// 콜백 함수 타입들
export type Callback<T = any> = (data: T) => void
export type AsyncCallback<T = any> = (data: T) => Promise<void>
export type ErrorCallback = (error: Error) => void
export type SuccessCallback<T = any> = (data: T) => void

// 조건부 타입들
export type NonNullable<T> = T extends null | undefined ? never : T
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// 배열 유틸리티 타입들
export type ArrayElement<T> = T extends (infer U)[] ? U : never
export type First<T> = T extends [infer U, ...any[]] ? U : never
export type Last<T> = T extends [...any[], infer U] ? U : never
export type Head<T> = T extends [infer U, ...any[]] ? U : never
export type Tail<T> = T extends [any, ...infer U] ? U : never

// 객체 유틸리티 타입들
export type Keys<T> = keyof T
export type Values<T> = T[keyof T]
export type Entries<T> = { [K in keyof T]: [K, T[K]] }[keyof T][]
export type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>
export type OmitByValue<T, V> = Omit<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>

// 함수 유틸리티 타입들
export type Parameters<T> = T extends (...args: infer P) => any ? P : never
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
export type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never
export type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never

// 조건부 타입들
export type If<C extends boolean, T, F> = C extends true ? T : F
export type And<A extends boolean, B extends boolean> = A extends true ? B extends true ? true : false : false
export type Or<A extends boolean, B extends boolean> = A extends true ? true : B extends true ? true : false
export type Not<T extends boolean> = T extends true ? false : true

// 문자열 유틸리티 타입들
export type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S
export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Lowercase<F>}${R}` : S
export type CamelCase<S extends string> = S extends `${infer F}_${infer R}` ? `${F}${Capitalize<CamelCase<R>>}` : S
export type SnakeCase<S extends string> = S extends `${infer F}${infer R}` ? `${Lowercase<F>}${SnakeCase<R>}` : S

// 숫자 유틸리티 타입들
// 주의: TypeScript 타입 시스템에서는 수학 연산을 직접 수행할 수 없습니다.
// 이 타입들은 실제로 작동하지 않으므로 사용하지 마세요.
// export type Add<A extends number, B extends number> = A extends number ? B extends number ? A + B : never : never
// export type Subtract<A extends number, B extends number> = A extends number ? B extends number ? A - B : never : never
// export type Multiply<A extends number, B extends number> = A extends number ? B extends number ? A * B : never : never
// export type Divide<A extends number, B extends number> = A extends number ? B extends number ? A / B : never : never

// 타입 가드 타입들
export type TypeGuard<T> = (value: any) => value is T
export type Predicate<T> = (value: T) => boolean
export type Comparator<T> = (a: T, b: T) => number

// 제네릭 타입들
export type Generic<T = any> = T
export type GenericFunction<T = any, R = any> = (arg: T) => R
export type GenericAsyncFunction<T = any, R = any> = (arg: T) => Promise<R>
export type GenericConstructor<T = any> = new (...args: any[]) => T

// 유니온 타입들
export type Union<T, U> = T | U
export type Intersection<T, U> = T & U
export type Difference<T, U> = T extends U ? never : T
export type SymmetricDifference<T, U> = Difference<T, U> | Difference<U, T>

// 재귀 타입들
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P]
}
export type RecursiveRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? RecursiveRequired<T[P]> : T[P]
}
export type RecursiveReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? RecursiveReadonly<T[P]> : T[P]
}
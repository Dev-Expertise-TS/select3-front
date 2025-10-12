'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 서버 데이터 페칭 우선으로 staleTime 증가
            staleTime: 5 * 60 * 1000, // 5분 (서버 revalidate와 조율)
            gcTime: 10 * 60 * 1000, // 10분
            retry: (failureCount, error: any) => {
              // 404 에러는 재시도 안함
              if (error?.response?.status === 404) return false
              // 401/403 에러는 재시도 안함
              if (error?.response?.status === 401 || error?.response?.status === 403) return false
              // 최대 1회 재시도
              return failureCount < 1
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
            refetchOnWindowFocus: false,
            refetchOnReconnect: true, // 네트워크 재연결 시 refetch
            refetchOnMount: false, // 마운트 시 refetch 안함 (서버 데이터 우선)
          },
          mutations: {
            // 기본 뮤테이션 설정
            retry: 0, // mutation은 재시도 안함 (사용자 액션이므로)
            onError: (error) => {
              console.error('Mutation error:', error)
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

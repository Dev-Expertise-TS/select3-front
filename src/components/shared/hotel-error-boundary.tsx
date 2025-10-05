"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface HotelErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface HotelErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
}

export class HotelErrorBoundary extends React.Component<
  HotelErrorBoundaryProps,
  HotelErrorBoundaryState
> {
  constructor(props: HotelErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): HotelErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('호텔 관련 오류 발생:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />
      }

      return (
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4 flex justify-center">
              <AlertTriangle className="h-16 w-16" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              호텔 목록을 불러오는 중 오류가 발생했습니다.
            </h2>
            <p className="text-gray-600 mb-6">
              잠시 후 다시 시도해주세요.
            </p>
            <Button
              onClick={this.handleRetry}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  개발자 정보 (클릭하여 확장)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 기본 오류 폴백 컴포넌트
export function DefaultHotelErrorFallback({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-red-600 text-6xl mb-4 flex justify-center">
          <AlertTriangle className="h-16 w-16" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          호텔 목록을 불러오는 중 오류가 발생했습니다.
        </h2>
        <p className="text-gray-600 mb-6">
          잠시 후 다시 시도해주세요.
        </p>
        <Button
          onClick={retry}
          variant="outline"
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>
      </div>
    </div>
  )
}

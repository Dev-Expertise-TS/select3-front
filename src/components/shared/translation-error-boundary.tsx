"use client"

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * 크롬 번역 충돌로 인한 에러를 잡아내는 Error Boundary
 * removeChild, NotFoundError 등 DOM 조작 에러를 무시하고 정상 렌더링 유지
 */
export class TranslationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // 크롬 번역 관련 에러인지 확인
    const errorMessage = error.message || ''
    const errorStack = error.stack || ''
    
    const isTranslationError = 
      errorMessage.includes('removeChild') ||
      errorMessage.includes('NotFoundError') ||
      errorMessage.includes('Node') ||
      errorStack.includes('removeChild')
    
    if (isTranslationError) {
      console.warn('🌐 크롬 번역 에러 감지됨 (Error Boundary에서 catch):', errorMessage)
      // 번역 에러는 무시하고 정상 렌더링 계속
      return { hasError: false, error: null }
    }
    
    // 다른 에러는 정상적으로 처리
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorMessage = error.message || ''
    
    // 크롬 번역 에러는 로그만 남기고 무시
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('NotFoundError') ||
      errorMessage.includes('Node')
    ) {
      console.warn('🌐 번역 에러 무시:', {
        error: errorMessage,
        componentStack: errorInfo.componentStack
      })
      // state를 리셋해서 계속 렌더링
      this.setState({ hasError: false, error: null })
      return
    }
    
    console.error('❌ Error Boundary에서 에러 감지:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">일시적인 오류가 발생했습니다.</p>
        </div>
      )
    }

    return this.props.children
  }
}


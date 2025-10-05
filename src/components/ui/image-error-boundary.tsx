/**
 * 이미지 에러 처리 컴포넌트
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ImageErrorBoundaryProps {
  src: string;
  alt: string;
  fallbackComponent?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

interface ImageErrorBoundaryState {
  hasError: boolean;
  errorSrc?: string;
}

export class ImageErrorBoundary extends React.Component<
  ImageErrorBoundaryProps,
  ImageErrorBoundaryState
> {
  constructor(props: ImageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ImageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('이미지 에러 발생:', {
      src: this.props.src,
      alt: this.props.alt,
      error: error.message,
      errorInfo
    });
  }

  componentDidUpdate(prevProps: ImageErrorBoundaryProps) {
    // src가 변경되면 에러 상태 리셋
    if (prevProps.src !== this.props.src && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallbackComponent || (
          <div
            className={cn(
              "bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg",
              this.props.className
            )}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <div className="text-sm">이미지를 불러올 수 없습니다</div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * 이미지 로딩 상태를 표시하는 컴포넌트
 */
interface ImageLoadingStateProps {
  isLoading: boolean;
  hasError: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ImageLoadingState({ 
  isLoading, 
  hasError, 
  children, 
  className 
}: ImageLoadingStateProps) {
  if (hasError) {
    return (
      <div className={cn(
        "bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg",
        className
      )}>
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-sm">이미지 로딩 실패</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn(
        "bg-gray-200 animate-pulse flex items-center justify-center rounded-lg",
        className
      )}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="text-gray-500 text-sm">로딩 중...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * 이미지 에러 발생 시 재시도 버튼이 있는 컴포넌트
 */
interface RetryableImageProps {
  src: string;
  alt: string;
  onRetry: () => void;
  className?: string;
  children: React.ReactNode;
}

export function RetryableImage({ 
  src, 
  alt, 
  onRetry, 
  className, 
  children 
}: RetryableImageProps) {
  const [retryCount, setRetryCount] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setHasError(false);
    onRetry();
  };

  if (hasError) {
    return (
      <div className={cn(
        "bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-lg p-4",
        className
      )}>
        <div className="text-center mb-3">
          <div className="text-3xl mb-2">🖼️</div>
          <div className="text-sm mb-2">이미지를 불러올 수 없습니다</div>
          <div className="text-xs text-gray-500">
            {retryCount > 0 && `재시도 ${retryCount}회`}
          </div>
        </div>
        <button
          onClick={handleRetry}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          disabled={retryCount >= 3}
        >
          {retryCount >= 3 ? '재시도 불가' : '다시 시도'}
        </button>
      </div>
    );
  }

  return (
    <ImageErrorBoundary
      src={src}
      alt={alt}
      className={className}
      fallbackComponent={
        <div className={cn(
          "bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-lg p-4",
          className
        )}>
          <div className="text-center mb-3">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-sm mb-2">이미지를 불러올 수 없습니다</div>
            <div className="text-xs text-gray-500">
              {retryCount > 0 && `재시도 ${retryCount}회`}
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            disabled={retryCount >= 3}
          >
            {retryCount >= 3 ? '재시도 불가' : '다시 시도'}
          </button>
        </div>
      }
    >
      {children}
    </ImageErrorBoundary>
  );
}

/**
 * 이미지 로딩 상태 관리 훅
 */

import { useState, useCallback, useRef } from 'react';
import { checkImageExists } from '@/lib/image-cache';
import { ImageLoadingState } from '@/lib/image-utils';

interface UseImageLoadingOptions {
  preloadOnMount?: boolean;
  checkExistence?: boolean;
  onLoad?: (src: string) => void;
  onError?: (src: string, error: Error) => void;
}

interface UseImageLoadingReturn {
  loadingStates: Map<string, ImageLoadingState>;
  preloadedImages: Set<string>;
  preloadImage: (src: string) => Promise<void>;
  isImageLoading: (src: string) => boolean;
  isImageLoaded: (src: string) => boolean;
  isImageError: (src: string) => boolean;
  clearCache: () => void;
}

export function useImageLoading(options: UseImageLoadingOptions = {}): UseImageLoadingReturn {
  const {
    preloadOnMount = false,
    checkExistence = true,
    onLoad,
    onError
  } = options;

  const [loadingStates, setLoadingStates] = useState<Map<string, ImageLoadingState>>(new Map());
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // 이미지 로딩 상태 업데이트
  const updateLoadingState = useCallback((src: string, state: ImageLoadingState) => {
    setLoadingStates(prev => {
      const newStates = new Map(prev);
      newStates.set(src, state);
      return newStates;
    });
  }, []);

  // 이미지 preload 함수
  const preloadImage = useCallback(async (src: string): Promise<void> => {
    // URL 디코딩 처리
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;

    // 이미 preload된 이미지인지 확인
    if (preloadedImages.has(decodedSrc)) {
      return;
    }

    // 기존 요청 취소
    const existingController = abortControllersRef.current.get(decodedSrc);
    if (existingController) {
      existingController.abort();
    }

    // 새로운 AbortController 생성
    const abortController = new AbortController();
    abortControllersRef.current.set(decodedSrc, abortController);

    try {
      // 로딩 상태 설정
      updateLoadingState(decodedSrc, 'loading');

      // 이미지 존재 여부 확인 (옵션)
      if (checkExistence) {
        const exists = await checkImageExists(decodedSrc);
        if (!exists) {
          updateLoadingState(decodedSrc, 'error');
          onError?.(decodedSrc, new Error('Image does not exist'));
          return;
        }
      }

      // 이미지 preload
      const img = new window.Image();
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (!abortController.signal.aborted) {
            updateLoadingState(decodedSrc, 'loaded');
            setPreloadedImages(prev => new Set([...prev, decodedSrc]));
            onLoad?.(decodedSrc);
            resolve();
          }
        };

        img.onerror = (error) => {
          if (!abortController.signal.aborted) {
            updateLoadingState(decodedSrc, 'error');
            onError?.(decodedSrc, error as Error);
            reject(error);
          }
        };

        // 타임아웃 설정
        const timeout = setTimeout(() => {
          if (!abortController.signal.aborted) {
            abortController.abort();
            reject(new Error('Image load timeout'));
          }
        }, 10000); // 10초 타임아웃

        img.onload = () => {
          clearTimeout(timeout);
          if (!abortController.signal.aborted) {
            updateLoadingState(decodedSrc, 'loaded');
            setPreloadedImages(prev => new Set([...prev, decodedSrc]));
            onLoad?.(decodedSrc);
            resolve();
          }
        };

        img.onerror = (error) => {
          clearTimeout(timeout);
          if (!abortController.signal.aborted) {
            updateLoadingState(decodedSrc, 'error');
            onError?.(decodedSrc, error as Error);
            reject(error);
          }
        };

        img.src = decodedSrc;
      });

      await loadPromise;

    } catch (error) {
      if (!abortController.signal.aborted) {
        updateLoadingState(decodedSrc, 'error');
        onError?.(decodedSrc, error as Error);
      }
    } finally {
      // AbortController 정리
      abortControllersRef.current.delete(decodedSrc);
    }
  }, [preloadedImages, checkExistence, updateLoadingState, onLoad, onError]);

  // 상태 확인 함수들
  const isImageLoading = useCallback((src: string) => {
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    return loadingStates.get(decodedSrc) === 'loading';
  }, [loadingStates]);

  const isImageLoaded = useCallback((src: string) => {
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    return loadingStates.get(decodedSrc) === 'loaded';
  }, [loadingStates]);

  const isImageError = useCallback((src: string) => {
    const decodedSrc = src.includes('supabase.co/storage/v1/object/public/') 
      ? decodeURIComponent(src) 
      : src;
    return loadingStates.get(decodedSrc) === 'error';
  }, [loadingStates]);

  // 캐시 클리어
  const clearCache = useCallback(() => {
    setLoadingStates(new Map());
    setPreloadedImages(new Set());
    
    // 진행 중인 요청들 취소
    abortControllersRef.current.forEach(controller => controller.abort());
    abortControllersRef.current.clear();
  }, []);

  return {
    loadingStates,
    preloadedImages,
    preloadImage,
    isImageLoading,
    isImageLoaded,
    isImageError,
    clearCache
  };
}

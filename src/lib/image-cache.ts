/**
 * 이미지 존재 여부 캐싱 유틸리티
 */

interface ImageCacheEntry {
  exists: boolean;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ImageCache {
  private cache = new Map<string, ImageCacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5분

  /**
   * 이미지 존재 여부를 캐시에서 조회
   */
  get(imageUrl: string): boolean | null {
    const entry = this.cache.get(imageUrl);
    
    if (!entry) {
      return null; // 캐시에 없음
    }

    // TTL 확인
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(imageUrl);
      return null; // 만료됨
    }

    return entry.exists;
  }

  /**
   * 이미지 존재 여부를 캐시에 저장
   */
  set(imageUrl: string, exists: boolean, ttl?: number): void {
    this.cache.set(imageUrl, {
      exists,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    });
  }

  /**
   * 특정 URL의 캐시를 삭제
   */
  delete(imageUrl: string): void {
    this.cache.delete(imageUrl);
  }

  /**
   * 만료된 캐시 항목들을 정리
   */
  cleanup(): void {
    const now = Date.now();
    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(url);
      }
    }
  }

  /**
   * 전체 캐시를 비움
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 캐시 상태 정보 반환
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([url, entry]) => ({
        url: url.substring(url.lastIndexOf('/') + 1), // 파일명만 표시
        exists: entry.exists,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl
      }))
    };
  }
}

// 싱글톤 인스턴스
export const imageCache = new ImageCache();

/**
 * 이미지 존재 여부를 확인하고 캐싱하는 함수
 */
export async function checkImageExists(imageUrl: string): Promise<boolean> {
  // 캐시에서 먼저 확인
  const cached = imageCache.get(imageUrl);
  if (cached !== null) {
    console.log(`📋 이미지 캐시 히트: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)} (${cached ? '존재' : '없음'})`);
    return cached;
  }

  try {
    console.log(`🔍 이미지 존재 확인 중: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`);
    
    // 호환 가능한 타임아웃 신호 생성 (Safari 등 AbortSignal.timeout 미지원 대비)
    const createTimeoutSignal = (ms: number): { signal?: AbortSignal; cancel?: () => void } => {
      try {
        // 표준 지원 시 활용
        // @ts-expect-error - 런타임 환경에 따라 존재하지 않을 수 있음
        if (typeof AbortSignal !== 'undefined' && typeof (AbortSignal as any).timeout === 'function') {
          // @ts-expect-error
          const sig = (AbortSignal as any).timeout(ms) as AbortSignal
          return { signal: sig, cancel: undefined }
        }
      } catch {}
      // 폴리필: AbortController + setTimeout
      if (typeof AbortController !== 'undefined') {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), ms)
        return { signal: controller.signal, cancel: () => clearTimeout(timer) }
      }
      return { signal: undefined, cancel: undefined }
    }

    const { signal, cancel } = createTimeoutSignal(5000)

    // HEAD 요청으로 이미지 존재 여부 확인
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      // 일부 환경에서 signal 미지원일 수 있어 옵션 병합은 조건부로
      ...(signal ? { signal } : {})
    });
    cancel?.()
    
    const exists = response.ok;
    
    // 캐시에 저장 (삭제/변경 반영을 빠르게 하기 위해 TTL 단축)
    const ttl = exists ? 2 * 60 * 1000 : 30 * 1000; // 존재: 2분, 없음: 30초
    imageCache.set(imageUrl, exists, ttl);
    
    console.log(`✅ 이미지 확인 완료: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)} (${exists ? '존재' : '없음'})`);
    return exists;
    
  } catch (error) {
    console.warn(`⚠️ 이미지 확인 실패: ${imageUrl.substring(imageUrl.lastIndexOf('/') + 1)}`, error);
    
    // 에러 시에도 캐시에 저장 (짧은 TTL로)
    imageCache.set(imageUrl, false, 30 * 1000); // 30초
    
    return false;
  }
}

/**
 * 여러 이미지의 존재 여부를 병렬로 확인
 */
export async function checkMultipleImages(imageUrls: string[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  
  // 병렬로 확인 (최대 5개씩)
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const batchPromises = batch.map(async (url) => {
      const exists = await checkImageExists(url);
      return { url, exists };
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(({ url, exists }) => {
      results.set(url, exists);
    });
  }
  
  return results;
}

// 주기적으로 캐시 정리 (5분마다)
setInterval(() => {
  imageCache.cleanup();
}, 5 * 60 * 1000);

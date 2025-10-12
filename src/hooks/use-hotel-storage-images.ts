import { useState, useEffect } from 'react';

interface HotelStorageImage {
  id: string;
  filename: string;
  sequence: number;
  media_path: string; // API 응답에서 제공되는 필드
  url: string; // 호환성을 위해 유지
  alt: string;
  isMain: boolean;
  size: number;
  lastModified: string;
}

interface HotelStorageImagesData {
  hotel: {
    sabre_id: number;
    slug: string;
    property_name_ko: string;
    property_name_en?: string;
  };
  images: HotelStorageImage[];
  totalCount: number;
}

interface UseHotelStorageImagesReturn {
  data: HotelStorageImagesData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * 호텔의 Supabase Storage 이미지 목록을 조회하는 훅
 */
export function useHotelStorageImages(sabreId: number | undefined): UseHotelStorageImagesReturn {
  const [data, setData] = useState<HotelStorageImagesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchImages = async () => {
    if (!sabreId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 useHotelStorageImages: API 호출 시작 (Sabre ID: ${sabreId})`);
      
      const response = await fetch(`/api/hotels/${sabreId}/storage-images`);
      const result = await response.json();

      console.log(`📊 useHotelStorageImages: API 응답 (Sabre ID: ${sabreId})`, {
        status: response.status,
        ok: response.ok,
        success: result.success,
        imagesCount: result.data?.images?.length || 0,
        error: result.error,
        details: result.details
      });

      if (!response.ok) {
        // 404나 다른 오류는 조용히 처리 (fallback 이미지가 있으므로)
        console.warn(`⚠️ useHotelStorageImages: Storage 이미지 없음 (Sabre ID: ${sabreId})`, {
          error: result.error,
          details: result.details
        });
        setData(null);
        return;
      }

      if (result.success) {
        console.log(`✅ useHotelStorageImages: 데이터 설정 완료 (Sabre ID: ${sabreId})`, {
          imagesCount: result.data?.images?.length || 0
        });
        setData(result.data);
      } else {
        // 실패해도 에러를 throw하지 않고 null 설정 (fallback 사용)
        console.warn(`⚠️ useHotelStorageImages: API 실패 (Sabre ID: ${sabreId})`, result.error);
        setData(null);
      }
    } catch (err) {
      // 네트워크 오류 등은 조용히 처리
      console.warn(`⚠️ useHotelStorageImages: 네트워크 오류 (Sabre ID: ${sabreId})`, err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [sabreId]);

  return {
    data,
    loading,
    error,
    refetch: fetchImages
  };
}

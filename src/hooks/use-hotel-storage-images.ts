import { useState, useEffect } from 'react';

interface HotelStorageImage {
  id: string;
  filename: string;
  sequence: number;
  url: string;
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
      const response = await fetch(`/api/hotels/${sabreId}/storage-images`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || '이미지 목록을 불러올 수 없습니다');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('알 수 없는 오류');
      setError(error);
      console.error('호텔 스토리지 이미지 조회 오류:', error);
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

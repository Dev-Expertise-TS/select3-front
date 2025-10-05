'use client';

import { useState, useEffect } from 'react';

export default function TestMandarinImagesPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/hotels/188152/storage-images');
        const data = await response.json();
        
        console.log('API 응답:', data);
        
        if (data.success) {
          setImages(data.data.images);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mandarin Oriental Taipei 이미지 테스트</h1>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">이미지를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-red-600">오류 발생</h1>
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mandarin Oriental Taipei 이미지 테스트</h1>
      
      <div className="mb-6">
        <p className="text-lg text-gray-600">
          총 {images.length}개의 이미지를 찾았습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="bg-white p-4 rounded-lg shadow-md border">
            <img
              src={image.url}
              alt={image.alt}
              className="w-full h-32 object-cover rounded mb-2"
              onError={(e) => {
                console.error('이미지 로드 실패:', image.url);
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="text-sm">
              <p className="font-medium">시퀀스: {image.sequence}</p>
              <p className="text-gray-600 truncate">{image.filename}</p>
              <p className="text-xs text-gray-500">ID: {image.id}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">디버깅 정보</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
          {JSON.stringify(images, null, 2)}
        </pre>
      </div>
    </div>
  );
}

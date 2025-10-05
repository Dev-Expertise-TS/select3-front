'use client';

import { useState } from 'react';

interface ImageExistsCheckerProps {
  url: string;
}

export default function ImageExistsChecker({ url }: ImageExistsCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<{
    exists: boolean;
    status: number;
    statusText: string;
    contentType?: string;
    sizeKB?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkImageExists = async () => {
    setIsChecking(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/debug/check-image-exists?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={checkImageExists}
        disabled={isChecking}
        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isChecking ? '확인 중...' : '이미지 존재 확인'}
      </button>

      {result && (
        <div className={`text-xs p-2 rounded ${
          result.exists 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className="font-medium">
            {result.exists ? '✅ 이미지 존재함' : '❌ 이미지 없음'}
          </div>
          <div>상태: {result.status} {result.statusText}</div>
          {result.contentType && <div>타입: {result.contentType}</div>}
          {result.sizeKB && <div>크기: {result.sizeKB} KB</div>}
        </div>
      )}

      {error && (
        <div className="text-xs bg-red-100 text-red-800 p-2 rounded">
          ❌ 오류: {error}
        </div>
      )}
    </div>
  );
}

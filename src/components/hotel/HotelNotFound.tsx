'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft } from 'lucide-react';

interface HotelNotFoundProps {
  slug?: string;
}

export function HotelNotFound({ slug }: HotelNotFoundProps) {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          호텔을 찾을 수 없습니다
        </h1>

        {/* 설명 */}
        <div className="text-gray-600 mb-8 space-y-2">
          <p>
            요청하신 호텔 정보를 찾을 수 없습니다.
          </p>
          {slug && (
            <p className="text-sm text-gray-500">
              호텔 슬러그: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{slug}</code>
            </p>
          )}
          <p>
            호텔명이 변경되었거나 일시적으로 이용할 수 없을 수 있습니다.
          </p>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-4">
          {/* 홈으로 돌아가기 */}
          <Link href="/">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>

          {/* 이전 페이지로 돌아가기 */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleGoBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지로 돌아가기
          </Button>

          {/* 호텔 검색 */}
          <Link href="/search">
            <Button variant="outline" className="w-full">
              <Search className="w-4 h-4 mr-2" />
              호텔 검색하기
            </Button>
          </Link>
        </div>

        {/* 추가 도움말 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            도움이 필요하신가요?
          </h3>
          <p className="text-sm text-blue-700">
            정확한 호텔명으로 다시 검색해보시거나, 
            고객센터로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

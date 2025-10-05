'use client';

import HeroImage from '@/components/HeroImage';
import HotelCardImage from '@/components/HotelCardImage';

export default function TestHeroImagePage() {
  const testImages = [
    {
      src: 'select-media/hotels/mandarin-oriental-taipei/Q2PyIQlanLqkcb3deRIMshhM.avif',
      alt: 'Mandarin Oriental Taipei - Luxury Hotel'
    },
    {
      src: 'select-media/hotels/hyatt-regency-seoul/hyatt-regency-seoul-main.avif',
      alt: 'Hyatt Regency Seoul - Business Hotel'
    },
    {
      src: 'select-media/hotels/park-hyatt-seoul/park-hyatt-seoul-suite.avif',
      alt: 'Park Hyatt Seoul - Premium Suite'
    },
    {
      src: 'select-media/hotels/ritz-carlton-seoul/ritz-carlton-seoul-lobby.avif',
      alt: 'Ritz Carlton Seoul - Grand Lobby'
    },
    {
      src: 'select-media/hotels/four-seasons-seoul/four-seasons-seoul-room.avif',
      alt: 'Four Seasons Seoul - Deluxe Room'
    }
  ];

  const cardTestImages = [
    {
      src: 'select-media/hotels/mandarin-oriental-taipei/Q2PyIQlanLqkcb3deRIMshhM.avif',
      alt: 'Mandarin Oriental Taipei',
      w: 640,
      h: 360
    },
    {
      src: 'select-media/hotels/hyatt-regency-seoul/hyatt-regency-seoul-main.avif',
      alt: 'Hyatt Regency Seoul',
      w: 800,
      h: 450
    },
    {
      src: 'select-media/hotels/park-hyatt-seoul/park-hyatt-seoul-suite.avif',
      alt: 'Park Hyatt Seoul',
      w: 400,
      h: 300
    },
    {
      src: 'select-media/hotels/ritz-carlton-seoul/ritz-carlton-seoul-lobby.avif',
      alt: 'Ritz Carlton Seoul',
      w: 600,
      h: 400
    },
    {
      src: 'select-media/hotels/four-seasons-seoul/four-seasons-seoul-room.avif',
      alt: 'Four Seasons Seoul',
      w: 500,
      h: 350
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">이미지 컴포넌트 테스트</h1>
          <p className="text-gray-600">
            HeroImage와 HotelCardImage 컴포넌트의 Supabase Storage 이미지 로딩 및 최적화 테스트 페이지입니다.
          </p>
        </div>

        <div className="space-y-16">
          {/* HeroImage 테스트 섹션 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">HeroImage 컴포넌트 테스트</h2>
            <div className="space-y-12">
              {testImages.map((image, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Hero 테스트 이미지 {index + 1}
                    </h3>
                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                      {image.src}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <HeroImage 
                      src={image.src} 
                      alt={image.alt}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Alt:</strong> {image.alt}</p>
                    <p><strong>Src:</strong> {image.src}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HotelCardImage 테스트 섹션 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">HotelCardImage 컴포넌트 테스트</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cardTestImages.map((image, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      카드 테스트 {index + 1}
                    </h3>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {image.w}×{image.h}
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                    <HotelCardImage 
                      src={image.src} 
                      alt={image.alt}
                      w={image.w}
                      h={image.h}
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Alt:</strong> {image.alt}</p>
                    <p><strong>Src:</strong> {image.src}</p>
                    <p><strong>Size:</strong> {image.w}×{image.h}px</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">테스트 항목</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">HeroImage</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Priority 로딩 (LCP 최적화)</li>
                <li>• 고정 높이 (48svh, min 360px)</li>
                <li>• Blur placeholder 표시</li>
                <li>• Object-cover 잘림 처리</li>
                <li>• 화면폭 전체 크기 (100vw)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">HotelCardImage</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Lazy 로딩 (성능 최적화)</li>
                <li>• 다양한 크기 테스트</li>
                <li>• Responsive 이미지 크기 조정</li>
                <li>• Blur placeholder 표시</li>
                <li>• Supabase Storage URL 처리</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">주의사항</h4>
          <p className="text-sm text-yellow-700">
            이 페이지는 개발/테스트 목적으로만 사용됩니다. 
            실제 이미지 경로가 존재하지 않을 수 있으므로 404 오류가 발생할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}

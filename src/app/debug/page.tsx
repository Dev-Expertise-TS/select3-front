import Link from 'next/link';

// 디버그 페이지는 동적으로 렌더링
export const dynamic = 'force-dynamic'

export default function DebugPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔧 시스템 디버그 대시보드</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 환경 변수 검증 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">🌍 환경 변수</h2>
          <p className="text-gray-600 mb-4">환경 변수 설정 상태를 확인합니다.</p>
          <Link 
            href="/api/debug/env" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            target="_blank"
          >
            환경 변수 확인
          </Link>
        </div>

        {/* OpenAI API 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-green-600">🤖 OpenAI API</h2>
          <p className="text-gray-600 mb-4">OpenAI API 키 유효성을 테스트합니다.</p>
          <Link 
            href="/api/test-openai" 
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            target="_blank"
          >
            API 키 테스트
          </Link>
        </div>

        {/* Sabre API 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">✈️ Sabre API</h2>
          <p className="text-gray-600 mb-4">Sabre API 연결 및 엔드포인트를 테스트합니다.</p>
          <div className="space-y-2">
            <Link 
              href="/api/debug/sabre" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors mr-2"
              target="_blank"
            >
              Sabre API 테스트
            </Link>
            <Link 
              href="/api/debug/sabre-status" 
              className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              target="_blank"
            >
              Sabre API 상태 확인
            </Link>
          </div>
        </div>

        {/* 이미지 최적화 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-orange-600">🖼️ 이미지 최적화</h2>
          <p className="text-gray-600 mb-4">Supabase Storage 이미지 최적화를 테스트합니다.</p>
          <div className="space-y-2">
            <Link 
              href="/test-images" 
              className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors mr-2"
            >
              이미지 테스트
            </Link>
            <Link 
              href="/test-supabase-images" 
              className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors mr-2"
            >
              Supabase 이미지 테스트
            </Link>
            <Link 
              href="/test-url-generation" 
              className="inline-block bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500 transition-colors"
            >
              URL 생성 테스트
            </Link>
          </div>
        </div>

        {/* 호텔 상세 페이지 테스트 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-red-600">🏨 호텔 페이지</h2>
          <p className="text-gray-600 mb-4">호텔 상세 페이지의 이미지 로딩을 테스트합니다.</p>
          <div className="space-y-2">
            <Link 
              href="/hotel/mandarin-oriental-taipei" 
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors mr-2"
            >
              호텔 페이지 테스트
            </Link>
            <Link 
              href="/debug-hotel-images/mandarin-oriental-taipei" 
              className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mr-2"
            >
              호텔 이미지 디버깅
            </Link>
            <Link 
              href="/test-hotel-cards" 
              className="inline-block bg-red-400 text-white px-4 py-2 rounded hover:bg-red-500 transition-colors mr-2"
            >
              호텔 카드 이미지 테스트
            </Link>
            <Link 
              href="/test-hotel-storage-images" 
              className="inline-block bg-red-300 text-white px-4 py-2 rounded hover:bg-red-400 transition-colors mr-2"
            >
              호텔 Storage 이미지 테스트
            </Link>
            <Link 
              href="/test-hotel-not-found" 
              className="inline-block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors mr-2"
            >
              호텔 없음 페이지 테스트
            </Link>
            <Link 
              href="/test-mandarin-images" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mr-2"
            >
              Mandarin 이미지 테스트
            </Link>
            <Link 
              href="/test-apostrophe" 
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors mr-2"
            >
              어퍼스트로피 테스트
            </Link>
            <Link 
              href="/test-image-exists" 
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors mr-2"
            >
              이미지 존재 확인
            </Link>
            <Link 
              href="/debug-grand-hyatt-images" 
              className="inline-block bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors mr-2"
            >
              Grand Hyatt Taipei 디버깅
            </Link>
            <Link 
              href="/debug-gallery-images" 
              className="inline-block bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 transition-colors mr-2"
            >
              갤러리 이미지 디버깅
            </Link>
            <Link 
              href="/test-storage-api" 
              className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
              Storage API 테스트
            </Link>
          </div>
        </div>

        {/* 성능 모니터링 */}
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold mb-4 text-indigo-600">📊 성능 모니터링</h2>
          <p className="text-gray-600 mb-4">Web Vitals 및 성능 지표를 확인합니다.</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">• 브라우저 개발자 도구 → Lighthouse</p>
            <p className="text-sm text-gray-500">• Network 탭에서 이미지 로딩 확인</p>
            <p className="text-sm text-gray-500">• Console에서 에러 로그 확인</p>
          </div>
        </div>
      </div>

      {/* 문제 해결 가이드 */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">🚨 문제 해결 가이드</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-red-600">OpenAI API 401 에러</h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• API 키가 만료되었거나 잘못된 형식입니다</li>
              <li>• OpenAI 계정에서 새로운 API 키를 발급받으세요</li>
              <li>• API 키는 'sk-'로 시작해야 합니다</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-red-600">Sabre API 404 에러</h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• API 엔드포인트 URL이 변경되었을 수 있습니다</li>
              <li>• Sabre API 문서를 확인하여 올바른 엔드포인트를 사용하세요</li>
              <li>• API 버전이 올바른지 확인하세요</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-red-600">이미지 로딩 문제</h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Supabase Storage 버킷이 올바르게 설정되었는지 확인</li>
              <li>• 이미지 파일 경로가 정확한지 확인</li>
              <li>• 브라우저 네트워크 탭에서 404 에러 확인</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

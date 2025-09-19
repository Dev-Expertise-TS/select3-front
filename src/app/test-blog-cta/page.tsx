import { BlogContentRenderer } from "@/components/shared/blog-content-renderer"

// 테스트용 블로그 데이터 (sabre_id 포함)
const testBlogData = {
  slug: "test-blog-with-hotel-cta",
  main_title: "테스트 블로그 - 호텔 카드 CTA 포함",
  main_image: "/placeholder.svg",
  sub_title: "블로그 본문 중간에 호텔 카드가 동적으로 렌더링되는지 테스트합니다.",
  s1_contents: "<h2>첫 번째 섹션</h2><p>이 섹션 다음에 호텔 카드가 나타납니다.</p>",
  s2_contents: "<h2>두 번째 섹션</h2><p>이 섹션에는 호텔 카드가 없습니다.</p>",
  s3_contents: "<h2>세 번째 섹션</h2><p>이 섹션 다음에도 호텔 카드가 나타납니다.</p>",
  s4_contents: "<h2>네 번째 섹션</h2><p>마지막 섹션입니다.</p>",
  s5_contents: null,
  s6_contents: null,
  s7_contents: null,
  s8_contents: null,
  s9_contents: null,
  s10_contents: null,
  s11_contents: null,
  s12_contents: null,
  created_at: "2024-01-01T00:00:00Z",
  // 호텔 sabre_id 필드들 (실제 데이터베이스의 sabre_id 사용)
  s1_sabre_id: 306431, // 첫 번째 섹션 다음에 호텔 카드 표시 (더 프린스 갤러리 도쿄 기오이초)
  s2_sabre_id: null, // 두 번째 섹션에는 호텔 카드 없음
  s3_sabre_id: 1644, // 세 번째 섹션 다음에 호텔 카드 표시 (더 랭함, 홍콩)
  s4_sabre_id: null, // 네 번째 섹션에는 호텔 카드 없음
  s5_sabre_id: null,
  s6_sabre_id: null,
  s7_sabre_id: null,
  s8_sabre_id: null,
  s9_sabre_id: null,
  s10_sabre_id: null,
  s11_sabre_id: null,
  s12_sabre_id: null
}

export default function TestBlogCtaPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            블로그 호텔 카드 CTA 테스트
          </h1>
          <p className="text-gray-600 mb-4">
            블로그 본문 중간에 호텔 카드가 동적으로 렌더링되는지 테스트합니다.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">테스트 시나리오:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 첫 번째 섹션 다음에 호텔 카드 표시 (sabre_id: 306431 - 더 프린스 갤러리 도쿄 기오이초)</li>
              <li>• 두 번째 섹션에는 호텔 카드 없음 (sabre_id: null)</li>
              <li>• 세 번째 섹션 다음에 호텔 카드 표시 (sabre_id: 1644 - 더 랭함, 홍콩)</li>
              <li>• 네 번째 섹션에는 호텔 카드 없음 (sabre_id: null)</li>
            </ul>
          </div>
        </div>

        <BlogContentRenderer 
          blog={testBlogData}
          showHeader={true}
          showImage={true}
          showDate={true}
          className="mb-8"
          imageClassName="mb-12"
          contentClassName="prose prose-lg max-w-none"
        />
      </div>
    </div>
  )
}

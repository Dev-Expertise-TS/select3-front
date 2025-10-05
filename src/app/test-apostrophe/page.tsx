'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TestApostrophePage() {
  const [testSlug, setTestSlug] = useState('hôtel-de-la-coupole-mgallery')
  const [encodedSlug, setEncodedSlug] = useState('')
  const [decodedSlug, setDecodedSlug] = useState('')

  const handleEncode = () => {
    const encoded = encodeURIComponent(testSlug)
    setEncodedSlug(encoded)
    console.log('🔤 인코딩 결과:', {
      original: testSlug,
      encoded: encoded
    })
  }

  const handleDecode = () => {
    const decoded = decodeURIComponent(encodedSlug || testSlug)
    setDecodedSlug(decoded)
    console.log('🔓 디코딩 결과:', {
      original: encodedSlug || testSlug,
      decoded: decoded
    })
  }

  const testUrls = [
    'hôtel-de-la-coupole-mgallery',
    'hôtel-de-la-coupole-mgallery',
    'hotel-with-apostrophe\'s',
    'hotel-with-dash-and-apostrophe\'s'
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">어퍼스트로피 URL 처리 테스트</h1>
        
        {/* 수동 테스트 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>수동 테스트</CardTitle>
            <CardDescription>
              어퍼스트로피가 포함된 호텔 slug의 인코딩/디코딩을 테스트합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">테스트할 Slug:</label>
              <Input
                value={testSlug}
                onChange={(e) => setTestSlug(e.target.value)}
                placeholder="hôtel-de-la-coupole-mgallery"
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleEncode}>인코딩</Button>
              <Button onClick={handleDecode} variant="outline">디코딩</Button>
            </div>
            
            {encodedSlug && (
              <div>
                <label className="block text-sm font-medium mb-2">인코딩 결과:</label>
                <div className="p-3 bg-gray-100 rounded font-mono text-sm">
                  {encodedSlug}
                </div>
              </div>
            )}
            
            {decodedSlug && (
              <div>
                <label className="block text-sm font-medium mb-2">디코딩 결과:</label>
                <div className="p-3 bg-gray-100 rounded font-mono text-sm">
                  {decodedSlug}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 자동 테스트 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>자동 테스트</CardTitle>
            <CardDescription>
              다양한 어퍼스트로피 패턴을 자동으로 테스트합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testUrls.map((url, index) => {
                const encoded = encodeURIComponent(url)
                const decoded = decodeURIComponent(encoded)
                const isCorrect = url === decoded
                
                return (
                  <div key={index} className="p-4 border rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {isCorrect ? "정상" : "오류"}
                      </Badge>
                      <span className="text-sm font-medium">테스트 {index + 1}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-1">원본:</div>
                        <div className="p-2 bg-gray-50 rounded font-mono break-all">
                          {url}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">인코딩:</div>
                        <div className="p-2 bg-blue-50 rounded font-mono break-all">
                          {encoded}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-1">디코딩:</div>
                        <div className="p-2 bg-green-50 rounded font-mono break-all">
                          {decoded}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* 실제 호텔 페이지 테스트 */}
        <Card>
          <CardHeader>
            <CardTitle>실제 호텔 페이지 테스트</CardTitle>
            <CardDescription>
              어퍼스트로피가 포함된 호텔 페이지로 이동하여 정상 작동하는지 확인합니다. 이미지 로딩도 함께 테스트됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-medium mb-2">원본 URL (브라우저에서 자동 인코딩됨):</div>
                  <div className="p-3 bg-gray-100 rounded text-sm">
                    <a 
                      href={`/hotel/${testSlug}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /hotel/{testSlug}
                    </a>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium mb-2">수동 인코딩된 URL:</div>
                  <div className="p-3 bg-gray-100 rounded text-sm">
                    <a 
                      href={`/hotel/${encodeURIComponent(testSlug)}`}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /hotel/{encodeURIComponent(testSlug)}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-medium text-yellow-800 mb-2">테스트 방법:</div>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. 위 링크들을 클릭하여 호텔 페이지로 이동</li>
                  <li>2. 브라우저 개발자 도구의 콘솔에서 디코딩 로그 확인</li>
                  <li>3. "호텔을 찾을 수 없습니다" 페이지가 나오지 않는지 확인</li>
                  <li>4. 호텔 이미지들이 정상적으로 로딩되는지 확인</li>
                  <li>5. Network 탭에서 이미지 요청이 400 오류 없이 성공하는지 확인</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

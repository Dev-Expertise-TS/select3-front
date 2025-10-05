'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ImageCheckResult {
  url: string
  status: 'checking' | 'exists' | 'not-exists' | 'error'
  statusCode?: number
  error?: string
  responseTime?: number
}

export default function TestImageExistsPage() {
  const [imageUrl, setImageUrl] = useState('https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_06_1600w.avif')
  const [results, setResults] = useState<ImageCheckResult[]>([])
  const [isChecking, setIsChecking] = useState(false)

  const checkImageExists = async (url: string): Promise<ImageCheckResult> => {
    const startTime = Date.now()
    
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        mode: 'cors'
      })
      
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        return {
          url,
          status: 'exists',
          statusCode: response.status,
          responseTime
        }
      } else {
        return {
          url,
          status: 'not-exists',
          statusCode: response.status,
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        url,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  const handleCheckSingle = async () => {
    if (!imageUrl.trim()) return
    
    setIsChecking(true)
    const result = await checkImageExists(imageUrl.trim())
    setResults([result])
    setIsChecking(false)
  }

  const handleCheckMultiple = async () => {
    const testUrls = [
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_01_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_02_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_03_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_04_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_05_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_06_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_07_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_08_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_09_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_10_1600w.avif',
      'https://bnnuekzyfuvgeefmhmnp.supabase.co/storage/v1/object/public/hotel-media/public/four-seasons-hotel-sydney/four-seasons-hotel-sydney_890_11_1600w.avif'
    ]
    
    setIsChecking(true)
    setResults([])
    
    for (const url of testUrls) {
      const result = await checkImageExists(url)
      setResults(prev => [...prev, result])
    }
    
    setIsChecking(false)
  }

  const getStatusBadge = (result: ImageCheckResult) => {
    switch (result.status) {
      case 'checking':
        return <Badge variant="secondary">확인 중...</Badge>
      case 'exists':
        return <Badge variant="default">존재함 ({result.statusCode})</Badge>
      case 'not-exists':
        return <Badge variant="destructive">없음 ({result.statusCode})</Badge>
      case 'error':
        return <Badge variant="destructive">오류</Badge>
      default:
        return <Badge variant="outline">알 수 없음</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🖼️ 이미지 존재 여부 확인 도구</h1>
        
        {/* 단일 이미지 확인 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>단일 이미지 확인</CardTitle>
            <CardDescription>
              특정 이미지 URL이 실제로 존재하는지 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">이미지 URL:</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="이미지 URL을 입력하세요"
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-4">
              <Button onClick={handleCheckSingle} disabled={isChecking}>
                {isChecking ? '확인 중...' : '이미지 확인'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Four Seasons Sydney 이미지 일괄 확인 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Four Seasons Hotel Sydney 이미지 일괄 확인</CardTitle>
            <CardDescription>
              Four Seasons Hotel Sydney의 모든 이미지 시퀀스(1-11)를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCheckMultiple} disabled={isChecking}>
              {isChecking ? '확인 중...' : '모든 이미지 확인'}
            </Button>
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>확인 결과</CardTitle>
              <CardDescription>
                {results.length}개 이미지 확인 완료
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">이미지 {index + 1}</div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(result)}
                        {result.responseTime && (
                          <span className="text-xs text-gray-500">
                            {result.responseTime}ms
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs font-mono text-gray-600 break-all mb-2">
                      {result.url}
                    </div>
                    
                    {result.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        오류: {result.error}
                      </div>
                    )}
                    
                    {result.statusCode && (
                      <div className="text-xs text-gray-500">
                        HTTP 상태 코드: {result.statusCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 요약 통계 */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">요약</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">
                      존재: {results.filter(r => r.status === 'exists').length}개
                    </span>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">
                      없음: {results.filter(r => r.status === 'not-exists').length}개
                    </span>
                  </div>
                  <div>
                    <span className="text-orange-600 font-medium">
                      오류: {results.filter(r => r.status === 'error').length}개
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Share2, Copy, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  className?: string
}

export function ShareButton({ 
  url, 
  title, 
  description = "",
  className 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      setIsOpen(true)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('링크 복사 실패:', error)
    }
  }

  const shareText = `${title} - 셀렉트 호텔`
  const kakaoShareUrl = `https://developers.kakao.com/tool/cleanup.html?url=${encodeURIComponent(url)}`

  return (
    <div className={cn("relative", className)}>
      <Button
        onClick={handleShare}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden sm:inline">공유하기</span>
      </Button>

      {/* 공유 옵션 드롭다운 */}
      {isOpen && (
        <>
          {/* 오버레이 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">공유하기</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-2">
                {/* 링크 복사 */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm text-gray-700">
                    {copied ? '복사됨!' : '링크 복사'}
                  </span>
                </button>

                {/* 카카오톡 공유 */}
                <a
                  href={`https://story.kakao.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-black font-bold">K</span>
                  </div>
                  <span className="text-sm text-gray-700">카카오톡</span>
                </a>

                {/* 페이스북 공유 */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">f</span>
                  </div>
                  <span className="text-sm text-gray-700">페이스북</span>
                </a>

                {/* 트위터 공유 */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">𝕏</span>
                  </div>
                  <span className="text-sm text-gray-700">트위터</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

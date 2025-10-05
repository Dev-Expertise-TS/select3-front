"use client"

import { useState, useEffect, useMemo } from "react"
import { X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SmartImage } from "@/components/ui/smart-image"
import { checkImageExists } from "@/lib/image-cache"
import { isValidImageUrl } from "@/lib/image-utils"

interface ImageItem {
  id: string
  media_path: string
  alt: string
  isMain?: boolean
}

interface ImageGalleryProps {
  images: ImageItem[]
  hotelName: string
  isOpen: boolean
  onClose: () => void
  selectedImage: number
  onImageSelect: (index: number) => void
  loading?: boolean
  error?: Error | null
}

export function ImageGallery({ 
  images, 
  hotelName, 
  isOpen, 
  onClose, 
  selectedImage, 
  onImageSelect,
  loading = false,
  error = null
}: ImageGalleryProps) {
  const [showImageDetail, setShowImageDetail] = useState(false)
  const [selectedDetailImage, setSelectedDetailImage] = useState(0)
  const [imageExistsMap, setImageExistsMap] = useState<Map<string, boolean>>(new Map())

  // 기본 유효성 검사로 필터링
  const initiallyValidImages = useMemo(() => {
    return images.filter((media) => {
      return media.media_path && 
             media.media_path.trim() !== '' && 
             !media.media_path.includes('placeholder') &&
             !media.media_path.includes('undefined') &&
             isValidImageUrl(media.media_path);
    })
  }, [images])

  // 실제 존재하는 이미지들만 필터링
  const validImages = useMemo(() => {
    return initiallyValidImages.filter((media) => {
      const exists = imageExistsMap.get(media.media_path)
      return exists === true // 명시적으로 true인 경우만 포함
    })
  }, [initiallyValidImages, imageExistsMap])

  // 이미지 존재 여부 확인
  useEffect(() => {
    if (!isOpen || initiallyValidImages.length === 0) return

    const checkImages = async () => {
      console.log(`🔍 ImageGallery: ${initiallyValidImages.length}개 이미지 존재 여부 확인 시작`)
      
      const promises = initiallyValidImages.map(async (media) => {
        try {
          const exists = await checkImageExists(media.media_path)
          return { media_path: media.media_path, exists }
        } catch (error) {
          console.warn(`⚠️ 이미지 확인 실패: ${media.media_path}`, error)
          return { media_path: media.media_path, exists: false }
        }
      })

      const results = await Promise.all(promises)
      const newExistsMap = new Map<string, boolean>()
      
      results.forEach(({ media_path, exists }) => {
        newExistsMap.set(media_path, exists)
      })

      setImageExistsMap(newExistsMap)
      
      const existingCount = results.filter(r => r.exists).length
      console.log(`✅ ImageGallery: 이미지 존재 여부 확인 완료 - ${existingCount}/${results.length}개 존재`)
    }

    checkImages()
  }, [isOpen, initiallyValidImages])

  // 이미지 상세 보기 열기
  const openImageDetail = (index: number) => {
    setSelectedDetailImage(index)
    setShowImageDetail(true)
  }

  // 이미지 상세 보기 닫기
  const closeImageDetail = () => {
    setShowImageDetail(false)
  }

  // 이전 이미지
  const prevImage = () => {
    setSelectedDetailImage((prev) => (prev === 0 ? validImages.length - 1 : prev - 1))
  }

  // 다음 이미지
  const nextImage = () => {
    setSelectedDetailImage((prev) => (prev === validImages.length - 1 ? 0 : prev + 1))
  }

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOpen) {
          onClose()
        } else if (showImageDetail) {
          closeImageDetail()
        }
      } else if (showImageDetail) {
        if (e.key === 'ArrowLeft') {
          prevImage()
        } else if (e.key === 'ArrowRight') {
          nextImage()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showImageDetail, onClose])

  // 디버깅 로그 제거됨

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] max-h-[800px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {hotelName}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>2026년 7월 15일</span>
              <span>-</span>
              <span>2026년 7월 16일</span>
              <span className="ml-2">성인 2명</span>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              확인
            </Button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="h-[calc(100%-80px)]">
          {/* Image Grid */}
          <div className="h-full p-6 overflow-y-auto">
            {!showImageDetail ? (
              <>
                {/* 로딩 상태 */}
                {loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="text-gray-600">이미지를 불러오는 중...</div>
                    </div>
                  </div>
                )}

                {/* 에러 상태 */}
                {error && !loading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-red-500 text-4xl mb-4">❌</div>
                      <div className="text-red-600 font-medium mb-2">이미지를 불러올 수 없습니다</div>
                      <div className="text-gray-600 text-sm">{error.message}</div>
                    </div>
                  </div>
                )}

                {/* 이미지가 없을 때 */}
                {!loading && !error && images.length === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-gray-400 text-4xl mb-4">📷</div>
                      <div className="text-gray-600 font-medium mb-2">표시할 이미지가 없습니다</div>
                      <div className="text-gray-500 text-sm">호텔 이미지가 준비되지 않았습니다</div>
                    </div>
                  </div>
                )}

                {/* 이미지 존재 여부 확인 중 */}
                {!loading && !error && images.length > 0 && initiallyValidImages.length > 0 && validImages.length === 0 && imageExistsMap.size === 0 && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <div className="text-gray-600">이미지를 확인하는 중...</div>
                    </div>
                  </div>
                )}

                {/* 존재하지 않는 이미지들만 있을 때 */}
                {!loading && !error && images.length > 0 && initiallyValidImages.length > 0 && validImages.length === 0 && imageExistsMap.size > 0 && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-gray-400 text-4xl mb-4">🖼️</div>
                      <div className="text-gray-600 font-medium mb-2">표시할 이미지가 없습니다</div>
                      <div className="text-gray-500 text-sm">유효한 호텔 이미지를 찾을 수 없습니다</div>
                      <div className="text-gray-400 text-xs mt-2">
                        확인된 이미지: {initiallyValidImages.length}개 중 {[...imageExistsMap.values()].filter(Boolean).length}개 존재
                      </div>
                    </div>
                  </div>
                )}

                {/* 이미지 그리드 */}
                {!loading && !error && validImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {validImages.map((media, index) => (
                      <div 
                        key={media.id} 
                        className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                        onClick={() => openImageDetail(index)}
                      >
                        <SmartImage
                          src={media.media_path}
                          alt={media.alt || `Gallery ${index + 1}`}
                          fill
                          className="object-cover transition-all duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          quality={85}
                          format="avif"
                          autoPreload={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Image Detail View */
              <div className="h-full flex flex-col">
                {/* Detail Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={closeImageDetail}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>갤러리로 돌아가기</span>
                  </button>
                  <div className="text-sm text-gray-500">
                    {selectedDetailImage + 1} / {validImages.length}
                  </div>
                </div>

                {/* Main Image */}
                <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100">
                  {validImages.length > 0 ? (
                    <SmartImage
                      src={validImages[selectedDetailImage]?.media_path}
                      alt={validImages[selectedDetailImage]?.alt || `Detail ${selectedDetailImage + 1}`}
                      fill
                      className="object-contain"
                      quality={90}
                      format="avif"
                      priority={true}
                      autoPreload={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-4">📷</div>
                        <div className="text-xl">이미지가 없습니다</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                {validImages.length > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={prevImage}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>이전</span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <span>다음</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Thumbnail Navigation */}
                {validImages.length > 1 && (
                  <div className="mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {validImages.map((media, index) => (
                        <button
                          key={media.id}
                          onClick={() => setSelectedDetailImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedDetailImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <SmartImage
                            src={media.media_path}
                            alt={media.alt || `Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                            quality={85}
                            format="avif"
                            autoPreload={false}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
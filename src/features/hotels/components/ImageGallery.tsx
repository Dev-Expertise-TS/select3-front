"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import NextImage from "next/image"
import { cn } from "@/lib/utils"
import { checkImageExists } from "@/lib/image-cache"

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
  sabreId?: number
}

export function ImageGallery({ 
  images, 
  hotelName, 
  isOpen, 
  onClose, 
  selectedImage, 
  onImageSelect,
  loading = false,
  error = null,
  sabreId
}: ImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(selectedImage)
  const [showDetailView, setShowDetailView] = useState(false)
  const [imageExistsMap, setImageExistsMap] = useState<Map<string, boolean>>(new Map())
  const thumbnailListRef = useRef<HTMLDivElement | null>(null)
  const preloadedSrcSetRef = useRef<Set<string>>(new Set())
  const [remoteImages, setRemoteImages] = useState<ImageItem[] | null>(null)

  const preloadImage = (src: string) => {
    if (!src || preloadedSrcSetRef.current.has(src)) return
    const img = new Image()
    img.decoding = 'async'
    img.loading = 'eager' as any
    img.src = src
    img.onload = () => preloadedSrcSetRef.current.add(src)
    img.onerror = () => preloadedSrcSetRef.current.add(src)
  }

  const sourceImages = remoteImages ?? images

  // 실제 존재하는 이미지들만 필터링
  const validImages = useMemo(() => {
    // 존재 여부를 아직 모르면 일단 표시하고, 명시적으로 false인 것만 제외
    return sourceImages.filter((image) => {
      const exists = imageExistsMap.get(image.media_path)
      return exists !== false
    })
  }, [sourceImages, imageExistsMap])

  // 이미지 존재 여부 확인 (이미지가 실제로 변경될 때만)
  useEffect(() => {
    if (!isOpen || sourceImages.length === 0) return

    // 서버에서 스토리지 목록(실존 파일)으로 전달된 경우(filename 존재)에는 재확인 스킵
    if (sourceImages.some((img: any) => typeof (img as any).filename === 'string')) return

    // 이미지 경로들을 문자열로 변환해서 비교
    const currentImagePaths = sourceImages.map(img => img.media_path).join(',')
    const lastCheckedPaths = Array.from(imageExistsMap.keys()).join(',')
    
    // 이미지 경로가 동일하면 다시 확인하지 않음
    if (currentImagePaths === lastCheckedPaths) return

    const checkImages = async () => {
      const promises = sourceImages.map(async (image) => {
        try {
          const exists = await checkImageExists(image.media_path)
          return { media_path: image.media_path, exists }
        } catch (error) {
          return { media_path: image.media_path, exists: false }
        }
      })

      const results = await Promise.all(promises)
      const newExistsMap = new Map<string, boolean>()
      
      results.forEach(({ media_path, exists }) => {
        newExistsMap.set(media_path, exists)
      })

      setImageExistsMap(newExistsMap)
    }

    checkImages()
  }, [isOpen, sourceImages.map(img => img.media_path).join(',')])

  // 팝업 open 시 서버에서 직접 전체 이미지 목록 가져오기
  useEffect(() => {
    if (!isOpen || !sabreId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/hotels/${sabreId}/storage-images`, { cache: 'no-store' })
        const json = await res.json()
        if (res.ok && json?.success && Array.isArray(json.data?.images) && json.data.images.length > 0) {
          const mapped: ImageItem[] = json.data.images.map((img: any) => ({
            id: img.id,
            media_path: img.media_path || img.url,
            alt: img.alt || `${hotelName} 이미지 ${img.sequence || ''}`,
            isMain: img.isMain,
          }))
          setRemoteImages(mapped)
        }
      } catch {}
    })()
  }, [isOpen, sabreId, hotelName])

  // 현재 선택 인덱스 주변 이미지 프리로드 (즉시 반응성 향상)
  useEffect(() => {
    if (!isOpen || validImages.length === 0) return
    const neighbors = [currentImageIndex, currentImageIndex + 1, currentImageIndex + 2]
      .map(i => (i + validImages.length) % validImages.length)
    neighbors.forEach(i => preloadImage(validImages[i]?.media_path))
  }, [isOpen, currentImageIndex, validImages])

  // 썸네일 가시성 기반 프리로드 (뷰포트 근처 이미지 선로딩)
  useEffect(() => {
    if (!isOpen || !thumbnailListRef.current) return
    const container = thumbnailListRef.current
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idxAttr = (entry.target as HTMLElement).getAttribute('data-index')
          const idx = idxAttr ? parseInt(idxAttr, 10) : NaN
          const src = isNaN(idx) ? undefined : validImages[idx]?.media_path
          if (src) preloadImage(src)
        }
      })
    }, { root: container, rootMargin: '200px', threshold: 0 })

    const items = container.querySelectorAll('[data-thumb="true"]')
    items.forEach(el => io.observe(el))

    return () => io.disconnect()
  }, [isOpen, validImages.length])

  // selectedImage prop이 변경될 때 currentImageIndex 업데이트
  useEffect(() => {
    setCurrentImageIndex(selectedImage)
  }, [selectedImage])

  // validImages가 변경될 때 currentImageIndex가 범위를 벗어나지 않도록 보정
  useEffect(() => {
    if (validImages.length > 0 && currentImageIndex >= validImages.length) {
      setCurrentImageIndex(0)
    }
  }, [validImages.length, currentImageIndex])

  // 키보드 이벤트 처리
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDetailView) {
          setShowDetailView(false)
        } else {
          onClose()
        }
      } else if (showDetailView) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          goToPrevious()
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          goToNext()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, showDetailView, onClose])

  const goToPrevious = () => {
    const newIndex = currentImageIndex === 0 ? validImages.length - 1 : currentImageIndex - 1
    setCurrentImageIndex(newIndex)
    onImageSelect(newIndex)
  }

  const goToNext = () => {
    const newIndex = currentImageIndex === validImages.length - 1 ? 0 : currentImageIndex + 1
    setCurrentImageIndex(newIndex)
    onImageSelect(newIndex)
  }

  const openDetailView = (index: number) => {
    setCurrentImageIndex(index)
    setShowDetailView(true)
    onImageSelect(index)
  }

  const closeDetailView = () => {
    setShowDetailView(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] max-h-[900px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {hotelName}
              </h2>
              <div className="text-sm text-gray-600">
                {validImages.length}장의 이미지
              </div>
            </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!showDetailView ? (
            /* Grid View */
            <div className="h-full p-6 overflow-y-auto">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <div className="text-gray-600">이미지를 불러오는 중...</div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">❌</div>
                    <div className="text-red-600 font-medium mb-2">이미지를 불러올 수 없습니다</div>
                    <div className="text-gray-600 text-sm">{error.message}</div>
                  </div>
                </div>
              )}

              {/* No Images */}
              {!loading && !error && validImages.length === 0 && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-gray-400 text-4xl mb-4">📷</div>
                    <div className="text-gray-600 font-medium mb-2">표시할 이미지가 없습니다</div>
                    <div className="text-gray-500 text-sm">호텔 이미지가 준비되지 않았습니다</div>
                  </div>
                </div>
              )}

              {/* Image Grid */}
              {!loading && !error && validImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {validImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer bg-gray-100"
                      onClick={() => openDetailView(index)}
                    >
                      <NextImage
                        src={image.media_path}
                        alt={image.alt || `Gallery ${index + 1}`}
                        fill
                        className="object-cover transition-all duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={85}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Detail View */
            <div className="h-full flex flex-col">
              {/* Detail Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <button
                  onClick={closeDetailView}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>갤러리로 돌아가기</span>
                </button>
                <div className="text-sm text-gray-500">
                  {currentImageIndex + 1} / {validImages.length}
                </div>
              </div>

              {/* Main Image (현재 선택된 한 장만 렌더링) */}
              <div className="flex-1 relative bg-gray-100 min-h-0">
                {validImages[currentImageIndex] && (
                    <NextImage
                    key={validImages[currentImageIndex].id}
                    src={validImages[currentImageIndex].media_path}
                    alt={validImages[currentImageIndex].alt || `Detail ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    quality={85}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                )}
              </div>

              {/* Navigation Controls */}
              {validImages.length > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={goToPrevious}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    이전
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToNext}
                    className="flex items-center gap-2"
                  >
                    다음
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Thumbnail Navigation */}
              {validImages.length > 1 && (
                <div className="p-4 border-t border-gray-200 flex-shrink-0">
                  <div ref={thumbnailListRef} className="flex gap-2 overflow-x-auto pb-2">
                    {validImages.map((image, index) => (
                      <div
                        key={image.id}
                        className={cn(
                          "relative flex-shrink-0 w-16 h-16 cursor-pointer rounded-lg overflow-hidden bg-gray-100",
                          currentImageIndex === index && "ring-2 ring-blue-500"
                        )}
                        data-thumb="true"
                        data-index={index}
                        onClick={() => {
                          // 즉시 상태 업데이트로 UI 반응성 향상
                          setCurrentImageIndex(index)
                          onImageSelect(index)
                        }}
                      >
                        <NextImage
                          src={image.media_path}
                          alt={image.alt || `Thumbnail ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-200 hover:scale-105"
                          sizes="64px"
                          quality={80}
                          loading="eager"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
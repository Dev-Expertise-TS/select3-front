"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { X, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"
import { Button } from "@/components/ui/button"

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
}

export function ImageGallery({ 
  images, 
  hotelName, 
  isOpen, 
  onClose, 
  selectedImage, 
  onImageSelect 
}: ImageGalleryProps) {
  const [showImageDetail, setShowImageDetail] = useState(false)
  const [selectedDetailImage, setSelectedDetailImage] = useState(0)

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
    setSelectedDetailImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // 다음 이미지
  const nextImage = () => {
    setSelectedDetailImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))
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
              <div className="grid grid-cols-3 gap-4">
                {images.map((media, index) => (
                  <div 
                    key={media.id} 
                    className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
                    onClick={() => openImageDetail(index)}
                  >
                    <Image
                      src={getSafeImageUrl(media.media_path)}
                      alt={media.alt || `Gallery ${index + 1}`}
                      fill
                      className="object-cover transition-all duration-300 group-hover:scale-105"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      loading="lazy"
                      onLoad={() => handleImageLoad(media.media_path)}
                      onError={handleImageError}
                    />
                  </div>
                ))}
              </div>
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
                    {selectedDetailImage + 1} / {images.length}
                  </div>
                </div>

                {/* Main Image */}
                <div className="flex-1 relative rounded-lg overflow-hidden bg-gray-100">
                  {images.length > 0 ? (
                    <Image
                      src={getSafeImageUrl(images[selectedDetailImage]?.media_path)}
                      alt={images[selectedDetailImage]?.alt || `Detail ${selectedDetailImage + 1}`}
                      fill
                      className="object-contain"
                      onLoad={() => handleImageLoad(images[selectedDetailImage]?.media_path)}
                      onError={handleImageError}
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
                {images.length > 1 && (
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
                {images.length > 1 && (
                  <div className="mt-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((media, index) => (
                        <button
                          key={media.id}
                          onClick={() => setSelectedDetailImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === selectedDetailImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={media.media_path}
                            alt={media.alt || `Thumbnail ${index + 1}`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
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
"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { optimizeHotelMainImage, optimizeGalleryDetail, optimizeGalleryThumbnail } from "@/lib/image-optimization"

interface MobileImageGridProps {
  images: Array<{
    id: string
    media_path: string
  }>
  hotelName: string
  className?: string
}

export function MobileImageGrid({ 
  images, 
  hotelName, 
  className = "" 
}: MobileImageGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // placeholder 이미지 필터링
  const validImages = images?.filter(img => 
    img.media_path && 
    img.media_path !== '/placeholder.svg' &&
    !img.media_path.includes('placeholder')
  ) || []

  if (!validImages || validImages.length === 0) {
    return null
  }

  const currentImage = validImages[currentImageIndex]
  const totalImages = validImages.length

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % totalImages)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages)
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      {/* 모바일 이미지 그리드 */}
      <div className={cn("lg:hidden", className)}>
        <div className="relative aspect-[4/3] rounded-none sm:rounded-lg overflow-hidden">
          <Image
            src={optimizeHotelMainImage(currentImage.media_path)}
            alt={hotelName}
            fill
            className="object-cover cursor-pointer"
            onClick={openModal}
            priority
            quality={85}
            sizes="100vw"
          />
          
          {/* 이미지 개수 표시 */}
          {totalImages > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4zm6 9l-4 5h12l-3-4-2.03 2.71L10 13zm7-4.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5zM20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2zm0 18h-7v-2h7v-7h2v7c0 1.1-.9 2-2 2zM4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>
                </svg>
              </div>
              <span>{currentImageIndex + 1}/{totalImages}</span>
            </div>
          )}
        </div>
      </div>

      {/* 슬라이드 레이어 팝업 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* 배경 오버레이 */}
          <div 
            className="absolute inset-0 bg-black/80"
            onClick={closeModal}
          />
          
          {/* 모달 컨텐츠 */}
          <div className="absolute inset-0 flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 bg-white">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {hotelName}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* 메인 이미지 영역 */}
            <div className="flex-1 relative bg-black">
              <div className="relative w-full h-full">
                <Image
                  src={optimizeGalleryDetail(currentImage.media_path)}
                  alt={`${hotelName} - 이미지 ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  priority
                  quality={90}
                  sizes="100vw"
                />
                
                {/* 네비게이션 버튼 */}
                {totalImages > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 썸네일 영역 */}
            {totalImages > 1 && (
              <div className="bg-white p-4 pb-20">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {validImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => selectImage(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                        index === currentImageIndex
                          ? "border-blue-500"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <Image
                        src={optimizeGalleryThumbnail(image.media_path)}
                        alt={`${hotelName} 썸네일 ${index + 1}`}
                        fill
                        className="object-cover"
                        quality={75}
                        sizes="64px"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

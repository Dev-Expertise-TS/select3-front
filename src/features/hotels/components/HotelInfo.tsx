"use client"

import { Star, MapPin } from "lucide-react"
// import { handleImageError, handleImageLoad } from "@/lib/image-utils"
import { HotelHeroImage, HotelThumbnail, OptimizedImage } from "@/components/ui/optimized-image"
import { MobileImageGrid } from "@/components/hotel/MobileImageGrid"

interface ImageItem {
  id: string
  media_path: string
  alt: string
  isMain?: boolean
}

interface HotelInfoProps {
  hotel: {
    property_name_ko?: string
    property_name_en?: string
    property_address?: string
    rating?: number
    city_ko?: string
    city_eng?: string
  }
  images: ImageItem[]
  selectedImage: number
  onImageSelect: (index: number) => void
  onGalleryOpen: () => void
  preloadedImages: Set<string>
  imageLoadingStates?: Map<string, 'loading' | 'loaded' | 'error'>
  isImageLoading?: (src: string) => boolean
  isImageLoaded?: (src: string) => boolean
  isImageError?: (src: string) => boolean
}

export function HotelInfo({ 
  hotel, 
  images, 
  selectedImage, 
  onImageSelect, 
  onGalleryOpen,
  preloadedImages,
  imageLoadingStates,
  isImageLoading,
  isImageLoaded,
  isImageError
}: HotelInfoProps) {
  return (
    <div className="bg-gray-100 py-0.5">
      <div className="container mx-auto max-w-[1440px] px-0 sm:px-4">
        <div className="bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-sm pt-1.5 px-0 pb-3 sm:pt-3 sm:px-6 sm:pb-6">
          {/* Image Gallery - 위로 이동 */}
          <div className="rounded-none sm:rounded-lg overflow-hidden mb-2 sm:mb-3 px-0 sm:px-0">
            {/* 모바일: MobileImageGrid 컴포넌트 사용 */}
            <MobileImageGrid
              images={images}
              hotelName={hotel.property_name_ko || hotel.property_name_en || '호텔명'}
              className="block sm:hidden"
            />
            
            {/* 데스크톱: 기존 레이아웃 */}
            <div className="hidden sm:flex gap-2 h-[400px]">
              {/* 메인 이미지 */}
              <div
                className="w-[60%] relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
                onClick={onGalleryOpen}
              >
                {images.length > 0 ? (
                  <div className="relative w-full h-full">
                    {/* 로딩 스켈레톤 */}
                    {(() => {
                      const currentImageSrc = images[selectedImage]?.media_path || images[0]?.media_path
                      const isLoading = isImageLoading?.(currentImageSrc) || (!preloadedImages.has(currentImageSrc) && !isImageLoaded?.(currentImageSrc))
                      const hasError = isImageError?.(currentImageSrc)
                      
                      
                      if (hasError) {
                        return (
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                            <div className="text-gray-400 text-center">
                              <div className="text-2xl mb-2">❌</div>
                              <div className="text-sm">이미지 로드 실패</div>
                            </div>
                          </div>
                        )
                      }
                      
                      if (isLoading) {
                        return (
                          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                            <div className="text-gray-400">
                              <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                              <div className="text-sm">이미지 로딩 중...</div>
                            </div>
                          </div>
                        )
                      }
                      
                      return null
                    })()}
                    <HotelHeroImage
                      src={images[selectedImage]?.media_path || images[0]?.media_path}
                      alt={images[selectedImage]?.alt || images[0]?.alt || hotel.property_name_ko || '호텔 이미지'}
                      width={1920}
                      height={1080}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">📷</div>
                      <div className="text-sm font-medium">No Image</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 썸네일 그리드 */}
              <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-2 h-full">
                {images.length > 0 ? (
                  <>
                    {images.slice(1, 5).map((media, index) => {
                      const isLoading = isImageLoading?.(media.media_path) || (!preloadedImages.has(media.media_path) && !isImageLoaded?.(media.media_path))
                      const hasError = isImageError?.(media.media_path)
                      
                      return (
                        <div
                          key={media.id}
                          className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 w-full h-full min-h-0"
                          onClick={() => {
                            onImageSelect(index + 1)
                            onGalleryOpen()
                          }}
                        >
                          {/* 로딩 스켈레톤 */}
                          {isLoading && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                            </div>
                          )}
                          
                          {/* 에러 상태 */}
                          {hasError && (
                            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                              <div className="text-gray-400 text-xs">❌</div>
                            </div>
                          )}
                          
                          <OptimizedImage
                            src={media.media_path}
                            alt={media.alt || `Gallery ${index + 2}`}
                            fill
                            className="object-cover transition-opacity duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 20vw, 20vw"
                            quality={85}
                            format="webp"
                            loading={isLoading ? 'loading' : hasError ? 'error' : undefined}
                            // onLoad={() => handleImageLoad(media.media_path)}
                            // onError={handleImageError}
                          />
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-2xl mb-2">📷</div>
                      <div className="text-sm font-medium">No Image</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hotel Info Header - 아래로 이동 */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 px-3 sm:px-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{hotel.property_name_ko || '호텔명'}</h1>
                {hotel.property_name_en && (
                  <span className="text-base sm:text-2xl font-bold text-gray-900">({hotel.property_name_en})</span>
                )}
                <div className="flex items-center">
                  {hotel.rating && [...Array(hotel.rating)].map((_, i) => (
                    <Star key={`hotel-info-star-${i}`} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{hotel.property_address || '주소 정보 없음'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
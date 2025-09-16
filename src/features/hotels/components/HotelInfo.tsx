"use client"

import Image from "next/image"
import { Star, MapPin, Heart } from "lucide-react"
import { getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"

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
    <div className="bg-gray-100 py-1.5">
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Hotel Info Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{hotel.property_name_ko || '호텔명'}</h1>
                {hotel.property_name_en && (
                  <span className="text-2xl font-bold text-gray-900">({hotel.property_name_en})</span>
                )}
                <div className="flex items-center">
                  {hotel.rating && [...Array(hotel.rating)].map((_, i) => (
                    <Star key={`hotel-info-star-${i}`} className="h-4 w-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{hotel.property_address || '주소 정보 없음'}</span>
                <a href="#" className="text-blue-600 text-sm hover:underline ml-2">
                  지도에서 호텔보기
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="flex gap-2 h-[400px] rounded-lg overflow-hidden">
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
                  <Image
                    src={getSafeImageUrl(images[selectedImage]?.media_path || images[0]?.media_path)}
                    alt={images[selectedImage]?.alt || images[0]?.alt || hotel.property_name_ko || '호텔 이미지'}
                    fill
                    className="object-cover transition-opacity duration-300"
                    priority={selectedImage === 0}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 60vw"
                    onLoad={() => handleImageLoad(images[selectedImage]?.media_path || images[0]?.media_path)}
                    onError={handleImageError}
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
            <div className="w-[40%] grid grid-cols-2 grid-rows-2 gap-2 h-full">
              {/* 호텔 이미지가 있는 경우 순차적으로 표시 */}
              {images.length > 0 ? (
                <>
                  {images.slice(1, 5).map((media, index) => {
                    const isLoading = isImageLoading?.(media.media_path) || (!preloadedImages.has(media.media_path) && !isImageLoaded?.(media.media_path))
                    const hasError = isImageError?.(media.media_path)
                    
                    return (
                      <div
                        key={media.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
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
                        
                        <Image
                          src={getSafeImageUrl(media.media_path)}
                          alt={media.alt || `Gallery ${index + 2}`}
                          fill
                          className="object-cover transition-opacity duration-300"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 20vw, 20vw"
                          loading={index < 2 ? "eager" : "lazy"}
                          onLoad={() => handleImageLoad(media.media_path)}
                          onError={handleImageError}
                        />
                      </div>
                    )
                  })}
                  {/* 더보기 오버레이 - 마지막 썸네일에만 표시 */}
                  {images.length > 5 && (
                    <div className="absolute bottom-0 right-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors rounded-lg">
                      <div className="text-white text-center p-2">
                        <div className="text-lg font-bold">사진 모두보기</div>
                        <div className="text-sm">({images.length}장)</div>
                      </div>
                    </div>
                  )}
                  {/* 5개 미만인 경우 빈 썸네일 표시 */}
                  {images.length < 5 && Array.from({ length: 5 - images.length }).map((_, index) => (
                    <div key={`empty-${index}`} className="bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg mb-1">📷</div>
                        <div className="text-xs font-medium">No Image</div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-lg mb-1">📷</div>
                      <div className="text-xs font-medium">No Image</div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-lg mb-1">📷</div>
                      <div className="text-xs font-medium">No Image</div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-lg mb-1">📷</div>
                      <div className="text-xs font-medium">No Image</div>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-lg mb-1">📷</div>
                      <div className="text-xs font-medium">No Image</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
/**
 * select_hotel_media 테이블 관련 유틸리티 함수
 */

/**
 * 각 호텔별로 가장 작은 image_seq를 가진 이미지만 추출
 * (image_seq가 1이 아닌 경우도 처리)
 */
export function getFirstImagePerHotel(mediaData: any[]): any[] {
  if (!mediaData || mediaData.length === 0) return []
  
  const firstImagesMap = new Map()
  
  mediaData.forEach((media: any) => {
    const currentSeq = parseInt(String(media.image_seq)) || 999
    const existingSeq = firstImagesMap.has(media.sabre_id) 
      ? parseInt(String(firstImagesMap.get(media.sabre_id).image_seq)) || 999
      : 999
    
    if (!firstImagesMap.has(media.sabre_id) || currentSeq < existingSeq) {
      firstImagesMap.set(media.sabre_id, media)
    }
  })
  
  return Array.from(firstImagesMap.values())
}

/**
 * 미디어 데이터에서 이미지 URL 추출
 * (public_url 우선, 없으면 storage_path)
 */
export function getImageUrl(media: any): string {
  return media?.public_url || media?.storage_path || '/placeholder.svg'
}

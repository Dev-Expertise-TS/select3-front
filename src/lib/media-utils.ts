/**
 * select_hotel_media 테이블 관련 유틸리티 함수
 */

/**
 * 파일명에서 이미지 번호 추출
 * 예: sofitel-legend-the-grand-amsterdam_30708_01_1200w.avif → 1
 * 예: sofitel-legend-the-grand-amsterdam_30708_02.avif → 2
 */
function extractImageNumber(fileName: string): number {
  if (!fileName) return 999
  
  // 패턴: slug_sabreId_번호_크기.확장자 또는 slug_sabreId_번호.확장자
  // sabreId 뒤의 2자리 숫자를 찾음 (예: _30708_01_ 또는 _30708_01.)
  const match = fileName.match(/_\d{5,}_(\d{2})(?:_|\.)/);
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  
  return 999 // 번호를 찾을 수 없으면 뒤로 정렬
}

/**
 * 각 호텔별로 가장 작은 image_seq를 가진 이미지만 추출
 * (image_seq가 null인 경우 파일명에서 번호 추출)
 */
export function getFirstImagePerHotel(mediaData: any[]): any[] {
  if (!mediaData || mediaData.length === 0) return []
  
  const firstImagesMap = new Map()
  
  mediaData.forEach((media: any) => {
    // 1순위: image_seq 사용
    let currentSeq = parseInt(String(media.image_seq))
    
    // 2순위: image_seq가 null이면 파일명에서 번호 추출
    if (isNaN(currentSeq)) {
      currentSeq = extractImageNumber(media.file_name)
    }
    
    // 기존에 저장된 이미지의 번호 가져오기
    let existingSeq = 999
    if (firstImagesMap.has(media.sabre_id)) {
      const existing = firstImagesMap.get(media.sabre_id)
      existingSeq = parseInt(String(existing.image_seq))
      
      if (isNaN(existingSeq)) {
        existingSeq = extractImageNumber(existing.file_name)
      }
    }
    
    // 더 작은 번호의 이미지를 저장
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

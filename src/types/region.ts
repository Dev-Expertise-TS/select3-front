/**
 * 지역 관련 타입 정의
 */

export interface Region {
  city_code: string
  city_ko: string
  city_en: string | null
  city_slug: string | null
  country_code: string | null
  country_ko: string | null
  country_en: string | null
  city_sort_order: number
  country_sort_order: number | null
}

export interface RegionImage {
  id: number
  city_code: string
  file_name: string
  file_path: string | null
  public_url: string | null
  image_seq: number
  imageUrl?: string | null  // API에서 생성된 최종 URL
}

export interface RegionImagesResponse {
  success: boolean
  data?: {
    region: {
      city_code: string
      city_ko: string
      city_en: string | null
    }
    images: RegionImage[]
    firstImage: RegionImage | null
  }
  error?: string
}


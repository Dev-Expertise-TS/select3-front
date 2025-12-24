export type LatLng = { lat: number; lng: number }

export type PoiHotel = {
  place_id: string
  name: string
  formatted_address?: string
  rating?: number
  user_ratings_total?: number
  location: LatLng
  photo_reference?: string
}

export type PoiHotelsResponse = {
  destination: string
  keyword: string
  radius: number
  center: LatLng
  results: PoiHotel[]
  nextPageToken: string | null
}

export type SelectHotelMarker = {
  sabre_id: number | string
  slug?: string | null
  name: string
  property_name_ko?: string | null
  property_name_en?: string | null
  property_address: string
  location: LatLng
  benefits?: string[]
  badges?: string[]
  star_rating?: number | null
  image?: string | null
  area_ko?: string | null
  area_en?: string | null
  city_ko?: string | null
  city_en?: string | null
  country_ko?: string | null
  country_en?: string | null
  promotions?: Array<{ title: string; description?: string }>
}

export type HotelMapMarkersResponse = {
  destination: string
  resolved: {
    kind: 'city' | 'country' | 'area' | 'unknown'
    label: string
    queryText: string
  }
  center: LatLng
  count: number
  requested: number
  markers: SelectHotelMarker[]
  areas?: Array<{ id: string; area_ko: string | null; area_en: string | null }>
}



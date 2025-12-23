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
  property_address: string
  location: LatLng
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
}



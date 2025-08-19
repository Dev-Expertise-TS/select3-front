// Hotel types
export interface Hotel {
  id: string
  name: string
  nameKr?: string
  slug: string
  description?: string
  location: string
  rating?: number
  price?: number
  image?: string
  amenities?: string[]
  brand?: string
}

// Brand types
export interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  hotels?: Hotel[]
}

// Destination types
export interface Destination {
  id: string
  name: string
  nameKr?: string
  description?: string
  image?: string
  hotels?: Hotel[]
}

// Search types
export interface SearchParams {
  query?: string
  location?: string
  brand?: string
  priceRange?: [number, number]
  amenities?: string[]
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    count?: number
    page?: number
    pageSize?: number
  }
}

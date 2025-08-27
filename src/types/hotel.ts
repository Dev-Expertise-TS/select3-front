// Rate Plan Codes API Response
export interface RatePlanCodesApiResponse {
  success: boolean
  data?: string[]
  error?: string
  count?: number
}

// Hotel Details API Response
export interface HotelDetailsApiResponse {
  success: boolean
  data?: any
  error?: string
}

// Rate Plans API Response
export interface RatePlansApiResponse {
  success: boolean
  data?: any
  error?: string
}

// Rate Plan Code
export interface RatePlanCode {
  RateKey: string
  RoomType: string
  RoomName: string
  Description: string
  Currency: string
  AmountAfterTax: number | string
  AmountBeforeTax: number | string
  RoomTypeCode: string
  RatePlanType: string
  RatePlanDescription: string
}
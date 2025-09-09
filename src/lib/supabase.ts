import { createClient } from '@supabase/supabase-js'

// RatePlanCode 타입 정의
export interface RatePlanCode {
  RateKey: string
  RoomType: string
  RoomName: string
  Description: string
  Currency: string
  AmountAfterTax: string
  AmountBeforeTax?: string
  RoomTypeCode?: string
  RatePlanDescription?: string
  RatePlanType?: string
  BookingCode?: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 환경변수 디버깅
console.log('🔧 Supabase 클라이언트 설정:')
console.log('  - URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : '❌ 설정 안됨')
console.log('  - ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ 설정 안됨')
console.log('  - URL 길이:', supabaseUrl?.length || 0)
console.log('  - ANON_KEY 길이:', supabaseAnonKey?.length || 0)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('✅ Supabase 클라이언트 생성 완료')

// 타입 안전성을 위한 데이터베이스 타입 정의
export type Database = {
  public: {
    Tables: {
      // select_hotels: 호텔 기본 정보 (실제 68개 컬럼)
      select_hotels: {
        Row: {
          // 기본 식별자
          id: string
          id_old: number
          sort_id: number
          sabre_id: number
          paragon_id: number
          brand_id: string | null
          
          // 호텔 기본 정보
          slug: string
          property_name_ko: string
          property_name_en: string
          
          // 위치 정보
          city: string
          city_ko: string | null
          city_en: string | null
          country_ko: string | null
          country_en: string | null
          continent_ko: string | null
          continent_en: string | null
          property_address: string
          destination_sort: string
          location_section: string | null
          
          // 체인 정보
          chain: string
          chain_en: string | null
          
          // 링크 및 상세 정보
          link: string | null
          property_details: string | null
          
          // 이미지 정보
          image_1: string
          image_2: string
          image_3: string
          image_4: string
          image_5: string
          
          // 배지 정보
          badge: string
          badge_1: string | null
          badge_2: string | null
          badge_3: string | null
          
          // 혜택 정보
          benefit: string
          benefit_1: string
          benefit_2: string
          benefit_3: string
          benefit_4: string
          benefit_5: string
          benefit_6: string
          benefit_details: string
          benefit_1_details: string
          benefit_2_details: string
          benefit_3_details: string
          benefit_4_details: string
          benefit_5_details: string
          benefit_6_details: string
          
          // 이벤트 정보
          event_1: string | null
          event_1_details_1: string | null
          event_1_details_2: string | null
          event_1_details_3: string | null
          event_1_details_4: string | null
          event_1_details_5: string | null
          event_2: string | null
          event_2_details_1: string | null
          event_2_details_2: string | null
          event_2_details_3: string | null
          event_2_details_4: string | null
          
          // 블로그 정보
          blogs: string | null
          blogs_s1: string | null
          blogs_s2: string | null
          blogs_s3: string | null
          blogs_s4: string | null
          blogs_s5: string | null
          blogs_s6: string | null
          blogs_s7: string | null
          
          // 요금제 정보
          rate_code: string | null
          rate_plan_code: string | null
          
          // 타임스탬프
          created_at: string
        }
        Insert: {
          // 기본 식별자
          id?: string
          id_old?: number
          sort_id?: number
          sabre_id: number
          paragon_id?: number
          brand_id?: string | null
          
          // 호텔 기본 정보
          slug: string
          property_name_ko: string
          property_name_en: string
          
          // 위치 정보
          city: string
          city_ko?: string | null
          city_en?: string | null
          country_ko?: string | null
          country_en?: string | null
          continent_ko?: string | null
          continent_en?: string | null
          property_address: string
          destination_sort: string
          location_section?: string | null
          
          // 체인 정보
          chain: string
          chain_en?: string | null
          
          // 링크 및 상세 정보
          link?: string | null
          property_details?: string | null
          
          // 이미지 정보
          image_1?: string
          image_2?: string
          image_3?: string
          image_4?: string
          image_5?: string
          
          // 배지 정보
          badge?: string
          badge_1?: string | null
          badge_2?: string | null
          badge_3?: string | null
          
          // 혜택 정보
          benefit?: string
          benefit_1?: string
          benefit_2?: string
          benefit_3?: string
          benefit_4?: string
          benefit_5?: string
          benefit_6?: string
          benefit_details?: string
          benefit_1_details?: string
          benefit_2_details?: string
          benefit_3_details?: string
          benefit_4_details?: string
          benefit_5_details?: string
          benefit_6_details?: string
          
          // 이벤트 정보
          event_1?: string | null
          event_1_details_1?: string | null
          event_1_details_2?: string | null
          event_1_details_3?: string | null
          event_1_details_4?: string | null
          event_1_details_5?: string | null
          event_2?: string | null
          event_2_details_1?: string | null
          event_2_details_2?: string | null
          event_2_details_3?: string | null
          event_2_details_4?: string | null
          
          // 블로그 정보
          blogs?: string | null
          blogs_s1?: string | null
          blogs_s2?: string | null
          blogs_s3?: string | null
          blogs_s4?: string | null
          blogs_s5?: string | null
          blogs_s6?: string | null
          blogs_s7?: string | null
          
          // 요금제 정보
          rate_code?: string | null
          rate_plan_code?: string | null
          
          // 타임스탬프
          created_at?: string
        }
        Update: {
          // 기본 식별자
          id?: string
          id_old?: number
          sort_id?: number
          sabre_id?: number
          paragon_id?: number
          brand_id?: string | null
          
          // 호텔 기본 정보
          slug?: string
          property_name_kor?: string
          property_name_en?: string
          
          // 위치 정보
          city?: string
          city_ko?: string | null
          city_en?: string | null
          country_kor?: string | null
          country_en?: string | null
          continent_kor?: string | null
          continent_en?: string | null
          property_address?: string
          destination_sort?: string
          location_section?: string | null
          
          // 체인 정보
          chain?: string
          chain_en?: string | null
          
          // 링크 및 상세 정보
          link?: string | null
          property_details?: string | null
          
          // 이미지 정보
          image_1?: string
          image_2?: string
          image_3?: string
          image_4?: string
          image_5?: string
          
          // 배지 정보
          badge?: string
          badge_1?: string | null
          badge_2?: string | null
          badge_3?: string | null
          
          // 혜택 정보
          benefit?: string
          benefit_1?: string
          benefit_2?: string
          benefit_3?: string
          benefit_4?: string
          benefit_5?: string
          benefit_6?: string
          benefit_details?: string
          benefit_1_details?: string
          benefit_2_details?: string
          benefit_3_details?: string
          benefit_4_details?: string
          benefit_5_details?: string
          benefit_6_details?: string
          
          // 이벤트 정보
          event_1?: string | null
          event_1_details_1?: string | null
          event_1_details_2?: string | null
          event_1_details_3?: string | null
          event_1_details_4?: string | null
          event_1_details_5?: string | null
          event_2?: string | null
          event_2_details_1?: string | null
          event_2_details_2?: string | null
          event_2_details_3?: string | null
          event_2_details_4?: string | null
          
          // 블로그 정보
          blogs?: string | null
          blogs_s1?: string | null
          blogs_s2?: string | null
          blogs_s3?: string | null
          blogs_s4?: string | null
          blogs_s5?: string | null
          blogs_s6?: string | null
          blogs_s7?: string | null
          
          // 요금제 정보
          rate_code?: string | null
          rate_plan_code?: string | null
          
          // 타임스탬프
          created_at?: string
        }
      }

      // select_hotel_media: 호텔 미디어 정보 (실제 11개 컬럼)
      select_hotel_media: {
        Row: {
          id: string
          role: string
          media_path: string
          alt_ko: string | null
          alt_en: string | null
          sort_order: number
          is_primary: boolean
          status: string
          created_at: string
          updated_at: string
          sabre_id: string | null
        }
        Insert: {
          id?: string
          role: string
          media_path: string
          alt_ko?: string | null
          alt_en?: string | null
          sort_order?: number
          is_primary?: boolean
          status?: string
          created_at?: string
          updated_at?: string
          sabre_id?: string | null
        }
        Update: {
          id?: string
          role?: string
          media_path?: string
          alt_ko?: string | null
          alt_en?: string | null
          sort_order?: number
          is_primary?: boolean
          status?: string
          created_at?: string
          updated_at?: string
          sabre_id?: string | null
        }
      }

      // select_hotel_benefits: 호텔 혜택 정보 (실제 6개 컬럼)
      select_hotel_benefits: {
        Row: {
          benefit: string
          benefit_description: string
          start_date: string | null
          end_date: string | null
          created_at: string
          benefit_id: number
        }
        Insert: {
          benefit: string
          benefit_description: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          benefit_id?: number
        }
        Update: {
          benefit?: string
          benefit_description?: string
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          benefit_id?: number
        }
      }

      // select_hotel_benefits_map: 호텔-혜택 매핑 (실제 6개 컬럼)
      select_hotel_benefits_map: {
        Row: {
          sabre_id: number
          paragon_id: string | null
          benefit_id: number
          created_at: string
          id: number
          sort: number
        }
        Insert: {
          sabre_id: number
          paragon_id?: string | null
          benefit_id: number
          created_at?: string
          id?: number
          sort?: number
        }
        Update: {
          sabre_id?: number
          paragon_id?: string | null
          benefit_id?: number
          created_at?: string
          id?: number
          sort?: number
        }
      }

      // sabre_rate_plan_codes: Sabre 요금제 코드 (실제 3개 컬럼)
      sabre_rate_plan_codes: {
        Row: {
          id: number
          rate_plan_code: string
          created_at: string
        }
        Insert: {
          id?: number
          rate_plan_code: string
          created_at?: string
        }
        Update: {
          id?: number
          rate_plan_code?: string
          created_at?: string
        }
      }

      // sabre_rate_plan_codes_map: 호텔-Sabre 요금제 매핑 (데이터 없음 - 기본 구조)
      sabre_rate_plan_codes_map: {
        Row: {
          id: number
          hotel_id: number
          rate_plan_code_id: number
          created_at: string
        }
        Insert: {
          id?: number
          hotel_id: number
          rate_plan_code_id: number
          created_at?: string
        }
        Update: {
          id?: number
          hotel_id?: number
          rate_plan_code_id?: number
          created_at?: string
        }
      }

      // select_import_rate: 환율 정보 (실제 3개 컬럼)
      select_import_rate: {
        Row: {
          rate_code: string
          sabre_id: number
          id: string
        }
        Insert: {
          rate_code: string
          sabre_id: number
          id?: string
        }
        Update: {
          rate_code?: string
          sabre_id?: number
          id?: string
        }
      }

      // select_feature_slots: 기능 슬롯 정보 (실제 5개 컬럼)
      select_feature_slots: {
        Row: {
          id: number
          sabre_id: number
          surface: string
          slot_key: string
          created_at: string
        }
        Insert: {
          id?: number
          sabre_id: number
          surface: string
          slot_key: string
          created_at?: string
        }
        Update: {
          id?: number
          sabre_id?: number
          surface?: string
          slot_key?: string
          created_at?: string
        }
      }

      // select_hotel_promotions: 호텔 프로모션 정보
      select_hotel_promotions: {
        Row: {
          promotion_id: number
          promotion: string
          promotion_description: string | null
          booking_date: string | null
          check_in_date: string | null
          created_at: string
        }
        Insert: {
          promotion_id?: number
          promotion: string
          promotion_description?: string | null
          booking_date?: string | null
          check_in_date?: string | null
          created_at?: string
        }
        Update: {
          promotion_id?: number
          promotion?: string
          promotion_description?: string | null
          booking_date?: string | null
          check_in_date?: string | null
          created_at?: string
        }
      }

      // select_hotel_promotions_map: 호텔-프로모션 매핑
      select_hotel_promotions_map: {
        Row: {
          id: number
          sabre_id: number
          promotion_id: number
          created_at: string
        }
        Insert: {
          id?: number
          sabre_id: number
          promotion_id: number
          created_at?: string
        }
        Update: {
          id?: number
          sabre_id?: number
          promotion_id?: number
          created_at?: string
        }
      }

      // hotel_chains: 호텔 체인 정보
      hotel_chains: {
        Row: {
          chain_id: number
          chain_name_en: string
          chain_name_kr?: string | null
          logo_path?: string | null
          description?: string | null
          website?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          chain_id?: number
          chain_name_en: string
          chain_name_kr?: string | null
          logo_path?: string | null
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          chain_id?: number
          chain_name_en?: string
          chain_name_kr?: string | null
          logo_path?: string | null
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // hotel_brands: 호텔 브랜드 정보
      hotel_brands: {
        Row: {
          brand_id: number
          brand_name_en: string
          brand_name_kr?: string | null
          chain_id: number
          logo_path?: string | null
          description?: string | null
          website?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          brand_id?: number
          brand_name_en: string
          brand_name_kr?: string | null
          chain_id: number
          logo_path?: string | null
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          brand_id?: number
          brand_name_en?: string
          brand_name_kr?: string | null
          chain_id?: number
          logo_path?: string | null
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

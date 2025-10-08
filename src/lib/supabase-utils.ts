import { supabase } from './supabase'
import type { Database } from './supabase'

type SelectHotel = Database['public']['Tables']['select_hotels']['Row']
type SelectHotelMedia = Database['public']['Tables']['select_hotel_media']['Row']
type SelectHotelBenefit = Database['public']['Tables']['select_hotel_benefits']['Row']
type SelectHotelBenefitMap = Database['public']['Tables']['select_hotel_benefits_map']['Row']
type SabreRatePlanCode = Database['public']['Tables']['sabre_rate_plan_codes']['Row']
type SabreRatePlanCodeMap = Database['public']['Tables']['sabre_rate_plan_codes_map']['Row']
type SelectImportRate = Database['public']['Tables']['select_import_rate']['Row']

// select_hotels 테이블 관련 함수들
// Supabase 연결 상태 확인
export const supabaseConnectionTest = {
  // 환경변수 확인
  checkEnvironmentVariables(): { url: boolean; anonKey: boolean } {
    const url = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔧 환경변수 확인:')
    console.log('  - NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ 설정됨' : '❌ 설정 안됨')
    console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✅ 설정됨' : '❌ 설정 안됨')
    
    return { url, anonKey }
  },

  // 실제 테이블 구조 확인
  async checkTableStructure(): Promise<void> {
    console.log('🔍 실제 테이블 구조 확인 중...')
    
    // select_hotels 테이블만 먼저 확인
    try {
      console.log('\n🔍 select_hotels 테이블 구조 확인...')
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('❌ select_hotels 테이블 오류:', error.message)
        console.error('❌ 오류 코드:', error.code)
        console.error('❌ 오류 상세:', error.details)
        console.error('❌ 오류 힌트:', error.hint)
      } else if (data && data.length > 0) {
        const firstRecord = data[0]
        console.log('✅ select_hotels 테이블 컬럼들:', Object.keys(firstRecord))
        console.log('📋 select_hotels 첫 번째 레코드:')
        Object.entries(firstRecord).forEach(([key, value]) => {
          console.log(`  - ${key}: ${value} (타입: ${typeof value})`)
        })
      } else {
        console.log('⚠️ select_hotels 테이블에 데이터가 없습니다.')
        
        // 테이블 스키마 정보 확인 시도
        try {
          const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_table_info', { table_name: 'select_hotels' })
          
          if (schemaError) {
            console.log('ℹ️ 테이블 스키마 정보를 가져올 수 없습니다:', schemaError.message)
          } else {
            console.log('📋 테이블 스키마 정보:', schemaData)
          }
        } catch (schemaErr) {
          console.log('ℹ️ 스키마 정보 확인 실패:', schemaErr)
        }
      }
    } catch (err) {
      console.error('❌ select_hotels 테이블 확인 예외:', err)
    }
    
    // 다른 테이블들도 확인
    const otherTables = [
      'select_hotel_media', 
      'select_hotel_benefits',
      'select_hotel_benefits_map',
      'sabre_rate_plan_codes',
      'sabre_rate_plan_codes_map',
      'select_import_rate'
    ]
    
    for (const tableName of otherTables) {
      try {
        console.log(`\n🔍 ${tableName} 테이블 구조 확인...`)
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          console.error(`❌ ${tableName} 테이블 오류:`, error.message)
        } else if (data && data.length > 0) {
          console.log(`✅ ${tableName} 테이블 컬럼들:`, Object.keys(data[0]))
          console.log(`📋 ${tableName} 첫 번째 레코드:`, data[0])
        } else {
          console.log(`⚠️ ${tableName} 테이블에 데이터가 없습니다.`)
        }
      } catch (err) {
        console.error(`❌ ${tableName} 테이블 확인 예외:`, err)
      }
    }
  },

  // Supabase 클라이언트 연결 테스트
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔧 Supabase 연결 테스트 시작...')
      
      // 환경변수 확인
      const envCheck = this.checkEnvironmentVariables()
      if (!envCheck.url || !envCheck.anonKey) {
        return { 
          success: false, 
          error: '환경변수가 설정되지 않았습니다.' 
        }
      }

      // 1단계: 기본 연결 테스트 (health check)
      console.log('🔧 1단계: 기본 연결 테스트...')
      try {
        const { data: healthData, error: healthError } = await supabase
          .from('select_hotels')
          .select('count')
          .limit(0)
        
        console.log('🔧 Health check 결과:', { healthData, healthError })
        
        if (healthError) {
          console.error('❌ Health check 실패:', healthError)
          return { 
            success: false, 
            error: `Health check 실패: ${healthError.message || '알 수 없는 오류'}` 
          }
        }
      } catch (healthErr) {
        console.error('❌ Health check 예외:', healthErr)
        return { 
          success: false, 
          error: `Health check 예외: ${String(healthErr)}` 
        }
      }

      // 2단계: 실제 데이터 조회 테스트
      console.log('🔧 2단계: 데이터 조회 테스트...')
      const { data, error } = await supabase
        .from('select_hotels')
        .select('id')
        .limit(1)

      if (error) {
        console.error('❌ 연결 테스트 실패 객체:', error)
        console.error('❌ 오류 타입:', typeof error)
        console.error('❌ 오류 키들:', Object.keys(error))
        console.error('❌ 오류 값들:', Object.values(error))
        console.error('❌ 오류 JSON:', JSON.stringify(error, null, 2))
        
        // 오류 객체의 모든 속성을 순회하며 로깅
        for (const [key, value] of Object.entries(error)) {
          console.error(`❌ 오류.${key}:`, value, typeof value)
        }
        
        // 안전한 오류 정보 추출
        const errorMessage = error?.message || '알 수 없는 오류'
        
        console.error('❌ 오류 메시지:', errorMessage)
        return { 
          success: false, 
          error: `연결 실패: ${errorMessage}` 
        }
      }

      console.log('✅ Supabase 연결 성공')
      return { success: true }
    } catch (err) {
      console.error('❌ 연결 테스트 예외:', err)
      return { 
        success: false, 
        error: `연결 테스트 중 오류: ${String(err)}` 
      }
    }
  }
}

export const selectHotelUtils = {
  // 모든 select_hotels 조회
  async getAllSelectHotels(): Promise<SelectHotel[]> {
    try {
      console.log('🔍 select_hotels 테이블 조회 시작...')
      
      // 먼저 테이블 구조 확인
      console.log('🔧 테이블 구조 확인 중...')
      const { data: structureData, error: structureError } = await supabase
        .from('select_hotels')
        .select('*')
        .limit(1)
      
      console.log('🔧 테이블 구조 확인 결과:', { structureData, structureError })
      
      if (structureError) {
        console.error('❌ 테이블 구조 확인 오류:', structureError)
        throw new Error(`테이블 구조 확인 오류: ${structureError.message}`)
      }
      
      if (structureData && structureData.length > 0) {
        console.log('🔧 실제 테이블 컬럼들:', Object.keys(structureData[0]))
        console.log('🔧 첫 번째 레코드:', structureData[0])
      }
      
      // 이제 전체 데이터 조회 (정렬 없이)
      const { data, error } = await supabase
        .from('select_hotels')
        .select('*')

      console.log('📊 Supabase 응답:', { data, error })

      if (error) {
        console.error('❌ Supabase 오류 객체:', error)
        console.error('❌ 오류 타입:', typeof error)
        console.error('❌ 오류 키들:', Object.keys(error))
        console.error('❌ 오류 값들:', Object.values(error))
        console.error('❌ 오류 JSON:', JSON.stringify(error, null, 2))
        
        // 오류 객체의 모든 속성을 순회하며 로깅
        for (const [key, value] of Object.entries(error)) {
          console.error(`❌ 오류.${key}:`, value, typeof value)
        }
        
        // 안전한 오류 정보 추출
        const errorCode = error?.code || 'UNKNOWN_CODE'
        const errorMessage = error?.message || '알 수 없는 오류'
        const errorDetails = error?.details || '상세 정보 없음'
        
        console.error('❌ 오류 코드:', errorCode)
        console.error('❌ 오류 메시지:', errorMessage)
        console.error('❌ 오류 상세:', errorDetails)
        
        throw new Error(`Supabase 오류: ${errorCode} - ${errorMessage}`)
      }

      console.log('✅ 조회 성공, 데이터 수:', data?.length || 0)
      return data || []
    } catch (err) {
      console.error('❌ 예외 발생:', err)
      if (err instanceof Error) {
        throw new Error(`select_hotels 조회 실패: ${err.message}`)
      }
      throw new Error(`select_hotels 조회 중 알 수 없는 오류: ${String(err)}`)
    }
  },

  // ID로 select_hotel 조회
  async getSelectHotelById(id: number): Promise<SelectHotel | null> {
    const { data, error } = await supabase
      .from('select_hotels')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    
    if (error) {
      console.error('Error fetching select_hotel by id:', error)
      throw error
    }
    
    // publish가 false면 null 반환
    if (data && data.publish === false) {
      return null
    }
    
    return data
  },

  // 브랜드별 select_hotels 조회
  async getSelectHotelsByBrand(brandName: string): Promise<SelectHotel[]> {
    const { data, error } = await supabase
      .from('select_hotels')
      .select('*')
      .ilike('property_name_kor', `%${brandName}%`)
      .order('property_name_kor')
    
    if (error) {
      console.error('Error fetching select_hotels by brand:', error)
      throw error
    }
    
    // 클라이언트에서 publish 필터링 (false 제외)
    return (data || []).filter((h: any) => h.publish !== false)
  },

  // 도시별 select_hotels 조회
  async getSelectHotelsByLocation(location: string): Promise<SelectHotel[]> {
    const { data, error } = await supabase
      .from('select_hotels')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('property_name_kor')
    
    if (error) {
      console.error('Error fetching select_hotels by location:', error)
      throw error
    }
    
    // 클라이언트에서 publish 필터링 (false 제외)
    return (data || []).filter((h: any) => h.publish !== false)
  },

  // select_hotels 검색
  async searchSelectHotels(query: string): Promise<SelectHotel[]> {
    const { data, error } = await supabase
      .from('select_hotels')
      .select('*')
      .or(`property_name_kor.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
      .order('property_name_kor')
    
    if (error) {
      console.error('Error searching select_hotels:', error)
      throw error
    }
    
    // 클라이언트에서 publish 필터링 (false 제외)
    return (data || []).filter((h: any) => h.publish !== false)
  },

  // select_hotels 테이블 존재 여부 확인
  async checkSelectHotelsTable(): Promise<boolean> {
    try {
      console.log('🔍 select_hotels 테이블 존재 여부 확인 중...')
      
      const { data, error } = await supabase
        .from('select_hotels')
        .select('id')
        .limit(1)

      console.log('📊 테이블 확인 응답:', { data, error })

      if (error) {
        console.error('❌ 테이블 확인 오류 객체:', error)
        console.error('❌ 오류 타입:', typeof error)
        console.error('❌ 오류 키들:', Object.keys(error))
        console.error('❌ 오류 값들:', Object.values(error))
        console.error('❌ 오류 JSON:', JSON.stringify(error, null, 2))
        
        // 오류 객체의 모든 속성을 순회하며 로깅
        for (const [key, value] of Object.entries(error)) {
          console.error(`❌ 오류.${key}:`, value, typeof value)
        }
        
        // 안전한 오류 정보 추출
        const errorCode = error?.code || 'UNKNOWN_CODE'
        const errorMessage = error?.message || '알 수 없는 오류'
        
        console.error('❌ 오류 코드:', errorCode)
        console.error('❌ 오류 메시지:', errorMessage)
        return false
      }

      console.log('✅ 테이블 존재 확인 성공')
      return true
    } catch (error) {
      console.error('❌ 테이블 확인 예외:', error)
      return false
    }
  }
}

// select_hotel_media 관련 함수들
export const selectHotelMediaUtils = {
  // 호텔별 미디어 조회
  async getHotelMediaByHotelId(hotelId: number): Promise<SelectHotelMedia[]> {
    const { data, error } = await supabase
      .from('select_hotel_media')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // 호텔의 주요 이미지 조회
  async getHotelPrimaryImage(hotelId: number): Promise<SelectHotelMedia | null> {
    const { data, error } = await supabase
      .from('select_hotel_media')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('is_primary', true)
      .eq('media_type', 'image')
      .single()
    
    if (error) throw error
    return data
  }
}

// select_hotel_benefits 관련 함수들
export const selectHotelBenefitsUtils = {
  // 모든 혜택 조회
  // 주의: select_hotel_benefits 테이블에서 benefit_description 대신 benefit 컬럼을 사용해야 합니다.
  async getAllBenefits(): Promise<SelectHotelBenefit[]> {
    const { data, error } = await supabase
      .from('select_hotel_benefits')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // 카테고리별 혜택 조회
  // 주의: select_hotel_benefits 테이블에서 benefit_description 대신 benefit 컬럼을 사용해야 합니다.
async getBenefitsByCategory(category: string): Promise<SelectHotelBenefit[]> {
    const { data, error } = await supabase
      .from('select_hotel_benefits')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }
}

// select_hotel_benefits_map 관련 함수들
export const selectHotelBenefitsMapUtils = {
  // 호텔별 혜택 조회
  // 주의: select_hotel_benefits 테이블에서 benefit_description 대신 benefit 컬럼을 사용해야 합니다.
  async getHotelBenefits(sabreId: number): Promise<SelectHotelBenefitMap[]> {
    const { data, error } = await supabase
      .from('select_hotel_benefits_map')
      .select(`
        *,
        select_hotel_benefits (
          benefit,
          benefit_description,
          start_date,
          end_date
        )
      `)
      .eq('sabre_id', sabreId)
      .order('sort')
    
    if (error) throw error
    return data || []
  }
}

// sabre_rate_plan_codes 관련 함수들
export const sabreRatePlanCodesUtils = {
  // 모든 요금제 코드 조회
  async getAllRatePlanCodes(): Promise<SabreRatePlanCode[]> {
    const { data, error } = await supabase
      .from('sabre_rate_plan_codes')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // 카테고리별 요금제 코드 조회
  async getRatePlanCodesByCategory(category: string): Promise<SabreRatePlanCode[]> {
    const { data, error } = await supabase
      .from('sabre_rate_plan_codes')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')
    
    if (error) throw error
    return data || []
  }
}

// sabre_rate_plan_codes_map 관련 함수들
export const sabreRatePlanCodesMapUtils = {
  // 호텔별 요금제 조회
  async getHotelRatePlans(hotelId: number): Promise<SabreRatePlanCodeMap[]> {
    const { data, error } = await supabase
      .from('sabre_rate_plan_codes_map')
      .select(`
        *,
        sabre_rate_plan_codes (
          code,
          name,
          description,
          category
        )
      `)
      .eq('hotel_id', hotelId)
      .eq('is_available', true)
    
    if (error) throw error
    return data || []
  }
}

// select_import_rate 관련 함수들
export const selectImportRateUtils = {
  // 현재 환율 조회
  async getCurrentExchangeRate(fromCurrency: string, toCurrency: string): Promise<SelectImportRate | null> {
    const { data, error } = await supabase
      .from('select_import_rate')
      .select('*')
      .eq('from_currency', fromCurrency)
      .eq('to_currency', toCurrency)
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single()
    
    if (error) throw error
    return data
  },

  // 모든 활성 환율 조회
  async getAllActiveExchangeRates(): Promise<SelectImportRate[]> {
    const { data, error } = await supabase
      .from('select_import_rate')
      .select('*')
      .eq('is_active', true)
      .order('effective_date', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

// 인증 관련 함수들
export const authUtils = {
  // 이메일/비밀번호로 로그인
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // 이메일/비밀번호로 회원가입
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 현재 사용자 정보 가져오기
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    return user
  },

  // 세션 상태 변경 감지
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

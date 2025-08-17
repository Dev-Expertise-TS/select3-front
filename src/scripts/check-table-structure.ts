import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function checkTableStructure() {
  console.log('🔍 select_hotels 테이블 구조 확인 중...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // 1. 테이블에서 데이터 조회
    const { data, error } = await supabase
      .from('select_hotels')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ 테이블 조회 오류:', error)
      return
    }
    
    if (data && data.length > 0) {
      const firstRecord = data[0]
      console.log('\n✅ select_hotels 테이블 컬럼 구조:')
      console.log('=' * 50)
      
      // 각 컬럼의 타입과 값 분석
      Object.entries(firstRecord).forEach(([key, value]) => {
        const type = typeof value
        const isNull = value === null
        const typeInfo = isNull ? 'null' : type
        
        console.log(`${key}: ${typeInfo}${isNull ? '' : ` (${value})`}`)
      })
      
      console.log('\n📋 TypeScript 타입 정의:')
      console.log('=' * 50)
      
      // TypeScript 타입 정의 생성
      const typeDefinition = Object.entries(firstRecord).map(([key, value]) => {
        const type = typeof value
        if (value === null) {
          return `  ${key}: string | null  // null 값이므로 string | null로 추정`
        }
        
        switch (type) {
          case 'string':
            return `  ${key}: string`
          case 'number':
            return `  ${key}: number`
          case 'boolean':
            return `  ${key}: boolean`
          case 'object':
            if (Array.isArray(value)) {
              return `  ${key}: any[]  // 배열 타입 - 구체적인 타입 확인 필요`
            }
            return `  ${key}: any  // 객체 타입 - 구체적인 타입 확인 필요`
          default:
            return `  ${key}: any  // 알 수 없는 타입`
        }
      }).join('\n')
      
      console.log(typeDefinition)
      
      // 전체 레코드 수 확인
      const { count } = await supabase
        .from('select_hotels')
        .select('*', { count: 'exact', head: true })
      
      console.log(`\n📊 테이블 정보:`)
      console.log(`- 총 레코드 수: ${count || 0}`)
      console.log(`- 컬럼 수: ${Object.keys(firstRecord).length}`)
      
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다.')
    }
    
  } catch (err) {
    console.error('❌ 스크립트 실행 오류:', err)
  }
}

// 스크립트 실행
checkTableStructure()

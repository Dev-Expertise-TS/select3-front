import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// .env.local 파일 로드
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function checkHotelMedia() {
  console.log('🔍 select_hotel_media 테이블 구조 및 데이터 확인 중...')
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  try {
    // 1. 테이블에서 데이터 조회
    const { data, error } = await supabase
      .from('select_hotel_media')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ 테이블 조회 오류:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('\n✅ select_hotel_media 테이블 데이터:')
      console.log('=' * 60)
      
      data.forEach((record, index) => {
        console.log(`\n📋 레코드 ${index + 1}:`)
        Object.entries(record).forEach(([key, value]) => {
          const type = typeof value
          const isNull = value === null
          const typeInfo = isNull ? 'null' : type
          
          if (key === 'media_path') {
            console.log(`  ${key}: ${typeInfo}${isNull ? '' : `\n    URL: ${value}`}`)
          } else {
            console.log(`  ${key}: ${typeInfo}${isNull ? '' : ` (${value})`}`)
          }
        })
      })
      
      // 2. 프로모션 호텔과 연결된 미디어 확인
      console.log('\n🔗 프로모션 호텔과 연결된 미디어 확인:')
      console.log('=' * 60)
      
      // select_feature_slots에서 프로모션 sabre_id 조회
      const { data: featureSlots, error: featureError } = await supabase
        .from('select_feature_slots')
        .select('sabre_id')
        .eq('surface', '프로모션')
      
      if (featureError) {
        console.error('❌ feature_slots 조회 오류:', featureError)
        return
      }
      
      if (featureSlots && featureSlots.length > 0) {
        const sabreIds = featureSlots.map(slot => slot.sabre_id)
        console.log('프로모션 sabre_ids:', sabreIds)
        
        // 해당 sabre_id의 미디어 조회
        const { data: promotionMedia, error: mediaError } = await supabase
          .from('select_hotel_media')
          .select('*')
          .in('sabre_id', sabreIds)
        
        if (mediaError) {
          console.error('❌ 프로모션 미디어 조회 오류:', mediaError)
          return
        }
        
        if (promotionMedia && promotionMedia.length > 0) {
          console.log('\n📸 프로모션 호텔 미디어:')
          promotionMedia.forEach((media, index) => {
            console.log(`\n  미디어 ${index + 1}:`)
            console.log(`    sabre_id: ${media.sabre_id}`)
            console.log(`    media_path: ${media.media_path}`)
            console.log(`    is_primary: ${media.is_primary}`)
            console.log(`    role: ${media.role}`)
          })
        } else {
          console.log('⚠️ 프로모션 호텔에 연결된 미디어가 없습니다.')
        }
      } else {
        console.log('⚠️ 프로모션 surface가 설정된 feature_slots가 없습니다.')
      }
      
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다.')
    }
    
  } catch (err) {
    console.error('❌ 스크립트 실행 오류:', err)
  }
}

// 스크립트 실행
checkHotelMedia()

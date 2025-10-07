import { AI_CONFIG, getCurrentModel, formatPrompt } from '@/config/ai-config';

interface RoomInfo {
  roomType: string;
  roomName: string;
  description: string;
  hotelName?: string;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 영어 텍스트를 한국어로 변환하는 헬퍼 함수
function translateToKorean(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  const translations: { [key: string]: string } = {
    // 객실 타입
    'Deluxe Room': '디럭스 룸',
    'Standard Room': '스탠다드 룸',
    'Suite': '스위트',
    'Executive Room': '이그제큐티브 룸',
    'Presidential Suite': '프레지덴셜 스위트',
    'Deluxe': '디럭스',
    'Standard': '스탠다드',
    'Executive': '이그제큐티브',
    'Presidential': '프레지덴셜',
    
    // 객실 특징
    'KING': '킹',
    'QUEEN': '퀸',
    'TWIN': '트윈',
    'DOUBLE': '더블',
    'SINGLE': '싱글',
    '1 KING': '킹 1개',
    '2 TWIN': '트윈 2개',
    
    // 편의시설
    'CLUB AMENITIES': '클럽 편의시설',
    'FREE WIRED INTERNET': '무료 유선 인터넷',
    'WI-FI ACCESS': 'Wi-Fi 접속',
    'FREE BREAKFAST': '무료 조식',
    'ROOM SERVICE': '룸 서비스',
    'FREE WIRED': '무료 유선',
    'INTERNET': '인터넷',
    'WI-FI': 'Wi-Fi',
    'ACCESS': '접속',
    
    // 객실 크기
    'SQM': '제곱미터',
    'SQ FT': '제곱피트',
    '42 SQM': '42제곱미터',
    
    // 일반적인 영어 표현
    'BOOK EARLY AND SAVE': '얼리버드 할인',
    'HORIZON': '호라이즌',
    'OCEAN VIEW': '오션뷰',
    'CITY VIEW': '시티뷰',
    'GARDEN VIEW': '가든뷰',
    'MOUNTAIN VIEW': '마운틴뷰',
    'POOL VIEW': '풀뷰',
    'BEACH VIEW': '비치뷰',
    
    // 추가 변환 규칙
    'BOOK': '예약',
    'EARLY': '얼리',
    'SAVE': '할인',
    'AND': '및',
    'FREE': '무료',
    'WIRED': '유선',
    'CLUB': '클럽',
    'AMENITIES': '편의시설',
    
    // 새로운 번역 규칙 추가
    'TOWER WING': '타워 윙',
    'TOWER': '타워',
    'WING': '윙',
    'MAX OCC': '최대 수용 인원',
    'MAX': '최대',
    'OCC': '수용 인원',
    '2A2C': '성인 2명, 어린이 2명',
    '2A': '성인 2명',
    '2C': '어린이 2명',
    '1A': '성인 1명',
    '1C': '어린이 1명',
    'OR': '또는',
    'POOLVIEW': '풀뷰',
    'CITY': '시티',
    'VIEW': '뷰'
  };
  
  let translatedText = text;
  
  // 영어 텍스트를 한국어로 변환 (긴 텍스트부터 처리)
  const sortedKeys = Object.keys(translations).sort((a, b) => b.length - a.length);
  
  sortedKeys.forEach(english => {
    const regex = new RegExp(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translatedText = translatedText.replace(regex, translations[english]);
  });
  
  // 남은 영어 단어들을 한국어로 변환 (대략적인 변환)
  translatedText = translatedText
    .replace(/\b[A-Z]{2,}\b/g, (match) => {
      // 대문자로만 된 단어들을 한국어로 변환
      const commonWords: { [key: string]: string } = {
        'ROOM': '룸',
        'VIEW': '뷰',
        'SIZE': '사이즈',
        'TYPE': '타입',
        'PLAN': '플랜',
        'RATE': '요금',
        'CODE': '코드',
        'KEY': '키'
      };
      return commonWords[match] || match;
    });
  
  console.log(`🔄 영어 변환: "${text}" → "${translatedText}"`);
  return translatedText;
}

// 최후의 수단: 남은 영어 텍스트를 강제로 한국어로 변환
function forceKoreanTranslation(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // 대문자 영어 단어들을 한국어로 변환
  let result = text.replace(/\b[A-Z]{2,}\b/g, (match) => {
    const forceTranslations: { [key: string]: string } = {
      'DELUXE': '디럭스',
      'ROOM': '룸',
      'BOOK': '예약',
      'EARLY': '얼리',
      'SAVE': '할인',
      'HORIZON': '호라이즌',
      'KING': '킹',
      'CLUB': '클럽',
      'AMENITIES': '편의시설',
      'FREE': '무료',
      'WIRED': '유선',
      'INTERNET': '인터넷',
      'WI-FI': 'Wi-Fi',
      'ACCESS': '접속',
      'SQM': '제곱미터',
      'VIEW': '뷰',
      'SIZE': '사이즈',
      'TYPE': '타입',
      'PLAN': '플랜',
      'RATE': '요금',
      'CODE': '코드',
      'KEY': '키',
      'TOWER': '타워',
      'WING': '윙',
      'MAX': '최대',
      'OCC': '수용 인원',
      'OR': '또는',
      'POOLVIEW': '풀뷰',
      'CITY': '시티'
    };
    
    return forceTranslations[match] || match;
  });
  
  // 특수 패턴 처리
  result = result
    .replace(/BOOK EARLY AND SAVE/g, '얼리버드 할인')
    .replace(/CLUB AMENITIES/g, '클럽 편의시설')
    .replace(/FREE WIRED INTERNET/g, '무료 유선 인터넷')
    .replace(/WI-FI ACCESS/g, 'Wi-Fi 접속')
    .replace(/(\d+) SQM/g, '$1제곱미터')
    .replace(/(\d+) KING/g, '킹 $1개')
    .replace(/(\d+) TWIN/g, '트윈 $1개')
    .replace(/TOWER WING/g, '타워 윙')
    .replace(/MAX OCC (\d+)A(\d+)C/g, '최대 수용 인원 성인 $1명, 어린이 $2명')
    .replace(/MAX OCC (\d+)A/g, '최대 수용 인원 성인 $1명')
    .replace(/(\d+)A(\d+)C/g, '성인 $1명, 어린이 $2명')
    .replace(/(\d+)A/g, '성인 $1명')
    .replace(/(\d+)C/g, '어린이 $1명');
  
  console.log(`🔨 강제 한국어 변환: "${text}" → "${result}"`);
  return result;
}

// 글로벌 호텔 OTA 스타일 객실명 생성 함수
export async function generateGlobalOTAStyleRoomName(roomType: string, roomName: string, description: string, hotelName: string): Promise<string> {
  console.log('🏨 generateGlobalOTAStyleRoomName 호출됨:', { roomType, roomName, description, hotelName })
  
  try {
    const systemPrompt = AI_CONFIG.PROMPTS.ROOM_NAME.SYSTEM;
    
    const userPrompt = formatPrompt(AI_CONFIG.PROMPTS.ROOM_NAME.USER_TEMPLATE, {
      hotelName,
      description
    });

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const currentModel = getCurrentModel();
    
    console.log('📤 객실 타입 추출 OpenAI API 요청:', { messages, model: currentModel })

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: currentModel,
        max_completion_tokens: 100,
        temperature: AI_CONFIG.API.TEMPERATURE,
        stream: AI_CONFIG.API.STREAM
      }),
    });

    console.log('📥 객실 타입 추출 OpenAI API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 객실 타입 추출 OpenAI API 오류 응답:', errorText)
      
      // API 키 관련 오류인 경우 더 자세한 정보 제공
      if (response.status === 401) {
        console.error('🔑 OpenAI API 키 인증 실패 - API 키를 확인해주세요.');
        throw new Error(`OpenAI API 키 인증 실패 (401): API 키가 유효하지 않거나 만료되었습니다.`);
      }
      
      // 503 서비스 이용 불가 오류 처리
      if (response.status === 503) {
        console.error('🚫 OpenAI API 서비스 일시적 이용 불가 (503)');
        throw new Error(`OpenAI API 서비스 일시적 이용 불가 (503): 네트워크 연결 문제 또는 서버 과부하입니다. 잠시 후 다시 시도해주세요.`);
      }
      
      // 429 요청 한도 초과 오류 처리
      if (response.status === 429) {
        console.error('⏰ OpenAI API 요청 한도 초과 (429)');
        throw new Error(`OpenAI API 요청 한도 초과 (429): API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.`);
      }
      
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 객실 타입 추출 OpenAI API 응답 데이터:', data)
    
    const content = data.choices?.[0]?.message?.content
    console.log('📝 추출된 객실 타입:', content)
    
    if (content) {
      // 불필요한 문자 제거 및 정리
      let cleanedContent = content.trim()
        .replace(/\([^)]*\)/g, '') // 괄호와 괄호 안의 내용 제거
        .replace(/\d+자/g, '') // "12자" 같은 글자 수 표시 제거
        .replace(/\d+개/g, '') // "2개" 같은 개수 표시 제거
        .replace(/[0-9]/g, '') // 모든 숫자 제거
        .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글과 영문, 공백만 유지)
        .replace(/\s+/g, ' ') // 연속된 공백을 하나로
        .trim()
      
      // 15자 이내로 제한
      const finalRoomType = cleanedContent.substring(0, 15) || '디럭스';
      console.log('✂️ 최종 객실 타입 (정리 후):', finalRoomType)
      
      return finalRoomType;
    }
    
    return '디럭스';
  } catch (error) {
    console.error('❌ 객실 타입 추출 오류:', error);
    // 오류 발생 시 기본 객실 타입 반환
    const fallback = roomType && roomType !== 'N/A' ? roomType.substring(0, 15) : '객실';
    console.log('🔄 fallback 객실 타입 사용:', fallback)
    return fallback;
  }
}

// 베드 구성 해석 함수
export async function interpretBedType(description: string, roomName: string): Promise<string> {
  console.log('🛏️ interpretBedType 호출됨:', { description, roomName })
  
  try {
    const systemPrompt = AI_CONFIG.PROMPTS.BED_TYPE.SYSTEM;
    
    const userPrompt = formatPrompt(AI_CONFIG.PROMPTS.BED_TYPE.USER_TEMPLATE, {
      description
    });

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log('📤 베드 구성 해석 OpenAI API 요청:', { messages, model: getCurrentModel() })

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
              body: JSON.stringify({
          messages,
          model: getCurrentModel(),
          max_completion_tokens: 50,
          temperature: AI_CONFIG.API.TEMPERATURE,
          stream: AI_CONFIG.API.STREAM
        }),
    });

    console.log('📥 베드 구성 해석 OpenAI API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 베드 구성 해석 OpenAI API 오류 응답:', errorText)
      
      // API 키 관련 오류인 경우 더 자세한 정보 제공
      if (response.status === 401) {
        console.error('🔑 OpenAI API 키 인증 실패 - API 키를 확인해주세요.');
        throw new Error(`OpenAI API 키 인증 실패 (401): API 키가 유효하지 않거나 만료되었습니다.`);
      }
      
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 베드 구성 해석 OpenAI API 응답 데이터:', data)
    
    const content = data.choices?.[0]?.message?.content
    console.log('📝 생성된 베드 구성:', content)
    
    if (content) {
      // 불필요한 문자 제거 및 정리
      let cleanedContent = content.trim()
        .replace(/\([^)]*\)/g, '') // 괄호와 괄호 안의 내용 제거
        .replace(/\d+개/g, '') // "2개" 같은 개수 표시 제거
        .replace(/\d+자/g, '') // "5자" 같은 글자 수 표시 제거
        .replace(/[0-9]/g, '') // 모든 숫자 제거
        .replace(/베드/g, '') // "베드" 단어 제거
        .replace(/침대/g, '') // "침대" 단어 제거
        .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거 (한글과 영문, 공백만 유지)
        .replace(/\s+/g, ' ') // 연속된 공백을 하나로
        .trim()
      
      // 8자 이내로 제한
      const finalBedType = cleanedContent.substring(0, 8) || '킹';
      console.log('✂️ 최종 베드 구성 (정리 후):', finalBedType)
      
      return finalBedType;
    }
    
    return '킹';
  } catch (error) {
    console.error('❌ 베드 구성 해석 오류:', error);
    // 오류 발생 시 기본 베드 구성 반환
    const fallback = '정보 없음';
    console.log('🔄 fallback 베드 구성 사용:', fallback)
    return fallback;
  }
}

export async function generateRoomIntroduction(roomInfo: RoomInfo, hotelName: string): Promise<string> {
  console.log('🔍 generateRoomIntroduction 호출됨:', { roomInfo, hotelName })
  
  // 입력 데이터 전처리: Description만 참조하여 한국어로 변환
  const processedDescription = forceKoreanTranslation(translateToKorean(roomInfo.description));
  
  console.log('🔄 전처리된 객실 설명:', processedDescription)
  
  try {
    const systemPrompt = AI_CONFIG.PROMPTS.ROOM_INTRODUCTION.SYSTEM;
    
    const userPrompt = formatPrompt(AI_CONFIG.PROMPTS.ROOM_INTRODUCTION.USER_TEMPLATE, {
      hotelName: hotelName || '',
      description: processedDescription,
      originalDescription: roomInfo.description
    });

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const currentModel = getCurrentModel();
    
    console.log('📤 OpenAI API 요청:', { 
      messages, 
      model: currentModel,
      requestBody: {
        messages,
        model: currentModel,
        max_completion_tokens: AI_CONFIG.API.MAX_TOKENS,
        temperature: AI_CONFIG.API.TEMPERATURE,
        stream: AI_CONFIG.API.STREAM
      }
    })

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: currentModel,
        max_completion_tokens: AI_CONFIG.API.MAX_TOKENS,
        temperature: AI_CONFIG.API.TEMPERATURE,
        stream: AI_CONFIG.API.STREAM
      }),
    });

    console.log('📥 OpenAI API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API 오류 응답:', errorText)
      
      // API 키 관련 오류인 경우 더 자세한 정보 제공
      if (response.status === 401) {
        console.error('🔑 OpenAI API 키 인증 실패 - API 키를 확인해주세요.');
        throw new Error(`OpenAI API 키 인증 실패 (401): API 키가 유효하지 않거나 만료되었습니다.`);
      }
      
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API 응답 데이터:', data)
    
    const content = data.choices?.[0]?.message?.content
    console.log('📝 생성된 소개문:', content)
    
    // AI 응답 후처리: 영어 텍스트나 원본 텍스트가 포함된 경우 강제로 한국어 변환
    if (content) {
      let processedContent = content;
      
      // 원본 Description이 포함된 경우 제거
      if (roomInfo.description && content.includes(roomInfo.description)) {
        console.log('⚠️ 원본 Description이 포함됨, 제거 처리');
        processedContent = content.replace(roomInfo.description, '');
      }
      
      // 영어 단어가 남아있는 경우 강제 한국어 변환
      if (/\b[A-Z]{2,}\b/.test(processedContent)) {
        console.log('⚠️ 영어 단어가 남아있음, 강제 한국어 변환');
        processedContent = forceKoreanTranslation(processedContent);
      }
      
      // 최종 결과가 너무 짧거나 의미없는 경우 fallback 사용
      if (processedContent.trim().length < 10) {
        console.log('⚠️ 생성된 소개문이 너무 짧음, fallback 사용');
        processedContent = `${roomInfo.description ? forceKoreanTranslation(roomInfo.description) : '편안하고 아늑한 분위기'}의 객실입니다.`;
      }
      
      console.log('🔧 후처리된 최종 소개문:', processedContent);
      return processedContent;
    }
    
    return '객실 소개를 생성할 수 없습니다.';
  } catch (error) {
    console.error('❌ OpenAI API 호출 오류:', error);
    // 오류 발생 시 기본 소개문 반환 (Description만 참조)
    const fallback = `${roomInfo.description || '편안한 숙박을 제공하는'} 객실입니다.`;
    console.log('🔄 fallback 소개문 사용:', fallback)
    return fallback;
  }
}

export async function generateRoomIntroductionBatch(
  rooms: RoomInfo[], 
  hotelName: string
): Promise<Map<string, string>> {
  console.log('🔍 generateRoomIntroductionBatch 호출됨:', { roomsCount: rooms.length, hotelName })
  
  const introductions = new Map<string, string>();
  
  // 병렬로 처리하되 API 호출 제한을 위해 배치 크기 제한
  const batchSize = 3;
  console.log(`📦 배치 크기: ${batchSize}, 총 ${rooms.length}개 객실 처리`)
  
  for (let i = 0; i < rooms.length; i += batchSize) {
    const batch = rooms.slice(i, i + batchSize);
    console.log(`🔄 배치 ${Math.floor(i/batchSize) + 1} 처리 중:`, batch.map(r => r.roomName))
    
    const promises = batch.map(async (room) => {
      const key = `${room.roomType}-${room.roomName}`;
      console.log(`📝 객실 소개 생성 중: ${key}`)
      const introduction = await generateRoomIntroduction(room, hotelName);
      return { key, introduction };
    });
    
    const results = await Promise.all(promises);
    results.forEach(({ key, introduction }) => {
      introductions.set(key, introduction);
      console.log(`✅ ${key} 소개문 생성 완료:`, introduction.substring(0, 50) + '...')
    });
    
    // API 호출 간격 조절
    if (i + batchSize < rooms.length) {
      console.log('⏳ 다음 배치 전 대기 중...')
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('🏁 모든 객실 소개 생성 완료:', introductions.size, '개')
  return introductions;
}

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
    'KING': '킹 사이즈',
    'QUEEN': '퀸 사이즈',
    'TWIN': '트윈',
    'DOUBLE': '더블',
    'SINGLE': '싱글',
    '1 KING': '킹 사이즈 1개',
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
    'AMENITIES': '편의시설'
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
      'KEY': '키'
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
    .replace(/(\d+) KING/g, '킹 사이즈 $1개')
    .replace(/(\d+) TWIN/g, '트윈 $1개');
  
  console.log(`🔨 강제 한국어 변환: "${text}" → "${result}"`);
  return result;
}

// Trip.com 스타일 객실명 생성 함수
export async function generateTripStyleRoomName(roomType: string, roomName: string, description: string, hotelName: string): Promise<string> {
  console.log('🏨 generateTripStyleRoomName 호출됨:', { roomType, roomName, description, hotelName })
  
  try {
    const systemPrompt = `당신은 Trip.com과 같은 여행사 플랫폼의 호텔 객실명 작명 전문가입니다.
주어진 객실 정보를 바탕으로 매력적이고 간결한 객실명을 **한국어로만** 작성해주세요.

작성 규칙:
1. **15자 이내**로 간결하게 작성
2. Trip.com 스타일의 매력적인 객실명
3. 객실 타입, 객실명, 설명의 핵심 특징을 반영
4. 고객이 선택하고 싶게 만드는 표현
5. **절대 영어를 사용하지 마세요**
6. **100% 한국어로만 작성**

**Trip.com 스타일 예시:**
- "디럭스 킹룸" (8자)
- "프리미엄 스위트" (9자)
- "오션뷰 디럭스" (9자)
- "클럽 플로어 킹" (10자)
- "패밀리 트윈룸" (10자)`;

    const userPrompt = `호텔명: ${hotelName}
객실 타입: ${roomType}
객실명: ${roomName}
설명: ${description}

위 정보를 바탕으로 Trip.com 스타일의 매력적인 객실명을 15자 이내로 작성해주세요.

**중요 요구사항:**
- 15자 이내로 간결하게
- Trip.com과 같은 여행사 플랫폼 스타일
- 객실의 특징과 장점을 부각
- **절대 영어를 사용하지 마세요**
- **100% 한국어로만 작성**

**원본 영어 데이터 (참고용):**
- 객실 타입: ${roomType}
- 객실명: ${roomName}
- 설명: ${description}

이 영어 데이터를 한국어로 번역하여 Trip.com 스타일의 객실명을 만들어주세요.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log('📤 Trip.com 스타일 객실명 OpenAI API 요청:', { messages, model: 'gpt-4o' })

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'gpt-4o',
        max_completion_tokens: 100,
        temperature: 0.7,
        stream: false
      }),
    });

    console.log('📥 Trip.com 스타일 객실명 OpenAI API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Trip.com 스타일 객실명 OpenAI API 오류 응답:', errorText)
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Trip.com 스타일 객실명 OpenAI API 응답 데이터:', data)
    
    const content = data.choices?.[0]?.message?.content
    console.log('📝 생성된 Trip.com 스타일 객실명:', content)
    
    // 15자 이내로 제한
    const finalRoomName = content ? content.trim().substring(0, 15) : '객실명 생성 실패';
    console.log('✂️ 최종 Trip.com 스타일 객실명 (15자 제한):', finalRoomName)
    
    return finalRoomName;
  } catch (error) {
    console.error('❌ Trip.com 스타일 객실명 생성 오류:', error);
    // 오류 발생 시 기본 객실명 반환
    const fallback = roomType && roomType !== 'N/A' ? roomType.substring(0, 15) : '객실';
    console.log('🔄 fallback 객실명 사용:', fallback)
    return fallback;
  }
}

// 베드 타입 해석 함수
export async function interpretBedType(description: string, roomName: string): Promise<string> {
  console.log('🛏️ interpretBedType 호출됨:', { description, roomName })
  
  try {
    const systemPrompt = `당신은 호텔 객실의 침대 타입을 해석하는 전문가입니다.
주어진 객실 설명과 객실명을 바탕으로 침대 타입을 **한국어로만** 간결하게 작성해주세요.

작성 규칙:
1. **10자 이내**로 간결하게 작성
2. 침대 타입과 개수를 명확하게 표시
3. **절대 영어를 사용하지 마세요**
4. **100% 한국어로만 작성**

**침대 타입 예시:**
- "킹 1개" (5자)
- "트윈 2개" (5자)
- "더블 1개" (6자)
- "킹+트윈" (6자)
- "킹 1개+소파" (9자)`;

    const userPrompt = `객실명: ${roomName}
설명: ${description}

위 정보를 바탕으로 침대 타입을 10자 이내로 작성해주세요.

**중요 요구사항:**
- 10자 이내로 간결하게
- 침대 타입과 개수를 명확하게
- **절대 영어를 사용하지 마세요**
- **100% 한국어로만 작성**

**원본 영어 데이터 (참고용):**
- 객실명: ${roomName}
- 설명: ${description}

이 영어 데이터를 한국어로 번역하여 침대 타입을 만들어주세요.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log('📤 베드 타입 해석 OpenAI API 요청:', { messages, model: 'gpt-4o' })

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: 'gpt-4o',
        max_completion_tokens: 50,
        temperature: 0.7,
        stream: false
      }),
    });

    console.log('📥 베드 타입 해석 OpenAI API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 베드 타입 해석 OpenAI API 오류 응답:', errorText)
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ 베드 타입 해석 OpenAI API 응답 데이터:', data)
    
    const content = data.choices?.[0]?.message?.content
    console.log('📝 생성된 베드 타입:', content)
    
    // 10자 이내로 제한
    const finalBedType = content ? content.trim().substring(0, 10) : '베드 타입 해석 실패';
    console.log('✂️ 최종 베드 타입 (10자 제한):', finalBedType)
    
    return finalBedType;
  } catch (error) {
    console.error('❌ 베드 타입 해석 오류:', error);
    // 오류 발생 시 기본 베드 타입 반환
    const fallback = '베드 정보 없음';
    console.log('🔄 fallback 베드 타입 사용:', fallback)
    return fallback;
  }
}

export async function generateRoomIntroduction(roomInfo: RoomInfo, hotelName: string): Promise<string> {
  console.log('🔍 generateRoomIntroduction 호출됨:', { roomInfo, hotelName })
  
  // 입력 데이터 전처리: 영어를 한국어로 변환 (2단계)
  const processedRoomInfo = {
    roomType: forceKoreanTranslation(translateToKorean(roomInfo.roomType)),
    roomName: forceKoreanTranslation(translateToKorean(roomInfo.roomName)),
    description: forceKoreanTranslation(translateToKorean(roomInfo.description))
  };
  
  console.log('🔄 전처리된 객실 정보:', processedRoomInfo)
  
  try {
    const systemPrompt = `당신은 호텔 객실 소개 전문가입니다. 
주어진 객실 정보를 바탕으로 매력적이고 상세한 객실 소개를 **100% 한국어로만** 작성해주세요.

작성 규칙:
1. 객실 타입, 객실명, 설명을 종합하여 자연스러운 소개문 작성
2. 호텔의 브랜드 이미지와 일치하는 톤앤매너 사용
3. 객실의 특징과 장점을 부각
4. 2-3문장으로 간결하게 작성
5. 고객이 선택하고 싶게 만드는 매력적인 표현 사용

**절대 금지사항:**
- 영어 단어나 문구를 절대 사용하지 마세요
- 원본 영어 텍스트를 그대로 복사하지 마세요
- 모든 영어는 한국어로 번역하여 사용하세요
- 최종 결과물에 영어가 하나라도 포함되면 안 됩니다

**한국어 작성 예시:**
- "Deluxe Room" → "디럭스 룸"
- "BOOK EARLY AND SAVE" → "얼리버드 할인 혜택"
- "CLUB AMENITIES" → "클럽 편의시설"
- "FREE WIRED INTERNET" → "무료 유선 인터넷"`;

    const userPrompt = `호텔명: ${hotelName}
객실 타입: ${processedRoomInfo.roomType}
객실명: ${processedRoomInfo.roomName}
설명: ${processedRoomInfo.description}

위 정보를 바탕으로 객실 소개를 작성해주세요.

**중요 요구사항:**
- 모든 텍스트는 이미 한국어로 변환되어 제공됩니다
- 자연스럽고 매력적인 한국어 소개문을 작성해주세요
- 객실의 특징과 장점을 부각하여 고객이 선택하고 싶게 만들어주세요
- **절대 영어를 사용하지 마세요**
- **100% 한국어로만 작성해주세요**

**원본 영어 데이터 (참고용):**
- 객실 타입: ${roomInfo.roomType}
- 객실명: ${roomInfo.roomName}
- 설명: ${roomInfo.description}

이 영어 데이터를 한국어로 번역하여 자연스러운 소개문을 만들어주세요.`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log('📤 OpenAI API 요청:', { 
      messages, 
      model: 'gpt-4o',
      requestBody: {
        messages,
        model: 'gpt-4o',
        max_completion_tokens: 200,
        temperature: 0.7,
        stream: false
      }
    })

    const response = await fetch('/api/openai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
              body: JSON.stringify({
          messages,
          model: 'gpt-4o',
          max_completion_tokens: 200,
          temperature: 0.7,
          stream: false
        }),
    });

    console.log('📥 OpenAI API 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ OpenAI API 오류 응답:', errorText)
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI API 응답 데이터:', data)
    
    const content = data.choices?.[0]?.message?.content
    console.log('📝 생성된 소개문:', content)
    
    return content || '객실 소개를 생성할 수 없습니다.';
  } catch (error) {
    console.error('❌ OpenAI API 호출 오류:', error);
    // 오류 발생 시 기본 소개문 반환
    const fallback = `${roomInfo.roomType} ${roomInfo.roomName} 객실입니다. ${roomInfo.description || '편안한 숙박을 제공합니다.'}`;
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

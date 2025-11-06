/**
 * AI를 사용하여 브랜드 설명 생성
 */

import { unstable_cache } from 'next/cache'

interface BrandInfo {
  brand_name_en: string
  brand_name_ko?: string | null
  brand_description?: string | null
  brand_description_ko?: string | null
}

/**
 * OpenAI API를 사용하여 브랜드 설명 생성 (내부 함수 - 캐시 없음)
 */
async function generateBrandDescriptionInternal(brand: BrandInfo): Promise<string> {
  // OpenAI API 키가 없으면 기본 설명 반환
  if (!process.env.OPENAI_API_KEY) {
    return generateFallbackDescription(brand)
  }

  try {
    const prompt = `다음 럭셔리 호텔 브랜드에 대한 매력적인 소개 문구를 한국어로 300자 정도로 작성해주세요.

브랜드명: ${brand.brand_name_en}${brand.brand_name_ko ? ` (${brand.brand_name_ko})` : ''}

요구사항:
- 300자 내외 (5-6문장)
- **반드시 브랜드의 역사와 연혁을 포함** (창립 연도, 주요 이정표, 헤리티지 등)
- 브랜드의 특징과 철학
- 럭셔리하고 품격 있는 어조
- 투어비스 셀렉트 예약 혜택 암시 (마지막 문장)`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 럭셔리 호텔 전문가이자 마케팅 카피라이터입니다. 브랜드의 역사와 연혁을 포함한 매력적인 브랜드 소개를 작성합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 450,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API 오류:', response.status, response.statusText)
      return generateFallbackDescription(brand)
    }

    const data = await response.json()
    const generatedText = data.choices?.[0]?.message?.content?.trim()

    if (!generatedText) {
      console.error('AI 응답이 비어있습니다')
      return generateFallbackDescription(brand)
    }

    console.log('✅ AI 브랜드 설명 생성 완료:', brand.brand_name_en)
    return generatedText
  } catch (error) {
    console.error('AI 브랜드 설명 생성 실패:', error)
    return generateFallbackDescription(brand)
  }
}

/**
 * AI API 실패 시 사용할 폴백 설명 생성
 */
function generateFallbackDescription(brand: BrandInfo): string {
  const brandName = brand.brand_name_ko || brand.brand_name_en
  
  // 기존 설명이 있으면 사용 (300자로 제한)
  if (brand.brand_description_ko) {
    return brand.brand_description_ko.slice(0, 300)
  }
  if (brand.brand_description) {
    return brand.brand_description.slice(0, 300)
  }

  // 기본 템플릿 (300자 내외, 역사 연혁 포함)
  return `${brandName}는 세계적인 럭셔리 호텔 브랜드로, 오랜 역사와 헤리티지를 바탕으로 전 세계에서 최고의 서비스를 제공하고 있습니다. 탁월한 서비스와 세심한 배려로 잊지 못할 경험을 선사하며, 각 호텔은 현지의 문화와 자연을 반영한 독특한 디자인으로 고객들에게 특별한 순간을 제공합니다. 투어비스 셀렉트를 통해 ${brandName}의 프리미엄 서비스를 특별한 혜택과 함께 경험하실 수 있습니다.`
}

/**
 * OpenAI API를 사용하여 브랜드 설명 생성 (캐시됨)
 * 
 * - 동일한 브랜드에 대해서는 7일간 캐시된 결과 반환
 * - revalidate: 604800초 (7일)
 */
export async function generateBrandDescription(brand: BrandInfo): Promise<string> {
  // 브랜드별 고유 캐시 키 생성
  const cacheKey = `brand-ai-description-${brand.brand_name_en}`
  
  const cachedFn = unstable_cache(
    async () => {
      return generateBrandDescriptionInternal(brand)
    },
    [cacheKey],
    {
      revalidate: 604800, // 7일 (60 * 60 * 24 * 7)
      tags: ['brand-description', cacheKey]
    }
  )
  
  return cachedFn()
}


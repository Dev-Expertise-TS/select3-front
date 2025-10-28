import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OG 태그 디버깅 API
 * 특정 호텔의 OG 태그 정보를 확인할 수 있습니다.
 * 
 * 사용법: /api/debug/og-tags?slug=hotel-slug
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        error: 'slug 파라미터가 필요합니다.',
        usage: '/api/debug/og-tags?slug=hotel-slug'
      }, { status: 400 })
    }
    
    const supabase = await createClient()
    
    // 호텔 정보 조회
    const { data: hotel, error: hotelError } = await supabase
      .from('select_hotels')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    
    if (hotelError || !hotel) {
      return NextResponse.json({
        success: false,
        error: '호텔을 찾을 수 없습니다.',
        slug,
        hotelError
      }, { status: 404 })
    }
    
    // 호텔 이미지 조회
    const { data: images, error: imagesError } = await supabase
      .from('select_hotel_media')
      .select('public_url, storage_path, image_seq, file_name')
      .eq('sabre_id', hotel.sabre_id)
      .order('image_seq', { ascending: true })
      .limit(3)
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://luxury-select.co.kr'
    
    // URL을 절대 URL로 변환
    const toAbsoluteUrl = (url: string) => {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/${url}`
    }
    
    const imageUrls = images
      ?.map(img => {
        const url = img.public_url || img.storage_path
        return {
          original: url,
          absolute: url ? toAbsoluteUrl(url) : null,
          fileName: img.file_name,
          sequence: img.image_seq
        }
      })
      .filter(img => img.absolute) || []
    
    // OG 태그 정보
    const ogTags = {
      title: `${hotel.property_name_ko || hotel.property_name_en} | Select Hotels`,
      description: hotel.description_ko || hotel.description_en || `${hotel.property_name_ko || hotel.property_name_en}의 최고의 숙박 경험을 제공합니다.`,
      url: `${baseUrl}/hotel/${slug}`,
      images: imageUrls.length > 0 
        ? imageUrls.map(img => ({
            url: img.absolute,
            width: 1200,
            height: 630,
            alt: `${hotel.property_name_ko || hotel.property_name_en} 이미지`
          }))
        : [{
            url: `${baseUrl}/select_logo.avif`,
            width: 1200,
            height: 630,
            alt: 'Select Hotels'
          }]
    }
    
    return NextResponse.json({
      success: true,
      hotel: {
        slug: hotel.slug,
        sabreId: hotel.sabre_id,
        nameKo: hotel.property_name_ko,
        nameEn: hotel.property_name_en,
        descriptionKo: hotel.description_ko,
        descriptionEn: hotel.description_en
      },
      rawImages: {
        count: images?.length || 0,
        images: images || [],
        error: imagesError
      },
      processedImages: imageUrls,
      ogTags,
      testUrls: {
        facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(ogTags.url)}`,
        twitter: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(ogTags.url)}`,
        linkedin: `https://www.linkedin.com/post-inspector/?url=${encodeURIComponent(ogTags.url)}`,
        opengraph: `https://www.opengraph.xyz/url/${encodeURIComponent(ogTags.url)}`
      }
    })
    
  } catch (error) {
    console.error('OG 태그 디버깅 오류:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}


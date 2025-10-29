"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSafeImageUrl, handleImageError } from "@/lib/image-utils"
import { HotelCardCta, HotelCardCtaData } from "./hotel-card-cta"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

interface BlogContent {
  slug: string
  main_title: string
  main_image: string | null
  sub_title: string | null
  s1_contents: string | null
  s2_contents: string | null
  s3_contents: string | null
  s4_contents: string | null
  s5_contents: string | null
  s6_contents: string | null
  s7_contents: string | null
  s8_contents: string | null
  s9_contents: string | null
  s10_contents: string | null
  s11_contents: string | null
  s12_contents: string | null
  created_at: string
  // 호텔 sabre_id 필드들
  s1_sabre_id: number | null
  s2_sabre_id: number | null
  s3_sabre_id: number | null
  s4_sabre_id: number | null
  s5_sabre_id: number | null
  s6_sabre_id: number | null
  s7_sabre_id: number | null
  s8_sabre_id: number | null
  s9_sabre_id: number | null
  s10_sabre_id: number | null
  s11_sabre_id: number | null
  s12_sabre_id: number | null
}

interface BlogContentRendererProps {
  blog: BlogContent
  showHeader?: boolean
  showImage?: boolean
  showDate?: boolean
  className?: string
  imageClassName?: string
  contentClassName?: string
}

// 호텔 데이터 조회 훅
function useHotelData(sabreId: number | null) {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['hotel-data', sabreId],
    queryFn: async () => {
      if (!sabreId) return null
      
      try {
        console.log('✅ [BlogContentRenderer] 호텔 데이터 조회 시작:', { sabreId })
        
        const { data, error } = await supabase
          .from('select_hotels')
          .select('*')
          .eq('sabre_id', sabreId)
          .maybeSingle()
        
        console.log('📊 [BlogContentRenderer] 호텔 데이터 조회 결과:', { 
          hasData: !!data, 
          hasError: !!error,
          dataIsNull: data === null,
          sabreId,
          hotelName: data?.property_name_ko || 'N/A'
        })
        
        if (error) {
          // 에러 객체를 안전하게 로깅
          console.error('🔴 [BlogContentRenderer] 호텔 데이터 조회 오류:', {
            sabreId,
            errorMessage: error?.message,
            errorDetails: error?.details,
            errorHint: error?.hint,
            errorCode: error?.code,
            timestamp: new Date().toISOString()
          })
          console.error('🔴 [BlogContentRenderer] Raw error object:', error)
          // 에러 발생 시 null 반환
          return null
        }
        
        // 데이터가 없는 경우 (존재하지 않는 sabre_id)
        if (!data) {
          console.warn('⚠️ [BlogContentRenderer] 호텔 데이터가 존재하지 않음:', { sabreId })
          return null
        }
        
        // publish가 false면 null 반환
        if (data.publish === false) {
          console.warn('⚠️ [BlogContentRenderer] 비공개 호텔:', { sabreId, hotelName: data.property_name_ko })
          return null
        }
        
        // select_hotel_media에서 이미지 조회 (image_seq가 가장 작은 것)
        if (data) {
          const { data: rawMediaData, error: mediaError } = await supabase
            .from('select_hotel_media')
            .select('id, sabre_id, file_name, public_url, storage_path, image_seq, slug')
            .eq('sabre_id', String(sabreId))
            .order('image_seq', { ascending: true })
            .limit(1)
            .maybeSingle()
          
          if (mediaError) {
            console.error('🔴 [BlogContentRenderer] 호텔 미디어 조회 오류:', {
              sabreId,
              errorMessage: mediaError?.message,
              errorDetails: mediaError?.details,
              errorCode: mediaError?.code
            })
          }
          
          // 이미지 경로를 호텔 데이터에 추가
          const imageUrl = rawMediaData?.public_url || rawMediaData?.storage_path || '/placeholder.svg'
          
          console.log('🖼️ [BlogContentRenderer] 호텔 이미지 URL:', {
            sabreId,
            hotelName: data.property_name_ko,
            imageUrl,
            hasPublicUrl: !!rawMediaData?.public_url,
            hasStoragePath: !!rawMediaData?.storage_path
          })
          
          return {
            ...data,
            image_url: imageUrl
          }
        }
        
        return data
      } catch (err) {
        // 예외 객체를 안전하게 로깅
        console.error('🔴 [BlogContentRenderer] 호텔 데이터 조회 중 예외 발생:', {
          sabreId,
          errorMessage: err instanceof Error ? err.message : String(err),
          errorStack: err instanceof Error ? err.stack : null,
          timestamp: new Date().toISOString()
        })
        console.error('🔴 [BlogContentRenderer] Exception object:', err)
        return null
      }
    },
    enabled: !!sabreId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1, // 재시도 횟수 제한
  })
}

// 호텔 카드 CTA 컴포넌트
function HotelCardCtaWrapper({ sabreId }: { sabreId: number | null }) {
  const { data: hotelData, isLoading, error } = useHotelData(sabreId)
  
  // 로딩 중이거나 sabreId가 없으면 렌더링하지 않음
  if (!sabreId || isLoading) {
    return null
  }
  
  // 오류가 있거나 데이터가 없으면 렌더링하지 않음
  if (error || !hotelData) {
    console.log('🚫 호텔 카드 CTA 렌더링 생략:', { sabreId, error: !!error, hasData: !!hotelData })
    return null
  }
  
  // 호텔 데이터를 HotelCardCtaData 형태로 변환
  const benefits = [
    hotelData.benefit_1,
    hotelData.benefit_2,
    hotelData.benefit_3,
    hotelData.benefit_4,
    hotelData.benefit_5,
    hotelData.benefit_6
  ].filter(benefit => benefit && benefit.trim() !== '')
  
  const hotelCardData: HotelCardCtaData = {
    sabre_id: hotelData.sabre_id,
    property_name_ko: hotelData.property_name_ko,
    property_name_en: hotelData.property_name_en,
    city: hotelData.city,
    city_ko: hotelData.city_ko,
    property_address: hotelData.property_address,
    image: hotelData.image_url || '/placeholder.svg', // select_hotel_media에서 조회한 이미지
    benefits,
    slug: hotelData.slug,
    rating: 4.5, // 기본값
    price: undefined,
    original_price: undefined,
    badge: undefined,
    isPromotion: false
  }
  
  console.log('✅ 호텔 카드 CTA 데이터 생성:', {
    sabreId,
    hotelName: hotelCardData.property_name_ko,
    benefitsCount: benefits.length,
    hasImage: !!hotelCardData.image
  })
  
  return (
    <div className="my-8">
      <HotelCardCta 
        hotel={hotelCardData}
        variant="default"
        showBenefits={true}
        showRating={false}
        showPrice={false}
        showBadge={false}
      />
    </div>
  )
}

export function BlogContentRenderer({ 
  blog, 
  showHeader = true, 
  showImage = true, 
  showDate = true,
  className = "",
  imageClassName = "",
  contentClassName = ""
}: BlogContentRendererProps) {
  const [imageError, setImageError] = useState(false)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const getContentSections = () => {
    if (!blog) return []
    
    const sections = [
      { content: blog.s1_contents, sabreId: blog.s1_sabre_id },
      { content: blog.s2_contents, sabreId: blog.s2_sabre_id },
      { content: blog.s3_contents, sabreId: blog.s3_sabre_id },
      { content: blog.s4_contents, sabreId: blog.s4_sabre_id },
      { content: blog.s5_contents, sabreId: blog.s5_sabre_id },
      { content: blog.s6_contents, sabreId: blog.s6_sabre_id },
      { content: blog.s7_contents, sabreId: blog.s7_sabre_id },
      { content: blog.s8_contents, sabreId: blog.s8_sabre_id },
      { content: blog.s9_contents, sabreId: blog.s9_sabre_id },
      { content: blog.s10_contents, sabreId: blog.s10_sabre_id },
      { content: blog.s11_contents, sabreId: blog.s11_sabre_id },
      { content: blog.s12_contents, sabreId: blog.s12_sabre_id }
    ].filter(section => section.content && section.content.trim() !== "")
    
    return sections
  }

  const contentSections = getContentSections()

  return (
    <div className={cn("space-y-6", className)}>
      {/* 메인 이미지 - 제목 위로 이동 */}
      {showImage && blog.main_image && !imageError && (
        <div className={cn("-mx-4 sm:mx-0", imageClassName)}>
          <div className="aspect-[21/9] sm:aspect-[16/9] relative overflow-hidden sm:rounded-xl bg-gray-100">
            <Image
              src={getSafeImageUrl(blog.main_image)}
              alt={blog.main_title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
              priority
              onError={(e) => {
                console.error('이미지 로드 실패:', e.currentTarget.src)
                setImageError(true)
              }}
            />
          </div>
        </div>
      )}

      {/* 이미지 오류 시 플레이스홀더 */}
      {showImage && blog.main_image && imageError && (
        <div className={cn("-mx-4 sm:mx-0", imageClassName)}>
          <div className="aspect-[21/9] sm:aspect-[16/9] relative overflow-hidden sm:rounded-xl bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🖼️</div>
              <p className="text-sm">이미지를 불러올 수 없습니다</p>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 - 이미지 아래로 이동 */}
      {showHeader && (
        <header className="space-y-4 pt-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {blog.main_title}
          </h1>
          {blog.sub_title && (
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              {blog.sub_title}
            </p>
          )}
          {showDate && (
            <div className="flex items-center gap-2 text-gray-500 pt-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(blog.created_at)}</span>
            </div>
          )}
        </header>
      )}

      {/* 본문 내용 */}
      <article className={cn("prose prose-lg max-w-none", contentClassName)}>
        {contentSections.map((section, index) => (
          <div key={`content-${index}`} className="mb-6">
            <div 
              className="blog-content text-gray-800 leading-relaxed whitespace-pre-wrap prose prose-gray max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_p]:mb-3 [&_strong]:font-semibold [&_em]:italic [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:bg-gray-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-gray-100 [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:ml-4 [&_li]:mb-2 [&_li[data-list='bullet']]:list-none [&_li[data-list='bullet']]:before:content-['•'] [&_li[data-list='bullet']]:before:absolute [&_li[data-list='bullet']]:before:left-0 [&_li[data-list='bullet']]:before:text-gray-600 [&_li[data-list='bullet']]:before:font-bold [&_li[data-list='bullet']]:pl-6 [&_li[data-list='bullet']]:relative [&_.ql-ui]:hidden"
              dangerouslySetInnerHTML={{ __html: section.content || '' }}
              suppressHydrationWarning
              translate="no"
            />
            
            {/* 호텔 카드 CTA 렌더링 */}
            {section.sabreId && (
              <HotelCardCtaWrapper sabreId={section.sabreId} />
            )}
          </div>
        ))}
      </article>
    </div>
  )
}

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { processHotelImages, getSafeImageUrl, handleImageError, handleImageLoad } from "@/lib/image-utils"

// Hotel data processing utilities
export function useHotelDataProcessing() {
  const [processedImages, setProcessedImages] = useState<any[]>([])
  const [isProcessingImages, setIsProcessingImages] = useState(false)

  // 이미지 처리 함수
  const processImages = useCallback(async (images: any[]) => {
    if (!images || images.length === 0) return []
    
    setIsProcessingImages(true)
    try {
      const processed = await processHotelImages(images)
      setProcessedImages(processed)
      return processed
    } catch (error) {
      console.error('이미지 처리 중 오류:', error)
      return []
    } finally {
      setIsProcessingImages(false)
    }
  }, [])

  // 호텔 데이터 정규화
  const normalizeHotelData = useCallback((hotel: any) => {
    if (!hotel) return null

    return {
      id: hotel.id,
      sabre_id: hotel.sabre_id,
      name_ko: hotel.name_ko || hotel.name_en || '',
      name_en: hotel.name_en || hotel.name_ko || '',
      city_ko: hotel.city_ko || hotel.city_en || hotel.city || '',
      city_en: hotel.city_en || hotel.city_ko || hotel.city || '',
      city: hotel.city || hotel.city_en || hotel.city_ko || '',
      country_ko: hotel.country_ko || hotel.country_en || hotel.country || '',
      country_en: hotel.country_en || hotel.country_ko || hotel.country || '',
      country: hotel.country || hotel.country_en || hotel.country_ko || '',
      description_ko: hotel.description_ko || hotel.description_en || '',
      description_en: hotel.description_en || hotel.description_ko || '',
      address_ko: hotel.address_ko || hotel.address_en || '',
      address_en: hotel.address_en || hotel.address_ko || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      website: hotel.website || '',
      latitude: hotel.latitude || null,
      longitude: hotel.longitude || null,
      star_rating: hotel.star_rating || null,
      brand_id: hotel.brand_id || null,
      chain_id: hotel.chain_id || null,
      slug: hotel.slug || '',
      is_active: hotel.is_active ?? true,
      created_at: hotel.created_at,
      updated_at: hotel.updated_at,
      originalData: hotel
    }
  }, [])

  // 혜택 데이터 정규화
  const normalizeBenefitsData = useCallback((benefits: any[]) => {
    if (!Array.isArray(benefits)) return []
    
    return benefits.map(benefit => ({
      id: benefit.id,
      benefit_id: benefit.benefit_id,
      name_ko: benefit.name_ko || benefit.name_en || '',
      name_en: benefit.name_en || benefit.name_ko || '',
      description_ko: benefit.description_ko || benefit.description_en || '',
      description_en: benefit.description_en || benefit.description_ko || '',
      icon: benefit.icon || '',
      sort: benefit.sort || 0,
      is_active: benefit.is_active ?? true,
      originalData: benefit
    })).sort((a, b) => a.sort - b.sort)
  }, [])

  // 프로모션 데이터 정규화
  const normalizePromotionsData = useCallback((promotions: any[]) => {
    if (!Array.isArray(promotions)) return []
    
    return promotions.map(promotion => ({
      id: promotion.id,
      promotion_id: promotion.promotion_id,
      title_ko: promotion.title_ko || promotion.title_en || '',
      title_en: promotion.title_en || promotion.title_ko || '',
      description_ko: promotion.description_ko || promotion.description_en || '',
      description_en: promotion.description_en || promotion.description_ko || '',
      discount_percentage: promotion.discount_percentage || 0,
      discount_amount: promotion.discount_amount || 0,
      start_date: promotion.start_date || '',
      end_date: promotion.end_date || '',
      is_active: promotion.is_active ?? true,
      originalData: promotion
    })).filter(p => p.is_active)
  }, [])

  // 블로그 데이터 정규화
  const normalizeBlogsData = useCallback((blogs: any[]) => {
    if (!Array.isArray(blogs)) return []
    
    return blogs.map(blog => ({
      id: blog.id,
      blog_id: blog.blog_id,
      title_ko: blog.title_ko || blog.title_en || '',
      title_en: blog.title_en || blog.title_ko || '',
      content_ko: blog.content_ko || blog.content_en || '',
      content_en: blog.content_en || blog.content_ko || '',
      excerpt_ko: blog.excerpt_ko || blog.excerpt_en || '',
      excerpt_en: blog.excerpt_en || blog.excerpt_ko || '',
      featured_image: blog.featured_image || '',
      slug: blog.slug || '',
      published_at: blog.published_at || '',
      is_active: blog.is_active ?? true,
      originalData: blog
    })).filter(b => b.is_active)
  }, [])

  return {
    processedImages,
    isProcessingImages,
    processImages,
    normalizeHotelData,
    normalizeBenefitsData,
    normalizePromotionsData,
    normalizeBlogsData
  }
}

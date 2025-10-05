import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // 정적 페이지들만 반환하여 동적 서버 사용 문제 해결
  return [
    {
      url: 'https://select-hotels.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://select-hotels.com/brands',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://select-hotels.com/all-hotel-resort',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://select-hotels.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://select-hotels.com/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * 캐시 무효화 API
 * 
 * 사용 예시:
 * POST /api/revalidate
 * {
 *   "secret": "YOUR_SECRET",
 *   "path": "/hotel/park-hyatt-tokyo",
 *   "tags": ["hotels", "promotion-hotels"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret, path, tags } = body

    // 보안 검증
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid secret' 
        },
        { status: 401 }
      )
    }

    // 경로 재검증
    if (path) {
      if (Array.isArray(path)) {
        for (const p of path) {
          await revalidatePath(p)
          console.log('✅ Path revalidated:', p)
        }
      } else {
        await revalidatePath(path)
        console.log('✅ Path revalidated:', path)
      }
    }

    // 태그 재검증
    if (tags) {
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          revalidateTag(tag)
          console.log('✅ Tag revalidated:', tag)
        }
      } else {
        revalidateTag(tags)
        console.log('✅ Tag revalidated:', tags)
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Revalidation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error revalidating',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * 전체 캐시 클리어 (관리자 전용)
 * 
 * DELETE /api/revalidate?secret=YOUR_SECRET&type=all
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const type = searchParams.get('type') || 'all'

    // 보안 검증
    if (secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid secret' 
        },
        { status: 401 }
      )
    }

    // 주요 태그 재검증
    const tags = [
      'hotels',
      'promotion-hotels',
      'top-banner-hotels',
      'hotel-chains',
      'brands',
      'trending-destinations',
      'regions',
      'benefits'
    ]

    for (const tag of tags) {
      revalidateTag(tag)
      console.log('✅ Tag cleared:', tag)
    }

    // 주요 경로 재검증
    const paths = [
      '/',
      '/hotel',
      '/brand',
      '/brand/brand',
      '/blog',
      '/promotion'
    ]

    for (const path of paths) {
      await revalidatePath(path)
      console.log('✅ Path cleared:', path)
    }

    return NextResponse.json({
      success: true,
      message: 'All caches cleared successfully',
      clearedTags: tags.length,
      clearedPaths: paths.length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Cache clear error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error clearing cache',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


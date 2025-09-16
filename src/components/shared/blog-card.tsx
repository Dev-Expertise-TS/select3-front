import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BlogCardProps {
  id: string
  mainImage: string | null
  mainTitle: string
  subTitle: string | null
  createdAt: string
  className?: string
}

export function BlogCard({
  id,
  mainImage,
  mainTitle,
  subTitle,
  createdAt,
  className
}: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <Link href={`/blog/${id}`} className="block group h-full">
      <Card className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col py-0",
        className
      )}>
        <div className="aspect-[16/9] relative overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={mainTitle}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-sm">이미지 없음</span>
            </div>
          )}
        </div>
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="space-y-3 flex-1">
            <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {mainTitle}
            </h3>
            {subTitle && (
              <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                {subTitle}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 mt-auto">
            <span className="text-xs text-gray-500">
              {formatDate(createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

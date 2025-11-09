'use client'

interface FilterTagsProps {
  countries?: string[] | null
  cities?: string[] | null
  companions?: string[] | null
  styles?: string[] | null
}

export function FilterTags({ countries, cities, companions, styles }: FilterTagsProps) {
  const hasAnyTags = countries?.length || cities?.length || companions?.length || styles?.length
  
  if (!hasAnyTags) return null

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 border-t-2 border-gray-100">
      <div className="container mx-auto max-w-[1440px] px-4">
        <div className="text-center mb-10">
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">이런 분들께 추천합니다</h3>
          <p className="text-gray-600">당신의 여행 스타일에 딱 맞는 선택</p>
        </div>
        
        <div className="space-y-6 max-w-5xl mx-auto">
          {countries && countries.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-base font-black text-gray-900 bg-blue-100 px-4 py-2 rounded-full">🌍 지역</span>
                {countries.map((country, index) => (
                  <span key={index} className="px-5 py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-bold rounded-full border border-blue-200 hover:scale-105 transition-transform">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {companions && companions.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-base font-black text-gray-900 bg-pink-100 px-4 py-2 rounded-full">👥 동반</span>
                {companions.map((companion, index) => (
                  <span key={index} className="px-5 py-2.5 bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 text-sm font-bold rounded-full border border-pink-200 hover:scale-105 transition-transform">
                    {companion}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {styles && styles.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-base font-black text-gray-900 bg-purple-100 px-4 py-2 rounded-full">✨ 스타일</span>
                {styles.map((style, index) => (
                  <span key={index} className="px-5 py-2.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 text-sm font-bold rounded-full border border-purple-200 hover:scale-105 transition-transform">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


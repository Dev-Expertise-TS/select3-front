import Image from "next/image"
import Link from "next/link"

const brands = [
  {
    name: "Marriott",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/R9NG10JHKyVNHnxyVMbHUm00cg-DCIxstog1vuAjvIxQRC70eC3iGD8ed.avif",
  },
  { name: "Aman", logo: "/brands/aman.png" },
  { name: "Hyatt", logo: "/brands/hyatt.png" },
  {
    name: "IHG",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OxH5JqU6zE636NE5B8HsyGXnRw-EA101FE4VHULns1QKOa1HCgmdLLQDf.avif",
  },
  { name: "Accor", logo: "/brands/accor.png" },
  { name: "Mandarin Oriental", logo: "/brands/mandarin-oriental.png" },
  { name: "Hilton", logo: "/brands/hilton.png" },
  { name: "Shangri-La", logo: "/brands/shangri-la.png" },
  { name: "Melia", logo: "/brands/melia.png" },
  { name: "Virtuoso", logo: "/brands/virtuoso.png" },
  { name: "LHW", logo: "/brands/lhw.png" },
  { name: "Heavens Portfolio", logo: "/brands/heavens-portfolio.png" },
]

export function BrandProgramSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-[1200px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brand & Program</h2>
          <p className="text-lg text-gray-600 mb-6">셀렉트에서 추천하는 최고의 브랜드와 프로그램</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-6">
          {brands.map((brand, index) => (
            <Link key={index} href={`/brand/${brand.name.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 group cursor-pointer overflow-hidden aspect-[4/3] relative">
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={brand.name}
                  fill
                  className="object-contain transition-all duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

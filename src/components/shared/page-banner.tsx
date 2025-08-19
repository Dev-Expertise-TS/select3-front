interface PageBannerProps {
  title: string
  subtitle?: string
}

export function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <section className="bg-gray-50 border-b">
      <div className="container mx-auto max-w-[1440px] px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-gray-600">{subtitle}</p>
        ) : null}
      </div>
    </section>
  )
}



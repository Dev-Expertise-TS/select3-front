export default function Loading() {
  return (
    <main className="pt-12 md:pt-16">
      <div className="container mx-auto max-w-[1440px] px-4 py-6">
        <div className="h-[64px] w-full rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3 h-[520px] rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
          <div className="lg:col-span-2 h-[520px] rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
        </div>
      </div>
    </main>
  )
}



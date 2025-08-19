import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/features/scroll-to-top"
import { HotelDetail } from "@/features/hotels/hotel-detail"

export default async function HotelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HotelDetail hotelSlug={slug} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

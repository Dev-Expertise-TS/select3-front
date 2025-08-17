import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { HotelDetail } from "@/components/hotel-detail"

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HotelDetail hotelSlug={(await params).slug} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

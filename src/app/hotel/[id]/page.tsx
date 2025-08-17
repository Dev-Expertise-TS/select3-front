import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { HotelDetail } from "@/components/hotel-detail"

export default async function HotelDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HotelDetail hotelId={(await params).id} />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

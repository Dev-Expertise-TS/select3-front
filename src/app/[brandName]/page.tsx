import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BrandHotelsClient } from "@/components/brand-hotels-client"

const brandHotels = {
  marriott: [
    {
      id: 1,
      name: "The Ritz-Carlton Tokyo",
      location: "Tokyo, Japan",
      address: "9-7-1 Akasaka, Minato City, Tokyo 107-6245, Japan",
      image: "/hotels/ritz-carlton-tokyo.jpg",
      rating: 4.8,
      price: "¥85,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "CreditCard", text: "$100 크레딧" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Star", text: "VIP 라운지" },
      ],
      promotion: {
        title: "리츠칼튼 도쿄 스페셜",
        bookingDeadline: "~2025.12.31",
        stayPeriod: "~2026.06.30",
        highlight: "VIP 패키지",
      },
    },
    {
      id: 2,
      name: "JW Marriott Seoul",
      location: "Seoul, Korea",
      address: "176 Sinbanpo-ro, Seocho-gu, Seoul 06546, South Korea",
      image: "/hotels/jw-marriott-seoul.jpg",
      rating: 4.7,
      price: "₩320,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Gift", text: "스파 크레딧" },
        { icon: "Star", text: "무료 Wi-Fi" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
      ],
      promotion: {
        title: "JW 마리어트 서울 패키지",
        bookingDeadline: "~2025.11.30",
        stayPeriod: "~2026.05.31",
        highlight: "스파 크레딧 포함",
      },
    },
    {
      id: 3,
      name: "The St. Regis Bali Resort",
      location: "Bali, Indonesia",
      address: "Strand Beach, Nusa Dua, Bali 80363, Indonesia",
      image: "/hotels/st-regis-bali.jpg",
      rating: 4.9,
      price: "$450",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Gift", text: "비치 액세스" },
        { icon: "Star", text: "버틀러 서비스" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
      ],
      promotion: {
        title: "세인트 레지스 발리 리조트",
        bookingDeadline: "~2025.10.31",
        stayPeriod: "~2026.04.30",
        highlight: "버틀러 서비스",
      },
    },
  ],
  hyatt: [
    {
      id: 4,
      name: "Park Hyatt Tokyo",
      location: "Tokyo, Japan",
      address: "3-7-1-2 Nishi Shinjuku, Shinjuku City, Tokyo 163-1055, Japan",
      image: "/hotels/park-hyatt-tokyo.jpg",
      rating: 4.8,
      price: "¥95,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Gift", text: "스파 크레딧" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Star", text: "VIP 혜택" },
      ],
      promotion: {
        title: "파크 하야트 도쿄 패키지",
        bookingDeadline: "~2025.12.31",
        stayPeriod: "~2026.06.30",
        highlight: "스파 크레딧 포함",
      },
    },
    {
      id: 5,
      name: "Grand Hyatt Seoul",
      location: "Seoul, Korea",
      address: "322 Yeongdong-daero, Gangnam-gu, Seoul 06164, South Korea",
      image: "/hotels/grand-hyatt-seoul.jpg",
      rating: 4.6,
      price: "₩280,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Gift", text: "피트니스 크레딧" },
        { icon: "Star", text: "무료 Wi-Fi" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
      ],
      promotion: {
        title: "그랜드 하야트 서울 패키지",
        bookingDeadline: "~2025.11.30",
        stayPeriod: "~2026.05.31",
        highlight: "피트니스 크레딧 포함",
      },
    },
  ],
  aman: [
    {
      id: 6,
      name: "Aman Tokyo",
      location: "Tokyo, Japan",
      address: "The Otemachi Tower, 1-5-6 Otemachi, Chiyoda City, Tokyo 100-0004, Japan",
      image: "/hotels/aman-tokyo.jpg",
      rating: 4.9,
      price: "¥180,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Gift", text: "스파 크레딧" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Star", text: "VIP 라운지" },
      ],
      promotion: {
        title: "아만 도쿄 스페셜",
        bookingDeadline: "~2025.12.31",
        stayPeriod: "~2026.06.30",
        highlight: "스파 크레딧 포함",
      },
    },
    {
      id: 7,
      name: "Aman Bali",
      location: "Bali, Indonesia",
      address: "Jl. Raya Tjampuhan, Sayan, Ubud, Bali 80571, Indonesia",
      image: "/hotels/aman-bali.jpg",
      rating: 4.9,
      price: "$800",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Gift", text: "스파 크레딧" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Star", text: "VIP 라운지" },
      ],
      promotion: {
        title: "아만 발리 스페셜",
        bookingDeadline: "~2025.12.31",
        stayPeriod: "~2026.06.30",
        highlight: "스파 크레딧 포함",
      },
    },
  ],
  fourSeasons: [
    {
      id: 8,
      name: "Four Seasons Hotel Tokyo at Marunouchi",
      location: "Tokyo, Japan",
      address: "1-11-1 Marunouchi, Chiyoda City, Tokyo 100-6277, Japan",
      image: "/hotels/four-seasons-tokyo.jpg",
      rating: 4.8,
      price: "¥120,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Gift", text: "스파 크레딧" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Star", text: "VIP 라운지" },
      ],
      promotion: {
        title: "포시즌스 도쿄 스페셜",
        bookingDeadline: "~2025.12.31",
        stayPeriod: "~2026.06.30",
        highlight: "스파 크레딧 포함",
      },
    },
    {
      id: 9,
      name: "Four Seasons Hotel Seoul",
      location: "Seoul, Korea",
      address: "97 Saemunan-ro, Jongno-gu, Seoul 03183, South Korea",
      image: "/hotels/four-seasons-seoul.jpg",
      rating: 4.7,
      price: "₩350,000",
      benefits: [
        { icon: "Coffee", text: "2인 조식" },
        { icon: "Gift", text: "스파 크레딧" },
        { icon: "Bed", text: "룸 업그레이드" },
        { icon: "Clock", text: "레이트 체크아웃" },
        { icon: "Zap", text: "얼리 체크인" },
        { icon: "Star", text: "VIP 라운지" },
      ],
      promotion: {
        title: "포시즌스 서울 스페셜",
        bookingDeadline: "~2025.11.30",
        stayPeriod: "~2026.05.31",
        highlight: "스파 크레딧 포함",
      },
    },
  ],
}

interface BrandPageProps {
  params: {
    brandName: string
  }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brandName = (await params).brandName.toLowerCase()
  const hotels = brandHotels[brandName as keyof typeof brandHotels] || []
  const displayName = brandName.charAt(0).toUpperCase() + brandName.slice(1)

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <BrandHotelsClient hotels={hotels} displayName={displayName} />
      <Footer />
    </div>
  )
}

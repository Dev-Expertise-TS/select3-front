import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactContent } from "./contact-content"

export const metadata: Metadata = {
  title: "문의하기 | 투어비스 셀렉트",
  description: "셀렉트에 대해 궁금한 내용을 문의주세요. 전문 상담사가 답변해드립니다.",
}

// ContactContent가 client component이므로 동적 렌더링
export const dynamic = 'force-dynamic'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ContactContent />
      <Footer />
    </div>
  )
}



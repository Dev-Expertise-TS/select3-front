'use client'

export function KakaoConsultationButton() {
  return (
    <a
      href="http://pf.kakao.com/_cxmxgNG/chat"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 hidden lg:block group"
      aria-label="카카오톡 상담"
    >
      <img
        src="https://appservice-img.s3.amazonaws.com/apps/gdc7WwhtIx4htbBH2iGjuB/ko/icon/splash?1753264267"
        alt="카카오톡 상담"
        className="block select-none w-[80px] h-auto transition-all duration-200 ease-out group-hover:scale-105 group-hover:drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] active:scale-95"
        draggable={false}
        loading="lazy"
      />
    </a>
  )
}

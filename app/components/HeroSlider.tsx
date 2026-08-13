"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface HeroSliderProps {
  onCatalogClick?: () => void;
  onWAClick?: () => void;
}

export default function HeroSlider({ onCatalogClick, onWAClick }: HeroSliderProps) {
  const slides = [
    {
      id: 1,
      bg: "bg-gradient-to-r from-red-600 via-red-500 to-amber-500",
      badge: "📦 BEST SELLER & GROSIR",
      title: "PUSAT KEMASAN & PACKING JOGJA",
      subtitle: "Grosir & Eceran Thinwall, Paper Bowl, Kardus Makanan & Plastik HD",
      ctaText: "Lihat Katalog",
      ctaAction: "catalog",
      buttonBg: "bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold",
    },
    {
      id: 2,
      bg: "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950",
      badge: "🚚 PENGIRIMAN CEPAT",
      title: "SIAP KIRIM DARI 2 CABANG TERDEKAT",
      subtitle: "Melayani Pemesanan Pusat SSA Bantul (Depan Stadion Sultan Agung) dan Cabang Potorono",
      ctaText: "Pesan via WhatsApp",
      ctaAction: "wa",
      buttonBg: "bg-emerald-500 hover:bg-emerald-400 text-white font-bold",
    },
    {
      id: 3,
      bg: "bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600",
      badge: "✨ MITRA TERPERCAYA",
      title: "SOLUSI PACKING USAHA KULINER & UMKM",
      subtitle: "Produk Lengkap, Harga Bersaing, dan Pelayanan Cepat",
      ctaText: "Hubungi Admin",
      ctaAction: "wa",
      buttonBg: "bg-white hover:bg-slate-100 text-emerald-800 font-bold",
    },
  ];

  const handleButtonClick = (action: string) => {
    if (action === "catalog") {
      if (onCatalogClick) {
        onCatalogClick();
      } else {
        const el = document.getElementById("katalog");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (action === "wa") {
      if (onWAClick) {
        onWAClick();
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-6 overflow-hidden">
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 w-full h-[300px] md:h-[400px] lg:h-[450px] group">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          speed={500}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={{ clickable: true }}
          className="hero-swiper w-full h-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="w-full h-full flex-shrink-0">
              <div
                className={`w-full h-full ${slide.bg} p-6 sm:p-12 flex flex-col justify-center items-center text-center text-white relative overflow-hidden`}
              >
                {/* Decorative background glow */}
                <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 max-w-3xl space-y-4">
                  <span className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs sm:text-sm font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
                    {slide.badge}
                  </span>

                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-md">
                    {slide.title}
                  </h2>

                  <p className="text-sm sm:text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto">
                    {slide.subtitle}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => handleButtonClick(slide.ctaAction)}
                      className={`px-6 py-3 rounded-xl text-sm sm:text-base transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer ${slide.buttonBg}`}
                    >
                      {slide.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
          
          {/* Custom Navigation */}
          <div className="swiper-button-prev-custom absolute top-1/2 left-4 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-slate-800 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </div>
          <div className="swiper-button-next-custom absolute top-1/2 right-4 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 text-slate-800 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </div>
        </Swiper>
      </div>
    </div>
  );
}

"use client";

interface MinimalProduct {
  category: string;
  image_url?: string;
}

interface HeroSplitBannerProps {
  onCatalogClick: () => void;
  products?: MinimalProduct[];
}

export default function HeroSplitBanner({ onCatalogClick, products = [] }: HeroSplitBannerProps) {
  const thinwallProduct = products.find(p => p.category.toLowerCase().includes("thinwall") && p.image_url);
  const paperboxProduct = products.find(p => p.category.toLowerCase().includes("paper") && p.image_url);

  const leftImage = thinwallProduct?.image_url || "https://images.unsplash.com/photo-1622699268600-0c46b539ba47?auto=format&fit=crop&q=80";
  const rightImage = paperboxProduct?.image_url || "https://images.unsplash.com/photo-1589139366579-0520261cb465?auto=format&fit=crop&q=80";
  return (
    <div className="w-full max-w-6xl mx-auto px-4 mt-8">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl w-full h-[500px] flex flex-col md:flex-row group bg-slate-900">
        
        {/* Left Side (Emerald / Eceran) */}
        <div className="flex-1 bg-emerald-700 relative overflow-hidden flex flex-col items-center justify-center p-8 transition-transform duration-700 hover:flex-[1.2]">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url('${leftImage}')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
          <div className="relative z-10 text-center transform transition-transform duration-500 group-hover:-translate-y-2">
            <span className="inline-block bg-white/20 backdrop-blur-md text-white font-bold px-5 py-1.5 rounded-full text-xs tracking-[0.25em] mb-4 border border-emerald-400/40 shadow-lg">ECERAN</span>
            <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2 drop-shadow-xl">Thinwall</h2>
            <p className="text-emerald-100 font-semibold tracking-wide">Tebal & Anti Bocor</p>
          </div>
        </div>

        {/* Right Side (Amber / Grosir) */}
        <div className="flex-1 bg-amber-800 relative overflow-hidden flex flex-col items-center justify-center p-8 transition-transform duration-700 hover:flex-[1.2]">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: `url('${rightImage}')` }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 to-transparent"></div>
          <div className="relative z-10 text-center transform transition-transform duration-500 group-hover:-translate-y-2">
            <span className="inline-block bg-black/30 backdrop-blur-md text-amber-50 font-bold px-5 py-1.5 rounded-full text-xs tracking-[0.25em] mb-4 border border-amber-500/40 shadow-lg">GROSIR</span>
            <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2 drop-shadow-xl">Paper Box</h2>
            <p className="text-amber-200 font-semibold tracking-wide">Eco-Friendly & Premium</p>
          </div>
        </div>

        {/* Dynamic Slanted Divider for Desktop */}
        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-3 bg-white/20 backdrop-blur-sm -skew-x-12 z-20 -ml-1.5 border-l border-r border-white/30 shadow-2xl mix-blend-overlay"></div>

        {/* Center Overlay Elements (Neo-Kick Style) */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-visible z-30">
          {/* Large Transparent Text */}
          <h1 className="text-[5rem] md:text-[9rem] font-black italic text-white opacity-40 tracking-tighter uppercase select-none drop-shadow-2xl whitespace-nowrap z-30">
            FRESH & ECO
          </h1>
          
          {/* Center CTA and Prices */}
          <div className="absolute flex flex-col items-center gap-6 z-40 pointer-events-auto translate-y-8 md:translate-y-12">
            <div className="flex items-center gap-6 bg-slate-900/85 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl ring-1 ring-white/5">
              <div className="text-center">
                <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Mulai Dari</p>
                <p className="text-2xl font-black text-white tracking-tight">Rp 500</p>
              </div>
              <div className="w-px h-10 bg-white/20"></div>
              <div className="text-center">
                <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest mb-1">Grosir</p>
                <p className="text-2xl font-black text-white tracking-tight">Diskon ++</p>
              </div>
            </div>
            
            <button
              onClick={onCatalogClick}
              className="group relative bg-white text-slate-900 font-black px-8 py-4 rounded-full uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">Lihat Semua Produk</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

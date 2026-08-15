"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import HeroSlider from "./components/HeroSlider";

interface Product {
  id: number;
  name: string;
  category: string;
  price_retail: number | string;
  price_wholesale?: number | string;
  description?: string;
  image_url?: string;
}

interface CartItem extends Product {
  qty: number;
}

const BRANCHES: Record<string, string> = {
  "Pusat SSA Bantul (Depan Stadion Sultan Agung)": "6281234567890",
  "Cabang Potorono": "6281122334455",
};

const parsePrice = (val: any): number => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const parsed = Number(String(val).replace(/[^0-9.-]+/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("Pusat SSA Bantul (Depan Stadion Sultan Agung)");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");
  const [categories, setCategories] = useState<string[]>(["Semua"]);

  // State Modal Login Admin
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [adminAuthError, setAdminAuthError] = useState<string>("");

  // Ambil Data Produk dari Supabase Database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Gagal mengambil data dari Supabase:", error.message);
      } else if (data) {
        if (data.length === 0) {
          console.error("Data produk dari Supabase kosong.");
        }
        setProducts(data);
        
        // Ekstrak kategori unik
        const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category))).filter(Boolean);
        setCategories(["Semua", ...uniqueCategories]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + parsePrice(item.price_retail) * item.qty, 0);

  const handleCheckoutWA = () => {
    if (cart.length === 0) return;

    const phone = BRANCHES[selectedBranch] || "6281234567890";

    // Formatter tanggal pesanan
    const dateStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let message = `🛒 *FORM PEMESANAN AD PLASTIK*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📍 *Cabang Tujuan:* ${selectedBranch}\n`;
    message += `📅 *Waktu Pesanan:* ${dateStr} WIB\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📋 *RINCIAN KERANJANG BELANJA:*\n\n`;

    cart.forEach((item, index) => {
      const itemPrice = parsePrice(item.price_retail);
      const itemSubtotal = itemPrice * item.qty;
      message += `${index + 1}. *${item.name}*\n`;
      message += `   • Kategori: ${item.category}\n`;
      message += `   • Harga: Rp ${itemPrice.toLocaleString("id-ID")} / pcs\n`;
      message += `   • Jumlah: *${item.qty} pcs*\n`;
      message += `   • Subtotal: *Rp ${itemSubtotal.toLocaleString("id-ID")}*\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📦 *Total Item:* ${totalItems} Pcs (${cart.length} Jenis Produk)\n`;
    message += `💰 *TOTAL ESTIMASI:* *Rp ${totalPrice.toLocaleString("id-ID")}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Mohon bantu cek ketersediaan stok & estimasi ongkirnya. Terima kasih! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen text-slate-800 pb-24">
      {/* Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-rose-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="AD Plastik Logo" className="w-11 h-11" />
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold tracking-tight text-emerald-600">AD Plastik</h1>
              <span className="text-[10px] font-bold text-yellow-600 tracking-wider uppercase -mt-0.5 block">
                Pusat Grosir & Eceran
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
            <span>📍 Cabang:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="Pusat SSA Bantul (Depan Stadion Sultan Agung)">Pusat SSA Bantul (Depan Stadion Sultan Agung)</option>
              <option value="Cabang Potorono">Cabang Potorono</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero Slider */}
      <HeroSlider
        onCatalogClick={() => {
          const el = document.getElementById("katalog");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onWAClick={() => {
          const phone = BRANCHES[selectedBranch] || "6281234567890";
          const message = encodeURIComponent(
            `Halo Admin *${selectedBranch}*,\nSaya ingin bertanya mengenai produk kemasan & grosir plastik.`
          );
          window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
        }}
      />

      {/* Product Catalog Grid */}
      <section id="katalog" className="max-w-6xl mx-auto mt-10 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 bg-white/60 inline-block px-3 py-1 rounded-lg border border-rose-100/60">
            Katalog Produk Ready Stock
          </h3>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Cari produk (misal: thinwall)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium bg-white/80 backdrop-blur-sm"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              🔍
            </span>
          </div>
        </div>

        {/* Category Pills */}
        {!loading && categories.length > 1 && (
          <div className="flex overflow-x-auto gap-2 pb-4 mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                    : "bg-white/80 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center py-10 text-slate-500 font-medium">Memuat katalog dari database Supabase...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center py-10 text-slate-500 font-medium">Produk tidak ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-rose-100 p-5 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg mb-3 bg-slate-100"
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400 text-sm font-medium border border-dashed border-slate-200">
                      Gambar Produk
                    </div>
                  )}
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    {product.category}
                  </span>
                  <h4 className="font-bold text-slate-900 mt-3 text-lg">{product.name}</h4>
                  {product.description && (
                    <p className="text-xs text-slate-500 mt-1 mb-2 line-clamp-2 leading-relaxed">{product.description}</p>
                  )}
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-col gap-1.5">
                    <p className="text-emerald-700 font-extrabold text-lg flex items-center justify-between">
                      <span>Rp {parsePrice(product.price_retail).toLocaleString("id-ID")}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide bg-slate-200/50 px-2 py-0.5 rounded">Eceran</span>
                    </p>
                    {product.price_wholesale && (
                      <p className="text-yellow-700 font-bold text-sm flex items-center justify-between pt-1.5 border-t border-slate-200">
                        <span>Rp {parsePrice(product.price_wholesale).toLocaleString("id-ID")}</span>
                        <span className="text-[10px] text-yellow-700 font-bold uppercase tracking-wide bg-yellow-100 px-2 py-0.5 rounded">Grosir</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition active:scale-95"
                >
                  + Keranjang
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-rose-100 bg-white/80 backdrop-blur-md pt-10 pb-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-700">
          <div>
            <h4 className="text-lg font-bold text-emerald-600 mb-2">AD Plastik - Pusat Kemasan Jogja</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pusat grosir & eceran perlengkapan packing, thinwall, paper bowl, dus makanan, dan kantong plastik terpercaya di Yogyakarta.
            </p>
          </div>
          <div>
            <h4 className="text-md font-bold text-slate-900 mb-2">📍 Alamat Cabang Official:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">1.</span>
                <div>
                  <strong className="text-slate-900">Pusat SSA Bantul</strong> (Depan Stadion Sultan Agung)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">2.</span>
                <div>
                  <strong className="text-slate-900">Cabang Potorono</strong>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AD Plastik. All rights reserved.</p>
          <button
            onClick={() => {
              setIsAdminAuthModalOpen(true);
              setAdminPasswordInput("");
              setAdminAuthError("");
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-700 transition font-medium bg-slate-100/80 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer"
          >
            <span>🔒</span> Admin
          </button>
        </div>
      </footer>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-40 border border-slate-700">
          <div>
            <p className="text-xs text-slate-400">{totalItems} Barang di Keranjang</p>
            <p className="font-bold text-emerald-400">Rp {totalPrice.toLocaleString("id-ID")}</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-full text-sm transition"
          >
            Lihat Keranjang & Checkout
          </button>
        </div>
      )}

      {/* Modal Pop-Up Keranjang */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Rincian Pesanan</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md bg-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-md shrink-0 flex items-center justify-center text-xs text-slate-400 font-bold">
                        📦
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-500">Rp {parsePrice(item.price_retail).toLocaleString("id-ID")} / pcs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className="w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Tujuan Cabang:</span>
                <span className="font-bold text-slate-900 text-sm">{selectedBranch}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Estimasi:</span>
                <span className="text-emerald-600">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>

              <button
                onClick={handleCheckoutWA}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                💬 Order Via WhatsApp Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pop-Up Auth Admin Password */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🔒</span> Akses Admin Dashboard
              </h3>
              <button
                onClick={() => setIsAdminAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (adminPasswordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                  sessionStorage.setItem("ad_admin_authenticated", "true");
                  setIsAdminAuthModalOpen(false);
                  window.location.href = "/admin";
                } else {
                  setAdminAuthError("Password Salah!");
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Masukkan Password Admin
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminAuthError("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                  autoFocus
                />
                {adminAuthError && (
                  <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                    <span>⚠️</span> {adminAuthError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminAuthModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm shadow transition cursor-pointer"
                >
                  Masuk Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
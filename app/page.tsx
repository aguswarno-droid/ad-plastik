"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image_url?: string;
}

interface CartItem extends Product {
  qty: number;
}

const BRANCHES: Record<string, string> = {
  "AD Plastik 1 - SSA Bantul": "6281234567890",
  "AD Plastik 2 - Ambarukmo": "6289876543210",
  "AD Plastik 3 - Potorono": "6281122334455",
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("AD Plastik 1 - SSA Bantul");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Ambil Data Produk dari Supabase Database
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Gagal mengambil data dari Supabase:", error.message);
      } else if (data) {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

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
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckoutWA = () => {
    if (cart.length === 0) return;

    const phone = BRANCHES[selectedBranch] || "6281234567890";
    let message = `Halo Admin *${selectedBranch}*,\nSaya ingin memesan produk berikut:\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n   Qty: ${item.qty} pcs x Rp ${item.price.toLocaleString("id-ID")}\n   Subtotal: Rp ${(item.price * item.qty).toLocaleString("id-ID")}\n`;
    });

    message += `\n*Total Estimasi: Rp ${totalPrice.toLocaleString("id-ID")}*\n\nMohon diinfokan ketersediaan stok & ongkirnya. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-600">AD Plastik</h1>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
            <span>📍 Cabang:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="AD Plastik 1 - SSA Bantul">AD Plastik 1 - SSA Bantul</option>
              <option value="AD Plastik 2 - Ambarukmo">AD Plastik 2 - Ambarukmo</option>
              <option value="AD Plastik 3 - Potorono">AD Plastik 3 - Potorono</option>
            </select>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mt-10 px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Pusat Kemasan Plastik & Bahan Packing Grosir
        </h2>
        <p className="mt-3 text-slate-600">
          Pesanan dikirim langsung dari cabang terdekat via WhatsApp Admin.
        </p>
      </section>

      {/* Product Catalog Grid */}
      <section className="max-w-6xl mx-auto mt-10 px-4">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Katalog Produk Ready Stock</h3>

        {loading ? (
          <p className="text-center py-10 text-slate-500 font-medium">Memuat katalog dari database Supabase...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition">
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
                  <p className="text-emerald-700 font-extrabold text-xl mt-2">
                    Rp {Number(product.price).toLocaleString("id-ID")}{" "}
                    <span className="text-xs text-slate-500 font-normal">/ pcs</span>
                  </p>
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
                      <p className="text-xs text-slate-500">Rp {Number(item.price).toLocaleString("id-ID")} / pcs</p>
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
    </div>
  );
}
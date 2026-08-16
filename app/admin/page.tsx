"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";
import { revalidateCatalog } from "@/app/actions";

interface Product {
  id: number;
  name: string;
  category: string;
  price_retail: number | string;
  price_wholesale?: number | string;
  image_url?: string;
  created_at?: string;
}

const CATEGORY_OPTIONS = [
  "Thinwall",
  "Paper Bowl & Craft",
  "Dus Makanan & Snack",
  "Plastik HD & Packaging",
  "Lakban & Solasi",
  "Bubble Wrap",
  "Lainnya",
];

export default function AdminDashboard() {
  const router = useRouter();
  // Auth Verification State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  // Product Data & UI States
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Form State Tambah Produk
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("Thinwall");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [priceRetail, setPriceRetail] = useState<string>("");
  const [priceWholesale, setPriceWholesale] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Status Action (Loading & Notification)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Edit Price Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newPriceRetail, setNewPriceRetail] = useState<string>("");
  const [newPriceWholesale, setNewPriceWholesale] = useState<string>("");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch Products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Gagal mengambil data produk:", error.message);
      showNotification("error", `Gagal memuat produk: ${error.message}`);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  // Cek Status Autentikasi Login saat Pertama Kali Dibuka
  useEffect(() => {
    const authStatus =
      typeof window !== "undefined"
        ? sessionStorage.getItem("ad_admin_authenticated")
        : null;

    if (authStatus === "true") {
      setIsAuthenticated(true);
      fetchProducts();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
    setCheckingAuth(false);
  }, []);

  // Handler Login Admin
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      sessionStorage.setItem("ad_admin_authenticated", "true");
      setIsAuthenticated(true);
      setAuthError("");
      fetchProducts();
    } else {
      setAuthError("Password Salah! Akses ditolak.");
    }
  };

  // Handler Logout Admin
  const handleAdminLogout = () => {
    sessionStorage.removeItem("ad_admin_authenticated");
    setIsAuthenticated(false);
    setProducts([]);
    setPasswordInput("");
    setAuthError("");
  };

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  };

  // Handler Pilih File Gambar & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("error", "Ukuran file terlalu besar! Maksimal 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Upload Gambar ke Supabase Storage (bucket: PRODUCTS)
  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
      // Sanitasi nama file: hilangkan spasi & karakter khusus
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}-${sanitizedName}`;
      const filePath = `images/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("PRODUCTS")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Full upload error:", uploadError);
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from("PRODUCTS")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err: any) {
      console.error("Full upload error:", err);
      showNotification("error", err.message || "Terjadi kesalahan saat mengunggah gambar.");
      return null;
    }
  };

  // Handler Submit Tambah Produk
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showNotification("error", "Nama produk wajib diisi!");
      return;
    }
    const finalPriceRetail = parseFloat(priceRetail);
    if (isNaN(finalPriceRetail) || finalPriceRetail <= 0) {
      showNotification("error", "Harga eceran produk harus angka positif!");
      return;
    }
    const finalPriceWholesale = priceWholesale ? parseFloat(priceWholesale) : null;

    const finalCategory = category === "Lainnya" && customCategory ? customCategory : category;

    setIsSubmitting(true);
    let uploadedImageUrl = "";

    if (imageFile) {
      showNotification("info", "Sedang mengunggah gambar produk ke Supabase Storage...");
      const url = await uploadImageToSupabase(imageFile);
      if (!url) {
        setIsSubmitting(false);
        return;
      }
      uploadedImageUrl = url;
    }

    showNotification("info", "Menyimpan data produk ke database...");

    const { error } = await supabase.from("products").insert([
      {
        name: name.trim(),
        category: finalCategory,
        price_retail: finalPriceRetail,
        price_wholesale: finalPriceWholesale,
        image_url: uploadedImageUrl || null,
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      console.error("Gagal menambah produk:", error.message);
      showNotification("error", `Gagal menyimpan produk: ${error.message}`);
    } else {
      showNotification("success", `Produk "${name}" berhasil ditambahkan! 🎉`);
      // Reset Form
      setName("");
      setPriceRetail("");
      setPriceWholesale("");
      setCategory("Thinwall");
      setCustomCategory("");
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();
      await revalidateCatalog();
      router.refresh();
    }
  };

  const handleSavePrice = async () => {
    if (!editingProduct) return;
    const parsedPriceRetail = parseFloat(newPriceRetail);
    if (isNaN(parsedPriceRetail) || parsedPriceRetail <= 0) {
      showNotification("error", "Harga eceran baru harus angka positif!");
      return;
    }
    const parsedPriceWholesale = newPriceWholesale ? parseFloat(newPriceWholesale) : null;

    setIsUpdatingPrice(true);
    const { error } = await supabase
      .from("products")
      .update({ price_retail: parsedPriceRetail, price_wholesale: parsedPriceWholesale })
      .eq("id", editingProduct.id);

    setIsUpdatingPrice(false);

    if (error) {
      showNotification("error", `Gagal memperbarui harga: ${error.message}`);
    } else {
      showNotification("success", `Harga ${editingProduct.name} berhasil diperbarui!`);
      setEditingProduct(null);
      setNewPriceRetail("");
      setNewPriceWholesale("");
      fetchProducts();
      await revalidateCatalog();
      router.refresh();
    }
  };

  // Handler Hapus Produk
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deletingProduct.id);

    setIsDeleting(false);

    if (error) {
      showNotification("error", `Gagal menghapus produk: ${error.message}`);
    } else {
      showNotification("success", `Produk "${deletingProduct.name}" berhasil dihapus.`);
      setDeletingProduct(null);
      fetchProducts();
      await revalidateCatalog();
      router.refresh();
    }
  };

  // Filter Products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Tampilan Loading Saat Mengecek Status Autentikasi
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 text-emerald-600 mx-auto border-4 border-emerald-600 border-t-transparent rounded-full" />
          <p className="text-sm font-medium text-slate-600">Memeriksa hak akses admin...</p>
        </div>
      </div>
    );
  }

  // 2. Tampilan Form Input Password Jika Belum Terautentikasi (Akses Langsung via URL Ditolak)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
              🔒
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Area Terkunci Admin</h2>
            <p className="text-xs text-slate-500">
              Silakan masukkan Password Admin untuk mengakses dashboard kelola produk.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password Admin
              </label>
              <input
                type="password"
                placeholder="Masukkan password admin..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError("");
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-sm"
                autoFocus
                required
              />
              {authError && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span> {authError}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition active:scale-95 text-sm cursor-pointer"
            >
              🔓 Masuk Dashboard Admin
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-slate-500 hover:text-emerald-700 transition flex items-center justify-center gap-1.5"
            >
              <span>🌐</span> Kembali ke Landing Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tampilan Dashboard Utama Jika Sudah Terautentikasi
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header Admin */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white p-2 rounded-xl text-xl font-extrabold shadow-md">
              ⚙️
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard AD Plastik</h1>
              <p className="text-xs text-slate-500">Kelola Katalog Produk & Supabase Database</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              Total Produk: {products.length}
            </span>
            <Link
              href="/"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 transition flex items-center gap-1.5"
            >
              <span>🌐</span> Landing Page
            </Link>
            <button
              onClick={handleAdminLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-medium text-xs sm:text-sm px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
            >
              <span>🔒</span> Keluar Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-xl shadow-md border flex items-center justify-between transition-all ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : notification.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {notification.type === "success"
                  ? "✅"
                  : notification.type === "error"
                  ? "⚠️"
                  : "ℹ️"}
              </span>
              <p className="font-semibold text-sm sm:text-base">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section Grid: Form Tambah & Ringkasan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column Left: Form Tambah Produk Baru */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5 h-fit">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>➕</span> Tambah Produk Baru
              </h2>
              <p className="text-xs text-slate-500">
                Gambar akan otomatis ter-upload ke Supabase Storage (bucket: PRODUCTS).
              </p>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Nama Produk */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Thinwall Rectangle 500ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  required
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Produk <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {category === "Lainnya" && (
                  <input
                    type="text"
                    placeholder="Tuliskan nama kategori baru..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    disabled={isSubmitting}
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                )}
              </div>

              {/* Harga */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Eceran (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      placeholder="1500"
                      value={priceRetail}
                      onChange={(e) => setPriceRetail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grosir (Rp) <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">Rp</span>
                    <input
                      type="number"
                      placeholder="1400"
                      value={priceWholesale}
                      onChange={(e) => setPriceWholesale(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Gambar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Foto Produk (Supabase Storage)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />

                {imagePreview && (
                  <div className="mt-3 relative w-full h-36 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span> Simpan Produk
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Column Right: Tabel Kelola Produk */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>📋</span> Daftar & Kelola Produk
                </h2>
                <p className="text-xs text-slate-500">
                  Update harga atau hapus produk langsung dari tabel Supabase.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="🔍 Cari nama / kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <svg
                  className="animate-spin h-8 w-8 text-emerald-600 mx-auto"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm font-medium">Memuat data produk dari Supabase...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm font-medium">Tidak ada produk yang ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                      <th className="py-3 px-4 rounded-l-xl">Gambar</th>
                      <th className="py-3 px-4">Nama Produk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Harga (Ecer/Grosir)</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-12 h-12 object-cover rounded-lg bg-slate-100 border border-slate-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://placehold.co/100x100?text=No+Img";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold">
                              📦
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-extrabold text-emerald-700">Rp {Number(p.price_retail || 0).toLocaleString("id-ID")}</p>
                          {p.price_wholesale && (
                            <p className="text-xs font-bold text-yellow-600 mt-0.5">Rp {Number(p.price_wholesale).toLocaleString("id-ID")}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setNewPriceRetail(p.price_retail?.toString() || "");
                              setNewPriceWholesale(p.price_wholesale?.toString() || "");
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                          >
                            ✏️ Edit Harga
                          </button>
                          <button
                            onClick={() => setDeletingProduct(p)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Edit Harga */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-md font-bold text-slate-900">
                ✏️ Edit Harga Produk
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">Nama Produk:</p>
              <p className="font-bold text-slate-900 text-base">{editingProduct.name}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Eceran Baru (Rp)
                </label>
                <input
                  type="number"
                  value={newPriceRetail}
                  onChange={(e) => setNewPriceRetail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Grosir Baru (Rp) <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="number"
                  value={newPriceWholesale}
                  onChange={(e) => setNewPriceWholesale(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePrice}
                disabled={isUpdatingPrice}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUpdatingPrice ? "Menyimpan..." : "Simpan Harga"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-md font-bold text-rose-600 flex items-center gap-2">
                <span>⚠️</span> Konfirmasi Hapus Produk
              </h3>
              <button
                onClick={() => setDeletingProduct(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-700">
              Apakah Anda yakin ingin menghapus produk{" "}
              <strong className="text-slate-900 font-bold">"{deletingProduct.name}"</strong> dari
              database Supabase?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-sm transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-sm shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Produk"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

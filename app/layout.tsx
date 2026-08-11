import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AD Plastik - Pusat Kemasan & Packing Makanan Jogja",
  description: "Supplier Grosir & Eceran Thinwall, Paper Bowl, Dus Makanan & Plastik HD di Jogja. Siap kirim dari Pusat SSA Bantul & Cabang Potorono.",
  keywords: "toko plastik jogja, grosir thinwall bantul, paper bowl jogja, kemasan makanan ssa bantul, ad plastik potorono",
  metadataBase: new URL("https://ad-plastik.vercel.app"),
  openGraph: {
    title: "AD Plastik - Pusat Kemasan & Packing Makanan Jogja",
    description: "Supplier Grosir & Eceran Thinwall, Paper Bowl, Dus Makanan & Plastik HD di Jogja. Siap kirim dari Pusat SSA Bantul & Cabang Potorono.",
    url: "https://ad-plastik.vercel.app",
    siteName: "AD Plastik",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AD Plastik - Pusat Kemasan & Packing Makanan Jogja",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

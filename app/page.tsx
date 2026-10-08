import Link from 'next/link';
import { ShoppingBag, CreditCard, BarChart3, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 sm:text-6xl">
            Sistem Kasir POS
            <span className="text-primary-600"> Modern</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Kelola transaksi penjualan dengan mudah. Sistem kasir lengkap dengan
            pembayaran online, cetak struk, dan laporan keuangan.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-primary-700"
            >
              Masuk ke Kasir
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/pos"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-600 px-8 py-4 text-lg font-medium text-primary-600 transition-colors hover:bg-primary-50"
            >
              Demo POS
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <ShoppingBag className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              POS Cepat
            </h3>
            <p className="text-gray-600">
              Interface yang simpel dan cepat untuk proses transaksi. Cari produk, tambah ke keranjang, dan checkout dalam hitungan detik.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Pembayaran Lengkap
            </h3>
            <p className="text-gray-600">
              Dukung berbagai metode pembayaran: Tunai, QRIS, Transfer Bank, E-Wallet, dan Virtual Account via Midtrans.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Laporan Otomatis
            </h3>
            <p className="text-gray-600">
              Cetak struk, laporan harian/mingguan/bulanan. Pantau penjualan dan performa bisnis secara real-time.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-primary-600 px-8 py-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            Siap Mengelola Bisnis Anda?
          </h2>
          <p className="mb-8 text-lg text-primary-100">
            Mulai gunakan sistem kasir modern kami hari ini. Gratis untuk Bisnis UKM.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-primary-600 transition-colors hover:bg-gray-100"
          >
            Mulai Sekarang
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
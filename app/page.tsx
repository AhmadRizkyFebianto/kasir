import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 sm:text-6xl">
            Reservasi Tempat
            <span className="text-primary-600"> Jadi Mudah</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Booking meja, ruangan, atau lapangan favorit Anda dengan cepat dan mudah.
            Lihat ketersediaan secara realtime.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/places"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-primary-700"
            >
              Lihat Tempat Tersedia
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/reservations"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary-600 px-8 py-4 text-lg font-medium text-primary-600 transition-colors hover:bg-primary-50"
            >
              Reservasi Saya
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <MapPin className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Pilih Tempat
            </h3>
            <p className="text-gray-600">
              Browse berbagai jenis tempat seperti meja, ruangan VIP, meeting room, hingga lapangan olahraga.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Pilih Waktu
            </h3>
            <p className="text-gray-600">
              Tentukan tanggal dan jam yang Anda inginkan. Sistem akan mengecek ketersediaan secara otomatis.
            </p>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <Clock className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Konfirmasi Booking
            </h3>
            <p className="text-gray-600">
              Dapatkan konfirmasi instan dan kode booking Anda. Siap untuk datang dan nikmati!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-2xl bg-primary-600 px-8 py-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            Siap untuk Booking?
          </h2>
          <p className="mb-8 text-lg text-primary-100">
            Jangan tunggu lagi! Pesan tempat favorit Anda sekarang.
          </p>
          <Link
            href="/places"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-primary-600 transition-colors hover:bg-gray-100"
          >
            Mulai Booking
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
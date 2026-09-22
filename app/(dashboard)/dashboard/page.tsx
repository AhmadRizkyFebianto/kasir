import {
  getDashboardMetrics,
  getRecentReservations,
  getPopularPlaces,
} from "@/lib/dashboard/queries";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  DollarSign,
  ShoppingCart,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const recentReservations = await getRecentReservations(5);
  const popularPlaces = await getPopularPlaces(5);

  const statusConfig: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    checked_in: "bg-blue-100 text-blue-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pendapatan Hari Ini
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(metrics.todayRevenue)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span>+12% dari kemarin</span>
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transaksi
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {metrics.todayTransactions}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Transaksi hari ini
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Reservasi Hari Ini
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {metrics.todayReservations}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Reservasi hari ini
          </div>
        </div>

        <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tempat Tersedia
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {metrics.availablePlaces}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Tempat yang tersedia saat ini
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Reservasi Terbaru
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-2 font-medium text-gray-600">Kode</th>
                <th className="px-4 py-2 font-medium text-gray-600">Pelanggan</th>
                <th className="px-4 py-2 font-medium text-gray-600">Waktu</th>
                <th className="px-4 py-2 font-medium text-gray-600">Status</th>
                <th className="px-4 py-2 font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.length > 0 ? (
                recentReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-2 font-mono">
                      {reservation.reservation_code}
                    </td>
                    <td className="px-4 py-2 text-gray-900">
                      {reservation.profiles?.[0]?.full_name || "-"}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {format(new Date(reservation.start_time), "dd MMM yyyy HH:mm", {
                        locale: localeId,
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-lg px-2 py-1 ${statusConfig[reservation.status] || statusConfig.pending}`}
                      >
                        {reservation.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {formatCurrency(reservation.total_amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Belum ada reservasi hari ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Tempat Paling Populer
        </h2>
        <div className="space-y-3">
          {popularPlaces.length > 0 ? (
            popularPlaces.map((place, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                    {place.number}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{place.name}</p>
                    <p className="text-sm text-gray-600">
                      {place.count} reservasi
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-300">
                  #{index + 1}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2">Belum ada data</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border-2 border-slate-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/pos"
            className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Buka POS</p>
              <p className="text-sm text-gray-600">Mulai transaksi</p>
            </div>
          </Link>

          <Link
            href="/dashboard/reservations"
            className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Reservasi</p>
              <p className="text-sm text-gray-600">Lihat booking</p>
            </div>
          </Link>

          <Link
            href="/dashboard/places"
            className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <MapPin className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Kelola Tempat</p>
              <p className="text-sm text-gray-600">Edit tempat</p>
            </div>
          </Link>

          <Link
            href="/dashboard/reports"
            className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Laporan</p>
              <p className="text-sm text-gray-600">Lihat statistik</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

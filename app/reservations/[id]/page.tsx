import { getReservationById } from '@/lib/reservations/actions';
import { notFound } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CheckCircle, Calendar, Clock, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

const statusConfig = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: 'Terkonfirmasi',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  checked_in: {
    label: 'Check-in',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  completed: {
    label: 'Selesai',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800',
    icon: CheckCircle,
  },
};

export default async function ReservationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const reservation = await getReservationById(params.id);

  if (!reservation) {
    notFound();
  }

  const status = statusConfig[reservation.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reservasi Berhasil Dibuat!
            </h1>
            <p className="mt-2 text-gray-600">
              Kode Booking: <span className="font-mono font-semibold">{reservation.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          {/* Reservation Details Card */}
          <div className="overflow-hidden rounded-xl bg-white shadow-lg">
            {/* Status */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Status Reservasi
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${status.color}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  {status.label}
                </span>
              </div>
            </div>

            {/* Place Info */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200">
                  <span className="text-2xl font-bold text-primary-600">
                    {reservation.places?.number}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {reservation.places?.name}
                  </h2>
                  {reservation.places?.place_categories && (
                    <p className="text-sm text-gray-600">
                      {reservation.places.place_categories.name}
                    </p>
                  )}
                  {reservation.places?.capacity && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Kapasitas: {reservation.places.capacity} orang</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-4 p-6">
              <h3 className="font-semibold text-gray-900">Detail Booking</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(reservation.start_time), 'EEEE, dd MMMM yyyy', {
                        locale: localeId,
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Waktu</p>
                    <p className="font-medium text-gray-900">
                      {format(new Date(reservation.start_time), 'HH:mm')} -{' '}
                      {format(new Date(reservation.end_time), 'HH:mm')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {reservation.duration_hours} jam
                    </p>
                  </div>
                </div>
              </div>

              {reservation.notes && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Catatan:
                  </p>
                  <p className="text-sm text-gray-600">{reservation.notes}</p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                Ringkasan Pembayaran
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Harga ({reservation.duration_hours} jam)
                  </span>
                  <span className="text-gray-900">
                    {formatCurrency(reservation.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    {formatCurrency(reservation.total_amount)}
                  </span>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <div className="mt-4 rounded-lg bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Catatan:</strong> Reservasi Anda menunggu konfirmasi.
                    Silakan lakukan pembayaran atau datang langsung ke kasir.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reservations"
              className="flex-1 rounded-lg bg-white border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Lihat Semua Reservasi
            </Link>
            <Link
              href="/places"
              className="flex-1 rounded-lg bg-primary-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-primary-700"
            >
              Booking Lagi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
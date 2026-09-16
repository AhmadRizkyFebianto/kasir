import { getMyReservations } from '@/lib/reservations/actions';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const statusConfig = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'bg-yellow-100 text-yellow-800',
  },
  confirmed: {
    label: 'Terkonfirmasi',
    color: 'bg-green-100 text-green-800',
  },
  checked_in: {
    label: 'Check-in',
    color: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Selesai',
    color: 'bg-gray-100 text-gray-800',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-100 text-red-800',
  },
};

export default async function MyReservationsPage() {
  const reservations = await getMyReservations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reservasi Saya
          </h1>
          <p className="text-gray-600">
            {reservations.length} reservasi ditemukan
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const status =
                statusConfig[
                  reservation.status as keyof typeof statusConfig
                ];

              return (
                <Link
                  key={reservation.id}
                  href={`/reservations/${reservation.id}`}
                  className="block"
                >
                  <div className="group overflow-hidden rounded-xl bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left Side */}
                      <div className="flex gap-4">
                        {/* Place Image/Number */}
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-200">
                          {reservation.places?.image_url ? (
                            <img
                              src={reservation.places.image_url}
                              alt={reservation.places.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-primary-600">
                              {reservation.places?.number}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                                {reservation.places?.name}
                              </h3>
                              {reservation.places?.place_categories && (
                                <p className="text-sm text-gray-600">
                                  {reservation.places.place_categories.name}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Time & Date */}
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(reservation.start_time),
                                  'EEEE, dd MMM yyyy',
                                  { locale: localeId }
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>
                                {format(
                                  new Date(reservation.start_time),
                                  'HH:mm'
                                )}{' '}
                                -{' '}
                                {format(
                                  new Date(reservation.end_time),
                                  'HH:mm'
                                )}{' '}
                                ({reservation.duration_hours} jam)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(reservation.total_amount)}
                          </p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl bg-white py-12 px-4">
            <Calendar className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum Ada Reservasi
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Anda belum memiliki reservasi. Mulai booking tempat favorit Anda
              sekarang!
            </p>
            <Link
              href="/places"
              className="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700"
            >
              Lihat Tempat Tersedia
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
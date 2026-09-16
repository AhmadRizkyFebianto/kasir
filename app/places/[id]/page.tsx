import { getPlaceById } from '@/lib/places/queries';
import { BookingForm } from '@/components/places/BookingForm';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, DollarSign, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const statusConfig = {
  available: {
    label: 'Tersedia',
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
  },
  reserved: {
    label: 'Direservasi',
    color: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  occupied: {
    label: 'Terisi',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-gray-100 text-gray-800',
    dotColor: 'bg-gray-500',
  },
};

export default async function PlaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const place = await getPlaceById(params.id);

  if (!place) {
    notFound();
  }

  const status = statusConfig[place.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/places"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Tempat
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Place Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative h-96 w-full overflow-hidden rounded-xl bg-gray-200">
              {place.image_url ? (
                <img
                  src={place.image_url}
                  alt={place.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                  <span className="text-6xl font-bold text-primary-600">
                    {place.number}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute right-4 top-4">
                <span
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${status.color}`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                  {status.label}
                </span>
              </div>

              {/* Category Badge */}
              {place.place_categories && (
                <div className="absolute left-4 top-4">
                  <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm">
                    {place.place_categories.name}
                  </span>
                </div>
              )}
            </div>

            {/* Details Card */}
            <div className="rounded-xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {place.name}
                  </h1>
                  <p className="mt-1 text-lg text-gray-500">
                    Nomor: {place.number}
                  </p>
                </div>
              </div>

              {place.description && (
                <p className="mb-6 text-gray-600">{place.description}</p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <Users className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kapasitas</p>
                    <p className="font-semibold text-gray-900">
                      {place.capacity} orang
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <DollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Harga</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(place.price_per_hour)}/jam
                    </p>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              {place.facilities && place.facilities.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Fasilitas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {place.facilities.map((facility: string) => (
                      <span
                        key={facility}
                        className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {place.status === 'available' ? (
                <BookingForm
                  place={{
                    id: place.id,
                    name: place.name,
                    price_per_hour: place.price_per_hour,
                  }}
                />
              ) : (
                <div className="rounded-xl bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    Tidak Tersedia
                  </h2>
                  <p className="text-gray-600">
                    Tempat ini sedang{' '}
                    {place.status === 'reserved'
                      ? 'direservasi'
                      : place.status === 'occupied'
                      ? 'terisi'
                      : 'dalam maintenance'}
                    . Silakan pilih tempat lain atau coba lagi nanti.
                  </p>
                  <Link
                    href="/places"
                    className="mt-4 block w-full rounded-lg bg-gray-100 px-4 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    Lihat Tempat Lain
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}